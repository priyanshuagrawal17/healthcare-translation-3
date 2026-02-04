# Deploy to Vercel (step-by-step)

Follow these steps to get your app live.

---

## 1. Get a free PostgreSQL database (Neon)

Vercel is serverless and can't use SQLite. Use a free Postgres database:

1. Go to **https://neon.tech** and sign up (free, no credit card).
2. Create a new project (e.g. `medical-nano`).
3. Copy the **connection string** (looks like `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).

Keep this URL; you'll use it in step 4 and step 7.

---

## 2. Switch the app to PostgreSQL

The project is set up to use PostgreSQL for deployment.

1. Open **`prisma/schema.prisma`** and set the datasource to:
   - `provider = "postgresql"`
   - `url      = env("DATABASE_URL")`

2. In your **`.env`** file, set:
   ```env
   DATABASE_URL="postgresql://..." 
   ```
   Paste your **Neon connection string** here (replace the SQLite line).

3. Create the tables in Neon:
   ```powershell
   npx prisma db push
   ```

4. Run the app locally once to confirm:
   ```powershell
   npm run dev
   ```

---

## 3. Push your code to GitHub

1. Create a **new public repository** on GitHub (e.g. `healthcare-doctor-patient-translation`).

2. In your project folder, run (use your repo URL):
   ```powershell
   cd "c:\Users\basua\Desktop\medical nano"
   git init
   git add .
   git commit -m "Healthcare Doctor-Patient Translation app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

**Important:** Your `.env` file is in `.gitignore`, so it will **not** be pushed. Never commit your OpenAI key or database URL.

---

## 4. Deploy on Vercel

1. Go to **https://vercel.com** and sign in (use “Continue with GitHub”).

2. Click **“Add New…” → “Project”**.

3. **Import** your GitHub repository. Select the repo you just pushed.

4. **Environment Variables** (before deploying, click “Environment Variables” and add):

   | Name             | Value                    |
   |------------------|--------------------------|
   | `OPENAI_API_KEY` | Your OpenAI API key      |
   | `DATABASE_URL`   | Your Neon connection string |

   Add them for **Production** (and optionally Preview).

5. **Build settings** (Vercel usually detects Next.js; if not):
   - Framework Preset: **Next.js**
   - Build Command: `npx prisma generate && next build` (or leave default if your `package.json` already has `"build": "prisma generate && next build"`)
   - Output: default

6. Click **Deploy**. Vercel will build and deploy.

7. After the first deploy, create the database tables on the **production** database (same Neon DB). Either:
   - Run locally with `DATABASE_URL` pointing to your Neon URL and run `npx prisma db push` (you may have done this in step 2), or  
   - In Vercel project → **Settings** → **Functions** → or use Vercel CLI:  
     `npx prisma db push` with `DATABASE_URL` from Vercel env.  
   If you use the **same** Neon database for local and production, the tables are already there from step 2.

---

## 5. Get your live link

After the deploy finishes, Vercel will show a URL like:

**https://your-project-name.vercel.app**

Use this as your **Deployed application link** in the Nao Medical submission form.

---

## Checklist

- [ ] Neon account created, connection string copied
- [ ] `prisma/schema.prisma` uses `provider = "postgresql"`
- [ ] `.env` has `DATABASE_URL` (Neon) and `OPENAI_API_KEY`
- [ ] `npx prisma db push` run successfully
- [ ] Code pushed to a **public** GitHub repo
- [ ] Vercel project created, repo connected
- [ ] `OPENAI_API_KEY` and `DATABASE_URL` set in Vercel
- [ ] Deploy succeeded and live link opens

Submit the **GitHub repo link** and **Vercel live link** in the Nao Medical form.
