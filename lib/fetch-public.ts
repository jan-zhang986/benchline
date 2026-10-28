import { assertPublicHttpUrl } from "@/lib/ssrf";

export const USER_AGENT =
  "BenchlineCitability/0.1 (single-page citability check requested by the site operator; not a training crawl)";

export type FetchedPage = {
  ok: boolean;
  status: number;
  url: string;
  body: string;
  contentType: string;
  error: string | null;
};

async function readLimited(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let received = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.byteLength;
    if (received > maxBytes) {
      text += decoder.decode(value.subarray(0, Math.max(0, value.byteLength - (received - maxBytes))), {
        stream: true,
      });
      await reader.cancel();
      break;
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}

export async function fetchPublic(
  start: URL,
  options: { maxBytes: number; timeoutMs: number; accept: "html" | "text" },
): Promise<FetchedPage> {
  let current = start;
  for (let hop = 0; hop < 5; hop += 1) {
    const checked = await assertPublicHttpUrl(current.toString());
    if (!checked.ok) {
      return {
        ok: false,
        status: 0,
        url: current.toString(),
        body: "",
        contentType: "",
        error: checked.error,
      };
    }
    current = checked.url;

    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(options.timeoutMs),
        headers: {
          "user-agent": USER_AGENT,
          accept:
            options.accept === "html"
              ? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1"
              : "text/plain,text/markdown;q=0.8,*/*;q=0.1",
        },
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      return {
        ok: false,
        status: 0,
        url: current.toString(),
        body: "",
        contentType: "",
        error: timedOut ? "The request timed out." : "The host did not respond.",
      };
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) {
        return {
          ok: false,
          status: response.status,
          url: current.toString(),
          body: "",
          contentType: "",
          error: "A redirect had no destination.",
        };
      }
      try {
        current = new URL(location, current);
      } catch {
        return {
          ok: false,
          status: response.status,
          url: current.toString(),
          body: "",
          contentType: "",
          error: "A redirect destination was invalid.",
        };
      }
      continue;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const body = await readLimited(response, options.maxBytes);
    return {
      ok: response.ok,
      status: response.status,
      url: current.toString(),
      body,
      contentType,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  }

  return {
    ok: false,
    status: 0,
    url: start.toString(),
    body: "",
    contentType: "",
    error: "Too many redirects.",
  };
}
