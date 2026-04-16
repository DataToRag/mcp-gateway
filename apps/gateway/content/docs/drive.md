---
title: "Drive"
description: "Search files, read content, and create folders in Google Drive."
order: 3
section: "connectors"
---

The Drive connector lets your AI assistant search across your Google Drive, read file contents, and organize files into folders.

## Available operations

| Tool | Description |
|------|-------------|
| `drive_search` | Search files by name, type, or content across Drive |
| `drive_read_file` | Read the content of a file (supports Docs, Sheets, PDFs, and text files) |
| `drive_create_folder` | Create a new folder, optionally inside a parent folder |

## Required scopes

- `https://www.googleapis.com/auth/drive`

## Example prompts

- "Find the latest Q2 revenue deck in my Drive"
- "Read the contents of the onboarding checklist doc and summarize it"
- "Create a new folder called 'April Reports' inside my Reports folder"
- "Search Drive for all spreadsheets modified in the last week"
