"use client";

import type { ConvertOptions } from "@/app/types/convert";

interface OptionsPanelProps {
  options: ConvertOptions;
  onChange: (o: ConvertOptions) => void;
  disabled?: boolean;
}

export default function OptionsPanel({ options, onChange, disabled }: OptionsPanelProps) {
  return (
    <div className="bg-zinc-900/60 rounded-2xl p-5 flex flex-col gap-5">
      <h2 className="text-zinc-300 font-semibold text-sm uppercase tracking-wider">
        Options
      </h2>

      {/* Quality */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm text-zinc-300">Quality</label>
          <span className="text-sm font-mono text-blue-400">{options.quality}</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={options.quality}
          disabled={disabled}
          onChange={(e) => onChange({ ...options, quality: Number(e.target.value) })}
          className="w-full accent-blue-500 disabled:opacity-40"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>Smaller file</span>
          <span>Best quality</span>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Resize and rename are set per file in the list above.
      </p>
    </div>
  );
}
