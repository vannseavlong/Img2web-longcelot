"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFiles, disabled }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!disabled) onFiles(accepted);
    },
    [onFiles, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragActive ? "border-blue-400 bg-blue-950/30" : "border-zinc-600 hover:border-zinc-400 bg-zinc-900/40"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3 select-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-12 h-12 ${isDragActive ? "text-blue-400" : "text-zinc-500"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        {isDragActive ? (
          <p className="text-blue-400 font-medium">Drop images here…</p>
        ) : (
          <>
            <p className="text-zinc-300 font-medium text-lg">
              Drag & drop images here
            </p>
            <p className="text-zinc-500 text-sm">
              or click to browse — PNG, JPG, GIF, AVIF, etc.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
