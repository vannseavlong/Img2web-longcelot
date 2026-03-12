"use client";

import { useCallback, useState } from "react";

interface SuggestFormState {
  readonly title: string;
  readonly description: string;
}

const GITHUB_REPO = "vannseavlong/Img2web-longcelot";

export default function SuggestFeature(): React.JSX.Element {
  const [form, setForm] = useState<SuggestFormState>({ title: "", description: "" });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const params = new URLSearchParams({
        title: form.title,
        body: form.description,
        labels: "feature-request",
      });
      window.open(
        `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`,
        "_blank",
        "noopener,noreferrer",
      );
      setForm({ title: "", description: "" });
    },
    [form],
  );

  return (
    <section id="suggest" className="w-full max-w-xl mx-auto px-4 py-16 flex flex-col gap-6">
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-white">Suggest a Feature</h2>
        <p className="text-zinc-500 text-sm">
          Have an idea or want to contribute? Fill in the form and it opens a pre-filled GitHub
          issue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/60 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Feature title</label>
          <input
            type="text"
            required
            value={form.title}
            placeholder="e.g. Bulk rename output files"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            placeholder="Describe the feature or improvement you'd like to see..."
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 font-semibold text-sm transition-colors"
          >
            Open GitHub Issue
          </button>
          <a
            href={`https://github.com/${GITHUB_REPO}/pulls`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Contribute
          </a>
        </div>
      </form>
    </section>
  );
}
