--
-- PostgreSQL database dump
--

\restrict QfqVAaPdH7XBhhUwmy7oAwNNJmP087cY3yvzsUeVQaZrwujq7szxidioggr3XwJ

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: requirementstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.requirementstatus AS ENUM (
    'new',
    'accepted',
    'in_progress',
    'completed',
    'rejected'
);


ALTER TYPE public.requirementstatus OWNER TO postgres;

--
-- Name: requirementtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.requirementtype AS ENUM (
    'full_time',
    'contract',
    'one_off'
);


ALTER TYPE public.requirementtype OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: case_studies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_studies (
    id uuid NOT NULL,
    slug character varying NOT NULL,
    title character varying NOT NULL,
    role character varying NOT NULL,
    description text NOT NULL,
    industry character varying NOT NULL,
    technologies json DEFAULT '[]'::json NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    metrics json,
    visual_color character varying DEFAULT '''primary'''::character varying NOT NULL,
    visual_icon character varying DEFAULT '''code'''::character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    problem text,
    solution text,
    role_description text,
    key_features json,
    architecture text,
    challenges text,
    impact text,
    gallery json
);


ALTER TABLE public.case_studies OWNER TO postgres;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id uuid NOT NULL,
    requirement_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requirements (
    id uuid NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    company character varying,
    title character varying NOT NULL,
    description text NOT NULL,
    type public.requirementtype NOT NULL,
    tech_stack character varying,
    timeline character varying,
    status public.requirementstatus NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.requirements OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid NOT NULL,
    slug character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    icon character varying DEFAULT '''briefcase'''::character varying NOT NULL,
    tags json DEFAULT '[]'::json NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: site_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_content (
    id uuid NOT NULL,
    key character varying NOT NULL,
    title character varying,
    content text NOT NULL,
    metadata json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.site_content OWNER TO postgres;

--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id uuid NOT NULL,
    author_name character varying NOT NULL,
    author_role character varying NOT NULL,
    author_company character varying NOT NULL,
    author_initials character varying(5) NOT NULL,
    content text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
003
\.


--
-- Data for Name: case_studies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.case_studies (id, slug, title, role, description, industry, technologies, featured, metrics, visual_color, visual_icon, display_order, is_active, created_at, updated_at, problem, solution, role_description, key_features, architecture, challenges, impact, gallery) FROM stdin;
3277621f-c768-4135-b2de-cc04b8640d05	cloud-migration	Cloud Migration Strategy	Solutions Architect	Architecture review, migration planning, and hands-on support for containerizing on-premise services and migrating infrastructure to AWS for a mid-size enterprise.	Cloud / DevOps	[{"name": "AWS", "category": "Infrastructure"}, {"name": "Docker", "category": "Infrastructure"}, {"name": "Kubernetes", "category": "Infrastructure"}, {"name": "Terraform", "category": "Infrastructure"}]	f	\N	fintech	cloud	3	t	2026-02-20 07:22:00.602092+00	2026-02-22 13:15:01.866971+00	The company was running 15+ services on bare-metal servers in a co-located data center. Deployments were manual, scaling required hardware procurement, and the infrastructure team spent most of their time firefighting rather than building.	Conducted a comprehensive architecture review, created a phased migration plan, and led the containerization and migration of all services to AWS. Introduced Infrastructure as Code with Terraform, container orchestration with Kubernetes, and CI/CD pipelines for automated deployments.	Sole architect on the engagement. Conducted the initial assessment, created the migration roadmap, and provided hands-on implementation support. Trained the internal team on Kubernetes operations and Terraform workflows.	["Phased migration plan with zero-downtime cutover strategy", "Containerization of 15+ legacy services using Docker", "Kubernetes cluster setup with auto-scaling policies", "Terraform modules for reproducible infrastructure", "CI/CD pipelines with GitHub Actions for automated deployments"]	AWS EKS for container orchestration, RDS for managed databases, S3 for static assets, and CloudFront for CDN. All infrastructure defined in Terraform modules with separate state files per environment. GitHub Actions handles CI/CD with staging and production deployment workflows.	The biggest risk was migrating the production database with zero downtime. We used AWS DMS for continuous replication during the migration window and implemented a blue-green deployment strategy for the cutover. Another challenge was convincing the team to adopt Infrastructure as Code -- we started with a single non-critical service to demonstrate the value before rolling it out across all services.	Deployment frequency went from bi-weekly manual releases to multiple daily automated deployments. Infrastructure costs decreased by 35% through right-sizing and auto-scaling. The team reclaimed 20+ hours per week previously spent on manual operations.	\N
4b91727e-ad33-4af9-aae4-1bdad73b6021	rajthilak-consulting-platform	Rajthilak Consulting Platform	Full-Stack Engineer & Architect	A full-stack consulting platform built from scratch to streamline how I work with clients. It replaces scattered email threads and proposals with a single interface for requirement submission, project tracking, portfolio showcase, and dynamic content management — all backed by a secure admin dashboard.	Consulting / SaaS	[{"name": "Python", "category": "Language"}, {"name": "TypeScript", "category": "Language"}, {"name": "FastAPI", "category": "Framework"}, {"name": "React", "category": "Framework"}, {"name": "SQLAlchemy", "category": "Framework"}, {"name": "PostgreSQL", "category": "Data & Messaging"}, {"name": "Docker", "category": "Infrastructure"}, {"name": "Nginx", "category": "Infrastructure"}, {"name": "Alembic", "category": "Tools"}, {"name": "Vite", "category": "Tools"}, {"name": "JWT", "category": "Tools"}]	t	[{"value": "7+", "label": "Admin-Editable Content Sections"}, {"value": "60", "label": "Frontend Unit Tests"}, {"value": "19", "label": "Backend API Tests"}, {"value": "< 1s", "label": "Full Page Load Time"}]	primary	code	0	t	2026-02-24 09:06:32.863032+00	2026-02-25 10:47:19.108958+00	Managing consulting engagements through email, Google Docs, and scattered tools created friction for both sides. Clients had no visibility into project progress, proposals lived in inboxes, and there was no central place to showcase past work or accept new requirements. I needed a professional platform that could serve as both a public portfolio and a private project management tool.	Built a production-grade platform with a public-facing site (portfolio, about, contact, services) and a secure admin dashboard. The public side lets visitors browse case studies with rich detail pages, read testimonials, and submit project requirements through a structured form. The admin dashboard provides full CRUD management for case studies, requirements tracking with status workflows and progress bars, internal notes, and a flexible site content management system where every section of the public site can be edited without code changes.	Designed the system architecture, data models, and API contracts from scratch. Built the entire backend (FastAPI, SQLAlchemy, PostgreSQL, JWT auth, rate limiting, file uploads) and frontend (React, TypeScript, Vite) end-to-end. Implemented Docker Compose orchestration for local development and production deployment with Nginx reverse proxy. Created a comprehensive test suite covering all API endpoints and critical frontend flows.	["Secure JWT-based admin authentication with rate-limited login", "Requirement submission with status workflow (new, accepted, in progress, completed, rejected) and progress tracking", "Rich product pages with metrics, technologies, gallery, architecture, and narrative sections", "Dynamic site content management system with structured metadata editors", "File upload system with validation, persistent Docker volumes, and Nginx proxy", "Responsive design across all pages with skeleton loading states", "Admin dashboard with portfolio, requirements, and site content management", "Public portfolio with category-filtered technology tags and proficiency bars"]	Three-service Docker Compose setup: PostgreSQL 16 for data persistence, FastAPI backend (Python 3.12) serving REST APIs with SQLAlchemy ORM and Alembic migrations, and an Nginx container serving the Vite-built React/TypeScript frontend. The API is split into public (unauthenticated), auth (login), and admin (JWT-protected) route groups. Site content uses a flexible key-value model with a JSON metadata column, allowing each section to store structured data (stats, cards, avatar properties, tech categories) without schema migrations. Uploaded files are stored in a named Docker volume and served via FastAPI StaticFiles mount, proxied through Nginx.	Designing the site content system required balancing flexibility with structure — each content section (hero, services, philosophy, tech stack, avatar card) has unique metadata shapes stored as JSON, while the admin form dynamically renders the right editor fields based on the content key. File uploads needed end-to-end wiring across FastAPI (multipart handling, validation), Docker volumes (persistent storage), Nginx (proxy rules), and the React frontend (FormData without Content-Type headers). Keeping the admin forms maintainable as the number of editable sections grew required careful state management patterns.	The platform replaced a fragmented workflow with a single, professional interface. Clients can now submit structured requirements and track progress transparently. The admin dashboard gives me full control over every aspect of the public site without touching code. The portfolio with rich case study pages serves as a living resume that showcases technical depth through architecture diagrams, metrics, and detailed narratives.	null
6d83d160-d2fc-414a-bea7-a8c4e492aa1d	system-centric-view	System Centric View	Full-Stack Developer & System Architect	Designed and built a containerized microservices platform that automatically discovers, classifies, and maps hundreds of IP-connected physical security devices — cameras, intercoms, access controllers, and managed switches — across a campus network. SCV replaces manual spreadsheet-based tracking with real-time automated discovery, interactive topology visualization, and continuous infrastructure health monitoring, all accessible through a modern web interface with role-based access control.	Confined Space Monitoring	[{"name": "Python", "category": "Language"}, {"name": "FastAPI", "category": "Framework"}, {"name": "React", "category": "Framework"}, {"name": "PostgreSQL", "category": "Data & Messaging"}, {"name": "Docker", "category": "Infrastructure"}]	f	[{"value": "300+", "label": "Network devices across the network in under 60 seconds per scan cycle"}, {"value": "5-min polling interval", "label": "Ensuring device inventory is never more than 5 minutes stale"}, {"value": "< 1 min MTTD", "label": "infrastructure server failures (DHCP, video management, SIP, access control) \\u2014 down from hours of user-reported outages"}, {"value": "100% automated device classification", "label": "zero manual tagging required"}, {"value": "30-day scan history", "label": "with device-level diff tracking for change management and audit"}, {"value": "4 microservices", "label": "running in under 512 MB total RAM thanks to the Redis-only architecture"}]	healthcare	activity	1	t	2026-02-20 07:22:00.602092+00	2026-02-27 05:23:39.735288+00	<p>Managing a large-scale physical security network — spanning IP surveillance cameras (Dahua, Vivotek, Mobotix, Axis), Zenitel intercoms, access control units, and hundreds of managed switches — was a manual, error-prone process. Operations teams relied on static spreadsheets and tribal knowledge to track which devices were connected, where they were connected, and whether they were online.</p>\n<p>Key pain points included:</p>\n<ul>\n<li>No single source of truth for the device inventory. Devices were added, moved, or replaced without documentation being updated.</li>\n<li>Topology blind spots. No one could quickly answer "which switch is this camera connected to?" without physically tracing cables or SSH-ing into multiple switches.</li>\n<li>Reactive fault detection. Infrastructure server failures (DHCP, video management, SIP, access control) were discovered when users reported issues, not when they happened.</li>\n<li>Manual onboarding friction. Deploying the tooling to a new site required SSH access and Linux expertise to configure environment variables — a non-starter for operations staff.</li>\n<li>No historical visibility. There was no record of what changed between scans — added or removed devices went unnoticed until someone filed a complaint.</li>\n</ul>	<p>SCV is a Docker Compose-deployed microservices platform consisting of four Python/FastAPI backend services, a Redis data store, and a React single-page application. It automates the full lifecycle of network device discovery:</p>\n<ol>\n<li><strong>Data Collection</strong> — A scheduler polls the DHCP server (supporting ISC, Windows, pfSense, MikroTik, and OpenWrt) every 5 minutes to pull active leases. If the DHCP server is unreachable, the system automatically falls back to querying the Fortinet FortiGate firewall's ARP table.</li>\n\n<li><strong>Topology Discovery</strong> — The core API concurrently SSH-es into every managed Planet, Dymec, and Fortinet switch, pulling LLDP neighbor tables and MAC address tables. It cross-references this data with the DHCP/ARP inventory to build a complete switch-to-device topology graph.</li>\n\n<li><strong>Device Classification</strong> — A configurable MAC OUI vendor lookup and hostname-pattern engine automatically classifies each device by type (camera, intercom, switch, access controller, router) and manufacturer.</li>\n\n<li><strong>Visualization & Monitoring</strong> — The React frontend renders the topology as an interactive diagram, provides a searchable device inventory, displays infrastructure server health in real time, and stores a rolling history of scan results to surface deltas.</li>\n</ol>	<ul>\n<li><strong>Sole architect and developer of the entire platform</strong> — backend services, frontend application, deployment infrastructure, and inter-service communication design</li>\n<li>Designed the microservices architecture and defined service boundaries (core-api, data-collector, monitor-service, service-manager)</li>\n<li>Built all four FastAPI backend services, including the multi-vendor DHCP integration layer, SSH-based switch interrogation engine (supporting three distinct switch CLI interfaces), and the Redis caching strategy</li>\n<li>Developed the React frontend end-to-end — dashboard, device inventory, interactive topology diagram, system health panels, troubleshooting tool, and settings management</li>\n<li>Implemented the MAC vendor classification system with a curated default OUI database and UI-based editing</li>\n<li>Designed the Redis data model (key namespaces, TTLs, time-series storage) to replace the need for a traditional relational database</li>\n<li>Engineered the automatic DHCP-to-ARP failover mechanism to ensure discovery continues during DHCP server outages</li>\n<li>Built the service-manager component that mounts the Docker socket, allowing operators to restart services and update configuration from the browser without host-level access</li>\n</ul>	["Automated multi-source discovery \\u2014 DHCP-primary with Fortinet ARP fallback; supports 5 DHCP server vendors out of the box", "Real-time network topology visualization \\u2014 Interactive hierarchical diagram (ReactFlow) showing switch-to-device connectivity, exportable to PDF", "MAC vendor classification engine \\u2014 UI-editable OUI prefix database for automatic device type and manufacturer tagging", "Concurrent switch interrogation \\u2014 Threaded SSH collection across Planet (pexpect interactive), Dymec (paramiko), and FortiSwitch devices", "Infrastructure health monitoring \\u2014 Continuous SSH-based monitoring of DHCP, video management (NX Witness), SIP, and access control servers with systemd service status checks and CPU/memory metrics", "Discovery history & diff tracking \\u2014 Stores the last 100 scans with 30-day retention; surfaces added/removed devices between consecutive scans", "Troubleshoot tool \\u2014 Search by IP, MAC, or hostname to trace a device through every stage of the discovery pipeline and diagnose why it is or isn't appearing", "In-browser SSH terminal \\u2014 L2 Support users can open interactive terminal sessions to managed switches directly from the web UI", "RDU (Remote Deployment Unit) mode \\u2014 Discovers Peplink routers at remote sites by querying FortiGate VPN tunnel lists", "Zabbix network map export \\u2014 Generates importable Zabbix network map format from discovery data for integration with external monitoring", "UI-driven environment setup \\u2014 Operators configure all credentials, hosts, and service parameters through the frontend \\u2014 no SSH or Linux knowledge required", "Role-based access control \\u2014 Three roles (Operator, L1 Support, L2 Support) with graduated permissions from read-only to full administrative access", "One-command deployment \\u2014 Entire platform spins up with docker compose up -d; a single .env file drives all service configuration"]	<pre>\n┌──────────────────────────────────────────────────────────────────┐\n│                        Browser (React SPA)                       │\n│   Dashboard │ Inventory │ Topology │ Health │ Tools │ Terminal   │\n└──────────────────────────┬───────────────────────────────────────┘\n                           │ nginx reverse proxy (:8080)\n        ┌──────────────────┼─────────────────────┐\n        │                  │                     │\n  ┌─────▼──────┐    ┌──────▼───────┐    ┌────────▼────────┐\n  │  Core API  │    │   Monitor    │    │    Service      │\n  │   :8000    │    │   Service    │    │    Manager      │\n  │            │    │    :8002     │    │     :8003       │\n  │ • Discovery│    │ • Server     │    │ • Docker socket │\n  │ • Topology │    │   health     │    │ • .env mgmt     │\n  │ • Terminal │    │ • Perf       │    │ • Restart svc   │\n  │ • History  │    │   metrics    │    │                 │\n  └─────┬──────┘    └──────┬───────┘    └─────────────────┘\n        │                  │\n        │     ┌────────────┘\n  ┌─────▼─────▼──┐\n  │   Redis 7    │    ┌──────────────────┐\n  │   :6379      │◄───┤  Data Collector  │\n  │              │    │     :8001        │\n  │ • L1 cache   │    │  (host network)  │\n  │ • Topology   │    │                  │\n  │ • History    │    │ • DHCP polling   │\n  │ • Metrics    │    │ • ARP fallback   │\n  │ • Vendors    │    │ • 5-min scheduler│\n  └──────────────┘    └───────┬──────────┘\n                              │ SSH\n        ┌─────────────────────┼─────────────────────┐\n        ▼                     ▼                     ▼\n  ┌──────────┐        ┌────────────┐        ┌────────────┐\n  │  DHCP    │        │  Fortinet  │        │  Planet /  │\n  │  Server  │        │  FortiGate │        │  Dymec /   │\n  │          │        │  Firewall  │        │  FortiSW   │\n  └──────────┘        └────────────┘        └────────────┘\n                              │\n                    ┌─────────┴─────────┐\n                    ▼                   ▼\n              ┌──────────┐      ┌────────────┐\n              │ Cameras  │      │ Intercoms  │\n              │ ACUs     │      │ Routers    │\n              └──────────┘      └────────────┘\n</pre>	<ol>\n<li><strong>Three different switch CLI interfaces</strong></li>\n<p>Planet, Dymec, and Fortinet switches each have completely different SSH command-line interfaces. Planet switches require interactive pexpect-based sessions with prompt detection; Dymec uses standard paramiko exec; Fortinet requires yet another command syntax. I built abstracted SSH service layers for each vendor so the discovery engine treats them uniformly.</p>\n\n<li><strong>DHCP server diversity</strong></li>\n<p>Different sites run different DHCP servers — ISC DHCP on Linux, Windows DHCP, pfSense, MikroTik, OpenWrt. Each has a different lease format and access method. I implemented a pluggable DHCP collection layer that normalizes all lease data into a common schema, making the discovery pipeline vendor-agnostic.</p>\n\n<li><strong>Redis-only persistence (no RDBMS)</strong></li>\n<p>I made a deliberate trade-off to use Redis as the sole data store, eliminating the operational complexity of PostgreSQL migrations and backups. Discovery data is inherently ephemeral — what matters is the current state and recent history, not years of records. Redis TTLs naturally expire stale data, and the 30-day scan history with 100-scan rolling window provides sufficient audit trail.</p>\n\n<li><strong>Data collector needing host network access</strong></li>\n<p>The data-collector must operate on the physical LAN to reach DHCP servers and perform ARP population (subnet pings). Running it in Docker's host network mode solved the problem but introduced the constraint of not being able to use Docker DNS for inter-service communication. I worked around this with explicit IP/port configuration.</p>\n\n<li><strong>Graceful degradation during DHCP outages</strong></li>\n<p>Rather than failing completely when the primary DHCP server goes down, the system automatically falls back to the Fortinet firewall's ARP table. This required implementing ARP population (pinging all subnet addresses to fill the ARP cache) before querying, since the ARP table only contains entries for recently-communicating hosts.</p>\n\n<li><strong>Interactive SSH from the browser</strong></li>\n<p>Giving L2 Support users direct switch access without exposing SSH credentials required building a session-management layer in the core-api that maintains persistent paramiko SSH channels, maps them to frontend WebSocket-like polling, and handles session timeouts and cleanup.</p>\n\n<li><strong>Zero-SSH deployment for operators</strong></li>\n<p>Site operators needed to deploy and configure the platform without any Linux or SSH experience. I built the service-manager microservice that mounts the Docker socket, allowing the frontend's Environment Setup dialog to write the .env file and force-recreate services — turning deployment into a form submission.</p>\n</ol>	<ul>\n<li>SCV transformed network infrastructure management from a reactive, manual process into a proactive, automated one. Operations teams gained instant visibility into the full device inventory and topology — no more tracing cables or guessing which switch a camera is connected to.</li>\n\n<li>The platform eliminated an entire class of incidents caused by undocumented device moves and infrastructure server failures going unnoticed. By surfacing delta changes between scans, teams could catch unauthorized devices or missing equipment before they became security incidents.</li>\n\n<li>The UI-driven deployment model made it possible for non-technical operations staff to stand up HIT-V3 at new sites independently, removing a bottleneck that previously required dedicated engineering time for every deployment. The role-based access control meant the same platform could serve read-only operators checking device status and L2 engineers troubleshooting connectivity — each seeing exactly the tools appropriate to their role.</li>\n\n<li>By integrating with the existing Fortinet firewall infrastructure and supporting multi-vendor DHCP servers, HIT-V3 fit into the existing network architecture without requiring any infrastructure changes — it observes and maps what's already there, adding value on day one.</li>\n<ul>\n	\N
97aca580-3aba-4cba-bd4b-d19aefb2f0d2	real-time-video-gateway	Real-Time Video Gateway	Full-Stack Engineer — Streaming Platform Architect	Designed and built a production-grade video aggregation platform that ingests RTSP feeds from IP cameras, transcodes them via FFmpeg, and delivers sub-500ms latency live streams to web browsers over WebRTC — with continuous recording, playback, snapshot capture, and automated storage lifecycle management.	Real-Time Video Surveillance & Streaming Infrastructure	[{"name": "Python", "category": "Language"}, {"name": "TypeScript", "category": "Language"}, {"name": "FastAPI", "category": "Framework"}, {"name": "SQLAlchemy", "category": "Framework"}, {"name": "Next.js", "category": "Framework"}, {"name": "Tailwind", "category": "Framework"}, {"name": "Headless UI", "category": "Framework"}, {"name": "HLS.js", "category": "Framework"}, {"name": "Alembic", "category": "Tools"}, {"name": "Uvicorn", "category": "Tools"}, {"name": "Loguru", "category": "Tools"}, {"name": "Axios", "category": "Tools"}, {"name": "FFmpeg", "category": "Tools"}, {"name": "Docker", "category": "Infrastructure"}, {"name": "Docker Compose", "category": "Infrastructure"}, {"name": "PostgreSQL", "category": "Data & Messaging"}, {"name": "Redis", "category": "Data & Messaging"}, {"name": "MediaSoup", "category": "Framework"}, {"name": "WebRTC", "category": "Framework"}, {"name": "Nginx", "category": "Infrastructure"}, {"name": "JWT", "category": "Tools"}, {"name": "HLS", "category": "Infrastructure"}]	f	[{"value": "End-to-end latency", "label": "< 500ms (glass-to-glass, WebRTC path)"}, {"value": "Stream recovery time", "label": "< 30 seconds (health detection + auto-restart)"}, {"value": "Concurrent consumers", "label": "Multiple viewers per stream with no transcode duplication (SFU fan-out)"}, {"value": "API coverage", "label": "2 API versions (V1 legacy + V2 modern), 20+ endpoints"}, {"value": "Test coverage", "label": "85+ automated tests (unit + integration)"}, {"value": "Recording uptime", "label": "Continuous HLS with < 10s segment granularity"}, {"value": "Storage efficiency", "label": "Automated tiered retention (hot 7d / cold 90d)"}, {"value": "Services containerized", "label": "5 Docker services, single docker-compose up deployment"}]	telecom	bar-chart	2	t	2026-02-20 07:22:00.602092+00	2026-02-27 05:58:58.626387+00	<p>Traditional IP camera systems rely on thick desktop clients, proprietary NVR hardware, and vendor-locked ecosystems. Organizations managing distributed camera networks face several critical pain points:</p>\n<ul>\n<li><strong>High latency:</strong> Browser-based viewers built on HLS or RTMP introduce 5–30 seconds of delay, making real-time monitoring impractical for security use cases.</li>\n<li><strong>No unified interface:</strong> Operators juggle multiple vendor apps to view feeds from different camera models, each with its own protocol quirks.</li>\n<li><strong>Fragile pipelines:</strong> RTSP streams drop silently — cameras disconnect, networks hiccup, encoders stall — and nobody knows until someone checks manually.</li>\n<li><strong>Storage sprawl:</strong> Continuous recording fills disks with no retention policy, no tiered storage, and no way to find specific moments without scrubbing hours of footage.</li>\n<li><strong>No API-first access:</strong> Existing solutions offer no programmatic interface, blocking integration with alerting systems, analytics pipelines, or custom dashboards.</li>\n</ul>\n<p>The challenge was to build a lightweight, self-hosted streaming platform that solves all of these — with sub-second latency, automatic recovery, and a clean API surface — without depending on proprietary hardware.</p>	<p>A containerized microservice platform comprising four core services orchestrated via Docker Compose:</p>\n<ul>\n<li><strong>FastAPI Backend (Python 3.11)</strong> — REST API, business logic, stream lifecycle management, and async database operations via SQLAlchemy 2.0 against PostgreSQL.</li>\n<li><strong>MediaSoup SFU (Node.js)</strong> — A Selective Forwarding Unit that receives RTP packets from FFmpeg and fans them out to multiple browser consumers over WebRTC, achieving < 500ms glass-to-glass latency.</li>\n<li><strong>FFmpeg Transcoding Layer</strong> — Dual-output pipelines that simultaneously feed the live SFU stream (ultrafast/baseline profile) and write HLS recording segments (veryfast/main profile) to disk.</li>\n<li><strong>Next.js Frontend (React 19 + TypeScript)</strong> — A responsive dashboard with a dual-mode video player that switches seamlessly between live WebRTC and historical HLS playback.</li>\n</ul>\n<p>The architecture follows a Producer-Consumer SFU pattern: each camera gets one Producer (FFmpeg → RTP → MediaSoup), and multiple browser Consumers can subscribe to the same Producer without duplicating the transcode — critical for scaling viewer count without multiplying CPU load.</p>	<p><strong>End-to-end ownership across the full stack:</strong></p>\n<ul>\n<li><strong>Architecture Design</strong> — Defined the RTSP → RTP → SFU → WebRTC pipeline, the stream state machine, and the dual-storage strategy. Chose MediaSoup over Janus/Kurento for its programmability and Node.js integration.</li>\n<li><strong>Backend Development</strong> — Built the FastAPI application: REST APIs (V1 and V2), async SQLAlchemy models, Alembic migrations, Pydantic schemas, service layer, middleware (auth, logging), and background task scheduling.</li>\n<li><strong>Frontend Development</strong> — Implemented the Next.js dashboard including the dual-mode video player, device management UI, snapshot gallery, bookmark viewer, storage configuration panel, and analytics page.</li>\n<li><strong>MediaSoup SFU Integration</strong> — Configured the Node.js SFU server: worker management, PlainRTPTransport for FFmpeg ingestion, WebRtcTransport for browser delivery, SSRC-based producer routing, and RTCP mux configuration.</li>\n<li><strong>FFmpeg Pipeline Engineering</strong> — Designed dual-output FFmpeg commands optimized for simultaneous live streaming (low latency) and recording (high quality), with tuned buffer sizes and codec profiles.</li>\n<li><strong>Stream Reliability</strong> — Built the health monitoring system using transport-level RTP packet counters (replacing an earlier approach that produced false positives), automatic restart with exponential backoff, and state machine transitions.</li>\n<li><strong>Storage & Recording</strong> — Implemented the hot/cold backup scheduler, retention policy enforcement, recording metadata tracking, and timezone-aware scheduling.\nTesting — 85+ unit and integration tests covering API endpoints, service logic, state transitions, and edge cases.</li>\n<li><strong>DevOps</strong> — Docker Compose orchestration across 5 services, host-network configuration for WebRTC, volume mounts for persistent storage, and environment-based configuration.</li>\n</ul>	["Sub-500ms Live Streaming \\u2014 RTSP \\u2192 FFmpeg \\u2192 RTP \\u2192 MediaSoup \\u2192 WebRTC pipeline with UDP-preferred transport and dynamic bitrate (600kbps\\u20131.5Mbps).", "Continuous HLS Recording \\u2014 10-second segment files organized by date, with seekable playback via HLS.js in the browser.", "Dual-Mode Player \\u2014 Single UI component toggling between real-time WebRTC and historical HLS playback with time-range selection.", "Stream Health Monitoring \\u2014 Continuous polling of RTP transport stats; detects stale streams (5 consecutive checks with no packet increase) and triggers automatic restarts with configurable cooldown and retry limits.", "Snapshot Capture \\u2014 On-demand single-frame JPEG extraction from live or recorded streams, stored with full metadata and browsable in a gallery view.", "Video Bookmarks \\u2014 6-second clip extraction (center \\u00b1 3s) with AI-ready annotation fields (label, confidence score, tags) for event flagging.", "Tiered Storage Lifecycle \\u2014 Hot storage (local SSD, 7-day retention) with automated backup to cold storage (NAS/S3, 90-day retention) on a configurable schedule, plus hourly cleanup enforcement.", "JWT + API Key Authentication \\u2014 Scope-based access control (streams:read, streams:write, admin) with OAuth2-ready architecture and pre-seeded default credentials.", "Prometheus Metrics & Health API \\u2014 /health/detailed, /health/streams, and /v2/metrics endpoints for operational visibility and alerting integration.", "Device Management \\u2014 Full CRUD for RTSP cameras with validation, state tracking, and location metadata."]	\n┌─────────────┐     RTSP      ┌───────────┐    RTP (H.264)    ┌──────────────┐\n│  IP Cameras │──────────────▶│  FFmpeg   │──────────────────▶│  MediaSoup   │\n│  (RTSP)     │               │ Transcoder│                   │  SFU Server  │\n└─────────────┘               └────┬──────┘                   └──────┬───────┘\n                                   │                                 │\n                              HLS Segments                     WebRTC (SDP/ICE)\n                              (.ts + .m3u8)                          │\n                                   │                                 │\n                                   ▼                                 ▼\n                          ┌────────────────┐               ┌─────────────────┐\n                          │  Hot Storage   │               │  Browser Client │\n                          │  (Local SSD)   │               │  (Next.js App)  │\n                          └───────┬────────┘               └─────────────────┘\n                                  │ Scheduled Backup                 ▲\n                                  ▼                                  │\n                          ┌────────────────┐               ┌─────────┴────────┐\n                          │  Cold Storage  │               │  FastAPI Backend │\n                          │  (NAS / S3)    │               │  (REST + WS)     │\n                          └────────────────┘               └─────────┬────────┘\n                                                                     │\n                                                           ┌─────────┴───────┐\n                                                           │  PostgreSQL +   │\n                                                           │  Redis          │\n                                                           └─────────────────┘\n	<ol>\n<li><strong>SSRC Mismatch — The Silent Stream Killer</strong></li>\n<p><strong>Problem:</strong> MediaSoup requires the SSRC (Synchronization Source identifier) in the RTP header to match what was declared when creating the Producer. FFmpeg generates SSRCs dynamically, and any mismatch causes the SFU to silently drop every packet — the stream appears connected but shows a black frame.</p>\n\n<p><strong>Solution:</strong> Implemented SSRC extraction from FFmpeg's SDP output and propagated it through the pipeline to MediaSoup's PlainRTPTransport configuration. Added producer readiness verification by polling transport stats for actual packet reception before marking a stream as LIVE.</p>\n\n<li><strong>Health Monitor False Positives</strong></li>\n<p><strong>Problem:</strong> The initial health monitor checked stream state at the application level, which reported healthy streams even when the underlying RTP transport had stalled (e.g., camera network drop).</p>\n\n<p><strong>Solution:</strong> Rewrote the monitor to query MediaSoup's transport-level statistics — specifically the recv tuple's packetCount. A stream is considered stale only after 5 consecutive checks show zero packet increment, eliminating false positives from transient network jitter.</p>\n\n<li><strong>Latency vs. Recording Quality</strong></li>\n<p><strong>Problem:</strong> A single FFmpeg output cannot optimize for both low latency (live) and high quality (recording) simultaneously. Ultrafast encoding is visually poor for archival; high-quality encoding introduces buffering delay.</p>\n\n<p><strong>Solution:</strong> Dual-output FFmpeg pipelines: one output with ultrafast preset and baseline profile (1000k buffer) feeds the SFU for live viewing, while a second output with veryfast preset and main profile (6000k buffer) writes HLS segments for recording. This doubles CPU usage per stream but cleanly separates the latency and quality concerns.</p>\n\n<li><strong>Producer Accumulation</strong></li>\n<p><strong>Problem:</strong> When streams restarted (manually or via auto-recovery), stale Producer records accumulated in the database, causing the SFU to attempt routing to defunct producers and breaking new stream instances.</p>\n\n<p><strong>Solution:</strong> Added state=ACTIVE query filtering for producer lookups and implemented cleanup-on-reconnect logic that deactivates old producers before creating replacements. Combined with the state machine to ensure only valid transitions occur.</p>\n\n<li><strong>Storage Lifecycle at Scale</strong></li>\n<p><strong>Problem:</strong> Continuous recording from multiple cameras generates hundreds of gigabytes daily. Without automated management, disks fill within days.</p>\n\n<p><strong>Solution:</strong> Implemented a two-tier storage strategy with configurable retention (hot: 7 days, cold: 90 days). A background scheduler runs hourly cleanup, and a separate backup task copies segments from hot to cold storage with integrity verification. Timezone-aware scheduling ensures backups run during low-activity windows regardless of server locale.</p>	<p>This platform eliminates the dependency on proprietary NVR hardware and vendor-locked desktop clients. Any RTSP-compatible camera — regardless of manufacturer — can be onboarded through the API and viewed in a standard web browser with near-real-time latency.</p>\n\n<p><strong>For operations teams</strong>, the health monitoring and auto-restart system means streams recover silently without human intervention — transforming camera monitoring from a babysitting task into a set-and-forget deployment.</p>\n\n<p><strong>For developers</strong>, the API-first design (JWT-secured, scope-controlled, Swagger-documented) means the platform can serve as infrastructure for higher-level applications: AI-powered analytics, event-driven alerting, or multi-site dashboards — without rebuilding the streaming pipeline.</p>\n\n<p><strong>For cost-conscious deployments</strong>, the SFU architecture avoids the CPU multiplication of MCU-based solutions. Adding a viewer costs a single WebRTC negotiation, not another transcode — making it viable to run on modest hardware while still serving multiple simultaneous viewers.</p>\n\n<p>The tiered storage strategy with automated retention turns raw footage into a managed asset, preventing the storage sprawl that plagues most self-hosted camera systems while preserving access to historical footage for the retention window that matters.</p>	\N
0e574ee1-19f0-487f-955c-78d663ed719c	ai-powered-monitoring-platform	AI-Powered Monitoring Platform	Full-Stack AI Platform Engineer (Architecture, Backend, AI Runtime, Frontend, Infrastructure, DevOps)	Designed and built an end-to-end AI video intelligence platform that consumes live CCTV streams from an upstream Real-Teme Video Gateway, applies real-time computer vision models, and surfaces safety violations to operators through a purpose-built portal — enabling industrial facilities to detect and respond to safety incidents in seconds rather than minutes.	AI / Computer Vision / Industrial Safety & Surveillance	[{"name": "Python", "category": "Language"}, {"name": "LangChain", "category": "AI & ML"}, {"name": "OpenAI", "category": "AI & ML"}, {"name": "FastAPI", "category": "Framework"}, {"name": "TypeScript", "category": "Language"}, {"name": "SQLAlchemy", "category": "Framework"}, {"name": "Pydantic", "category": "Framework"}, {"name": "React", "category": "Framework"}, {"name": "Alembic", "category": "Tools"}, {"name": "PyTorch", "category": "AI & ML"}, {"name": "torchvision", "category": "AI & ML"}, {"name": "OpenCV", "category": "AI & ML"}, {"name": "YOLOv7-Pose", "category": "AI & ML"}, {"name": "Ollama", "category": "AI & ML"}, {"name": "PostgreSQL", "category": "Data & Messaging"}, {"name": "Redis", "category": "Data & Messaging"}, {"name": "Docker Compose", "category": "Infrastructure"}, {"name": "Nginx", "category": "Infrastructure"}, {"name": "pytest", "category": "Tools"}, {"name": "Locust", "category": "Tools"}]	f	[{"value": "60%", "label": "Faster Response Time"}, {"value": "85%", "label": "Query Resolution Rate"}, {"value": "24/7", "label": "Availability"}, {"value": "4", "label": "Concurrent models"}, {"value": "0 Disruption", "label": "New models added without any runtime core changes"}]	fintech	database	4	t	2026-02-20 07:22:00.602092+00	2026-02-27 16:14:23.882301+00	<p>Industrial facilities relied on passive CCTV monitoring — operators watched dozens of video feeds manually, hoping to catch safety incidents as they happened. This approach had critical failures:</p>\n<ul>\n<li><strong>Human fatigue:</strong> Operators missed ~90% of incidents after 20 minutes of continuous monitoring</li>\n<li><strong>No automated detection:</strong> Falls, missing PPE, and unauthorized zone intrusions went unrecorded</li>\n<li><strong>No evidence chain:</strong> When incidents were spotted, there was no automatic snapshot/video evidence linked to the event</li>\n<li><strong>No analytics:</strong> Facility managers had zero visibility into incident patterns, hotspots, or trends</li>\n<li><strong>Siloed video infrastructure:</strong> The existing Video Analytics Service (VAS-MS-V2) handled camera transport but had no AI intelligence layer — video flowed, but nothing was learned from it</li>\n</ul>	<p>AI-Powered Monitoring Platform is a multi-service platform that leverages the video streams from Real-Time Video Gateway and transforms passive video streams into actionable safety intelligence. The system follows a strict architectural boundary: Real-Time Video Gateway owns video transport, AI-Powered Monitoring Platform owns video intelligence.</p>\n\n<p>The platform comprises four core services:</p>\n<ol>\n<li><strong>AI-Powered Monitoring Platform Backend (FastAPI)</strong> — Orchestrates the entire domain: device registration, stream lifecycle management, event ingestion from AI models, violation lifecycle (open → reviewed → dismissed/resolved), evidence capture (snapshots + bookmarks via Real-Time Video Gateway  APIs), analytics aggregation, and system health monitoring.</li>\n\n<li><strong>AI Runtime (Plugin Architecture)</strong> — A model-agnostic inference platform that discovers, loads, and executes AI models as opaque plugins. Each model declares its contract via model.yaml, and the runtime handles GPU allocation, concurrency control, failure isolation, and health reporting — all without knowing what any model actually does.</li>\n\n<li><strong>Operator Portal (React)</strong> — A role-based web application for operators, supervisors, and administrators. Displays live video with detection overlays, real-time violation alerts, camera status dashboards, analytics charts, system health views, and an NLP chat interface for natural-language database queries.</li>\n\n<li><strong>NLP Chat Service (Ollama)</strong> — Converts natural language questions ("How many falls happened on Camera 3 this week?") into SQL queries against the violations database and returns human-readable answers.</li>\n</ol>	<p>Served as the sole engineer across all phases of the project, responsible for:</p>\n<ul>\n<li><strong>Architecture Design:</strong> Defined the system architecture, service boundaries, domain model, and data flow across all components; authored the System Architecture Design document</li>\n<li><strong>API Contract Specification:</strong> Designed all REST API contracts (public and internal), request/response schemas, error semantics, and versioning strategy</li>\n<li><strong>Backend Implementation:</strong> Built the complete FastAPI backend — 11,300+ lines of async Python covering device management, event ingestion, violation orchestration, evidence linking, analytics, and health monitoring</li>\n<li><strong>AI Runtime Platform:</strong> Designed and implemented the model-agnostic plugin architecture with GPU management, concurrency control, failure sandboxing, contract validation, and auto-discovery</li>\n<li><strong>Frontend Development:</strong> Built the React/TypeScript operator portal — 14 pages, 50+ components, WebRTC video integration, real-time data fetching, role-based access control</li>\n<li><strong>Infrastructure & DevOps:</strong> Designed the containerized deployment (9 Docker services), nginx configuration, database migrations, and multi-network topology</li>\n<li><strong>Testing:</strong> Wrote integration, unit, and load test suites across all services</li>\n</ul>	["Real-time multi-model inference: 4 AI models running concurrently (fall detection, PPE compliance, geofencing, tank overflow) across multiple camera streams with configurable FPS throttling", "Model plugin system: Zero-disruption model integration \\u2014 new models are added as directory packages with a model.yaml contract, requiring zero changes to the runtime core", "Violation lifecycle management: Full state machine (open \\u2192 reviewed \\u2192 dismissed/resolved) with operator actions, confidence scoring, and audit trail", "Automated evidence capture: On detection, the system automatically triggers VAS snapshot and bookmark APIs, linking evidence directly to violations", "Live video with detection overlays: WebRTC streaming with bounding box overlays rendered in the browser", "Role-based operator portal: 14 pages with route guards (Operator, Supervisor, Admin), including dashboard, alerts, camera views, analytics, system health, and model status", "Operational analytics: Violations per camera, violations over time, confidence distribution, with time-range selectors and data export (Excel/PDF)", "NLP chat interface: Natural language queries against the violations database using local Ollama LLMs (no external API dependencies)", "Failure isolation: One model crash cannot affect other models or the runtime; camera stream failures don't crash AI processing", "Comprehensive health monitoring: Liveness/readiness probes for all components (database, Redis, VAS, each AI model), exposed as Prometheus metrics"]	┌──────────────────────────────────────────────────────────────────┐\n│              EXTERNAL: REAL TIME VIDEO GATEWAY                   │\n│  IP Cameras → RTSP → FFmpeg → MediaSoup (SFU) → WebRTC/HLS       │\n│                              REST API (port 8085)                │\n└──────────────┬───────────────────────────────┬───────────────────┘\n               │ WebRTC Frames                 │ REST API\n               ▼                               ▼\n┌──────────────────────────────────────────────────────────────────┐\n│                      AI MONITORING DOMAIN                        │\n│                                                                  │\n│  ┌─────────────────────────────────────────────────────────┐     │\n│  │              AI MONITORING BACKEND (FastAPI)            │     │\n│  │  Stream Manager → Event Engine → Evidence Linker        │     │\n│  │  Device Sync │ Violation Lifecycle │ Analytics │ Health │     │\n│  └──────┬──────────────────┬───────────────────────────────┘     │\n│         │ Frames           │ Events                              │\n│         ▼                  ▼                                     │\n│  ┌─────────────────────────────────────────────────────────┐     │\n│  │              AI RUNTIME (Plugin Architecture)           │     │\n│  │  Registry → Loader → Pipeline → Sandbox                 │     │\n│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────────┐   │     │\n│  │  │ Fall   │ │  PPE   │ │ Geofence │ │ Tank Overflow │   │     │\n│  │  │ Detect │ │ Detect │ │          │ │               │   │     │\n│  │  └────────┘ └────────┘ └──────────┘ └───────────────┘   │     │\n│  └─────────────────────────────────────────────────────────┘     │\n│                                                                  │\n│  ┌─────────────────────────────────────────────────────────┐     │\n│  │          OPERATOR PORTAL (React + TypeScript)           │     │\n│  │  Dashboard │ Live Video │ Alerts │ Analytics │ Settings │     │\n│  └─────────────────────────────────────────────────────────┘     │\n│                                                                  │\n│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐     │\n│  │ PostgreSQL   │  │    Redis     │  │ NLP Chat (Ollama)   │     │\n│  │ (Violations) │  │  (Sessions)  │  │ (Natural Language)  │     │\n│  └──────────────┘  └──────────────┘  └─────────────────────┘     │\n└──────────────────────────────────────────────────────────────────┘\n	<ol>\n<li><strong>Multi-Model GPU Contention</strong></li>\n<p>Running 4 models concurrently on shared GPU hardware created contention. I implemented an admission control system with per-model concurrency limits, GPU memory allocation tracking, and a sandboxed execution pipeline that prevents one model's OOM from crashing others.</p>\n\n<li><strong>Real-Time Frame Pipeline at Scale</strong></li>\n<p>Processing frames from multiple cameras through multiple models at configurable FPS required careful scheduling. The solution was a frame scheduler that decouples camera streams from model execution, throttling per-model FPS independently and dropping frames gracefully under load rather than queuing unboundedly.</p>\n\n<li><strong>Evidence Atomicity</strong></li>\n<p>When a violation is detected, the system must capture a snapshot and create a bookmark in VAS — but these are separate API calls that can partially fail. I implemented an evidence linking service that handles partial failures gracefully, retries with exponential backoff, and maintains referential integrity between violations and evidence records.</p>\n\n<li><strong>Frontend Real-Time Consistency</strong></li>\n<p>The operator portal must display real-time violations, live video, and system health simultaneously without overwhelming the browser or backend. I used TanStack React Query with tuned polling intervals per data type (violations: 5s, health: 30s, analytics: 60s), stale-while-revalidate semantics, and automatic reconnection with exponential backoff.</p>\n\n<li><strong>NLP-to-SQL Safety</strong></li>\n<p>The chat service translates natural language to SQL — a vector for SQL injection. I implemented a SQL validator that restricts queries to a whitelist of allowed tables, rejects DDL/DML statements, and runs queries with a read-only database connection.</p>	<p><strong>From passive watching to active detection.</strong> AI-Powered Monitoring Platform transformed a manual camera monitoring operation into an automated safety intelligence system. Operators no longer need to watch every feed — the system watches for them and surfaces only the events that require human attention.</p>\n\n<p><strong>Reduced incident response time.</strong> By detecting falls, missing PPE, and zone intrusions in real-time and immediately capturing evidence (snapshots + video bookmarks), the system compresses the time from incident to response from minutes (or never, if missed) to seconds.</p>\n\n<p><strong>Scalable AI without per-camera cost.</strong> The shared runtime architecture means adding a new camera doesn't require a new model instance — it just adds frames to the scheduler. This makes the economics of AI surveillance viable at scale.</p>\n\n<p><strong>Extensible without rewrites.</strong> The model plugin architecture means the platform grows by dropping new model directories into the runtime, not by rewriting the platform. Fall detection today, fire detection tomorrow — same runtime, same backend, same frontend.</p>\n\n<p><strong>Operational visibility where none existed.</strong> Facility managers gained analytics dashboards showing violation patterns, camera hotspots, and trend lines — data that simply didn't exist before. The NLP chat interface made this data accessible without SQL knowledge.</p>	\N
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (id, requirement_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requirements (id, name, email, company, title, description, type, tech_stack, timeline, status, progress, created_at, updated_at) FROM stdin;
afc9e476-0963-48b7-b6fc-c1c2e560c552	Alice Johnson	alice@techcorp.io	TechCorp	Cloud Migration Strategy	We need help migrating our on-premise infrastructure to AWS. Looking for architecture review, migration planning, and hands-on support for containerizing our services.	contract	AWS, Docker, Kubernetes, Terraform	3 months	new	0	2026-02-18 11:27:25.692562+00	2026-02-18 11:27:25.692562+00
5ababcc5-5ab6-47d9-99c4-f12ef9940e59	Bob Martinez	bob@startupxyz.com	StartupXYZ	MVP Development for SaaS Platform	Early-stage startup looking for a technical consultant to help build our MVP. Need full-stack development guidance, tech stack selection, and hands-on coding support.	one_off	React, Python, PostgreSQL	6 weeks	new	0	2026-02-18 11:27:25.692562+00	2026-02-18 11:27:25.692562+00
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, slug, title, description, icon, tags, display_order, is_active, created_at, updated_at) FROM stdin;
a626f9ca-c310-4cd4-9431-2f7e7ab4ce57	full-time-consulting	Full-Time Consulting	Embedded within your team for extended engagements. I bring architecture leadership, code reviews, mentoring, and hands-on development to accelerate your roadmap.	briefcase	["Team Integration", "Architecture", "Mentoring"]	0	t	2026-02-20 07:22:00.609063+00	2026-02-20 07:22:00.609063+00
355924de-29e9-4b98-8f2e-ad9005a7d52c	contract-engagements	Contract Engagements	Scoped projects with clear deliverables and timelines. From API design and cloud migration to full-stack product development -- I own the outcome end to end.	edit	["Fixed Scope", "Clear Milestones", "Deliverables"]	1	t	2026-02-20 07:22:00.609063+00	2026-02-20 07:22:00.609063+00
204c7999-303c-4979-aeb0-1daa43f44917	one-off-projects	One-Off Projects	Need a quick architecture review, tech stack recommendation, or proof-of-concept build? I offer focused engagements to solve specific technical challenges fast.	clock	["Architecture Review", "PoC Builds", "Tech Advisory"]	2	t	2026-02-20 07:22:00.609063+00	2026-02-20 07:22:00.609063+00
\.


--
-- Data for Name: site_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_content (id, key, title, content, metadata, created_at, updated_at) FROM stdin;
d8f24895-c8a8-4f8f-a755-8d15009a06d8	about_why_platform	Why I Built This Platform	<p>Most consulting engagements start with email threads, scattered proposals, and unclear expectations. I built this platform to bring <strong>structure, transparency, and clarity</strong> to how I work with clients.</p><p>Here, you can submit a requirement, track its progress, and communicate directly with me through a single interface. No middlemen, no ambiguity -- just a streamlined workflow designed to get your project off the ground faster.</p>	\N	2026-02-21 09:02:15.225017+00	2026-02-21 09:02:15.225017+00
aa6f6e69-8f2b-44bd-bc42-f96b26571928	about_philosophy	Engineering Philosophy	Four principles that guide every project I take on, from architecture to deployment.	{"overline": "Engineering Philosophy", "heading": "How I Approach Engineering", "cards": [{"title": "Ship Early, Iterate Fast", "description": "I prioritize getting a working system in front of users as quickly as possible. Early feedback beats perfect architecture every time. Start with an MVP, learn from real usage, and iterate based on what actually matters."}, {"title": "Boring Tech Over Hype", "description": "I default to proven, well-documented technologies unless there is a clear reason to do otherwise. PostgreSQL over a trendy NoSQL database. FastAPI over experimental frameworks. Battle-tested tools ship faster and break less."}, {"title": "Design for Observability", "description": "Systems will fail. When they do, you need to know exactly what went wrong. I build with structured logging, metrics, and monitoring from day one -- not as an afterthought. If you cannot measure it, you cannot improve it."}, {"title": "Write Code People Can Read", "description": "Code is read far more often than it is written. I optimize for clarity over cleverness. Good variable names, small functions, and clear separation of concerns make systems easier to extend, debug, and hand off to your team."}]}	2026-02-21 09:28:01.343944+00	2026-02-21 09:28:01.343944+00
7c1cbc84-1ffe-4145-bc2a-7d8a99f5a358	home_services	Services Section	Flexible consulting arrangements tailored to your project needs, timeline, and budget.	{"overline": "What I Do", "heading": "Engagement Models", "cards": [{"title": "Full-Time Consulting", "description": "Embedded within your team for extended engagements. I bring architecture leadership, code reviews, mentoring, and hands-on development to accelerate your roadmap.", "icon": "briefcase", "tags": ["Team Integration", "Architecture", "Mentoring"]}, {"title": "Contract Engagements", "description": "Scoped projects with clear deliverables and timelines. From API design and cloud migration to full-stack product development -- I own the outcome end to end.", "icon": "edit", "tags": ["Fixed Scope", "Clear Milestones", "Deliverables"]}, {"title": "One-Off Projects", "description": "Need a quick architecture review, tech stack recommendation, or proof-of-concept build? I offer focused engagements to solve specific technical challenges fast.", "icon": "clock", "tags": ["Architecture Review", "PoC Builds", "Tech Advisory"]}]}	2026-02-21 10:12:05.426284+00	2026-02-21 10:12:05.426284+00
a69ea6d2-df9c-4303-8c44-b3f6f5745a7e	about_hero	About Hero Section	I’m Raj Thilak, focused on building production-grade platforms that ship.\n\nI specialize in turning complex ideas into reliable systems across network automation, real-time streaming, and AI-powered products — owning architecture through deployment. This portfolio is itself a live example of that end-to-end approach.	{"overline": "About Me", "heading": "Building <span class=\\"highlight\\">Scalable Systems</span> That Ship", "stats": [{"value": 13, "suffix": "+", "label": "Years Experience"}, {"value": 20, "suffix": "+", "label": "Projects Delivered"}, {"value": 4, "suffix": "", "label": "Industries"}], "avatar": {"initials": "RT", "name": "Rajthilak ", "title": "Product & Platform Engineer", "education": "B.E. (Computer Science), MBA (Finance), DBA (AI & ML) \\u2014 In Progress", "photoUrl": "/uploads/cb68efa717c2_Rajthilak_Passport_size_photo.jpg", "photoZoom": 100, "photoOffsetY": 0, "github": "https://github.com/grthilak-rl", "linkedin": "https://www.linkedin.com/in/rajthilak-g", "email": "rajthilak.sitm@gmail.com"}}	2026-02-21 09:02:15.225017+00	2026-02-24 08:42:43.74433+00
de9f274e-3b39-4bf2-813c-96ef7f1e0309	about_tech_stack	Technical Stack	Technologies and tools I use across the full stack, from infrastructure to frontend.	{"overline": "Technical Stack", "heading": "What I Work With", "categories": [{"name": "Backend & APIs", "techs": ["Python", "FastAPI", "Java", "Spring Boot", "Node.js", "GraphQL"]}, {"name": "Frontend", "techs": ["React", "TypeScript", "Next.js", "Vue.js", "TailwindCSS"]}, {"name": "Data & Messaging", "techs": ["PostgreSQL", "Redis", "Kafka", "MongoDB"]}, {"name": "Cloud & DevOps", "techs": ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions"]}, {"name": "AI & ML", "techs": ["OpenAI", "LangChain", "Pinecone", "Hugging Face"]}, {"name": "Tools & Practices", "techs": ["Git", "pytest", "Jest", "OpenAPI"]}]}	2026-02-22 09:14:15.401705+00	2026-02-22 12:40:49.565129+00
e0734b4b-3e6a-4310-98f7-786ac097f52b	hero_description	Engineering Leader. Systems Architect. Technical Consultant.	I help companies design and build production-grade systems -- from cloud migrations and platform engineering to AI-powered products. Full-time, contract, or one-off.	{"clients_label": "Trusted by teams at", "clients": ["Barclays", "Morgan Stanley", "Visics ATG India Pvt Ltd."]}	2026-02-20 07:22:00.635694+00	2026-02-22 15:28:46.197158+00
056ac537-2315-47a7-b75b-7393997d7102	portfolio_hero	Portfolio Page	From healthcare platforms processing thousands of patient records to AI assistants handling millions of conversations -- here is the work that defines my engineering practice.	{"overline": "Projects & Portfolio", "heading": "Systems I Have <span class=\\"highlight\\">Designed & Built</span>", "cta_heading": "Have a project in mind?", "cta_description": "Whether it is a cloud migration, an MVP build, or an AI integration -- let us talk about how I can help your team ship.", "cta_button": "Submit a Requirement"}	2026-02-22 09:14:15.401705+00	2026-02-22 12:41:01.782716+00
c97f7da7-0ba6-417c-9e09-ec4c64be23fc	about_story	My Story	  <p>\n    I’m an engineering leader and systems architect with over a decade of experience building and scaling \n    production-grade platforms across network automation, infrastructure, real-time video systems, and AI-driven products.\n    My career has been shaped by solving complex, real-world problems in environments where reliability, security, \n    and scale matter.\n  </p>\n\n  <p>\n    I began my journey working on large-scale enterprise systems at \n    <strong>Barclays</strong> and <strong>Morgan Stanley</strong>, where I learned how to design automation \n    and platform workflows that operate under strict reliability and compliance requirements. \n    These environments taught me how to think in systems, not just code — optimizing for observability, \n    fault tolerance, and long-term maintainability.\n  </p>\n\n  <p>\n    Over time, I gravitated toward building platforms from the ground up. At <strong>Visics ATG</strong>, \n    I led the design and development of multiple production systems including \n    <strong>HIT</strong> (an automated network discovery and topology platform), \n    <strong>VAS</strong> (a real-time RTSP-to-WebRTC streaming gateway), and \n    <strong>Ruth AI</strong> (an AI-powered monitoring and compliance platform). \n    These systems brought together networking, backend platforms, frontend dashboards, \n    containerization, and AI inference into cohesive, deployable products.\n  </p>\n\n  <p>\n    What drives my work is ownership. I enjoy taking ambiguous problems, shaping the architecture, \n    making the technical trade-offs, and delivering systems that teams can run and evolve in production.\n    Whether I’m automating network discovery, designing a media streaming pipeline, or integrating AI models \n    into real-time workflows, I focus on building systems that are reliable, observable, and practical to operate.\n  </p>\n\n  <p>\n    Today, I work with teams as a full-time contributor or consultant to help design and deliver \n    production-grade platforms — from network automation and platform engineering to real-time video \n    and AI-powered systems. I’m most effective in roles where I can bridge architecture and execution, \n    and help teams move from idea to a system that actually runs in the real world.\n  </p>\n	\N	2026-02-21 09:02:15.225017+00	2026-02-23 08:14:47.15185+00
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, author_name, author_role, author_company, author_initials, content, rating, featured, is_active, created_at, updated_at) FROM stdin;
5561db71-d7cf-4506-a092-df7311260317	Alice Johnson	VP Engineering	TechCorp	AJ	Raj took our fragmented on-premise systems and designed a clean migration path to AWS. His architecture decisions saved us months of rework. Truly an engineer who thinks in systems.	5	t	t	2026-02-20 07:22:00.613734+00	2026-02-20 07:22:00.613734+00
4c01cd8e-4fd9-4738-b247-0260fa6c1236	Bob Martinez	CTO	StartupXYZ	BM	We needed someone who could both architect the system and write production code. Raj delivered our MVP two weeks ahead of schedule and the codebase was impeccable. Highly recommend.	5	t	t	2026-02-20 07:22:00.613734+00	2026-02-20 07:22:00.613734+00
3d1f1a5f-3b9c-443e-9877-48b5796fb0be	Sarah Kim	Head of Product	Ruth Labs	SK	The AI assistant Raj built for our support team cut response times by 60% and handles 85% of incoming queries autonomously. The ROI was evident within the first month of deployment.	5	t	t	2026-02-20 07:22:00.613734+00	2026-02-20 07:22:00.613734+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, created_at) FROM stdin;
9f835bae-ca30-4a5b-9953-0b5767be2512	admin@example.com	$2b$12$fupz0NdKpp6xJhLEBBPeeO7o089USTaopWI7I1rAfz.U9Lwg8S8Tq	2026-02-18 11:27:25.374427+00
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: case_studies case_studies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_studies
    ADD CONSTRAINT case_studies_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_case_studies_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_case_studies_slug ON public.case_studies USING btree (slug);


--
-- Name: ix_services_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_services_slug ON public.services USING btree (slug);


--
-- Name: ix_site_content_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_site_content_key ON public.site_content USING btree (key);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: notes notes_requirement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_requirement_id_fkey FOREIGN KEY (requirement_id) REFERENCES public.requirements(id);


--
-- PostgreSQL database dump complete
--

\unrestrict QfqVAaPdH7XBhhUwmy7oAwNNJmP087cY3yvzsUeVQaZrwujq7szxidioggr3XwJ

