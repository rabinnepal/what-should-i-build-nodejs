# What Should I Build - Backend

A Node.js backend for the "What Should I Build" project idea generator, built with Express.js, Prisma ORM, and PostgreSQL.

## Features

- User authentication with JWT
- Project idea submission and voting
- Quiz-based idea suggestions
- Vector similarity search using Cohere embeddings and Pinecone
- AI-powered project descriptions and idea generation using Google Gemini
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Cohere API key
- Pinecone account and API key
- Google Gemini API key (optional)

## Setup

1. Clone the repository:
```bash
git clone git@github.com:rabinnepal/what-should-i-build-nodejs.git
cd what-should-i-build-backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)

### Ideas
- `POST /api/ideas` - Create new idea (protected)
- `GET /api/ideas` - Get ideas with pagination and sorting
- `GET /api/ideas/:id` - Get single idea
- `POST /api/ideas/:id/vote` - Vote on idea (protected)

### Quiz
- `POST /api/quiz/suggest` - Submit quiz and get suggestions

### Embeddings
- `POST /api/embeddings/search` - Search ideas by vector similarity (protected)

## Development

- `npm run dev` - Start development server with hot reload
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Database Schema

The application uses Prisma ORM with PostgreSQL. The schema includes:

- Users
- Ideas
- Votes
- Quiz Responses

See `prisma/schema.prisma` for the complete schema definition.

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `COHERE_API_KEY` - Cohere API key for embeddings
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_ENVIRONMENT` - Pinecone environment
- `PINECONE_INDEX` - Pinecone index name
- `PORT` - Server port (default: 3000)
- `GOOGLE_CLIENT_ID`- Google Client ID
- `GOOGLE_CLIENT_SECRET`=Google Client Secret
- `GITHUB_CLIENT_ID`= GitHub Client ID
- `GITHUB_CLIENT_SECRET`= GitHub Client Secret

## AI Features

### Cohere Embeddings
- Used for generating vector embeddings of project ideas and quiz answers
- Enables semantic search and similarity matching
- Model: `embed-english-v3.0`

### Google Gemini
- Optional AI-powered features:
  - Generate creative project descriptions
  - Suggest new project ideas based on quiz answers
- Model: `gemini-free`

## License

MIT 