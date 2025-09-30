"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import type { Schema } from "hast-util-sanitize";
import type { Components } from "react-markdown";
import type { PluggableList } from "unified";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CITATIONS_ENABLED } from "@/lib/feature-flags";
import { Check, Copy, ChevronDown } from "lucide-react";
import { visit } from "unist-util-visit";
import type { Root, Text } from "mdast";
import type { Parent } from "unist";

export interface ChatSource {
  id: string;
  documentId: string;
  title?: string;
  category?: string;
  namespace: string;
  citation: number;
  url?: string;
  snippet?: string;
}

interface ChatMessageProps {
  type: "user" | "ai";
  content: string;
  timestamp?: string;
  showCopyButton?: boolean;
  isStreaming?: boolean;
  sources?: ChatSource[];
}

const STREAMING_DEBOUNCE_MS = 40;
const COPIED_RESET_MS = 2000;

const mergeUnique = <T,>(...sources: (T[] | undefined)[]): T[] => {
  const set = new Set<T>();
  sources.forEach((source) => {
    source?.forEach((item) => set.add(item));
  });
  return Array.from(set);
};

const CITATION_PATTERN = /\[(\d+)\]/g;

const stripCitations = (value: string) =>
  value.replace(/\s*\[(\d+)\]/g, (match) => (match.startsWith(" ") ? " " : ""));

const remarkInlineCitations = () => {
  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (
        (parent as Parent).type === "link" ||
        (parent as Parent).type === "code" ||
        (parent as Parent).type === "inlineCode"
      ) {
        return;
      }
      const textNode = node as Text;
      const value = textNode.value;
      if (!value) return;

      const matches = [...value.matchAll(CITATION_PATTERN)];
      if (matches.length === 0) return;

      const replacements: any[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const matchIndex = match.index ?? 0;
        if (matchIndex > lastIndex) {
          replacements.push({
            type: "text",
            value: value.slice(lastIndex, matchIndex),
          });
        }

        const citationIndex = match[1];
        replacements.push({
          type: "link",
          url: `#source-${citationIndex}`,
          data: {
            hProperties: {
              className: "inline-citation",
              "data-citation-index": citationIndex,
            },
          },
          children: [
            {
              type: "text",
              value: citationIndex,
            },
          ],
        });

        lastIndex = matchIndex + match[0].length;
      }

      if (lastIndex < value.length) {
        replacements.push({
          type: "text",
          value: value.slice(lastIndex),
        });
      }

      (parent as Parent).children.splice(index, 1, ...replacements);
      return index + replacements.length;
    });
  };
};

type AttributeEntry = string | [string, string];

const markdownSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: mergeUnique(defaultSchema.tagNames, [
    "a",
    "p",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "strong",
    "em",
    "blockquote",
    "hr",
    "br",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "sup",
    "button",
  ]),
  attributes: {
    ...defaultSchema.attributes,
    a: mergeUnique(
      defaultSchema.attributes?.a as AttributeEntry[] | undefined,
      ["href", "title", "target", "rel", "data-citation-index"]
    ),
    code: mergeUnique(
      defaultSchema.attributes?.code as AttributeEntry[] | undefined,
      ["class", "className"]
    ),
    pre: mergeUnique(
      defaultSchema.attributes?.pre as AttributeEntry[] | undefined,
      ["class", "className"]
    ),
    table: mergeUnique(
      defaultSchema.attributes?.table as AttributeEntry[] | undefined,
      ["class", "className"]
    ),
    td: mergeUnique(
      defaultSchema.attributes?.td as AttributeEntry[] | undefined,
      ["class", "className"]
    ),
    th: mergeUnique(
      defaultSchema.attributes?.th as AttributeEntry[] | undefined,
      ["class", "className"]
    ),
    sup: mergeUnique(
      defaultSchema.attributes?.sup as AttributeEntry[] | undefined,
      ["class", "className"]
    ),
    button: mergeUnique(
      defaultSchema.attributes?.button as AttributeEntry[] | undefined,
      [
        "type",
        "class",
        "className",
        "title",
        "aria-label",
        "data-citation-index",
      ]
    ),
  },
};

const MARKDOWN_REMARK_PLUGINS: PluggableList = [remarkGfm, remarkBreaks];

const hasUnclosedCodeFence = (value: string) => {
  const matches = value.match(/```/g);
  return matches ? matches.length % 2 === 1 : false;
};

type CodeRenderer = NonNullable<Components["code"]>;

interface MarkdownContentProps {
  content: string;
  components: Components;
  rehypePlugins: PluggableList;
  remarkPlugins: PluggableList;
}

const MarkdownContent = memo(function MarkdownContent({
  content,
  components,
  rehypePlugins,
  remarkPlugins,
}: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
});

const shallowEqualSources = (a?: ChatSource[], b?: ChatSource[]) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((source, index) => {
    const other = b[index];
    return (
      source.id === other.id &&
      source.documentId === other.documentId &&
      source.citation === other.citation &&
      source.url === other.url &&
      source.title === other.title &&
      source.namespace === other.namespace &&
      source.category === other.category &&
      source.snippet === other.snippet
    );
  });
};

function ChatMessageComponent({
  type,
  content,
  timestamp,
  showCopyButton = false,
  isStreaming = false,
  sources,
}: ChatMessageProps) {
  const [displayContent, setDisplayContent] = useState(content);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"answer" | "citations" | null>(
    null
  );
  const debounceTimerRef = useRef<number>();
  const copyResetTimerRef = useRef<number>();
  const copyStatusTimerRef = useRef<number>();

  const sourcesCount = sources?.length ?? 0;
  const enableSourcesUI = !isStreaming && sourcesCount > 0;
  const [sourcesExpanded, setSourcesExpanded] = useState(() => {
    if (!enableSourcesUI) return false;
    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 768 : false;
    return !isMobile && sourcesCount <= 3;
  });

  useEffect(() => {
    if (isStreaming) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        setDisplayContent(content);
      }, STREAMING_DEBOUNCE_MS);
      return;
    }

    setDisplayContent(content);
  }, [content, isStreaming]);

  useEffect(() => {
    setCopyStatus(null);
  }, [content]);

  useEffect(() => {
    if (!enableSourcesUI) {
      setSourcesExpanded(false);
      return;
    }

    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 768 : false;
    const shouldExpandByDefault = !isMobile && sourcesCount <= 3;
    setSourcesExpanded((prev) =>
      prev === shouldExpandByDefault ? prev : shouldExpandByDefault
    );
  }, [enableSourcesUI, sourcesCount]);

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceTimerRef.current);
      window.clearTimeout(copyResetTimerRef.current);
      window.clearTimeout(copyStatusTimerRef.current);
    };
  }, []);

  const effectiveContent = displayContent || "";
  const shouldRenderPlainText = hasUnclosedCodeFence(displayContent);

  const shouldRenderInlineCitations = CITATIONS_ENABLED && enableSourcesUI;

  const rehypePlugins = useMemo(() => {
    const plugins: PluggableList = [[rehypeSanitize, markdownSanitizeSchema]];

    if (!isStreaming && !shouldRenderPlainText) {
      plugins.push(rehypeHighlight);
    }

    return plugins;
  }, [isStreaming, shouldRenderPlainText]);

  const remarkPlugins = useMemo(() => {
    if (shouldRenderInlineCitations) {
      return [...MARKDOWN_REMARK_PLUGINS, remarkInlineCitations];
    }
    return MARKDOWN_REMARK_PLUGINS;
  }, [shouldRenderInlineCitations]);

  const handleCopySnippet = useCallback(
    async (snippet: string, snippetId: string) => {
      if (!snippet.trim()) return;
      if (typeof navigator === "undefined" || !navigator.clipboard) return;

      try {
        await navigator.clipboard.writeText(snippet);
        setCopiedCodeId(snippetId);
        window.clearTimeout(copyResetTimerRef.current);
        copyResetTimerRef.current = window.setTimeout(() => {
          setCopiedCodeId(null);
        }, COPIED_RESET_MS);
      } catch (error) {
        console.warn("Copy code block failed", error);
      }
    },
    []
  );

  const handleCopyAnswer = useCallback(async () => {
    const cleanContent = stripCitations(content).trim();
    if (!cleanContent) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopyStatus("answer");
      window.clearTimeout(copyStatusTimerRef.current);
      copyStatusTimerRef.current = window.setTimeout(() => {
        setCopyStatus(null);
      }, COPIED_RESET_MS);
    } catch (error) {
      console.warn("Copy answer failed", error);
    }
  }, [content]);

  const handleCopyWithCitations = useCallback(async () => {
    const baseContent = content.trim();
    if (!baseContent) {
      await handleCopyAnswer();
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard) return;

    const sourcesText = (sources ?? []).map((source, index) => {
      const label = source.citation ?? index + 1;
      const title = source.title || "Source";
      const url = source.url ? ` - ${source.url}` : "";
      return `[${label}] ${title}${url}`;
    });

    const payload = sourcesText.length
      ? `${baseContent}\n\nSources:\n${sourcesText.join("\n")}`
      : baseContent;

    try {
      await navigator.clipboard.writeText(payload);
      setCopyStatus("citations");
      window.clearTimeout(copyStatusTimerRef.current);
      copyStatusTimerRef.current = window.setTimeout(() => {
        setCopyStatus(null);
      }, COPIED_RESET_MS);
    } catch (error) {
      console.warn("Copy with citations failed", error);
    }
  }, [content, handleCopyAnswer, sources]);

  const markdownComponents = useMemo<Components>(() => {
    const CodeBlock: CodeRenderer = ({
      node,
      inline,
      className,
      children,
      ...rest
    }) => {
      const rawValue = String(children ?? "");
      const codeValue = rawValue.replace(/\n$/, "");

      if (inline) {
        return (
          <code
            {...rest}
            className={cn(className, "font-gill-sans-regular text-gray-800")}
          >
            {children}
          </code>
        );
      }

      const languageMatch = className?.match(/language-([\w-]+)/);
      const language = languageMatch ? languageMatch[1] : "plaintext";
      const snippetId =
        typeof node?.position?.start.offset === "number"
          ? `${node.position.start.offset}`
          : `${language}-${codeValue.length}`;
      const isCopied = copiedCodeId === snippetId;

      return (
        <div className="group relative">
          <button
            type="button"
            onClick={() => handleCopySnippet(codeValue, snippetId)}
            className="absolute right-3 top-3 hidden items-center gap-1 rounded-md border border-white/15 bg-gray-900/80 px-2 py-1 text-xs font-medium text-gray-100 shadow-sm transition group-hover:flex group-focus-within:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BFFF]"
            aria-label="Copy code block"
          >
            {isCopied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {isCopied ? "Copied" : "Copy"}
          </button>
          <pre
            {...rest}
            className={cn(
              "not-prose overflow-x-auto rounded-md bg-gray-900 p-4 text-gray-100",
              className
            )}
          >
            <code className={cn(className, "block")} data-language={language}>
              {codeValue}
            </code>
          </pre>
        </div>
      );
    };

    return {
      a: ({ href, children, rel, ...rest }) => {
        const citationMatch =
          typeof href === "string" && href.startsWith("#source-")
            ? Number.parseInt(href.replace("#source-", ""), 10)
            : null;

        if (
          shouldRenderInlineCitations &&
          citationMatch &&
          Number.isFinite(citationMatch)
        ) {
          const citationNumber = citationMatch;
          const matchingSource =
            sources?.find((source) => source.citation === citationNumber) ??
            sources?.[citationNumber - 1];

          const handleCitationClick = () => {
            setSourcesExpanded(true);
            if (typeof window === "undefined" || typeof document === "undefined") {
              return;
            }
            window.requestAnimationFrame(() => {
              const target = document.getElementById(`source-${citationNumber}`);
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            });
          };

          const title = matchingSource?.title || `Source ${citationNumber}`;
          const ariaLabel = matchingSource?.title
            ? `View source ${citationNumber}: ${matchingSource.title}`
            : `View source ${citationNumber}`;

          return (
            <sup className="inline align-baseline text-[#00BFFF]">
              <button
                type="button"
                onClick={handleCitationClick}
                className="rounded px-1 text-[0.65rem] font-semibold leading-none text-[#00BFFF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00BFFF]"
                title={title}
                aria-label={ariaLabel}
                {...rest}
                data-citation-index={citationNumber}
              >
                {citationNumber}
              </button>
            </sup>
          );
        }

        return (
          <a
            {...rest}
            href={href}
            target="_blank"
            rel={cn("noopener noreferrer", rel)}
          >
            {children}
          </a>
        );
      },
      code: CodeBlock,
      table: ({ children, ...rest }) => (
        <div className="w-full overflow-x-auto">
          <table {...rest}>{children}</table>
        </div>
      ),
      img: () => null,
    } as Components;
  }, [
    copiedCodeId,
    handleCopySnippet,
    shouldRenderInlineCitations,
    sources,
    setSourcesExpanded,
  ]);

  if (type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-md">
          <div className="bg-[#00BFFF] text-white rounded-lg p-4">
            <p className="text-sm font-gill-sans-regular whitespace-pre-wrap">
              {content}
            </p>
          </div>
          {timestamp && (
            <p className="text-xs text-gray-500 mt-1 text-right">{timestamp}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="space-y-3 message-content">
            {shouldRenderPlainText ? (
              <pre className="whitespace-pre-wrap break-words text-gray-800 font-gill-sans-regular">
                {effectiveContent}
              </pre>
            ) : (
              <div className="prose prose-sm max-w-none text-gray-800">
                <MarkdownContent
                  content={effectiveContent}
                  components={markdownComponents}
                  rehypePlugins={rehypePlugins}
                  remarkPlugins={remarkPlugins}
                />
              </div>
            )}

            {enableSourcesUI && sources && (
              <div className="flex flex-wrap gap-2 pt-1">
                {sources.map((source, index) => {
                  const label = source.citation ?? index + 1;
                  return (
                    <div
                      key={`${source.id}-${label}`}
                      className="inline-flex items-center space-x-2 rounded-full border border-[#00BFFF]/30 bg-[#00BFFF]/5 px-3 py-1"
                      title={source.title || "Source"}
                    >
                      <span className="text-xs font-semibold text-[#00BFFF]">
                        [{label}]
                      </span>
                      <span className="text-xs text-gray-600 truncate max-w-[160px]">
                        {source.title || "Source"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {CITATIONS_ENABLED && enableSourcesUI && sources && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSourcesExpanded((prev) => !prev)}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-tight text-gray-500"
                    aria-expanded={sourcesExpanded}
                  >
                    {sourcesExpanded ? "Hide sources" : "Show sources"} ({
                      sourcesCount
                    })
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        sourcesExpanded ? "rotate-180" : ""
                      )}
                    />
                  </button>
                </div>
                {sourcesExpanded && (
                  <ul className="mt-2 space-y-2">
                    {sources.map((source, index) => {
                      const label = source.citation ?? index + 1;
                      return (
                        <li
                          key={`source-detail-${source.id}-${label}`}
                          id={`source-${label}`}
                          className="text-sm text-gray-700"
                          tabIndex={-1}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#00BFFF]/10 text-xs font-semibold text-[#00BFFF]">
                              {label}
                            </span>
                            <div className="space-y-1">
                              <div className="font-gill-sans-regular">
                                {source.url ? (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#00BFFF] hover:underline"
                                  >
                                    {source.title || "Source"}
                                  </a>
                                ) : (
                                  <span>{source.title || "Source"}</span>
                                )}
                              </div>
                              {source.snippet && (
                                <p className="text-xs text-gray-600">
                                  {source.snippet}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {isStreaming && !effectiveContent && (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            )}
          </div>
          {(timestamp || showCopyButton) && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
              {timestamp && (
                <p className="text-xs text-gray-500">{timestamp}</p>
              )}
              {showCopyButton && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleCopyAnswer}
                  >
                    {copyStatus === "answer" ? (
                      <Check className="h-4 w-4 text-[#00BFFF]" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-xs">Copy answer</span>
                  </Button>
                  {sourcesCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleCopyWithCitations}
                    >
                      {copyStatus === "citations" ? (
                        <Check className="h-4 w-4 text-[#00BFFF]" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-xs">Copy with sources</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ChatMessage = memo(ChatMessageComponent, (prev, next) => {
  return (
    prev.type === next.type &&
    prev.content === next.content &&
    prev.timestamp === next.timestamp &&
    prev.showCopyButton === next.showCopyButton &&
    prev.isStreaming === next.isStreaming &&
    shallowEqualSources(prev.sources, next.sources)
  );
});

export default ChatMessage;
