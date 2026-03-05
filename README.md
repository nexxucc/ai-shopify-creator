# AI Shopify Creator

An AI-powered tool that automatically generates complete Shopify stores — products, collections, pages, images, and theme customization — all from a single prompt.

## Features

- **AI-Powered Store Generation** — Describe your niche and the AI creates everything
- **Product Images** — Automatically sourced from Pexels based on product type
- **Theme Customization** — Homepage hero, sections, and colors auto-configured
- **React Dashboard** — Real-time progress tracking with a slick dark UI
- **Auto Cleanup** — Wipes old store data before each new generation
- **Error Handling** — Retries, error logging, and graceful failure recovery

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   React UI   │───▶│  Express API │───▶│  n8n Workflow │
│  (Dashboard) │    │  (Port 3000) │    │  (Port 5678) │
└──────────────┘    └──────────────┘    └──────┬───────┘
                           │                   │
                    ┌──────┴──────┐      ┌─────┴──────┐
                    │  PostgreSQL │      │  Groq AI   │
                    │  (Port 5432)│      │  (Llama 3) │
                    └─────────────┘      └─────┬──────┘
                                               │
                                        ┌──────┴──────┐
                                        │ Shopify API │
                                        │  + Pexels   │
                                        └─────────────┘
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 18+](https://nodejs.org/)
- [Shopify Partner Account](https://partners.shopify.com/) with a dev store
- [Groq API Key](https://console.groq.com/keys) (free)
- [Pexels API Key](https://www.pexels.com/api/new/) (free)

## Quick Start

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/ai-shopify-creator.git
cd ai-shopify-creator
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, n8n, and Qdrant.

### 3. Set Up n8n Workflow

1. Open http://localhost:5678
2. Import `n8n-workflows/master-workflow.json`
3. Import `n8n-workflows/error-handler-workflow.json` (separate workflow)
4. Set PostgreSQL credentials on all Postgres nodes
5. Link the Error Handler: Master workflow → Settings → Error Workflow → select Error Handler
6. Activate both workflows

### 4. Install & Run API

```bash
cd api
npm install
npm run dev
```

### 5. Build Dashboard (first time only)

```bash
cd dashboard
npm install
npm run build
```

### 6. Create a Store!

Open http://localhost:3000, fill in the form, and watch the AI build your store.

## Project Structure

```
ai-shopify-creator/
├── agents/                    # AI agent system prompts
│   ├── store-architect/       # Store blueprint generation
│   ├── product-researcher/    # Product catalog generation
│   ├── content-writer/        # SEO content creation
│   ├── pricing-optimizer/     # Price optimization
│   └── theme-consultant/      # Theme recommendations
├── api/                       # Express.js API server
│   ├── index.js               # Main server + static serving
│   ├── routes/
│   │   ├── stores.js          # Store CRUD + cleanup
│   │   └── theme.js           # Theme customization API
│   └── schemas/
│       └── storeCreate.js     # Zod validation schema
├── dashboard/                 # React + Vite frontend
│   └── src/
│       ├── components/        # Header, Form, RunsTable, etc.
│       ├── hooks/             # useRuns, useRunStatus
│       ├── api.js             # API client
│       └── App.jsx            # Main app
├── database/
│   └── init.sql               # PostgreSQL schema
├── n8n-workflows/
│   ├── master-workflow.json   # Main AI pipeline
│   └── error-handler-workflow.json
├── docker-compose.yml         # Dev infrastructure
├── docker-compose.prod.yml    # Production config
├── Dockerfile                 # Multi-stage build
└── .env.example               # Environment template
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI generation | ✅ |
| `SHOPIFY_STORE_DOMAIN` | e.g. `your-store.myshopify.com` | ✅ |
| `SHOPIFY_ACCESS_TOKEN` | Shopify Admin API token | ✅ |
| `PEXELS_API_KEY` | For product images | ✅ |
| `POSTGRES_USER/PASSWORD` | Database credentials | ✅ |
| `N8N_USER/PASSWORD` | n8n login | ✅ |
| `GEMINI_API_KEY` | Google Gemini (fallback) | Optional |

## How It Works

1. **User submits** niche, audience, budget tier via the dashboard
2. **API cleans** existing Shopify store data
3. **API triggers** n8n webhook with store parameters
4. **n8n runs 5 AI agents** sequentially (Groq/Llama 3.3 70B):
   - Store Architect → Blueprint
   - Product Researcher → Product catalog
   - Content Writer → SEO descriptions
   - Pricing Optimizer → Optimal pricing
   - Theme Consultant → Colors & fonts
5. **n8n creates on Shopify**: Collections, Products (with Pexels images), Pages
6. **API customizes theme**: Hero banner, sections, colors
7. **Dashboard shows** real-time progress & completion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Lucide React |
| Backend | Node.js, Express 5 |
| Workflow | n8n (self-hosted) |
| AI | Groq (Llama 3.3 70B) |
| Database | PostgreSQL |
| Cache | Redis |
| Images | Pexels API |
| Platform | Shopify Admin API |

## License

MIT
