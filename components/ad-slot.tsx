import Script from "next/script";

export function AdSlot({ placement }: { placement: "article" | "report" }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot =
    placement === "article"
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE
      : process.env.NEXT_PUBLIC_ADSENSE_SLOT_REPORT;
  const label = placement === "article" ? "article" : "after report summary";

  if (!client || !slot) {
    return (
      <aside
        aria-label="Advertisement"
        data-ad-placement={placement}
        className="my-8 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center"
      >
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Advertisement
        </p>
        <p className="mt-1 text-sm text-muted-foreground">AdSense placeholder · {label}</p>
      </aside>
    );
  }

  return (
    <aside aria-label="Advertisement" data-ad-placement={placement} className="my-8">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsense-push-${placement}`} strategy="afterInteractive">
        {"(adsbygoogle = window.adsbygoogle || []).push({});"}
      </Script>
    </aside>
  );
}
