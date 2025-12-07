import { useParams, Link, useNavigate } from "react-router-dom";
import { mockWikiArticles } from "../MockData";

export default function WikiArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const article = mockWikiArticles.find((a) => a.id === Number(id));

  if (!article) {
    return (
      <div className="page">
        <div className="card">
          <h2>Článok neexistuje</h2>
          <button className="btn-secondary" onClick={() => navigate("/wiki")}>
            Späť na wiki
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{article.title}</h1>
        <p className="page-subtitle">
          {article.game} · naposledy aktualizované {article.lastUpdated}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
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
      </div>

      <div className="card">
        {/* article.content je obyčajný text – pre jednoduchosť použijeme <pre> */}
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            fontSize: "0.95rem",
          }}
        >
          {article.content}
        </pre>
      </div>

      <div className="card">
        <Link to="/wiki" className="btn-link">
          ← Späť na zoznam článkov
        </Link>
      </div>
    </div>
  );
}
