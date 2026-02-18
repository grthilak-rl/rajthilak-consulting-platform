import type { Project } from "../types";

const portfolio: Project[] = [
  {
    name: "HIT",
    description:
      "A healthcare information technology platform designed to streamline clinical workflows, improve patient data management, and enable seamless interoperability across hospital systems.",
    tech_stack: ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
    role: "Lead Backend Engineer",
  },
  {
    name: "VAS",
    description:
      "A value-added services platform enabling telecom operators to deliver digital content, subscription management, and billing integration at scale for millions of subscribers.",
    tech_stack: ["Java", "Spring Boot", "Kafka", "Redis", "AWS"],
    role: "Full Stack Developer",
  },
  {
    name: "Ruth AI",
    description:
      "An AI-powered conversational assistant built to automate customer support, handle complex queries with context awareness, and reduce response times through intelligent routing.",
    tech_stack: ["Python", "LangChain", "OpenAI", "FastAPI", "React"],
    role: "AI/ML Engineer & Architect",
  },
];

export default portfolio;
