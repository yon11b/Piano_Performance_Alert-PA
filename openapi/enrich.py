"""Apply the owner's Notion criteria without inventing missing artist careers."""
import json
import re
from pathlib import Path

RULES = json.loads(Path(__file__).with_name("classification_rules.json").read_text(encoding="utf-8"))


def classify(title, cast, price):
    text = f"{title or ''} {cast or ''}"
    amounts = []
    for number, unit in re.findall(r"(\d[\d,]*(?:\.\d+)?)\s*(만|천)?\s*원", price or ""):
        multiplier = {"만": 10000, "천": 1000, "": 1}[unit]
        amounts.append(float(number.replace(",", "")) * multiplier)
    if amounts and max(amounts) >= RULES["world_min_price"]:
        return "WORLD"
    for level in ("WORLD", "NATIONAL", "RISING", "NEWBEE"):
        if any(name in text for name in RULES["artists"][level]):
            return level
    # Missing career information does not establish that an artist is a beginner.
    return None


def enrich_all(con):
    with con.cursor() as cursor:
        cursor.execute("SELECT id, title, cast, price FROM performances WHERE famous_level IS NULL")
        records = cursor.fetchall()
        count = 0
        for performance_id, title, cast, price in records:
            level = classify(title, cast, price)
            if level:
                cursor.execute("UPDATE performances SET famous_level=%s WHERE id=%s AND famous_level IS NULL", (level, performance_id))
                count += cursor.rowcount
    con.commit()
    print(f"Classified {count} performances using the saved Notion criteria.")


def enrich_one(con, performance_id):
    with con.cursor() as cursor:
        cursor.execute("SELECT title, cast, price FROM performances WHERE id=%s AND famous_level IS NULL", (performance_id,))
        row = cursor.fetchone()
        if row:
            level = classify(*row)
            if level:
                cursor.execute("UPDATE performances SET famous_level=%s WHERE id=%s AND famous_level IS NULL", (level, performance_id))
    con.commit()
