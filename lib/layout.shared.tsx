import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="bg-cyan-200 p-2 border rounded flex-1">
          Irene{"'"}s Docs
        </div>
      ),
    },
  };
}
