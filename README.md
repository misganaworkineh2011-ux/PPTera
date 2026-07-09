# PPTera - AI-Powered Presentation Generator

An AI-powered SaaS application that generates professional PowerPoint presentations using OpenAI, built with Next.js, Clerk, Prisma, Neon, and Polar.

## Features

- 🤖 AI-powered presentation generation using OpenAI GPT-4
- 🔐 Authentication with Clerk
- 💳 Payment processing with Polar 
- 🗄️ PostgreSQL database with Prisma ORM (Neon)
- 📊 Credit-based system
- 📥 Download presentations as PPTX files
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon) + Prisma
- **Payments**: Polar
- **AI**: OpenAI GPT-4
- **PPT Generation**: pptxgenjs
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Clerk account
- Polar account
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

4. Set up the database:

\`\`\`bash
npm run db:push
\`\`\`

5. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `CLERK_WEBHOOK_SECRET`: Clerk webhook secret
- `POLAR_ACCESS_TOKEN`: Polar API token
- `POLAR_ENV`: Polar environment (sandbox/production)
- `POLAR_WEBHOOK_SECRET`: Polar webhook secret
- `POLAR_PRODUCT_*`: Polar product IDs
- `OPENAI_API_KEY`: OpenAI API key

## Database Schema

The application uses Prisma with two main models:

- **User**: Stores user information, credits, and subscription details
- **Presentation**: Stores generated presentations

## API Routes

- `/api/generate` - Generate presentations
- `/api/webhooks/clerk` - Clerk webhook handler
- `/api/webhooks/polar` - Polar webhook handler

## Deployment

Deploy to Vercel:

\`\`\`bash
npm run build
\`\`\`

Make sure to set all environment variables in your deployment platform.

## License

MIT
