import portfolio from "../data/portfolio";

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
};

const badgeStyle = {
  display: "inline-block",
  background: "#eee",
  borderRadius: 4,
  padding: "2px 8px",
  marginRight: 6,
  marginBottom: 4,
  fontSize: 13,
};

export default function Portfolio() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Portfolio</h1>
      {portfolio.map((project) => (
        <div key={project.name} style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>{project.name}</h2>
          <p>{project.description}</p>
          <p>
            <strong>Role:</strong> {project.role}
          </p>
          <div>
            {project.tech_stack.map((tech) => (
              <span key={tech} style={badgeStyle}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
