import fs from "node:fs";
import path from "node:path";
import {
  readVersionDirs,
  detectLatestVersionNumber,
  collectVersionRoutes,
} from "@/lib/versioning.mjs";

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

  const versions = readVersionDirs(contentRoot) as {
    name: string;
    num: number;
  }[];

  if (versions.length === 0) return [];

  const latest = detectLatestVersionNumber(contentRoot) ?? undefined;

  const tabs: SidebarTab[] = versions.map(({ name, num }) => {
    const versionUrl = `${baseUrl}/${name.toLowerCase()}`;
    const isLatest = latestMapsToBase && num === latest;
    const url = isLatest ? baseUrl : versionUrl;
    const urls = collectVersionRoutes({
      contentRoot,
      baseUrl,
      versionName: name,
      isLatest,
    }) as Set<string>;

    return {
      title: `V${num}`,
      description: descriptionFactory(num),
      url,
      urls,
    };
  });

  return tabs;
}
