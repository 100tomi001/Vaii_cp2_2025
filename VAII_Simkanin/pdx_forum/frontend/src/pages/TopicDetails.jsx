import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function TopicDetail() {
  const { id } = useParams();
  const topicId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingError, setPostingError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
const [editContent, setEditContent] = useState("");




  useEffect(() => {
    const load = async () => {
      try {
        const [topicRes, postsRes] = await Promise.all([
          api.get(`/topics/${topicId}`),
          api.get(`/posts/${topicId}`),
        ]);
        setTopic(topicRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [topicId]);

  if (!loading && !topic) {
    return (
      <div className="page">
        <div className="card">
          <h2>Téma neexistuje</h2>
          <button className="btn-secondary" onClick={() => navigate("/forum")}>
            Späť na fórum
          </button>
        </div>
      </div>
    );
  }

  const handleAddPost = async (e) => {
    e.preventDefault();
    setPostingError("");

    if (!user) {
      setPostingError("Na pridanie príspevku sa musíš prihlásiť.");
      return;
    }
    if (!newPost.trim()) return;

    try {
      await api.post(`/posts/${topicId}`, { content: newPost.trim() });

      // načítame znovu príspevky
      const res = await api.get(`/posts/${topicId}`);
      setPosts(res.data);
      setNewPost("");
    } catch (err) {
      console.error(err);
      setPostingError("Nepodarilo sa pridať príspevok.");
    }
  };

const handleDeletePost = async (postId) => {
  try {
    await api.delete(`/posts/${postId}`);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  } catch (err) {
    console.error(err);
    setPostingError("Nepodarilo sa zmazať príspevok.");
  }
};

const confirmDeleteTopic = async () => {
  try {
    await api.delete(`/topics/${topicId}`);
    navigate("/forum");
  } catch (err) {
    console.error(err);
    setPostingError("Nepodarilo sa zmazať tému.");
  }
};

const cancelDeleteTopic = () => {
  setShowDeleteConfirm(false);
};

const startEditPost = (post) => {
  setEditingPostId(post.id);
  setEditContent(post.content);
  setPostingError("");
};

const cancelEditPost = () => {
  setEditingPostId(null);
  setEditContent("");
};

const saveEditPost = async () => {
  if (!editContent.trim()) {
    setPostingError("Obsah príspevku nesmie byť prázdny.");
    return;
  }

  try {
    const res = await api.patch(`/posts/${editingPostId}`, {
      content: editContent.trim(),
    });

    const updated = res.data;

    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );

    setEditingPostId(null);
    setEditContent("");
  } catch (err) {
    console.error(err);
    setPostingError("Nepodarilo sa upraviť príspevok.");
  }
};


return (
  <div className="page">
    {/* Loading */}
    {!topic || loading ? (
      <p>Načítavam tému...</p>
    ) : (
      <>
        {/* ===== HEADER S TITULOM A DELETE ===== */}
        <div className="page-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 className="page-title">{topic.title}</h1>
              <p className="page-subtitle">
                autor {topic.author} ·{" "}
                {new Date(topic.created_at).toLocaleString("sk-SK")}
              </p>
            </div>

            {/* ZMAZANIE TÉMY – LEN AUTOR */}
            {user?.username === topic.author && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-secondary"
                style={{ whiteSpace: "nowrap" }}
              >
                Zmazať tému
              </button>
            )}
          </div>
        </div>

        {/* ===== PRÍSPEVKY ===== */}
        <div className="card">
          <h2>Príspevky</h2>

          {posts.length === 0 && (
            <p className="topic-meta">Zatiaľ žiadne odpovede. Buď prvý.</p>
          )}

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {posts.map((p) => (
  <div
    key={p.id}
    style={{
      padding: "10px 12px",
      borderRadius: 12,
      background: "#020617",
      border: "1px solid #1f2937",
      position: "relative",
    }}
  >
    {/* DELETE KOMENTÁRA */}
    {user?.username === p.author && (
      <button
        onClick={() => handleDeletePost(p.id)}
        style={{
          position: "absolute",
          top: 6,
          right: 8,
          border: "none",
          background: "transparent",
          color: "#f87171",
          cursor: "pointer",
          fontSize: 14,
        }}
        title="Zmazať príspevok"
      >
        ✕
      </button>
    )}

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
        paddingRight: 40, // trochu miesta pre tlačidlá
      }}
    >
      <span style={{ fontWeight: 500 }}>{p.author}</span>
      <span className="topic-meta">
        {new Date(p.created_at).toLocaleString("sk-SK")}
      </span>
    </div>

    {/* Ak je tento post v edit režime */}
    {editingPostId === p.id ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          rows={3}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          style={{
            background: "#020617",
            border: "1px solid #1f2937",
            borderRadius: 8,
            padding: "6px 8px",
            color: "#e5e7eb",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={saveEditPost}
            className="btn-primary"
          >
            Uložiť
          </button>
          <button
            type="button"
            onClick={cancelEditPost}
            className="btn-secondary"
          >
            Zrušiť
          </button>
        </div>
      </div>
    ) : (
      <>
        <div style={{ marginBottom: 6 }}>{p.content}</div>

        {/* tlačidlo Upraviť – len autor */}
        {user?.username === p.author && (
          <button
            type="button"
            onClick={() => startEditPost(p)}
            className="btn-link"
            style={{ padding: 0, fontSize: 13 }}
          >
            Upraviť
          </button>
        )}
      </>
    )}
  </div>
))}
          </div>
        </div>

        {/* ===== FORM NA ODPOVEĎ ===== */}
        <div className="card">
          <h3>Napíš odpoveď</h3>

          <form onSubmit={handleAddPost}>
            <textarea
              rows={4}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              style={{
                background: "#020617",
                border: "1px solid #1f2937",
                borderRadius: 10,
                padding: "8px 10px",
                color: "#e5e7eb",
                resize: "vertical",
              }}
              placeholder="Napíš svoj príspevok..."
            />

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: 8 }}
            >
              Odoslať
            </button>
          </form>

          {postingError && (
            <p style={{ color: "salmon", marginTop: 8 }}>{postingError}</p>
          )}

          <p style={{ marginTop: 8 }}>
            <Link to="/forum" className="btn-link">
              ← Späť na fórum
            </Link>
          </p>
        </div>
      </>
    )}

    {/* ===== 🟥 DELETE CONFIRM MODAL (Novo pridané!) ===== */}
    {showDeleteConfirm && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "#1f2937",
            padding: "24px",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "380px",
            textAlign: "center",
            border: "1px solid #374151",
          }}
        >
          <h2 style={{ marginBottom: 12 }}>Zmazať tému?</h2>
          <p style={{ marginBottom: 24 }}>
            Naozaj chceš natrvalo odstrániť túto tému aj so všetkými príspevkami?
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary"
              style={{ padding: "8px 16px" }}
            >
              Zrušiť
            </button>

            <button
              onClick={confirmDeleteTopic}
              className="btn-primary"
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                borderColor: "#ef4444",
              }}
            >
              Zmazať
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);


}
