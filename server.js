const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Enable CORS for all origins during development
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Public client config for browser
app.get("/api/public-config", (req, res) => {
  const config = {
    supabaseUrl: (process.env.SUPABASE_URL || "").trim(),
    supabaseAnonKey: (process.env.SUPABASE_ANON_KEY || "").trim()
  };
  console.log("Serving public config:", config.supabaseUrl ? "URL Present" : "URL MISSING");
  res.json(config);
});

const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

function isValidSupabase(url, key) {
  if (!url || !key) return false;
  try {
    const u = new URL(url);
    const hasPlaceholders = /YOUR_SUPABASE_URL|YOUR_SUPABASE_SERVICE_ROLE_KEY/i.test(url + key);
    return (u.protocol === "http:" || u.protocol === "https:") && !hasPlaceholders;
  } catch {
    return false;
  }
}

let supabase = null;
if (isValidSupabase(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log("Supabase server-side client initialized.");
} else {
  console.error("Supabase credentials invalid or missing in .env");
}


// Artworks API using Supabase
app.get("/api/artworks", async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase.from("artworks").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase Database error (fetch):", error.message);
      return res.status(500).json({ error: "Cloud database error: " + error.message });
    }
    res.json(data || []);
  } catch (e) {
    console.error("Critical error in /api/artworks (GET):", e.message);
    res.status(503).json({ error: "Backend unreachable. Please check Supabase project status." });
  }
});

app.post("/api/artworks", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Cloud database not configured" });
  const { title, description, price, image_url } = req.body || {};
  if (!title || !price) return res.status(400).json({ error: "title and price required" });
  
  try {
    const { data, error } = await supabase.from("artworks").insert([{ title, description, price, image_url }]).select();
    if (error) {
      console.error("Supabase Database error (insert):", error.message);
      return res.status(500).json({ error: "Cloud insert failed: " + error.message });
    }
    res.json(data?.[0] || {});
  } catch (e) {
    console.error("Critical error in /api/artworks (POST):", e.message);
    res.status(503).json({ error: "Backend unreachable. Upload failed." });
  }
});

// Delete artwork and its storage file (if present)
app.delete("/api/artworks/:id", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  const adminKeyHeader = req.headers["x-admin-key"];
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
  if (!ADMIN_API_KEY || adminKeyHeader !== ADMIN_API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const id = req.params.id;
  const { data: rows, error: selError } = await supabase.from("artworks").select("id,image_url").eq("id", id).limit(1);
  if (selError) return res.status(500).json({ error: "Failed to read artwork" });
  const row = rows?.[0];
  if (!row) return res.status(404).json({ error: "Not found" });
  // Attempt storage removal based on public URL
  try {
    const url = new URL(row.image_url || "");
    const match = url.pathname.match(/\/object\/public\/artworks\/(.+)$/);
    const path = match ? match[1] : null;
    if (path) {
      await supabase.storage.from("artworks").remove([path]);
    }
  } catch {}
  const { error: delError } = await supabase.from("artworks").delete().eq("id", id);
  if (delError) return res.status(500).json({ error: "Failed to delete artwork" });
  res.json({ ok: true });
});

// Example test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working" });
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Keep-alive interval started.");
});

// Force process to stay alive
setInterval(() => {
  // console.log("Keep-alive tick");
}, 10000);

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
