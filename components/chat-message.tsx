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
import { Check, Copy } from "lucide-react";

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
  onCopy?: () => void;
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
  ]),
  attributes: {
    ...defaultSchema.attributes,
    a: mergeUnique(
      defaultSchema.attributes?.a as AttributeEntry[] | undefined,
      ["href", "title", "target", "rel"]
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
}

const MarkdownContent = memo(function MarkdownContent({
  content,
  components,
  rehypePlugins,
}: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={MARKDOWN_REMARK_PLUGINS}
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
  onCopy,
}: ChatMessageProps) {
  const [displayContent, setDisplayContent] = useState(content);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const debounceTimerRef = useRef<number>();
  const copyResetTimerRef = useRef<number>();

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
    return () => {
      window.clearTimeout(debounceTimerRef.current);
      window.clearTimeout(copyResetTimerRef.current);
    };
  }, []);

  const effectiveContent =
    displayContent || (isStreaming ? "HomeTruth is thinking…" : "");
  const shouldRenderPlainText = hasUnclosedCodeFence(displayContent);

  const rehypePlugins = useMemo(() => {
    const plugins: PluggableList = [[rehypeSanitize, markdownSanitizeSchema]];

    if (!isStreaming && !shouldRenderPlainText) {
      plugins.push(rehypeHighlight);
    }

    return plugins;
  }, [isStreaming, shouldRenderPlainText]);

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
      a: ({ href, children, rel, ...rest }) => (
        <a
          {...rest}
          href={href}
          target="_blank"
          rel={cn("noopener noreferrer", rel)}
        >
          {children}
        </a>
      ),
      code: CodeBlock,
      table: ({ children, ...rest }) => (
        <div className="w-full overflow-x-auto">
          <table {...rest}>{children}</table>
        </div>
      ),
      img: () => null,
    } as Components;
  }, [copiedCodeId, handleCopySnippet]);

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
          <div className="space-y-3">
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
                />
              </div>
            )}

            {sources && sources.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {sources.map((source) => (
                  <div
                    key={`${source.id}-${source.citation}`}
                    className="inline-flex items-center space-x-2 rounded-full border border-[#00BFFF]/30 bg-[#00BFFF]/5 px-3 py-1"
                    title={source.title || "Source"}
                  >
                    <span className="text-xs font-semibold text-[#00BFFF]">
                      [{source.citation}]
                    </span>
                    <span className="text-xs text-gray-600 truncate max-w-[160px]">
                      {source.title || "Source"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {CITATIONS_ENABLED && sources && sources.length > 0 && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-tight text-gray-500">
                  Sources
                </p>
                <ul className="mt-2 space-y-2">
                  {sources.map((source) => (
                    <li
                      key={`source-detail-${source.id}-${source.citation}`}
                      className="text-sm text-gray-700"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#00BFFF]/10 text-xs font-semibold text-[#00BFFF]">
                          {source.citation}
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
                  ))}
                </ul>
              </div>
            )}

            {isStreaming && (
              <p className="text-xs text-gray-400 animate-pulse">
                Streaming response…
              </p>
            )}
          </div>
          {(timestamp || showCopyButton) && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              {timestamp && (
                <p className="text-xs text-gray-500">{timestamp}</p>
              )}
              {showCopyButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={onCopy}
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </Button>
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
