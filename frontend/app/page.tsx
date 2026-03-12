"use client";

import JSZip from "jszip";
import { useCallback, useRef, useState } from "react";
import DropZone from "./components/DropZone";
import FileList from "./components/FileList";
import OptionsPanel from "./components/OptionsPanel";
import type { ConvertOptions, FileEntry, FileStatus } from "./types/convert";

type GlobalStatus = "idle" | "converting" | "done" | "error";

export default function Home() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [options, setOptions] = useState<ConvertOptions>({
    quality: 80,
    doResize: false,
    maxWidth: 1920,
    maxHeight: 1080,
  });
  const [globalStatus, setGlobalStatus] = useState<GlobalStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const downloadRef = useRef<{ url: string; name: string } | null>(null);

  const addFiles = useCallback((incoming: File[]) => {
    setEntries((prev) => {
      const names = new Set(prev.map((e) => e.file.name));
      const newEntries: FileEntry[] = incoming
        .filter((f) => !names.has(f.name))
        .map((f) => ({ file: f, status: "pending" }));
      return [...prev, ...newEntries];
    });
    setGlobalStatus("idle");
    if (downloadRef.current) {
      URL.revokeObjectURL(downloadRef.current.url);
      downloadRef.current = null;
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateEntryStatus = (
    index: number,
    patch: Partial<FileEntry>,
  ) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    );
  };

  const convert = async () => {
    if (!entries.length) return;

    const snapshot = entries;
    setEntries(snapshot.map((e) => ({ ...e, status: "pending" as FileStatus, result: undefined, error: undefined })));
    setGlobalStatus("converting");
    setErrorMsg("");

    const results: Array<{ name: string; blob: Blob }> = [];

    for (let i = 0; i < snapshot.length; i++) {
      const entry = snapshot[i];
      updateEntryStatus(i, { status: "converting" });

      const formData = new FormData();
      formData.append("files", entry.file);
      formData.append("quality", options.quality.toString());
      formData.append("do_resize", options.doResize ? "true" : "false");
      formData.append("max_width", options.maxWidth.toString());
      formData.append("max_height", options.maxHeight.toString());

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(`${apiBase}/api/convert`, { method: "POST", body: formData });
        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const blob = await res.blob();
        const webpName = entry.file.name.replace(/\.[^.]+$/, ".webp");
        results.push({ name: webpName, blob });
        updateEntryStatus(i, { status: "done", result: blob });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Conversion failed";
        updateEntryStatus(i, { status: "error", error: msg });
      }
    }

    if (results.length === 0) {
      setGlobalStatus("error");
      setErrorMsg("All conversions failed.");
      return;
    }

    if (results.length === 1) {
      const url = URL.createObjectURL(results[0].blob);
      downloadRef.current = { url, name: results[0].name };
    } else {
      const zip = new JSZip();
      for (const { name, blob } of results) {
        zip.file(name, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      downloadRef.current = { url, name: "converted.zip" };
    }

    setGlobalStatus("done");
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
    setEntries([]);
    setGlobalStatus("idle");
    setErrorMsg("");
  };

  const busy = globalStatus === "converting";
  const done = globalStatus === "done";
  const successCount = entries.filter((e) => e.status === "done").length;
  const totalCount = entries.length;

  return (
    <main className="flex justify-center px-4 pt-10 pb-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Drop zone */}
        <DropZone onFiles={addFiles} disabled={busy || done} />

        {/* File list */}
        {entries.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                {entries.length} file{entries.length !== 1 ? "s" : ""} selected
              </span>
              {!busy && !done && (
                <button
                  onClick={() => setEntries([])}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <FileList entries={entries} onRemove={removeFile} disabled={busy || done} />
          </div>
        )}

        {/* Options */}
        {entries.length > 0 && (
          <OptionsPanel
            options={options}
            onChange={setOptions}
            disabled={busy || done}
          />
        )}

        {/* Convert button */}
        {entries.length > 0 && !done && (
          <button
            onClick={convert}
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:bg-blue-900 disabled:text-blue-500 font-semibold text-sm transition-colors"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Converting…
              </span>
            ) : (
              `Convert ${entries.length > 1 ? `${entries.length} images` : "image"} to WebP`
            )}
          </button>
        )}

        {/* Error */}
        {globalStatus === "error" && (
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
                {successCount === totalCount
                  ? successCount === 1 ? "Image converted!" : `${successCount} images converted!`
                  : `${successCount} of ${totalCount} images converted`}
              </p>
              <p className="text-zinc-500 text-sm">
                {successCount === 1
                  ? "Your .webp file is ready."
                  : "All files packed into a .zip archive."}
              </p>
            </div>

            <button
              onClick={download}
              className="w-full py-3 rounded-2xl bg-green-500 hover:bg-green-400 active:bg-green-600 font-semibold text-sm text-zinc-950 transition-colors"
            >
              Download{" "}
              {successCount === 1
                ? entries.find((e) => e.status === "done")?.file.name.replace(/\.[^.]+$/, ".webp") ?? "image.webp"
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
