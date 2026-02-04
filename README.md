# Healthcare Doctor–Patient Translation Web Application

A full-stack web application that acts as a **real-time translation bridge** between a doctor and a patient. Built for the Nao Medical take-home assignment.

## Project overview

- **Doctor** and **Patient** roles with separate language settings; messages are translated in near real time.
- **Text chat** with clear visual distinction (doctor = blue, patient = pink).
- **Audio recording** from the browser; clips are stored and playable in the conversation thread.
- **Conversation logging** with timestamps; all text and audio persist in a database beyond the session.
- **Conversation search** by keyword/phrase across all conversations, with highlighted matches and surrounding context.
- **AI-powered summary** (symptoms, diagnoses, medications, follow-up) via OpenAI, available during or after a conversation.

## Features attempted and completed

| Feature | Status |
|--------|--------|
| Real-time doctor–patient translation | ✅ |
| Text chat UI with role distinction | ✅ |
| Audio recording & storage in thread | ✅ |
| Conversation logging with timestamps | ✅ |
| Persistence beyond session (DB) | ✅ |
| Conversation search with highlight & context | ✅ |
| AI-powered medical summary | ✅ |
| Mobile-friendly UI | ✅ |
| Deployment-ready (Vercel + DB) | ✅ |

## Tech stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (serverless)
- **Database:** Prisma + SQLite (dev); use PostgreSQL for production (e.g. Vercel Postgres, Railway, Render)
- **AI/LLM:** OpenAI API (GPT-4o-mini) for translation and medical summarization
- **Audio:** Browser MediaRecorder API; audio stored as base64 in DB (consider object storage for scale)

## AI tools and resources leveraged

- OpenAI API documentation for Chat Completions
- Next.js and Prisma docs for project setup and data layer

## Getting started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd "medical nano"
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `OPENAI_API_KEY` – your OpenAI API key (required for translation and summary)
   - `DATABASE_URL` – e.g. `file:./prisma/dev.db` for local SQLite

3. **Database**

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Build and production

```bash
npm run build
npm start
```

For production, set `DATABASE_URL` to a PostgreSQL connection string and run:

```bash
npx prisma migrate deploy
```

## Known limitations and trade-offs

- **Audio storage:** Audio is stored as base64 in SQLite. For many/long recordings, use file or object storage (e.g. S3) and store only URLs in the DB.
- **Real-time:** Translation runs on send (not live streaming). For “true” real-time, you’d stream ASR + translation.
- **Auth:** No authentication; suitable for assignment/demo. Add auth (e.g. NextAuth) for multi-tenant use.
- **Summary:** Generated once per request; not auto-updated as the conversation grows.

## Deployment

- **Frontend + API:** Deploy to [Vercel](https://vercel.com) (recommended for Next.js). Connect the repo and set `OPENAI_API_KEY` and `DATABASE_URL` in the project environment.
- **Database:** Use Vercel Postgres, Railway, or Render Postgres. Update `prisma/schema.prisma` to use `provider = "postgresql"` and point `url` at your Postgres `DATABASE_URL`, then run `prisma migrate deploy`.

## Repository structure

```
medical nano/
├── prisma/
│   └── schema.prisma      # Conversation & Message models
├── src/
│   ├── app/
│   │   ├── api/           # translate, conversations, search, summary
│   │   ├── search/         # Search page
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Main chat UI
│   │   └── globals.css
│   ├── components/
│   │   ├── AudioRecorder.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ConversationList.tsx
│   └── lib/
│       ├── openai.ts      # translate + summary
│       └── prisma.ts
├── .env.example
├── package.json
└── README.md
```

## License

MIT.
