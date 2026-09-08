/**
 * MarkdownMessage — small, dependency-free renderer for assistant replies.
 *
 * Supports the AI Chat surface needs: headings, lists, strong text, inline and
 * fenced code, blockquotes, tables, and links. It emits React text nodes only,
 * so untrusted model text is not inserted as HTML.
 */

import React from "react";

interface MarkdownMessageProps {
  text: string;
}

interface Block {
  type: "heading" | "paragraph" | "code" | "quote" | "list" | "table";
  text?: string;
  level?: number;
  lang?: string;
  ordered?: boolean;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

function isHeading(line: string) {
  return /^#{1,6}\s+\S/.test(line);
}

function isList(line: string) {
  return /^(\s*[-*+]\s+|\s*\d+\.\s+)/.test(line);
}

function isTableStart(lines: string[], index: number) {
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return current.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(next);
}

function isSpecialStart(lines: string[], index: number) {
  const line = lines[index] ?? "";
  return (
    line.startsWith("```") ||
    isHeading(line) ||
    line.trim().startsWith(">") ||
    isList(line) ||
    isTableStart(lines, index)
  );
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        body.push(lines[i] ?? "");
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", text: body.join("\n"), lang });
      continue;
    }

    if (isHeading(line)) {
      const match = /^(#{1,6})\s+(.*)$/.exec(line);
      blocks.push({
        type: "heading",
        level: match?.[1]?.length ?? 2,
        text: match?.[2] ?? line,
      });
      i += 1;
      continue;
    }

    if (line.trim().startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith(">")) {
        body.push((lines[i] ?? "").replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: body.join("\n") });
      continue;
    }

    if (isList(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && isList(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*(?:[-*+]|\d+\.)\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (isTableStart(lines, i)) {
      const headers = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").includes("|") && (lines[i] ?? "").trim() !== "") {
        rows.push(splitTableRow(lines[i] ?? ""));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const body: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() !== "" && !isSpecialStart(lines, i)) {
      body.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "paragraph", text: body.join(" ") });
  }

  return blocks;
}

function safeHref(raw: string) {
  const href = raw.trim();
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (href.startsWith("/")) return href;
  return undefined;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+?\*\*|`[^`]+?`|\[[^\]]+?\]\([^)]+?\))/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{renderInline(token.slice(2, -2))}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      const link = /^\[([^\]]+?)\]\(([^)]+?)\)$/.exec(token);
      const href = link ? safeHref(link[2] ?? "") : undefined;
      if (link && href) {
        nodes.push(
          <a key={key} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            {renderInline(link[1] ?? "")}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function MarkdownMessage({ text }: MarkdownMessageProps) {
  const blocks = parseBlocks(text);

  return (
    <div className="ai-md">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const tag = `h${Math.min(Math.max(block.level ?? 2, 1), 6)}`;
          return React.createElement(tag, { key: index }, renderInline(block.text ?? ""));
        }
        if (block.type === "code") {
          return (
            <pre key={index}>
              <code data-lang={block.lang || undefined}>{block.text}</code>
            </pre>
          );
        }
        if (block.type === "quote") {
          return <blockquote key={index}>{renderInline(block.text ?? "")}</blockquote>;
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={index}>
              {(block.items ?? []).map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </Tag>
          );
        }
        if (block.type === "table") {
          return (
            <div key={index} className="ai-md-table-wrap">
              <table>
                <thead>
                  <tr>
                    {(block.headers ?? []).map((header, cellIndex) => (
                      <th key={cellIndex}>{renderInline(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(block.rows ?? []).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{renderInline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={index}>{renderInline(block.text ?? "")}</p>;
      })}
    </div>
  );
}
