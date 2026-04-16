---
title: "Atlassian"
description: "Jira and Confluence — issues, pages, comments, and search."
order: 9
section: "connectors"
---

The Atlassian connector gives your AI assistant access to Jira and Confluence — searching issues, creating tickets, reading and editing pages, and managing comments and attachments.

## Jira operations

| Tool | Description |
|------|-------------|
| `jira_search` | Search Jira issues using JQL (Jira Query Language). Supports pagination via `next_page_token` |
| `jira_get_issue` | Get full details for an issue by key (e.g. `PROJ-123`) — summary, status, priority, assignee, reporter, description, labels, dates, comments count, attachments |
| `jira_create_issue` | Create a new issue in a specified project. Returns the issue key and URL |
| `jira_update_issue` | Update an issue's summary, description, or arbitrary fields via `additional_fields` |
| `jira_get_transitions` | Get available workflow transitions for an issue. Use returned IDs with `jira_transition_issue` |
| `jira_transition_issue` | Move an issue to a new workflow status |
| `jira_get_comments` | Get all comments on an issue |
| `jira_add_comment` | Add a comment to an issue |
| `jira_edit_comment` | Edit an existing comment |
| `jira_delete_comment` | Delete a comment |
| `jira_get_attachment` | Get attachment metadata by ID — filename, size, MIME type, content URL |
| `jira_list_fields` | List all available fields (system + custom) to discover field IDs for creates/updates |
| `jira_search_users` | Search users by name, username, or email. Returns display names and account IDs |

## Confluence operations

| Tool | Description |
|------|-------------|
| `confluence_search` | Search content using CQL (Confluence Query Language) |
| `confluence_list_pages` | List pages in a space with id, title, version, and link |
| `confluence_get_page` | Get a page by ID, including XHTML body content and version info |
| `confluence_create_page` | Create a new page. Content must be in XHTML storage format |
| `confluence_edit_page` | Update an existing page. Version auto-increments if not provided |
| `confluence_delete_page` | Delete a page by ID |
| `confluence_get_comments` | Get all comments on a page with body content and version info |
| `confluence_add_comment` | Add a comment to a page, optionally replying to an existing comment |
| `confluence_get_attachment` | Get metadata for a page attachment by filename |

## Required scopes

- `read:jira-work`, `write:jira-work`, `read:jira-user`
- `read:confluence-content.all`, `write:confluence-content`
- `read:confluence-space.summary`, `write:confluence-file`
- `search:confluence`, `readonly:content.attachment:confluence`
- `read:me`, `offline_access`

## Example prompts

- "Find all Jira tickets assigned to me that are in progress, sorted by priority"
- "Create a bug ticket in PROJ from the error in this Slack thread with steps to reproduce"
- "Read the sprint retro Confluence page and summarize the top action items"
- "Transition JIRA-456 to 'In Review' and add a comment linking the PR"
- "Search Confluence for our on-call runbook and pull out the escalation steps"
- "List all pages in the Engineering space updated in the last week"
