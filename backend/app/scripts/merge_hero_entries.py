"""
One-time script: merge hero_tagline into hero_description.

Moves the tagline content into hero_description.title, then deletes hero_tagline.
Run inside Docker: docker compose exec backend python -m app.scripts.merge_hero_entries
"""

from app.core.database import SessionLocal
from app.models.site_content import SiteContent


def merge():
    db = SessionLocal()
    try:
        tagline = db.query(SiteContent).filter(SiteContent.key == "hero_tagline").first()
        description = db.query(SiteContent).filter(SiteContent.key == "hero_description").first()

        if not description:
            print("hero_description not found — nothing to do.")
            return

        if tagline:
            description.title = tagline.content
            db.delete(tagline)
            db.commit()
            print(f"Merged tagline into hero_description.title: '{description.title}'")
            print("Deleted hero_tagline entry.")
        else:
            print("hero_tagline not found — already merged or never existed.")
    finally:
        db.close()


if __name__ == "__main__":
    merge()
