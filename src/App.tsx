import { useState } from "react";

import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

function App() {
  // Store the selected file path.
  const [selectedPath, setSelectedPath] = useState("");

  // Store the result message.
  const [message, setMessage] = useState("");

  // Track whether a copy operation is running.
  const [uploading, setUploading] = useState(false);

  // Open the native file picker.
  async function chooseFile() {
    try {
      const file = await open({
        multiple: false,
        directory: false,
      });

      // The user may cancel the dialog.
      if (typeof file === "string") {
        setSelectedPath(file);
        setMessage("");
      }
    } catch (error) {
      setMessage(`File selection failed: ${String(error)}`);
    }
  }

  // Copy the selected file using Rust.
  async function uploadFile() {
    if (!selectedPath) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const result = await invoke<string>("upload_file", {
        sourcePath: selectedPath,
      });

      setMessage(`File copied successfully: ${result}`);
    } catch (error) {
      setMessage(`Copy failed: ${String(error)}`);
    } finally {
      setUploading(false);
    }
  }

  // Extract the filename for display.
  const fileName = selectedPath ? selectedPath.split(/[\\/]/).pop() : "";

  return (
    <main className="app">
      <h1>File Uploader</h1>

      <button onClick={chooseFile}>Choose File</button>

      <p className="filename">
        Selected file: {fileName || "No file selected"}
      </p>

      <button onClick={uploadFile} disabled={!selectedPath || uploading}>
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {message && <p className="message">{message}</p>}
    </main>
  );
}

export default App;
