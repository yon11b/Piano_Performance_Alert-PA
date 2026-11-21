"""Fetch upcoming performances once without interactive input."""
import os
import time
from datetime import datetime, timedelta, timezone
import xml.etree.ElementTree as ET

import requests

from db import connect_DB
from enrich import enrich_one
from migrate import ensure_schema
from performance.insert import (
    servicekey as default_service_key,
    push_performance_list,
    push_performance_detail,
)

# Connect directly to the canonical HTTPS host without the www redirect.
BASE_URL = "https://kopis.or.kr/openApi/restful"
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}


def date_range():
    today = datetime.now(timezone(timedelta(hours=9))).date()
    start = datetime.strptime(os.getenv("KOPIS_START_DATE") or today.strftime("%Y%m%d"), "%Y%m%d").date()
    end = datetime.strptime(
        os.getenv("KOPIS_END_DATE") or (start + timedelta(days=90)).strftime("%Y%m%d"),
        "%Y%m%d",
    ).date()
    if end < start:
        raise ValueError("KOPIS_END_DATE must be on or after KOPIS_START_DATE")
    return start, end


def fetch_xml(session, path, params):
    key = str(params.get("service", ""))

    def safe_body():
        body = response.text
        if key:
            body = body.replace(key, "[REDACTED]")
        return body[:1000]

    for attempt in range(3):
        time.sleep(1)
        try:
            response = session.get(
                f"{BASE_URL}/{path}", params=params, headers=REQUEST_HEADERS, timeout=30
            )
        except requests.RequestException:
            if attempt == 2:
                raise RuntimeError(f"KOPIS connection failed: {path}") from None
            time.sleep(5 * (2 ** attempt))
            continue
        retryable = (
            "Request Blocked" in response.text
            or response.status_code in (429, 500, 502, 503, 504)
        )
        if not retryable or attempt == 2:
            break
        retry_after = response.headers.get("Retry-After", "")
        delay = int(retry_after) if retry_after.isdigit() else 5 * (2 ** attempt)
        if delay > 60:
            raise RuntimeError(f"KOPIS requested a {delay}-second cooldown; retry later")
        print(f"KOPIS temporarily unavailable: {path}; retry {attempt + 1}/2 in {delay}s")
        time.sleep(delay)
    if not response.ok:
        if "Request Blocked" in response.text:
            raise RuntimeError(
                "KOPIS rejected this HTTP request (Request Blocked). "
                "Open the API from the host browser to check whether this network/IP is allowed. "
                "No performance data was returned."
            ) from None
        raise RuntimeError(
            f"KOPIS HTTP {response.status_code}: {path}; response={safe_body()}"
        ) from None
    try:
        root = ET.fromstring(response.content)
    except ET.ParseError:
        raise RuntimeError(f"KOPIS returned non-XML data: {safe_body()}") from None
    if root.tag != "dbs":
        raise ValueError(f"KOPIS API error (check key and quota): {safe_body()}")
    if root.find(".//errmsg") is not None:
        raise ValueError(f"KOPIS API error: {safe_body()}")
    return root


def main():
    start, end = date_range()
    print(f"Collecting Seoul classical performances: {start} through {end}")
    key = os.getenv("KOPIS_SERVICE_KEY") or default_service_key
    con = connect_DB()
    total = 0
    try:
        ensure_schema(con)
        with requests.Session() as session:
            # Use short date windows, and continue even if a page only contains duplicates.
            window_start = start
            while window_start <= end:
                window_end = min(window_start + timedelta(days=30), end)
                page = 1
                while True:
                    root = fetch_xml(session, "pblprfr", {
                        "service": key,
                        "stdate": window_start.strftime("%Y%m%d"),
                        "eddate": window_end.strftime("%Y%m%d"),
                        "cpage": page,
                        "rows": 100,
                        "signgucode": "11",
                        "shcate": "CCCA",
                    })
                    print(f"{window_start} through {window_end}, page {page}: {len(root.findall('db'))} records")
                    if not root.findall("db"):
                        break
                    total += push_performance_list(con, root)
                    page += 1
                window_start = window_end + timedelta(days=1)

            with con.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM performances ORDER BY "
                    "CASE WHEN save = '1' THEN 1 ELSE 0 END, id"
                )
                ids = [row[0] for row in cursor.fetchall()]
            failed_ids = []
            updated = 0
            consecutive_failures = 0
            for performance_id in ids:
                try:
                    root = fetch_xml(session, f"pblprfr/{performance_id}", {"service": key})
                    if not root.findall("db"):
                        raise ValueError("KOPIS returned no detail record")
                    push_performance_detail(con, root, performance_id)
                    enrich_one(con, performance_id)
                except Exception as exc:
                    con.rollback()
                    failed_ids.append(performance_id)
                    consecutive_failures += 1
                    print(f"Detail failed: {performance_id}: {exc}")
                    if consecutive_failures >= 3:
                        print("Stopping after 3 consecutive failures; retry later.")
                        break
                    continue
                updated += 1
                consecutive_failures = 0
        print(f"Collection result: {total} inserted, {updated}/{len(ids)} details updated.")
        if failed_ids:
            print(f"Failed IDs: {', '.join(failed_ids)}")
            raise SystemExit("Collection incomplete. Existing data preserved; rerun to retry.")
    finally:
        con.close()


if __name__ == "__main__":
    main()
