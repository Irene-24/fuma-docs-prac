import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { generateDocsTabs } from "@/lib/tabs";

const tabs = generateDocsTabs();

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      sidebar={{
        tabs,
      }}
    >
      {children}
    </DocsLayout>
  );
}
