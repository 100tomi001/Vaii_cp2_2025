import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Forum from "../pages/Forum";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Wiki from "../pages/Wiki";
import WikiArticle from "../pages/WikiArticle";
import NewTopic from "../pages/NewTopic";
import TopicDetail from "../pages/TopicDetails";



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/wiki/:id" element={<WikiArticle />} />
          <Route path="/topic/new" element={<NewTopic />} />
          <Route path="/topic/:id" element={<TopicDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
