# Setting Up Google OAuth for Care Connect

This guide will help you set up Google OAuth for your Care Connect application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown menu at the top of the page, then click **New Project**.
3. Enter a name for your project, then click **Create**.
4. Wait for the project to be created, then select it in the project dropdown.

## Step 2: Enable the Google OAuth API

1. From your Google Cloud Project dashboard, navigate to **APIs & Services > Library**.
2. Search for "Google OAuth API" and select "Google OAuth2 API".
3. Click **Enable** to enable the API for your project.

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**.
2. Choose "External" for User Type (unless you have a Google Workspace organization), then click **Create**.
3. Fill in the required fields:
   - App name: "Care Connect"
   - User support email: Your email address
   - Developer contact information: Your email address
   - Authorized domains: Your domain (for development, you can skip this)
4. Click **Save and Continue**.
5. Under "Scopes", add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
6. Click **Save and Continue**.
7. You can skip adding test users for now. Click **Save and Continue**.
8. Review your settings, then click **Back to Dashboard**.

## Step 4: Create OAuth Client Credentials

1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials**, then select **OAuth client ID**.
3. For "Application type", select **Web application**.
4. Enter a name for your client, like "Care Connect Web Client".
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3001`
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3001/auth/google/callback`
7. Click **Create**.
8. A dialog will appear showing your Client ID and Client Secret. Copy these values.

## Step 5: Update Your .env File

1. Open your project's `.env` file.
2. Add the following entries:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   SESSION_SECRET=some-random-session-secret
   BASE_URL=http://localhost:3001
   MONGO_URI=your-mongodb-connection-string
   ```
3. Replace `your-client-id` and `your-client-secret` with the values you copied from Google Cloud Console.
4. For `SESSION_SECRET`, use a random string of your choice for session security.
5. For `MONGO_URI`, use your MongoDB connection string (local or Atlas).

## Step 6: Start Your Application

1. Run `npm install` to ensure all dependencies are installed.
2. Run `npm start` to start the application.
3. Visit `http://localhost:3001` in your browser.
4. Click "Login" or "Sign Up" to test the Google OAuth integration.

## Troubleshooting

- If you encounter a "redirect_uri_mismatch" error, double-check that the redirect URI configured in Google Cloud Console exactly matches the one in your code.
- For development, you can add multiple redirect URIs (e.g., both http and https versions).
- If the login button doesn't work, check your browser console for JavaScript errors and server logs for backend errors.
- Make sure the Google OAuth API is properly enabled for your project. 