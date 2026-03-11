"use client";

import { useCallback, useRef, useState } from "react";
import DropZone from "./components/DropZone";
import FileList from "./components/FileList";
import OptionsPanel, { ConvertOptions } from "./components/OptionsPanel";

type Status = "idle" | "converting" | "done" | "error";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<ConvertOptions>({
    quality: 80,
    doResize: false,
    maxWidth: 1920,
    maxHeight: 1080,
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const downloadRef = useRef<{ url: string; name: string } | null>(null);

  const addFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !names.has(f.name))];
    });
    setStatus("idle");
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current.url);
      downloadRef.current = null;
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const convert = async () => {
    if (!files.length) return;
    setStatus("converting");
    setErrorMsg("");

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("quality", options.quality.toString());
    formData.append("do_resize", options.doResize ? "true" : "false");
    formData.append("max_width", options.maxWidth.toString());
    formData.append("max_height", options.maxHeight.toString());

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const name =
        files.length === 1
          ? files[0].name.replace(/\.[^.]+$/, ".webp")
          : "converted.zip";

      downloadRef.current = { url, name };
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Conversion failed");
      setStatus("error");
    }
  };

  const download = () => {
    if (!downloadRef.current) return;
    const a = document.createElement("a");
    a.href = downloadRef.current.url;
    a.download = downloadRef.current.name;
    a.click();
  };

  const reset = () => {
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current.url);
      downloadRef.current = null;
    }
    setFiles([]);
    setStatus("idle");
    setErrorMsg("");
  };

  const busy = status === "converting";
  const done = status === "done";

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-start justify-center pt-16 pb-16 px-4">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            img<span className="text-blue-400">2</span>webp
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Convert images to WebP — nothing is stored on the server.
          </p>
        </div>

        {/* Drop zone */}
        <DropZone onFiles={addFiles} disabled={busy || done} />

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </span>
              {!busy && !done && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <FileList files={files} onRemove={removeFile} disabled={busy || done} />
          </div>
        )}

        {/* Options */}
        {files.length > 0 && (
          <OptionsPanel
            options={options}
            onChange={setOptions}
            disabled={busy || done}
          />
        )}

        {/* Convert button */}
        {files.length > 0 && !done && (
          <button
            onClick={convert}
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:bg-blue-900 disabled:text-blue-500 font-semibold text-sm transition-colors"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Converting…
              </span>
            ) : (
              `Convert ${files.length > 1 ? `${files.length} images` : "image"} to WebP`
            )}
          </button>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-red-950/40 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">
            {errorMsg || "Something went wrong. Is the Python backend running?"}
          </div>
        )}

        {/* Done state */}
        {done && (
          <div className="bg-zinc-900/60 rounded-2xl p-5 flex flex-col gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-green-400"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-zinc-200 font-medium">
                {files.length === 1 ? "Image converted!" : `${files.length} images converted!`}
              </p>
              <p className="text-zinc-500 text-sm">
                {files.length === 1
                  ? "Your .webp file is ready."
                  : "All files packed into a .zip archive."}
              </p>
            </div>

            <button
              onClick={download}
              className="w-full py-3 rounded-2xl bg-green-500 hover:bg-green-400 active:bg-green-600 font-semibold text-sm text-zinc-950 transition-colors"
            >
              Download{" "}
              {files.length === 1
                ? files[0].name.replace(/\.[^.]+$/, ".webp")
                : "converted.zip"}
            </button>

            <button
              onClick={reset}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
