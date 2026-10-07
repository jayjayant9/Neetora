"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders mixed text with KaTeX formulas ($...$ for inline, $$...$$ for display blocks)
 */
export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content, className = "" }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return "";

    // Regex to split by $$...$$ (block) and $...$ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
    const parts = content.split(regex);

    return parts
      .map((part) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim();
          try {
            return `<div class="my-2 overflow-x-auto">${katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            })}</div>`;
          } catch {
            return `<div class="text-rose-500 font-mono text-xs my-1">${part}</div>`;
          }
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1).trim();
          try {
            return katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return `<span class="text-rose-500 font-mono text-xs">${part}</span>`;
          }
        } else {
          // Plain text - convert newlines to <br/>
          return part.replace(/\n/g, "<br/>");
        }
      })
      .join("");
  }, [content]);

  return (
    <div
      className={`katex-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
