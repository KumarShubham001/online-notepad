import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { db } from "./configs/firebase-configs.ts";
import Editor from "./Editor/Editor.tsx";

function App() {
  const [url, setUrl] = useState(window.location.href);
  const [noteId, setNoteId] = useState(url.split("/").pop() || "");
  const [editorData, setEditorData] = useState<string>("");

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const listenerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>("");
  const lastUpdateTimestamp = useRef<Date | null>(null);

  const setupListener = () => {
    if (!noteId) return;

    const noteRef = doc(db, "notes", noteId);
    const unsubscribe = onSnapshot(noteRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteContent = docSnap.data().content;
        const remoteTimestamp = docSnap.data().updatedAt?.toDate();

        // Only update if:
        // 1. Content is different AND
        // 2. Either we don't have a last update timestamp OR the remote update is newer
        if (
          remoteContent !== lastSavedContent.current &&
          (!lastUpdateTimestamp.current ||
            !remoteTimestamp ||
            remoteTimestamp > lastUpdateTimestamp.current)
        ) {
          setEditorData(remoteContent);
          lastSavedContent.current = remoteContent;
          lastUpdateTimestamp.current = remoteTimestamp || new Date();
          console.log("Updated from remote:", {
            content: remoteContent,
            timestamp: remoteTimestamp,
          });
        }
      }
    });

    unsubscribeRef.current = unsubscribe;
    return unsubscribe;
  };

  const removeListener = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  };

  useEffect(() => {
    if (!noteId) {
      const randomNoteId = Math.random().toString(36).substring(2, 10);
      window.history.replaceState(null, "", `/${randomNoteId}`);
      setUrl(window.location.href);
      setNoteId(randomNoteId);
    }
  }, [noteId]);

  useEffect(() => {
    if (!noteId) return;

    const noteRef = doc(db, "notes", noteId);

    const fetchInitialData = async () => {
      try {
        const docSnap = await getDoc(noteRef);
        if (docSnap.exists()) {
          const content = docSnap.data().content;
          const timestamp = docSnap.data().updatedAt?.toDate();
          setEditorData(content);
          lastSavedContent.current = content;
          lastUpdateTimestamp.current = timestamp || new Date();
        } else {
          const now = new Date();
          await setDoc(noteRef, {
            content: "",
            createdAt: now,
            updatedAt: now,
          });
          setEditorData("");
          lastSavedContent.current = "";
          lastUpdateTimestamp.current = now;
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setupListener();
      }
    };

    fetchInitialData();

    return () => {
      removeListener();
      if (listenerTimeoutRef.current) {
        clearTimeout(listenerTimeoutRef.current);
      }
    };
  }, [noteId]);

  const handleEditorChange = async (newContent: string) => {
    if (newContent === lastSavedContent.current) {
      return;
    }

    removeListener();
    setEditorData(newContent);

    try {
      const now = new Date();
      const noteRef = doc(db, "notes", noteId);
      await setDoc(
        noteRef,
        {
          content: newContent,
          updatedAt: now,
        },
        { merge: true },
      );
      lastSavedContent.current = newContent;
      lastUpdateTimestamp.current = now;
      console.log("Saved local changes:", {
        content: newContent,
        timestamp: now,
      });
    } catch (error) {
      console.error("Error saving document:", error);
    }

    if (listenerTimeoutRef.current) {
      clearTimeout(listenerTimeoutRef.current);
    }

    listenerTimeoutRef.current = setTimeout(() => {
      setupListener();
    }, 1000);
  };

  return (
    <div className="bg-slate-900 h-screen w-screen">
      <div className="p-4 w-full max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-2 text-center text-white">
          Notepad: {noteId}
        </h2>
      </div>
      <Editor initialData={editorData} onChangeData={handleEditorChange} />
    </div>
  );
}

export default App;
