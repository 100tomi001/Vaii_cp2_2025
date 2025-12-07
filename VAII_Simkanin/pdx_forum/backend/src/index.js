import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import topicRoutes from "./routes/topics.js";
import postRoutes from "./routes/posts.js";
// tieto ZATIAĽ VYHOĎ alebo zakomentuj
// import tagRoutes from "./routes/tags.js";
// import wikiRoutes from "./routes/wiki.js";
// import newsRoutes from "./routes/news.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/posts", postRoutes);
// app.use("/api/tags", tagRoutes);
// app.use("/api/wiki", wikiRoutes);
// app.use("/api/news", newsRoutes);

import { query } from "./db.js";


app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await query("SELECT 1 AS ok");
    res.json({ db: "OK", result: result.rows[0] });
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).json({ db: "ERROR" });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Backend beží na porte " + PORT);
});
