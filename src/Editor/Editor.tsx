import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { configs } from "../configs/editor-config";
import "./Editor.css";

interface EditorProps {
  initialData?: string;
  onChangeData?: (data: string) => void;
}

export default function Editor({
  initialData = "",
  onChangeData,
}: EditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {
        editorConfig: null,
      };
    }

    return configs ? configs(initialData) : { editorConfig: null };
  }, [isLayoutReady, initialData]);

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar editor-container_include-word-count"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {editorConfig && (
              <CKEditor
                // @ts-expect-error
                data={initialData as string}
                onChange={(_event, editor) => {
                  onChangeData?.(editor.getData());
                }}
                editor={ClassicEditor}
                config={editorConfig as any}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
