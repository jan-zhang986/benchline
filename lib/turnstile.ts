export async function verifyTurnstile(
  token: string | null,
  ip: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false, error: "Complete the bot check and try again." };

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    });
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await response.json()) as { success?: boolean };
    if (!data.success) return { ok: false, error: "Bot check failed. Refresh the page and try again." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Bot check could not be verified. Try again." };
  }
}
