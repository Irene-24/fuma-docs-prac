export function isDirectory(p: string): boolean;
export function readVersionDirs(
  root: string,
): Array<{ name: string; num: number }>;
export function detectLatestVersionNumber(root: string): number | null;
export function detectLatestVersionName(root: string): string | null;
export function collectVersionRoutes(options: {
  contentRoot: string;
  baseUrl?: string;
  versionName: string;
  isLatest?: boolean;
}): Set<string>;
