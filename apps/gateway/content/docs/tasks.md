---
title: "Tasks"
description: "List, create, update, complete, and delete Google Tasks."
order: 8
section: "connectors"
connector: "google-workspace"
---

The Tasks connector lets your AI assistant manage your Google Tasks — listing task lists, creating items, marking them complete, and organizing your to-dos.

## Available operations

| Tool | Description |
|------|-------------|
| `tasks_list` | List all task lists (e.g., "My Tasks", "Work", "Personal") |
| `tasks_list_tasks` | List tasks within a specific task list |
| `tasks_create` | Create a new task with title, notes, and optional due date |
| `tasks_update` | Update a task's title, notes, or due date |
| `tasks_complete` | Mark a task as completed |
| `tasks_delete` | Delete a task |

## Required scopes

- `https://www.googleapis.com/auth/tasks`

## Example prompts

- "Show me all tasks in my Work list that are due this week"
- "Create a task to review the Q2 budget by Friday"
- "Mark the 'Send invoice' task as complete"
- "Add three tasks to my Personal list: buy groceries, call dentist, renew passport"
