import express from "express";
import { query } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/topics
 * Zoznam všetkých tém + počet odpovedí + posledná aktivita
 */
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        t.id,
        t.title,
        t.created_at,
        u.username AS author,
        COUNT(p.id) AS replies,
        COALESCE(MAX(p.created_at), t.created_at) AS last_activity
      FROM topics t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN posts p ON p.topic_id = t.id
      GROUP BY t.id, t.title, t.created_at, u.username
      ORDER BY last_activity DESC;
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("TOPICS ERROR (GET /):", err);
    res
      .status(500)
      .json({ message: "Server error loading topics", detail: err.message });
  }
});

/**
 * GET /api/topics/:id
 * Detail jednej témy (bez príspevkov)
 */
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await query(
      `
      SELECT
        t.id,
        t.title,
        t.created_at,
        u.username AS author
      FROM topics t
      JOIN users u ON u.id = t.user_id
      WHERE t.id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("TOPIC DETAIL ERROR (GET /:id):", err);
    res.status(500).json({ message: "Server error loading topic" });
  }
});

/**
 * POST /api/topics
 * Vytvorenie novej témy + úvodný post
 */
router.post("/", authRequired, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Missing title or content" });
  }

  try {
    // 1) vytvoríme tému
    const topicRes = await query(
      `INSERT INTO topics (user_id, title)
       VALUES ($1, $2)
       RETURNING id`,
      [req.user.id, title]
    );

    const topicId = topicRes.rows[0].id;

    // 2) úvodný post
    await query(
      `INSERT INTO posts (topic_id, user_id, content)
       VALUES ($1, $2, $3)`,
      [topicId, req.user.id, content]
    );

    return res.status(201).json({ id: topicId, message: "Topic created" });
  } catch (err) {
    console.error("CREATE TOPIC ERROR (POST /):", err);
    return res
      .status(500)
      .json({ message: "Server error creating topic", detail: err.message });
  }
});

/**
 * DELETE /api/topics/:id
 * Zmazanie témy (iba autor)
 */
// DELETE /api/topics/:id – zmazanie témy (iba autor)
router.delete("/:id", authRequired, async (req, res) => {
  const topicId = req.params.id;

  try {
    // zistíme, komu téma patrí
    const check = await query(
      `SELECT user_id FROM topics WHERE id = $1`,
      [topicId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const ownerId = check.rows[0].user_id;

    if (ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this topic" });
    }

    // zmažeme tému (posts sa zmažú automaticky ON DELETE CASCADE)
    await query(`DELETE FROM topics WHERE id = $1`, [topicId]);

    return res.json({ message: "Topic deleted" });
  } catch (err) {
    console.error("DELETE TOPIC ERROR:", err);
    res.status(500).json({ message: "Server error deleting topic" });
  }
});



export default router;
