---
title: "One Prompt, Two Inboxes: Multi-Account Support for MCP"
excerpt: "Most MCP servers assume one user means one account. We built multi-account support so you can query your work and personal Google accounts in the same conversation."
date: "2026-04-05"
author: "Manuel Yang"
category: "Product"
coverImage: "/blog/multi-account-mcp.png"
tags: ["multi-account", "google-workspace", "mcp", "context-window"]
---

Here's a scenario that kept coming up. You're in Claude, drafting a reply to a work email, and you need to find a receipt from your personal Gmail. You open a new browser tab, log into a different Google account, search for the receipt, copy the details, and paste them back into your conversation.

That's exactly the kind of thing MCP tools are supposed to eliminate.

## The one-account assumption

Most MCP servers treat authentication as a solved problem: one user, one OAuth token, done. And for a lot of use cases, that's fine. But people don't live in one account. I've got a work Google account and a personal one. Some users have three or four. The moment you connect your work Gmail through an MCP server, your personal Gmail becomes invisible to the LLM.

We hit this wall ourselves while building DataToRAG. A user connected their corporate Google Workspace account, then asked, "Can you also check my personal email for that Amazon order confirmation?" The answer was no. Not because the protocol couldn't handle it, but because nobody had built the plumbing.

So we built the plumbing.

## How it works

DataToRAG now supports connecting multiple Google accounts per service. The connect flow uses Google's `select_account` prompt, so when you add a second account, Google asks which one you want to link. No confusion, no accidentally re-authorizing the same account.

Every tool (search emails, list drafts, read documents) accepts an optional `account` parameter. It's just an email address. If you pass `account: "manuel@work.com"`, the tool hits that account's API. If you omit it, the default account is used.

Single-account users never notice the feature exists. There's no extra configuration, no "select your account" step on every call. You connect one account, you use the tools exactly like before.

For multi-account users, the LLM figures it out from context. If you say "check my work email," Claude knows to use your work address. If you say "find that receipt in my personal Gmail," it passes your personal address. The `list_connected_accounts` tool lets the LLM discover which accounts are available at any point, so it doesn't have to guess.

## Keeping the context window lean

Adding multi-account support raised a question we'd been thinking about anyway: tool sprawl.

DataToRAG connects to Google services (Gmail, Drive, Docs, Sheets, Calendar) and Atlassian services (Jira, Confluence). That's a lot of tools. If you've only connected Gmail, why should your LLM's context window include tool definitions for Jira, Confluence, Sheets, and everything else?

We added lazy tool loading. Tools for services you haven't connected are hidden from the MCP `ListTools` response entirely. They don't exist as far as the LLM is concerned. For a user who's only connected Google Workspace, this cuts the tool count by about 30% compared to exposing the full catalog.

When you connect a new service, its tools appear automatically. Disconnect it, they disappear. The LLM always sees exactly the tools it can actually use.

![Tool Count: All vs Connected Only](/blog/lazy-loading-tool-count.png)

## What this looks like in practice

A single conversation, two accounts:

**You:** "Search my work email for the Q1 budget spreadsheet from finance."

Claude calls `gmail_search` with `account: "manuel@company.com"` and `query: "Q1 budget from:finance"`.

**You:** "Now check my personal Gmail for the Home Depot receipt from last week."

Claude calls `gmail_search` with `account: "manuel@gmail.com"` and `query: "Home Depot receipt"`.

No tab switching. No copy-pasting. The LLM picks the right account based on what you asked for.

Other patterns we've seen: pulling company docs from a corporate Drive while referencing personal Google Docs notes. Checking a work calendar for meeting times, then a personal calendar for conflicts. Drafting in one inbox based on context from another.

## The account parameter nobody talks about

The MCP spec doesn't have an opinion on multi-account scenarios. There's no standard for how tools should accept account identifiers, and most server implementations don't bother. We chose a simple email-address parameter because it's unambiguous, human-readable, and something LLMs already understand from context.

If you're building MCP tools and your users might have multiple accounts, consider this pattern. An optional `account` parameter with a sensible default covers both cases cleanly: single-account users get zero friction, multi-account users get full control.

Multi-account support is live now in the [Google Workspace MCP](https://datatorag.com). Connect your accounts and try: "Search my personal Gmail for flight confirmations."
