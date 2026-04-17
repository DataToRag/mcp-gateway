---
title: "Sheets"
description: "Read, create, update, append, and delete Google Sheets."
order: 5
section: "connectors"
connector: "google-workspace"
---

The Sheets connector lets your AI assistant read data from spreadsheets, write to cells, append rows, and create new sheets.

## Available operations

| Tool | Description |
|------|-------------|
| `sheets_read` | Read data from a range of cells (e.g., `Sheet1!A1:D10`) |
| `sheets_create` | Create a new spreadsheet |
| `sheets_update` | Update specific cells in a sheet |
| `sheets_append` | Append rows to the end of a sheet |
| `sheets_delete` | Delete a spreadsheet |

## Required scopes

- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive` (for create/delete)

## Example prompts

- "Read the first 20 rows of my Sales Pipeline sheet and summarize the top deals"
- "Create a new spreadsheet called 'Expense Tracker' with columns for date, category, amount, and notes"
- "Append today's metrics to the bottom of the KPI tracking sheet"
- "Update cell B2 in the Budget sheet to 15000"
