import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";

function Notepad() {
  const { noteId } = useParams();
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`http://localhost:5000/notes/${noteId}`);
        const data = await response.json();
        setContent(data.content || "");
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    };
    
    fetchNote();
    const interval = setInterval(fetchNote, 5000); // Fetch content every 5 seconds
    return () => clearInterval(interval);
  }, [noteId]);

  const handleChange = async (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    try {
      await fetch(`http://localhost:5000/notes/${noteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div className="p-4 w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">Notepad: {noteId}</h2>
      <textarea
        className="w-full h-64 border p-2 rounded"
        value={content}
        onChange={handleChange}
      ></textarea>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path=":noteId" element={<Notepad />} />
      </Routes>
    </Router>
  );
}

export default App;
