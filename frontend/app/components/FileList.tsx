"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FileEntry, FileStatus } from "@/app/types/convert";

interface FileListProps {
  entries: FileEntry[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

interface FileItemProps {
  entry: FileEntry;
  index: number;
  onRemove: (i: number) => void;
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

function FileItem({ entry, index, onRemove, disabled }: FileItemProps) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(entry.file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [entry.file]);

  const kb = (entry.file.size / 1024).toFixed(1);
  const isProcessing = entry.status === "converting" || entry.status === "done" || entry.status === "error";

  return (
    <div className="flex items-center gap-3 bg-zinc-800/60 rounded-xl px-3 py-2">
      {preview && (
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-700">
          <Image src={preview} alt={entry.file.name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 truncate">{entry.file.name}</p>
        <p className="text-xs text-zinc-500">{kb} KB</p>
      </div>
      {isProcessing ? (
        <StatusIndicator status={entry.status} error={entry.error} />
      ) : (
        !disabled && (
          <button
            onClick={() => onRemove(index)}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded"
            aria-label="Remove file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )
      )}
    </div>
  );
}

export default function FileList({ entries, onRemove, disabled }: FileListProps) {
  if (!entries.length) return null;

  return (
    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
      {entries.map((entry, i) => (
        <FileItem
          key={`${entry.file.name}-${i}`}
          entry={entry}
          index={i}
          onRemove={onRemove}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
