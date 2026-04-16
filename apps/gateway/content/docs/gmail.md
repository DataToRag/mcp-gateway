---
title: "Gmail"
description: "Search, read, send, reply, forward, draft, and triage emails."
order: 1
section: "connectors"
---

The Gmail connector gives your AI assistant full access to your inbox — searching, reading, composing, and organizing messages.

## Available operations

| Tool | Description |
|------|-------------|
| `gmail_search` | Search emails using Gmail query syntax (e.g., `from:boss subject:Q2 has:attachment`) |
| `gmail_list` | List recent messages from your inbox |
| `gmail_read` | Read a full email by message ID, including headers, body, and attachment metadata |
| `gmail_send` | Send a new email |
| `gmail_reply` | Reply to an existing thread |
| `gmail_forward` | Forward a message to another recipient |
| `gmail_create_draft` | Create a draft without sending |
| `gmail_update_draft` | Update an existing draft |
| `gmail_triage` | Label, archive, mark as read/unread, star, or trash messages |
| `gmail_mark_read` | Mark a message as read |
| `gmail_save_attachment_to_drive` | Save an email attachment directly to Google Drive |

## Required scopes

- `https://www.googleapis.com/auth/gmail.modify`
- `https://www.googleapis.com/auth/gmail.send`

## Example prompts

- "Search my inbox for emails from @acme.com in the last week and summarize the key asks"
- "Draft a reply to the latest email from Sarah declining the meeting politely"
- "Find all unread emails with attachments and save the attachments to my Reports folder in Drive"
- "Triage my inbox — archive anything older than 3 days that I haven't replied to"
- "Forward the Q2 report email to the marketing team with a note"
