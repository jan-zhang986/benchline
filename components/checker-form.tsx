"use client";

import { useActionState } from "react";
import Script from "next/script";
import { createReport, type ActionError } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClass = "h-11 bg-card px-3 text-base md:text-base";

export function CheckerForm({
  defaults = { brand: "", website: "", category: "" },
  heading = "Check citability",
}: {
  defaults?: { brand: string; website: string; category: string };
  heading?: string;
}) {
  const [state, action, pending] = useActionState(createReport, null as ActionError | null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <Card id="checker" className="scroll-mt-24 border-border bg-card shadow-none ring-foreground/10">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{heading}</CardTitle>
        <CardDescription>
          Homepage, robots.txt, and llms.txt only. The report page is public.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="relative space-y-4" data-abuse-protection="ip-rate-limit">
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label>
              Fax
              <input name="benchline_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand name</Label>
            <Input
              id="brand"
              name="brand"
              required
              minLength={2}
              maxLength={80}
              defaultValue={defaults.brand}
              placeholder="Northwind"
              autoComplete="organization"
              className={fieldClass}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              name="website"
              required
              maxLength={300}
              defaultValue={defaults.website}
              placeholder="https://example.com"
              autoComplete="url"
              inputMode="url"
              className={fieldClass}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              We request the homepage, /robots.txt, and /llms.txt.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category, optional</Label>
            <Input
              id="category"
              name="category"
              maxLength={60}
              defaultValue={defaults.category}
              placeholder="email marketing"
              className={fieldClass}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Fills prompts such as “best {'{category}'} tools 2026”.
            </p>
          </div>
          {siteKey ? (
            <>
              <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
              <div className="cf-turnstile" data-sitekey={siteKey} />
            </>
          ) : null}
          {state?.error ? (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="h-11 w-full px-4 text-base" disabled={pending}>
            {pending ? "Checking citability…" : "Run free check"}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Free. No account. 8 checks per hour and 30 per day from one network. Turnstile runs only
            when the site operator configures it.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
