"""Idempotent schema upgrades for existing Docker data volumes."""
from db import connect_DB
from enrich import enrich_all


def ensure_schema(con):
    additions = {
        "famous_level": "VARCHAR(16) NULL DEFAULT NULL",
        "program": "LONGTEXT NULL",
        "composer": "TEXT NULL",
    }
    with con.cursor() as cursor:
        cursor.execute(
            "SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'performances'"
        )
        columns = dict(cursor.fetchall())
        if not columns:
            raise RuntimeError("performances table is missing; check DB initialization")
        for name, definition in additions.items():
            if name not in columns:
                cursor.execute(f"ALTER TABLE performances ADD COLUMN `{name}` {definition}")
                print(f"Added performances.{name}")
        if columns.get("story", "").lower() != "longtext":
            cursor.execute("ALTER TABLE performances MODIFY COLUMN story LONGTEXT NULL")
            print("Updated performances.story to LONGTEXT")
    con.commit()
    enrich_all(con)
    print("Database schema ready; existing data preserved.")


if __name__ == "__main__":
    con = connect_DB()
    try:
        ensure_schema(con)
    finally:
        con.close()
