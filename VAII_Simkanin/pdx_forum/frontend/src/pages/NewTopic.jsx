import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function NewTopic() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  // ak nie je prihlásený, pošleme ho na login
  if (!user) {
    return (
      <div className="page">
        <div className="card">
          <h2>Na vytvorenie témy sa musíš prihlásiť</h2>
          <p>
            Pre vytvorenie novej diskusie je potrebný účet. 
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Link to="/login" className="btn-primary">
              Prihlásiť sa
            </Link>
            <Link to="/register" className="btn-secondary">
              Registrácia
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Vyplň názov témy aj obsah prvého príspevku.");
      return;
    }

    try {
      const res = await api.post("/topics", {
        title: title.trim(),
        content: content.trim(),
      });

      // backend vracia id novej témy
      const newId = res.data.id;
      navigate(`/topic/${newId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Chyba pri vytváraní témy.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nová téma</h1>
        <p className="page-subtitle">
          Vytvor novú diskusiu – prvý príspevok bude úvodný post v téme.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Názov témy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            rows={8}
            placeholder="Úvodný príspevok – popíš tému, otázku, problém..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              background: "#020617",
              border: "1px solid #1f2937",
              borderRadius: 10,
              padding: "8px 10px",
              color: "#e5e7eb",
              resize: "vertical",
            }}
          />

          <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
            Vytvoriť tému
          </button>
        </form>

        {error && <p style={{ color: "salmon", marginTop: 8 }}>{error}</p>}

        <p style={{ marginTop: 10 }}>
          <Link to="/forum" className="btn-link">
            ← Späť na fórum
          </Link>
        </p>
      </div>
    </div>
  );
}
