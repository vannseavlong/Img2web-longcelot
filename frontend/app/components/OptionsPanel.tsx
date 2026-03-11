"use client";

export interface ConvertOptions {
  quality: number;
  doResize: boolean;
  maxWidth: number;
  maxHeight: number;
}

interface Props {
  options: ConvertOptions;
  onChange: (o: ConvertOptions) => void;
  disabled?: boolean;
}

export default function OptionsPanel({ options, onChange, disabled }: Props) {
  const set = (patch: Partial<ConvertOptions>) =>
    onChange({ ...options, ...patch });

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
          onChange={(e) => set({ quality: Number(e.target.value) })}
          className="w-full accent-blue-500 disabled:opacity-40"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>Smaller file</span>
          <span>Best quality</span>
        </div>
      </div>

      {/* Resize toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-zinc-300">Resize images</label>
        <button
          onClick={() => set({ doResize: !options.doResize })}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
            ${options.doResize ? "bg-blue-500" : "bg-zinc-700"}
            disabled:opacity-40
          `}
          aria-checked={options.doResize}
          role="switch"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
              options.doResize ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Resize inputs */}
      {options.doResize && (
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-zinc-500">Max width (px)</label>
            <input
              type="number"
              min={0}
              value={options.maxWidth || ""}
              disabled={disabled}
              placeholder="e.g. 1920"
              onChange={(e) => set({ maxWidth: Number(e.target.value) })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-40"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-zinc-500">Max height (px)</label>
            <input
              type="number"
              min={0}
              value={options.maxHeight || ""}
              disabled={disabled}
              placeholder="e.g. 1080"
              onChange={(e) => set({ maxHeight: Number(e.target.value) })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-40"
            />
          </div>
        </div>
      )}
    </div>
  );
}
