# Deploying Paradox AI to Vercel

Paradox AI is now fully configured and ready for 1-click deployment on [Vercel](https://vercel.com).

The project is structured with:
- **Frontend SPA**: React 19 + Vite compiled to static assets (`/dist`)
- **Backend API**: Serverless Function (`/api/chat.ts`) utilizing `@google/genai` with streaming responses
- **Configuration**: `vercel.json` pre-configured with Vite framework build settings and SPA rewrites

---

## Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy Paradox AI to Vercel"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - Vercel will automatically detect the **Vite** framework preset from `vercel.json`.

3. **Configure Environment Variables** in Vercel:
   In the **Environment Variables** section of the deployment screen, add:
   - `GEMINI_API_KEY`: Your Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))

4. **Click "Deploy"**:
   Vercel will build the frontend and configure the `/api/chat` serverless route. Once finished, you will receive a live `.vercel.app` URL.

---

## Option 2: Deploy via Vercel CLI

If you prefer using the command line:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Preview**:
   ```bash
   vercel
   ```
   Follow the prompts to link to your Vercel account.

3. **Add Environment Variable**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   Enter your Gemini API key when prompted.

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## Google Workspace & OAuth Configuration

If you are using Google Drive, Calendar, Tasks, or Contacts integrations:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Open your OAuth 2.0 Client ID used for this project.
3. Under **Authorized JavaScript origins**, add your Vercel production domain:
   - `https://your-project.vercel.app`
4. Under **Authorized redirect URIs**, add:
   - `https://your-project.vercel.app`
5. Save changes. Users can now authenticate with Google Workspace directly on your Vercel domain.
