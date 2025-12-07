import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Wiki from "../pages/Wiki";
import WikiArticle from "../pages/WikiArticle";


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          PDX Forum
        </Link>

        <nav className="nav-links">
          <Link to="/forum">Fórum</Link>
          <Link to="/wiki">Wiki</Link>
          {/* neskôr: <Link to="/news">Novinky</Link> */}
        </nav>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/profile" className="nav-user">
              {user.username}
            </Link>
            <button className="btn-secondary" onClick={handleLogout}>
              Odhlásiť sa
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-link">
              Prihlásenie
            </Link>
            <Link to="/register" className="btn-primary">
              Registrácia
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
