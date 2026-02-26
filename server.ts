import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("notes.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    color TEXT DEFAULT 'white',
    is_archived INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/notes", (req, res) => {
    const notes = db.prepare("SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC").all();
    res.json(notes);
  });

  app.post("/api/notes", (req, res) => {
    const { id, title, content, color, is_pinned } = req.body;
    const stmt = db.prepare(`
      INSERT INTO notes (id, title, content, color, is_pinned)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, content, color || 'white', is_pinned ? 1 : 0);
    res.status(201).json({ id, title, content, color, is_pinned });
  });

  app.put("/api/notes/:id", (req, res) => {
    const { id } = req.params;
    const { title, content, color, is_pinned, is_archived } = req.body;
    const stmt = db.prepare(`
      UPDATE notes 
      SET title = ?, content = ?, color = ?, is_pinned = ?, is_archived = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(title, content, color, is_pinned ? 1 : 0, is_archived ? 1 : 0, id);
    res.json({ success: true });
  });

  app.delete("/api/notes/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM notes WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
