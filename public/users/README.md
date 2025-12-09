# User Data Storage

This directory stores user pensum data as JSON files.

## Structure

Each user's data is stored in a file named after their email:
- `user@example.com.json`
- `profesor@umng.edu.co.json`

## Privacy Notice

⚠️ **All files in this directory are publicly visible** in the GitHub repository. Do not store sensitive information.

## File Format

Each JSON file contains:
```json
{
  "subjects": [...],
  "ejes": [...],
  "programInfo": {...},
  "totalSemesters": 10,
  "lastUpdated": "2024-12-09T12:00:00.000Z"
}
```

## How It Works

1. User logs in with email + GitHub token
2. App auto-saves changes to GitHub every 5 seconds
3. On next login, data is automatically loaded
4. If no GitHub token, falls back to localStorage

## For Developers

Files are managed via GitHub API:
- Create/Update: `PUT /repos/nerinconq/generador-de-pensum/contents/public/users/{email}.json`
- Read: `GET /repos/nerinconq/generador-de-pensum/contents/public/users/{email}.json`
