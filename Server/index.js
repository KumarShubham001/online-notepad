const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"]
	}
});

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
});

db.connect(err => {
	if (err) console.error("Database connection failed:", err);
	else console.log("Connected to MySQL");
});

// Get note by ID
app.get("/notes/:id", (req, res) => {
	const noteId = req.params.id;
	db.query("SELECT content FROM notes WHERE id = ?", [noteId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(result[0] || { content: "" });
	});
});

// Save or update note
app.post("/notes/:id", (req, res) => {
	const { content } = req.body;
	const noteId = req.params.id;
	db.query(
		"INSERT INTO notes (id, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = ?",
		[noteId, content, content],
		(err) => {
			if (err) return res.status(500).json({ error: err.message });
			res.json({ message: "Note saved!" });
		}
	);
});

io.on("connection", (socket) => {
	console.log("User connected:", socket.id);

	socket.on("join_note", (noteId) => {
		socket.join(noteId);
	});

	socket.on("update_note", ({ noteId, content }) => {
		db.query(
			"INSERT INTO notes (id, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = ?",
			[noteId, content, content]
		);
		socket.to(noteId).emit("receive_note", content);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

server.listen(5000, () => {
	console.log("Server running on port 5000");
});
