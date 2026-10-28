"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WaitlistForm({
  source,
  brand = "",
}: {
  source: string;
  brand?: string;
}) {
  const [state, action, pending] = useActionState(joinWaitlist, null as WaitlistState);

  if (state && "ok" in state) {
    return (
      <p role="status" className="rounded-lg border border-border bg-card px-3 py-3 text-sm leading-relaxed">
        You’re on the list. Weekly tracking is not live. This demo stores the address in the project
        database and does not send mail. We will only email you if a tracking product actually ships.
      </p>
    );
  }

  return (
    <form action={action} className="relative space-y-3">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Fax
          <input name="benchline_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="source" value={source} />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor={`email-${source}`}>Email</Label>
          <Input
            id={`email-${source}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="h-11 bg-card px-3 text-base md:text-base"
            disabled={pending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`waitlist-brand-${source}`}>Brand, optional</Label>
          <Input
            id={`waitlist-brand-${source}`}
            name="brand"
            defaultValue={brand}
            maxLength={80}
            className="h-11 bg-card px-3 text-base md:text-base"
            disabled={pending}
          />
        </div>
        <Button type="submit" className="h-11 px-4" disabled={pending}>
          {pending ? "Saving…" : "Join the waitlist"}
        </Button>
      </div>
      {state && "error" in state ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">
          No billing. Weekly tracking is waitlist only. We do not send a confirmation email from this
          demo.
        </p>
      )}
    </form>
  );
}
