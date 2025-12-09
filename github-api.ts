// GitHub API integration for storing user data
// Repository: nerinconq/generador-de-pensum

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'nerinconq';
const REPO_NAME = 'generador-de-pensum';
const USERS_PATH = 'public/users';

export interface GitHubConfig {
    token?: string;
    email: string;
}

/**
 * Save user data to GitHub repository
 */
export async function saveUserDataToGitHub(
    email: string,
    data: any,
    token: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const fileName = `${email.replace(/[^a-zA-Z0-9@._-]/g, '_')}.json`;
        const filePath = `${USERS_PATH}/${fileName}`;

        // Get current file SHA if it exists (required for updates)
        let sha: string | undefined;
        try {
            const existingFile = await fetch(
                `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (existingFile.ok) {
                const fileData = await existingFile.json();
                sha = fileData.sha;
            }
        } catch (e) {
            // File doesn't exist yet, that's okay
        }

        // Create or update file
        const content = btoa(JSON.stringify(data, null, 2));
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update pensum data for ${email}`,
                    content,
                    sha,
                    branch: 'main'
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.message || 'Failed to save to GitHub' };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Network error' };
    }
}

/**
 * Load user data from GitHub repository (public read, no token needed)
 */
export async function loadUserDataFromGitHub(
    email: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const fileName = `${email.replace(/[^a-zA-Z0-9@._-]/g, '_')}.json`;
        const filePath = `${USERS_PATH}/${fileName}`;

        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'No saved data found for this user' };
            }
            return { success: false, error: 'Failed to load from GitHub' };
        }

        const fileData = await response.json();
        const content = atob(fileData.content);
        const data = JSON.parse(content);

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to parse data' };
    }
}

/**
 * Check if user data exists in GitHub
 */
export async function checkUserDataExists(email: string): Promise<boolean> {
    try {
        const fileName = `${email.replace(/[^a-zA-Z0-9@._-]/g, '_')}.json`;
        const filePath = `${USERS_PATH}/${fileName}`;

        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
            {
                method: 'HEAD',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Validate GitHub token
 */
export async function validateGitHubToken(token: string): Promise<boolean> {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/user`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.ok;
    } catch {
        return false;
    }
}
