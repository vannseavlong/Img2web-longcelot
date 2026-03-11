"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  files: File[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

function FileItem({
  file,
  index,
  onRemove,
  disabled,
}: {
  file: File;
  index: number;
  onRemove: (i: number) => void;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const kb = (file.size / 1024).toFixed(1);

  return (
    <div className="flex items-center gap-3 bg-zinc-800/60 rounded-xl px-3 py-2">
      {preview && (
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-700">
          <Image src={preview} alt={file.name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 truncate">{file.name}</p>
        <p className="text-xs text-zinc-500">{kb} KB</p>
      </div>
      {!disabled && (
        <button
          onClick={() => onRemove(index)}
          className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded"
          aria-label="Remove file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function FileList({ files, onRemove, disabled }: Props) {
  if (!files.length) return null;

  return (
    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
      {files.map((file, i) => (
        <FileItem
          key={`${file.name}-${i}`}
          file={file}
          index={i}
          onRemove={onRemove}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
