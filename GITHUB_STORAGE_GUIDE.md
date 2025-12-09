# GitHub Storage Implementation - Quick Guide

## ✅ What's Been Implemented

### 1. GitHub API Module (`github-api.ts`)
- `saveUserDataToGitHub()`: Save user data to `public/users/{email}.json`
- `loadUserDataFromGitHub()`: Load user data (public read, no token needed)
- `checkUserDataExists()`: Check if user file exists
- `validateGitHubToken()`: Validate token before use

### 2. Welcome Screen Updates
- Added "Usar GitHub Storage" checkbox
- GitHub Personal Access Token input field (password type)
- Direct link to generate token with correct scopes
- Validation: requires token if GitHub storage is enabled

### 3. App.tsx Integration
- **Auto-save**: Saves to GitHub every 5 seconds after changes (debounced)
- **Auto-load**: Loads existing data from GitHub on login
- **Fallback**: Uses localStorage if no GitHub token provided
- **Sync status**: Tracks saving/synced/error states

### 4. Directory Structure
```
public/users/
├── README.md          # Documentation
├── .gitkeep          # Keep directory in git
└── user@email.json   # User data files (created automatically)
```

## 🚀 How to Use

### For Users

1. **Generate GitHub Token**:
   - Go to: https://github.com/settings/tokens/new
   - Scopes needed: `repo` (full control of private repositories)
   - Description: "Gestor Pensum"
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Login with GitHub Storage**:
   - Open the app
   - Enter your email, university, and career
   - ✅ Check "Usar GitHub Storage"
   - Paste your GitHub token
   - Click "COMENZAR DISEÑO"

3. **Your Data**:
   - Saved automatically every 5 seconds
   - Stored in: `public/users/your-email@domain.json`
   - Publicly visible in the repository
   - Version controlled (full history)

### Without GitHub Token

- Data saves to browser localStorage only
- Not shared across devices
- Export/Import JSON manually

## 🔧 Technical Details

### Auto-Save Logic
```typescript
// Debounced save (5 seconds after last change)
useEffect(() => {
  if (!githubToken || !hasStarted) return;
  
  const timer = setTimeout(async () => {
    await saveUserDataToGitHub(email, data, token);
  }, 5000);
  
  return () => clearTimeout(timer);
}, [subjects, ejes, programInfo, totalSemesters]);
```

### Data Format
```json
{
  "subjects": [...],
  "ejes": [...],
  "programInfo": {
    "name": "Física para Nanociencia",
    "university": "UMNG",
    "email": "user@example.com"
  },
  "totalSemesters": 10,
  "lastUpdated": "2024-12-09T12:00:00.000Z"
}
```

## ⚠️ Important Notes

### Security
- **Tokens are stored in localStorage** (client-side only)
- **Data files are PUBLIC** in the repository
- Don't store sensitive information
- Tokens have full `repo` access - keep them secret

### Limitations
- GitHub API rate limit: 5000 requests/hour (authenticated)
- File size limit: 1MB per file
- Repository size: Unlimited (within reason)

### Sync Status (TODO)
The sync status indicator needs to be added manually to the header:
```tsx
{githubToken && (
  <span className="text-xs">
    {syncStatus === 'synced' && '✓ Synced'}
    {syncStatus === 'saving' && '⟳ Saving...'}
    {syncStatus === 'error' && '⚠ Error'}
  </span>
)}
```

Add this after the email display in `App.tsx` around line 576.

## 🐛 Troubleshooting

### "Failed to save to GitHub"
- Check your token is valid
- Ensure token has `repo` scope
- Check GitHub API rate limits

### "No saved data found"
- First time login - data will be created on first save
- Check file exists in `public/users/`

### Data not syncing
- Wait 5 seconds after making changes
- Check browser console for errors
- Verify token in localStorage: `localStorage.getItem('github_token')`

## 📝 Next Steps

1. **Add Sync Status UI**: Manually add the sync indicator to the header
2. **Test**: Create a token and test the flow
3. **Push to GitHub**: `git push origin main`
4. **Verify**: Check `public/users/` directory in GitHub repo

## 🎯 Benefits Over Firebase

✅ **No external service** - uses your existing GitHub repo
✅ **Free forever** - no usage limits
✅ **Version control** - full history of changes
✅ **Simple setup** - just need a token
✅ **Transparent** - see all data in repo
❌ **Public data** - not suitable for sensitive info
❌ **Manual token** - users must generate their own
