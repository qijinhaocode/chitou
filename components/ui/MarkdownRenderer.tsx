"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { cn } from "@/lib/utils"

// Import a minimal highlight.js theme (atom-one-dark works great for tech content)
import "highlight.js/styles/atom-one-dark.css"

interface MarkdownRendererProps {
  content: string
  className?: string
  compact?: boolean  // smaller font/spacing for feedback text
}

export function MarkdownRenderer({ content, className, compact }: MarkdownRendererProps) {
  return (
    <div className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        // Base text
        "prose-p:leading-relaxed prose-p:my-2",
        // Headings
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-h1:text-base prose-h2:text-sm prose-h3:text-sm",
        // Strong / emphasis
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-em:text-muted-foreground",
        // Lists
        "prose-ul:my-2 prose-ol:my-2",
        "prose-li:my-0.5 prose-li:leading-relaxed",
        // Inline code
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5",
        "prose-code:text-[0.82em] prose-code:font-mono prose-code:text-foreground",
        "prose-code:before:content-none prose-code:after:content-none",
        // Code blocks (highlight.js takes over)
        "prose-pre:rounded-xl prose-pre:my-3 prose-pre:p-0 prose-pre:overflow-hidden",
        "prose-pre:bg-transparent",
        "[&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0",
        "[&_pre]:bg-[#282c34] [&_pre]:p-4 [&_pre]:text-sm",
        // Blockquote
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        // HR
        "prose-hr:border-border",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Compact variant
        compact && "prose-p:my-1 prose-headings:mt-2 prose-headings:mb-1",
        className
      )}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
