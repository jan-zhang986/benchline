"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function ShareBar({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const shareUrl = origin ? `${origin}${path}` : path;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="report-url">
        Report URL
      </label>
      <input
        id="report-url"
        readOnly
        value={shareUrl}
        onFocus={(event) => {
          event.currentTarget.select();
        }}
        className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
      />
      <Button
        type="button"
        variant="outline"
        className="h-11 shrink-0 px-4"
        onClick={async () => {
          const absolute = `${window.location.origin}${path}`;
          try {
            await navigator.clipboard.writeText(absolute);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Link copied" : "Copy report link"}
      </Button>
    </div>
  );
}
