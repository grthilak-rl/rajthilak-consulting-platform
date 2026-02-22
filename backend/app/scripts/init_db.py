import time

from alembic import command
from alembic.config import Config
from bcrypt import hashpw, gensalt
from sqlalchemy import text as sa_text
from sqlalchemy.exc import OperationalError

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD
from app.core.database import engine, SessionLocal
from app.models import User
from app.models.requirement import Requirement, RequirementType, RequirementStatus
from app.models.case_study import CaseStudy
from app.models.service import Service
from app.models.testimonial import Testimonial
from app.models.site_content import SiteContent

MAX_RETRIES = 10
RETRY_DELAY = 2


def _wait_for_db():
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"Connecting to database (attempt {attempt}/{MAX_RETRIES})...")
            with engine.connect() as conn:
                conn.execute(sa_text("SELECT 1"))
            print("Database is ready.")
            return
        except OperationalError:
            if attempt == MAX_RETRIES:
                print("Could not connect to database. Giving up.")
                raise
            print(f"Database not ready. Retrying in {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)


def init_db():
    _wait_for_db()

    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    print("Migrations applied.")

    seed_admin()
    seed_requirements()
    seed_case_studies()
    seed_services()
    seed_testimonials()
    seed_site_content()


def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            print(f"Admin user already exists: {ADMIN_EMAIL}")
            return

        password_hash = hashpw(
            ADMIN_PASSWORD.encode("utf-8"), gensalt()
        ).decode("utf-8")

        admin = User(email=ADMIN_EMAIL, password_hash=password_hash)
        db.add(admin)
        db.commit()
        print(f"Admin user created: {ADMIN_EMAIL}")
    finally:
        db.close()


def seed_requirements():
    db = SessionLocal()
    try:
        count = db.query(Requirement).count()
        if count > 0:
            print(f"Requirements already seeded ({count} found). Skipping.")
            return

        requirements = [
            Requirement(
                name="Alice Johnson",
                email="alice@techcorp.io",
                company="TechCorp",
                title="Cloud Migration Strategy",
                description="We need help migrating our on-premise infrastructure to AWS. Looking for architecture review, migration planning, and hands-on support for containerizing our services.",
                type=RequirementType.contract,
                tech_stack="AWS, Docker, Kubernetes, Terraform",
                timeline="3 months",
                status=RequirementStatus.new,
                progress=0,
            ),
            Requirement(
                name="Bob Martinez",
                email="bob@startupxyz.com",
                company="StartupXYZ",
                title="MVP Development for SaaS Platform",
                description="Early-stage startup looking for a technical consultant to help build our MVP. Need full-stack development guidance, tech stack selection, and hands-on coding support.",
                type=RequirementType.one_off,
                tech_stack="React, Python, PostgreSQL",
                timeline="6 weeks",
                status=RequirementStatus.new,
                progress=0,
            ),
        ]

        db.add_all(requirements)
        db.commit()
        print(f"Seeded {len(requirements)} sample requirements.")
    finally:
        db.close()


def seed_case_studies():
    db = SessionLocal()
    try:
        count = db.query(CaseStudy).count()
        if count > 0:
            print(f"Case studies already seeded ({count} found). Skipping.")
            return

        studies = [
            CaseStudy(
                slug="ruth-ai",
                title="Ruth AI",
                role="AI/ML Engineer & Architect",
                description="An AI-powered conversational assistant built to automate customer support, handle complex queries with context awareness, and reduce response times through intelligent routing.",
                industry="AI / ML",
                technologies=[
                    {"name": "Python", "category": "Language"},
                    {"name": "LangChain", "category": "AI & ML"},
                    {"name": "OpenAI", "category": "AI & ML"},
                    {"name": "FastAPI", "category": "Framework"},
                    {"name": "React", "category": "Framework"},
                ],
                featured=True,
                metrics=[
                    {"value": "60%", "label": "Faster Response Time"},
                    {"value": "85%", "label": "Query Resolution Rate"},
                    {"value": "24/7", "label": "Availability"},
                ],
                visual_color="ai",
                visual_icon="microphone",
                display_order=0,
            ),
            CaseStudy(
                slug="hit-platform",
                title="HIT Platform",
                role="Lead Backend Engineer",
                description="A healthcare information technology platform designed to streamline clinical workflows, improve patient data management, and enable seamless interoperability across hospital systems.",
                industry="Healthcare",
                technologies=[
                    {"name": "Python", "category": "Language"},
                    {"name": "FastAPI", "category": "Framework"},
                    {"name": "React", "category": "Framework"},
                    {"name": "PostgreSQL", "category": "Data & Messaging"},
                    {"name": "Docker", "category": "Infrastructure"},
                ],
                featured=False,
                visual_color="healthcare",
                visual_icon="activity",
                display_order=1,
            ),
            CaseStudy(
                slug="vas-platform",
                title="VAS Platform",
                role="Full Stack Developer",
                description="A value-added services platform enabling telecom operators to deliver digital content, subscription management, and billing integration at scale for millions of subscribers.",
                industry="Telecom",
                technologies=[
                    {"name": "Java", "category": "Language"},
                    {"name": "Spring Boot", "category": "Framework"},
                    {"name": "Kafka", "category": "Data & Messaging"},
                    {"name": "Redis", "category": "Data & Messaging"},
                    {"name": "AWS", "category": "Infrastructure"},
                ],
                featured=False,
                visual_color="telecom",
                visual_icon="bar-chart",
                display_order=2,
            ),
            CaseStudy(
                slug="cloud-migration",
                title="Cloud Migration Strategy",
                role="Solutions Architect",
                description="Architecture review, migration planning, and hands-on support for containerizing on-premise services and migrating infrastructure to AWS for a mid-size enterprise.",
                industry="Cloud / DevOps",
                technologies=[
                    {"name": "AWS", "category": "Infrastructure"},
                    {"name": "Docker", "category": "Infrastructure"},
                    {"name": "Kubernetes", "category": "Infrastructure"},
                    {"name": "Terraform", "category": "Infrastructure"},
                ],
                featured=False,
                visual_color="fintech",
                visual_icon="cloud",
                display_order=3,
            ),
        ]

        db.add_all(studies)
        db.commit()
        print(f"Seeded {len(studies)} case studies.")
    finally:
        db.close()


def seed_services():
    db = SessionLocal()
    try:
        count = db.query(Service).count()
        if count > 0:
            print(f"Services already seeded ({count} found). Skipping.")
            return

        services = [
            Service(
                slug="full-time-consulting",
                title="Full-Time Consulting",
                description="Embedded within your team for extended engagements. I bring architecture leadership, code reviews, mentoring, and hands-on development to accelerate your roadmap.",
                icon="briefcase",
                tags=["Team Integration", "Architecture", "Mentoring"],
                display_order=0,
            ),
            Service(
                slug="contract-engagements",
                title="Contract Engagements",
                description="Scoped projects with clear deliverables and timelines. From API design and cloud migration to full-stack product development -- I own the outcome end to end.",
                icon="edit",
                tags=["Fixed Scope", "Clear Milestones", "Deliverables"],
                display_order=1,
            ),
            Service(
                slug="one-off-projects",
                title="One-Off Projects",
                description="Need a quick architecture review, tech stack recommendation, or proof-of-concept build? I offer focused engagements to solve specific technical challenges fast.",
                icon="clock",
                tags=["Architecture Review", "PoC Builds", "Tech Advisory"],
                display_order=2,
            ),
        ]

        db.add_all(services)
        db.commit()
        print(f"Seeded {len(services)} services.")
    finally:
        db.close()


def seed_testimonials():
    db = SessionLocal()
    try:
        count = db.query(Testimonial).count()
        if count > 0:
            print(f"Testimonials already seeded ({count} found). Skipping.")
            return

        testimonials = [
            Testimonial(
                author_name="Alice Johnson",
                author_role="VP Engineering",
                author_company="TechCorp",
                author_initials="AJ",
                content="Raj took our fragmented on-premise systems and designed a clean migration path to AWS. His architecture decisions saved us months of rework. Truly an engineer who thinks in systems.",
                rating=5,
                featured=True,
            ),
            Testimonial(
                author_name="Bob Martinez",
                author_role="CTO",
                author_company="StartupXYZ",
                author_initials="BM",
                content="We needed someone who could both architect the system and write production code. Raj delivered our MVP two weeks ahead of schedule and the codebase was impeccable. Highly recommend.",
                rating=5,
                featured=True,
            ),
            Testimonial(
                author_name="Sarah Kim",
                author_role="Head of Product",
                author_company="Ruth Labs",
                author_initials="SK",
                content="The AI assistant Raj built for our support team cut response times by 60% and handles 85% of incoming queries autonomously. The ROI was evident within the first month of deployment.",
                rating=5,
                featured=True,
            ),
        ]

        db.add_all(testimonials)
        db.commit()
        print(f"Seeded {len(testimonials)} testimonials.")
    finally:
        db.close()


def seed_site_content():
    db = SessionLocal()
    try:
        existing_keys = {row.key for row in db.query(SiteContent.key).all()}

        entries = [
            {
                "key": "hero_tagline",
                "title": "Hero Tagline",
                "content": "Engineering Leader. Systems Architect. Technical Consultant.",
            },
            {
                "key": "hero_description",
                "title": "Hero Description",
                "content": "I help companies design and build production-grade systems -- from cloud migrations and platform engineering to AI-powered products. Full-time, contract, or one-off.",
                "metadata_": {
                    "clients_label": "Trusted by teams at",
                    "clients": ["TechCorp", "StartupXYZ", "HealthSys Inc.", "TelecomOne"],
                },
            },
            {
                "key": "about_hero",
                "title": "About Hero Section",
                "content": "I am Raj Thilak, a full-stack engineer and technical consultant with over a decade of experience designing and shipping production systems across healthcare, telecom, AI/ML, and fintech.",
                "metadata_": {
                    "overline": "About Me",
                    "heading": 'Building <span class="highlight">Scalable Systems</span> That Ship',
                    "stats": [
                        {"value": 10, "suffix": "+", "label": "Years Experience"},
                        {"value": 20, "suffix": "+", "label": "Projects Delivered"},
                        {"value": 4, "suffix": "", "label": "Industries"},
                    ],
                    "avatar": {
                        "initials": "RT",
                        "name": "Raj Thilak",
                        "title": "Engineering Consultant & Architect",
                        "github": "https://github.com/rajthilak",
                        "linkedin": "https://linkedin.com/in/rajthilak",
                        "email": "raj@example.com",
                    },
                },
            },
            {
                "key": "about_story",
                "title": "My Story",
                "content": (
                    "<p>I started my career as a backend developer at a telecom company, "
                    "building value-added services that reached millions of subscribers. "
                    "The scale forced me to think deeply about <strong>distributed systems, "
                    "data pipelines, and fault tolerance</strong> from day one.</p>"
                    "<p>After working on backend platforms in Java and Spring Boot, I "
                    "transitioned to healthcare technology, where I led the development of "
                    "a <strong>clinical workflow platform</strong> serving hospitals. This "
                    "experience taught me how to design systems under regulatory constraints "
                    "while maintaining performance and usability.</p>"
                    "<hr>"
                    "<p>More recently, I have been building <strong>AI-powered products</strong> "
                    "using Python, LangChain, and OpenAI APIs. One of my flagship projects, "
                    "Ruth AI, is a conversational assistant that handles customer support "
                    "queries with 85% autonomous resolution and 60% faster response times.</p>"
                    "<p>Today, I work as an independent consultant, helping startups and "
                    "mid-size companies architect, build, and ship production systems. Whether "
                    "it is a cloud migration, an MVP build, or an AI integration -- I bring "
                    "hands-on engineering, architectural clarity, and a commitment to delivery.</p>"
                ),
            },
            {
                "key": "about_philosophy",
                "title": "Engineering Philosophy",
                "content": "Four principles that guide every project I take on, from architecture to deployment.",
                "metadata_": {
                    "overline": "Engineering Philosophy",
                    "heading": "How I Approach Engineering",
                    "cards": [
                        {
                            "title": "Ship Early, Iterate Fast",
                            "description": "I prioritize getting a working system in front of users as quickly as possible. Early feedback beats perfect architecture every time. Start with an MVP, learn from real usage, and iterate based on what actually matters.",
                        },
                        {
                            "title": "Boring Tech Over Hype",
                            "description": "I default to proven, well-documented technologies unless there is a clear reason to do otherwise. PostgreSQL over a trendy NoSQL database. FastAPI over experimental frameworks. Battle-tested tools ship faster and break less.",
                        },
                        {
                            "title": "Design for Observability",
                            "description": "Systems will fail. When they do, you need to know exactly what went wrong. I build with structured logging, metrics, and monitoring from day one -- not as an afterthought. If you cannot measure it, you cannot improve it.",
                        },
                        {
                            "title": "Write Code People Can Read",
                            "description": "Code is read far more often than it is written. I optimize for clarity over cleverness. Good variable names, small functions, and clear separation of concerns make systems easier to extend, debug, and hand off to your team.",
                        },
                    ],
                },
            },
            {
                "key": "home_services",
                "title": "Services Section",
                "content": "Flexible consulting arrangements tailored to your project needs, timeline, and budget.",
                "metadata_": {
                    "overline": "What I Do",
                    "heading": "Engagement Models",
                    "cards": [
                        {
                            "title": "Full-Time Consulting",
                            "description": "Embedded within your team for extended engagements. I bring architecture leadership, code reviews, mentoring, and hands-on development to accelerate your roadmap.",
                            "icon": "briefcase",
                            "tags": ["Team Integration", "Architecture", "Mentoring"],
                        },
                        {
                            "title": "Contract Engagements",
                            "description": "Scoped projects with clear deliverables and timelines. From API design and cloud migration to full-stack product development -- I own the outcome end to end.",
                            "icon": "edit",
                            "tags": ["Fixed Scope", "Clear Milestones", "Deliverables"],
                        },
                        {
                            "title": "One-Off Projects",
                            "description": "Need a quick architecture review, tech stack recommendation, or proof-of-concept build? I offer focused engagements to solve specific technical challenges fast.",
                            "icon": "clock",
                            "tags": ["Architecture Review", "PoC Builds", "Tech Advisory"],
                        },
                    ],
                },
            },
            {
                "key": "about_tech_stack",
                "title": "Technical Stack",
                "content": "Technologies and tools I use across the full stack, from infrastructure to frontend.",
                "metadata_": {
                    "overline": "Technical Stack",
                    "heading": "What I Work With",
                    "categories": [
                        {"name": "Backend & APIs", "techs": ["Python", "FastAPI", "Java", "Spring Boot", "Node.js", "GraphQL"]},
                        {"name": "Frontend", "techs": ["React", "TypeScript", "Next.js", "Vue.js", "TailwindCSS"]},
                        {"name": "Data & Messaging", "techs": ["PostgreSQL", "Redis", "Kafka", "MongoDB"]},
                        {"name": "Cloud & DevOps", "techs": ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions"]},
                        {"name": "AI & ML", "techs": ["OpenAI", "LangChain", "Pinecone", "Hugging Face"]},
                        {"name": "Tools & Practices", "techs": ["Git", "pytest", "Jest", "OpenAPI"]},
                    ],
                },
            },
            {
                "key": "portfolio_hero",
                "title": "Portfolio Page",
                "content": "From healthcare platforms processing thousands of patient records to AI assistants handling millions of conversations -- here is the work that defines my engineering practice.",
                "metadata_": {
                    "overline": "Projects & Portfolio",
                    "heading": 'Systems I Have <span class="highlight">Designed & Built</span>',
                    "cta_heading": "Have a project in mind?",
                    "cta_description": "Whether it is a cloud migration, an MVP build, or an AI integration -- let us talk about how I can help your team ship.",
                    "cta_button": "Submit a Requirement",
                },
            },
            {
                "key": "about_why_platform",
                "title": "Why I Built This Platform",
                "content": (
                    "<p>Most consulting engagements start with email threads, scattered "
                    "proposals, and unclear expectations. I built this platform to bring "
                    "<strong>structure, transparency, and clarity</strong> to how I work "
                    "with clients.</p>"
                    "<p>Here, you can submit a requirement, track its progress, and "
                    "communicate directly with me through a single interface. No middlemen, "
                    "no ambiguity -- just a streamlined workflow designed to get your project "
                    "off the ground faster.</p>"
                ),
            },
        ]

        new_entries = [
            SiteContent(**entry) for entry in entries if entry["key"] not in existing_keys
        ]

        if not new_entries:
            print(f"Site content already seeded ({len(existing_keys)} found). Skipping.")
            return

        db.add_all(new_entries)
        db.commit()
        print(f"Seeded {len(new_entries)} new site content entries ({len(existing_keys)} already existed).")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
