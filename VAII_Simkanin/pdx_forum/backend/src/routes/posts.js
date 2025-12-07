import express from "express";
import { authRequired } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

/**
 * GET /api/posts/:topicId
 * Všetky príspevky v jednej téme
 */
router.get("/:topicId", async (req, res) => {
  const topicId = req.params.topicId;

  try {
    const result = await query(
      `
      SELECT 
        p.id,
        p.content,
        p.created_at,
        u.username AS author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.topic_id = $1
      ORDER BY p.created_at ASC
      `,
      [topicId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("POSTS ERROR (GET /:topicId):", err);
    res.status(500).json({ message: "Server error loading posts" });
  }
});

/**
 * POST /api/posts/:topicId
 * Pridanie novej odpovede do témy
 */
router.post("/:topicId", authRequired, async (req, res) => {
  const topicId = req.params.topicId;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Missing content" });
  }

  try {
    const insertRes = await query(
      `
      INSERT INTO posts (topic_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
      `,
      [topicId, req.user.id, content]
    );

    const postRow = insertRes.rows[0];

    // doplníme autora
    const userRes = await query(
      `SELECT username FROM users WHERE id = $1`,
      [req.user.id]
    );

    const author = userRes.rows[0]?.username || "Unknown";

    res.status(201).json({
      id: postRow.id,
      content: postRow.content,
      created_at: postRow.created_at,
      author,
    });
  } catch (err) {
    console.error("CREATE POST ERROR (POST /:topicId):", err);
    res.status(500).json({ message: "Server error creating post" });
  }
});

/**
 * DELETE /api/posts/:id
 * Zmazanie jedného príspevku (iba autor)
 */
router.delete("/:id", authRequired, async (req, res) => {
  const postId = req.params.id;

  try {
    // najprv zistíme, komu príspevok patrí
    const check = await query(
      `SELECT user_id FROM posts WHERE id = $1`,
      [postId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const ownerId = check.rows[0].user_id;

    if (ownerId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to delete this post" });
    }

    // zmažeme ho
    await query(`DELETE FROM posts WHERE id = $1`, [postId]);

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    res.status(500).json({ message: "Server error deleting post" });
  }
});

// PATCH /api/posts/:id – úprava príspevku (iba autor)
router.patch("/:id", authRequired, async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Content nesmie byť prázdny." });
  }

  try {
    // overíme, že post existuje a patrí userovi
    const check = await query(
      `SELECT user_id FROM posts WHERE id = $1`,
      [postId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Post neexistuje." });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Nemáš právo upraviť tento príspevok." });
    }

    // update obsahu
    const updateRes = await query(
      `
      UPDATE posts
      SET content = $1
      WHERE id = $2
      RETURNING id, topic_id, user_id, content, created_at
      `,
      [content.trim(), postId]
    );

    const updated = updateRes.rows[0];

    // doplníme autora (username)
    const userRes = await query(
      `SELECT username FROM users WHERE id = $1`,
      [updated.user_id]
    );

    const author = userRes.rows[0]?.username || "Unknown";

    res.json({
      id: updated.id,
      topic_id: updated.topic_id,
      content: updated.content,
      created_at: updated.created_at,
      author,
    });
  } catch (err) {
    console.error("UPDATE POST ERROR:", err);
    res.status(500).json({ message: "Server error updating post" });
  }
});



export default router;
