---
title: "Contacts"
description: "Search, list, create, update, and delete Google Contacts. Search company directory."
order: 7
section: "connectors"
---

The Contacts connector gives your AI assistant access to your Google Contacts and your organization's directory.

## Available operations

| Tool | Description |
|------|-------------|
| `contacts_search` | Search contacts by name, email, or phone number |
| `contacts_list` | List all contacts |
| `contacts_get` | Get details of a specific contact |
| `contacts_create` | Create a new contact |
| `contacts_update` | Update an existing contact |
| `contacts_delete` | Delete a contact |
| `contacts_directory_search` | Search your organization's people directory (Google Workspace accounts) |

## Required scopes

- `https://www.googleapis.com/auth/contacts`
- `https://www.googleapis.com/auth/directory.readonly` (for directory search)

## Example prompts

- "Find Sarah's phone number in my contacts"
- "Search the company directory for everyone on the engineering team"
- "Create a new contact for John Smith, john@acme.com, (555) 123-4567"
- "Update Mike's contact with his new email address"
