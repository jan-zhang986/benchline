export type RobotRule = { type: "allow" | "disallow"; path: string };
export type RobotGroup = { agents: string[]; rules: RobotRule[] };
export type RobotAccess = "allowed" | "blocked" | "unspecified";

export type ParsedRobots = {
  groups: RobotGroup[];
  /** Absolute or relative Sitemap URLs declared in robots.txt (order preserved, de-duped). */
  sitemaps: string[];
};

export function parseRobots(text: string): RobotGroup[] {
  return parseRobotsDocument(text).groups;
}

export function parseRobotsDocument(text: string): ParsedRobots {
  const groups: RobotGroup[] = [];
  const sitemaps: string[] = [];
  const seenSitemaps = new Set<string>();
  let current: RobotGroup | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      if (value) current.agents.push(value.toLowerCase());
      continue;
    }

    if (field === "allow" || field === "disallow") {
      if (!current) {
        current = { agents: ["*"], rules: [] };
        groups.push(current);
      }
      current.rules.push({ type: field, path: value });
      continue;
    }

    if (field === "sitemap" && value) {
      const key = value.toLowerCase();
      if (!seenSitemaps.has(key)) {
        seenSitemaps.add(key);
        sitemaps.push(value);
      }
    }
  }

  return { groups, sitemaps };
}

function ruleMatch(pattern: string, path: string): { match: boolean; specificity: number } {
  if (!pattern) return { match: false, specificity: 0 };
  let source = "";
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i];
    if (char === "*") source += ".*";
    else if (char === "$" && i === pattern.length - 1) source += "$";
    else source += char.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  }
  try {
    return {
      match: new RegExp(`^${source}`).test(path),
      specificity: pattern.replace(/[*$]/g, "").length,
    };
  } catch {
    return { match: false, specificity: 0 };
  }
}

/**
 * Decide whether `agent` may fetch `path`.
 * A specific user-agent group wins over `*`.
 * The longest matching path wins. Equal length prefers Allow.
 * An empty Disallow matches nothing (the usual "allow all" spelling).
 */
export function accessFor(groups: RobotGroup[], agent: string, path = "/"): RobotAccess {
  const name = agent.toLowerCase();
  const specific = groups.filter((group) => group.agents.includes(name));
  const fallback = groups.filter((group) => group.agents.includes("*"));
  const chosen = specific.length > 0 ? specific : fallback;
  if (chosen.length === 0) return "unspecified";

  let best: { type: "allow" | "disallow"; specificity: number } | null = null;
  for (const group of chosen) {
    for (const rule of group.rules) {
      const match = ruleMatch(rule.path, path);
      if (!match.match) continue;
      if (
        !best ||
        match.specificity > best.specificity ||
        (match.specificity === best.specificity && rule.type === "allow")
      ) {
        best = { type: rule.type, specificity: match.specificity };
      }
    }
  }

  if (!best) return "allowed";
  return best.type === "disallow" ? "blocked" : "allowed";
}
