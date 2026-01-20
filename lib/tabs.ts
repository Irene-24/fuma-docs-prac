import fs from "node:fs";
import path from "node:path";

type SidebarTab = {
  title: string;
  description?: string;
  url: string;
  urls?: Set<string>;
};

function isDirectory(p: string) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function generateDocsTabs(options?: {
  contentRoot?: string;
  baseUrl?: string;
  descriptionFactory?: (versionNumber: number) => string | undefined;
  latestMapsToBase?: boolean;
}): SidebarTab[] {
  const {
    contentRoot = path.join(process.cwd(), "content", "docs"),
    baseUrl = "/docs",
    descriptionFactory = (n: number) => `Version ${n} documentation`,
    latestMapsToBase = true,
  } = options ?? {};

  if (!isDirectory(contentRoot)) return [];

  const entries = fs.readdirSync(contentRoot, { withFileTypes: true });
  const versions = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .map((name) => {
      const m = /^v(\d+)$/i.exec(name);
      if (!m) return null;
      const num = Number(m[1]);
      if (!Number.isFinite(num)) return null;
      return { name, num } as const;
    })
    .filter((v): v is { name: string; num: number } => v !== null)
    .sort((a, b) => a.num - b.num);

  if (versions.length === 0) return [];

  const latest = versions.at(-1)?.num;

  const tabs: SidebarTab[] = versions.map(({ name, num }) => {
    const versionUrl = `${baseUrl}/${name.toLowerCase()}`;
    const isLatest = latestMapsToBase && num === latest;
    const url = isLatest ? baseUrl : versionUrl;
    const urls = new Set<string>();

    // Always include the version root
    urls.add(versionUrl);
    if (isLatest) urls.add(baseUrl);

    // Recursively collect nested page routes for activation
    const versionDir = path.join(contentRoot, name);
    const mdExts = new Set([".mdx", ".md"]);

    const walk = (dir: string, relParts: string[] = []) => {
      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          walk(full, [...relParts, e.name]);
        } else if (e.isFile()) {
          const ext = path.extname(e.name).toLowerCase();
          if (!mdExts.has(ext)) continue;
          const baseName = path.basename(e.name, ext);

          // Build relative route segments (exclude 'index' filename)
          const segs =
            baseName === "index" ? relParts : [...relParts, baseName];

          // Older versions: /docs/vN/... ; Latest (if mapped to base): /docs/...
          const versionRoute = [versionUrl, ...segs]
            .join("/")
            .replace(/\/+$/, "");
          urls.add(versionRoute);
          if (isLatest) {
            const baseRoute = [baseUrl, ...segs].join("/").replace(/\/+$/, "");
            // Handle root index mapping where segs = [] -> /docs
            urls.add(baseRoute || baseUrl);
          }
        }
      }
    };

    walk(versionDir);

    return {
      title: `V${num}`,
      description: descriptionFactory(num),
      url,
      urls,
    };
  });

  return tabs;
}
