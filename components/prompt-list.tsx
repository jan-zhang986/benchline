"use client";

import { CopyButton } from "@/components/copy-button";
import { INTENT_LABEL, INTENT_ORDER } from "@/lib/prompt-pack";
import type { RenderedPrompt } from "@/lib/types";

export function PromptList({ prompts }: { prompts: RenderedPrompt[] }) {
  const all = prompts.map((prompt) => prompt.text).join("\n");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {prompts.length} prompts across category, comparison, brand, and evaluation queries.
        </p>
        <CopyButton text={all} label="Copy all" />
      </div>
      {INTENT_ORDER.map((intent) => {
        const group = prompts.filter((prompt) => prompt.intent === intent);
        if (group.length === 0) return null;
        return (
          <div key={intent}>
            <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
              {INTENT_LABEL[intent]}
            </h3>
            <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-card">
              {group.map((prompt) => (
                <li key={prompt.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="text-sm">{prompt.text}</span>
                  <CopyButton text={prompt.text} label="Copy" />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
