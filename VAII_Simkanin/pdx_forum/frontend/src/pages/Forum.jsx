import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Tag from "../components/Tag";
import { mockTags } from "../MockData"; // kľudne nechaj zatiaľ mock tagy
import { useAuth } from "../context/AuthContext";

const TABS = ["Home", "Trending", "Latest threads", "New posts"];

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedTag, setSelectedTag] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // načítame témy z backendu
useEffect(() => {
  const load = async () => {
    try {
      const res = await api.get("/topics");
      setTopics(res.data);
    } catch (err) {
      console.error("Chyba pri načítaní tém", err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);


  const topicsForTab = useMemo(() => {
  // doplníme default hodnoty, aby nič nepadlo
  let list = topics.map((t) => ({
    ...t,
    replies: Number(t.replies ?? 0),
    last_activity: t.last_activity || t.created_at,
  }));

  if (selectedTag) {
    list = list;
  }

  switch (activeTab) {
    case "Trending":
      return list.slice().sort((a, b) => b.replies - a.replies);
    case "Latest threads":
      return list
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
    case "New posts":
      return list
        .slice()
        .sort(
          (a, b) =>
            new Date(b.last_activity).getTime() -
            new Date(a.last_activity).getTime()
        );
    case "Home":
    default:
      return list;
  }
}, [activeTab, selectedTag, topics]);

  const handleOpenTopic = (id) => {
    navigate(`/topic/${id}`);
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) setSelectedTag(null);
    else setSelectedTag(tag);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Fórum</h1>
        <p className="page-subtitle">
          Témy načítané z backendu (PostgreSQL).
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="forum-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`forum-tab ${activeTab === tab ? "forum-tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            gap: 12,
            alignItems: "center",
          }}
        >
          <h2>Diskusné témy</h2>
          {user && (
            <button
            className="btn-primary"
            onClick={() => navigate("/topic/new")}>
            + Nová téma
            </button>
)}
        </div>

        {/* tagy zatiaľ len vizuálne */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {mockTags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              active={selectedTag === tag}
              onClick={() => handleTagClick(tag)}
            />
          ))}
        </div>

        {loading ? (
          <p>Načítavam témy...</p>
        ) : (
          <div className="topics-list">
          {topicsForTab.map((t) => (
            <div key={t.id}
              className="topic-item"
              onClick={() => handleOpenTopic(t.id)}
              >
              <div>
                <div 
                className="topic-title">{t.title}
                </div>
                <div className="topic-meta">
                  autor {t.author} ·{" "}
                  {new Date(t.created_at).toLocaleDateString("sk-SK")}
                </div>
              </div>
              <div className="topic-meta">
              {t.replies} odpovedí
              <br />
              posledná aktivita{" "}
              {new Date(t.last_activity).toLocaleDateString("sk-SK")}
              </div>
            </div>
))}

            {topicsForTab.length === 0 && (
              <p className="topic-meta">Zatiaľ žiadne témy.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
