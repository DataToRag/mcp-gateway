---
title: "Confluence Pages Are 40KB of JSON. Your AI Gets 2KB."
excerpt: "Atlassian Document Format is a nightmare for context windows. We convert it to clean markdown so your AI can actually read Confluence."
date: "2026-04-06"
author: "Manuel Yang"
category: "Engineering"
coverImage: "/blog/adf-context-optimization.png"
tags: ["atlassian", "confluence", "jira", "mcp", "context-window", "performance"]
---

Pull a Confluence page through the REST API. What comes back is Atlassian Document Format: a deeply nested JSON tree that represents the document structure. A 500-word page with a table, a few headings, and an inline image produces roughly 40KB of ADF JSON.

Your AI assistant doesn't need any of it. It needs the text.

## What ADF looks like

ADF is Atlassian's internal document model. Every paragraph, heading, list item, table cell, mention, emoji, and inline card is a nested node with type metadata, attributes, and content arrays. A single bold word generates three levels of nesting: a paragraph node containing a text node containing a marks array with a `{ type: "strong" }` entry.

Here's a real example. A Confluence page with the text "Q3 Planning" as a heading:

```json
{
  "type": "heading",
  "attrs": { "level": 2 },
  "content": [
    {
      "type": "text",
      "text": "Q3 Planning"
    }
  ]
}
```

That's 120 bytes for 11 characters of actual content. Scale that across a full page with tables, status macros, user mentions, media nodes, and layout sections, and you get 30-50KB of JSON where maybe 1-2KB is the text someone would actually read.

## Why this matters for MCP

We wrote about this problem with Google Docs and Slides in [a previous post](/blog/why-your-mcp-server-is-eating-your-context-window). The same math applies here, possibly worse. ADF is more verbose than the Google Docs API response for equivalent content because Atlassian encodes every formatting detail as nested JSON objects rather than flat style arrays.

A 200K token context window can hold maybe 60KB of raw text. Two Confluence page reads at 40KB each and you've consumed a third of your context on structural JSON that the LLM will never use meaningfully. The model spends attention budget parsing braces and attribute keys instead of understanding the content.

We saw this in testing. A workflow that read three Confluence pages and summarized them started losing coherence by the second page when using raw ADF. The same workflow with converted text stayed sharp through all three and still had room for follow-up questions.

## How we handle it

Our Atlassian MCP connector converts ADF to clean markdown before returning it. The conversion walks the node tree and extracts just the content:

**Headings** become `## Heading Text` with the correct level. **Tables** become markdown tables with proper alignment. **Mentions** become `@Display Name`. **Code blocks** keep their language annotation. **Inline cards** (links to Jira issues, other Confluence pages) resolve to `[Title](url)`. **Media nodes** are noted as `[image: filename]` so the AI knows something was there without eating context on base64 data.

Status macros, layout columns, panel macros, and other Confluence-specific elements get stripped down to their text content. The expand macro (those collapsible sections people love to stuff meeting notes into) gets flattened so nothing is hidden from the AI.

The result: a 40KB ADF response becomes 1-2KB of readable markdown. That's a 95%+ reduction, consistent with what we see on the Google Workspace side.

## Jira is cleaner, but not clean

Jira issue descriptions also use ADF, though they tend to be shorter. A typical issue description might be 5-10KB of ADF for a few paragraphs of text. We apply the same conversion.

The bigger win on the Jira side is trimming the issue metadata. A full Jira issue response includes changelog history, rendered fields, schema definitions, edit metadata, and the full project configuration. We return the fields people actually ask about: summary, status, assignee, priority, description (as markdown), and comments. The rest is noise.

## The write tradeoff

Here's what we're not pretending doesn't exist: converting ADF to markdown is lossy. You can't round-trip it. If you read a Confluence page as markdown and then try to write it back as ADF, you'll lose panel types, status badge colors, Smart Link card layouts, macro configurations, and table column widths. The reconverted ADF won't match the original structure.

For reading, summarizing, searching, and extracting information, this doesn't matter. Those are the 90% use case, and they work great with clean text.

For writes, it depends on what you're doing:

**Works fine:** Creating new pages from scratch (the AI generates markdown, we convert to ADF). Appending content to existing pages. Full page replacements where you don't care about preserving the original formatting. Updating Jira issue fields like status, assignee, or priority. Adding comments.

**Gets risky:** Surgical edits to a heavily formatted page. If someone built a Confluence page with nested panels, status badges inside table cells, and expand macros with custom titles, asking the AI to "change the Q3 deadline in the second table" is going to produce a structurally different page. The text will be right but the formatting will be wrong.

This is a conscious design choice, not an oversight. We picked the approach that makes 90% of workflows work well over one that makes 100% of workflows work poorly. Sending raw ADF to the LLM would preserve write fidelity in theory, but in practice the model would choke on the context overhead before it could do anything useful with it.

There's a path forward we're exploring: caching the original ADF server-side when a page is read, then having the LLM describe its intended changes in plain text. The server would apply those changes to the cached ADF tree directly, preserving all the structural detail the LLM never needed to see. That would give you accurate surgical edits without burning context. We're not there yet, but the architecture supports it.

## The pattern

This is the same approach we use across every connector. Raw API responses are designed for applications that need pixel-perfect rendering or full write-back capability. An AI assistant needs neither for most tasks. It needs to read and understand the content, then take actions using IDs and references from the original data.

For Confluence: read the text, keep the structure (headings, lists, tables), drop the formatting metadata. For Jira: return the issue fields that matter, convert descriptions to markdown, include IDs for follow-up actions.

If you're building an MCP connector for any service that returns rich document formats (Notion's block API has the same problem), think about the read/write split. Most AI interactions with documents are reads. Build for that first, and handle writes with a separate strategy that doesn't compromise your read path.

## Try it

The Atlassian MCP connector is live in [DataToRAG](https://datatorag.com). Connect your Jira and Confluence accounts from the dashboard. Try asking your AI to summarize a Confluence page or pull the details on a Jira issue. The response will be clean markdown, not a wall of JSON.
