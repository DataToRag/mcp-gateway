---
title: "Atlassian"
description: "Jira and Confluence — issues, pages, comments, and search."
order: 20
section: "general"
---

The Atlassian connector gives your AI assistant access to Jira and Confluence — searching issues with JQL, creating and updating tickets, reading and editing pages, and managing comments and attachments.

## Services

| Service | Summary |
|---------|---------|
| [Jira](/docs/jira) | Search with JQL, create, update, transition issues, manage comments and attachments |
| [Confluence](/docs/confluence) | Search with CQL, read and edit pages, manage comments and attachments |

## Connecting

Sign in at [datatorag.com/dashboard](https://datatorag.com/dashboard) and click Connect on the Atlassian card. One OAuth flow grants access to both Jira and Confluence in your chosen Atlassian site.

## Required scopes

- `read:jira-work`, `write:jira-work`, `read:jira-user`
- `read:confluence-content.all`, `write:confluence-content`
- `read:confluence-space.summary`, `write:confluence-file`
- `search:confluence`, `readonly:content.attachment:confluence`
- `read:me`, `offline_access`
