import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useParams, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import "./App.css"

const socket = io("http://localhost:5000");

function Notepad() {
	const { noteId } = useParams();
	const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

	useEffect(() => {
		socket.emit("join_note", noteId);

		const fetchNote = async () => {
			try {
				const response = await fetch(`http://localhost:5000/notes/${noteId}`);
				const data = await response.json();
				if (data.content) {
					setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(data.content))));
				}
			} catch (error) {
				console.error("Error fetching note:", error);
			}
		};
		fetchNote();

		socket.on("receive_note", (newContent) => {
			setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(newContent))));
		});

		return () => {
			socket.off("receive_note");
		};
	}, [noteId]);

	const handleEditorChange = (newState) => {
		setEditorState(newState);
		const content = JSON.stringify(convertToRaw(newState.getCurrentContent()));
		socket.emit("update_note", { noteId, content });
	};

	return (
		<div className="app">
			<div className="p-4 w-full max-w-lg mx-auto">
				<h2 className="text-xl font-bold mb-2">Notepad: {noteId}</h2>
				<Editor
					editorState={editorState}
					onEditorStateChange={handleEditorChange}
					wrapperClassName="border p-2 rounded"
					editorClassName="h-64 border p-2"
					toolbar={{ options: ['inline', 'list', 'textAlign', 'history'] }}
				/>
			</div>
		</div>
	);
}

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Navigate to={`/${uuidv4().slice(0, 6)}`} />} />
				<Route path=":noteId" element={<Notepad />} />
			</Routes>
		</Router>
	);
}

export default App;
