"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FileEntry, FileStatus, ResizeOptions } from "@/app/types/convert";

interface FileListProps {
  entries: FileEntry[];
  onRemove: (index: number) => void;
  onRename: (index: number, name: string) => void;
  onResizeChange: (index: number, resize: ResizeOptions) => void;
  disabled?: boolean;
}

interface FileItemProps {
  entry: FileEntry;
  index: number;
  onRemove: (i: number) => void;
  onRename: (index: number, name: string) => void;
  onResizeChange: (index: number, resize: ResizeOptions) => void;
  disabled?: boolean;
}

function StatusIndicator({ status, error }: { readonly status: FileStatus; readonly error?: string }) {
  if (status === "converting") {
    return (
      <svg className="animate-spin h-4 w-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    );
  }
  if (status === "done") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <span title={error ?? "Failed"}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return null;
}

function FileItem({ entry, index, onRemove, onRename, onResizeChange, disabled }: FileItemProps) {
  const [preview, setPreview] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    const url = URL.createObjectURL(entry.file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [entry.file]);

  const kb = (entry.file.size / 1024).toFixed(1);
  const isProcessing = entry.status === "converting" || entry.status === "done" || entry.status === "error";
  const canEdit = !disabled;

  const setResize = (patch: Partial<ResizeOptions>) =>
    onResizeChange(index, { ...entry.resize, ...patch });

  return (
    <div className="flex flex-col gap-2 bg-zinc-800/60 rounded-xl px-3 py-2">
      <div className="flex items-center gap-3">
        {preview && (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-700">
            <Image src={preview} alt={entry.file.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={entry.outputName}
              disabled={!canEdit}
              onChange={(e) => onRename(index, e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 rounded px-1 -mx-1 focus:outline-none focus:bg-zinc-900/60 disabled:opacity-70"
              aria-label="Output file name"
            />
            <span className="text-sm text-zinc-500 shrink-0">.webp</span>
          </div>
          <p className="text-xs text-zinc-500">{kb} KB</p>
        </div>
        {isProcessing ? (
          <StatusIndicator status={entry.status} error={entry.error} />
        ) : (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              disabled={!canEdit}
              className={`text-xs shrink-0 px-2 py-1 rounded-lg transition-colors ${
                entry.resize.enabled ? "text-blue-400 bg-blue-500/10" : "text-zinc-500 hover:text-zinc-300"
              } disabled:opacity-40`}
              aria-expanded={expanded}
            >
              Resize
            </button>
            {canEdit && (
              <button
                onClick={() => onRemove(index)}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded shrink-0"
                aria-label="Remove file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {expanded && !isProcessing && (
        <div className="flex flex-col gap-2 pl-13 pb-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">Resize this image</label>
            <button
              onClick={() => setResize({ enabled: !entry.resize.enabled })}
              disabled={!canEdit}
              className={`
                relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none
                ${entry.resize.enabled ? "bg-blue-500" : "bg-zinc-700"}
                disabled:opacity-40
              `}
              aria-checked={entry.resize.enabled}
              role="switch"
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  entry.resize.enabled ? "translate-x-4.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {entry.resize.enabled && (
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-zinc-500">Max width (px)</label>
                <input
                  type="number"
                  min={0}
                  value={entry.resize.maxWidth || ""}
                  disabled={!canEdit}
                  placeholder="e.g. 1920"
                  onChange={(e) => setResize({ maxWidth: Number(e.target.value) })}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-40"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-zinc-500">Max height (px)</label>
                <input
                  type="number"
                  min={0}
                  value={entry.resize.maxHeight || ""}
                  disabled={!canEdit}
                  placeholder="e.g. 1080"
                  onChange={(e) => setResize({ maxHeight: Number(e.target.value) })}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-40"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FileList({ entries, onRemove, onRename, onResizeChange, disabled }: FileListProps) {
  if (!entries.length) return null;

  return (
    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
      {entries.map((entry, i) => (
        <FileItem
          key={`${entry.file.name}-${i}`}
          entry={entry}
          index={i}
          onRemove={onRemove}
          onRename={onRename}
          onResizeChange={onResizeChange}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
