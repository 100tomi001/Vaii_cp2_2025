import { Link } from "react-router-dom";
import { mockWikiArticles } from "../MockData";

export default function Wiki() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Wiki</h1>
        <p className="page-subtitle">
          Články s návodmi, tipmi a stratégiami pre hry Paradox Interactive.
        </p>
      </div>

      <div className="card">
        <h2>Všetky články</h2>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {mockWikiArticles.map((article) => (
            <Link
              key={article.id}
              to={`/wiki/${article.id}`}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "#020617",
                border: "1px solid #1f2937",
              }}
            >
              <div style={{ fontWeight: 500 }}>{article.title}</div>
              <div className="topic-meta">
                {article.game} · aktualizované {article.lastUpdated}
              </div>
              <p style={{ marginTop: 6, fontSize: "0.9rem" }}>{article.summary}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {article.tags?.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.75rem",
                      padding: "2px 6px",
                      borderRadius: 999,
                      background: "#020617",
                      border: "1px solid #1f2937",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
