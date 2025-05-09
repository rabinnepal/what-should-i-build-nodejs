require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'COHERE_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_ENVIRONMENT',
  'PINECONE_INDEX'
];

// Optional environment variables
const optionalEnvVars = [
  'GEMINI_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

module.exports = {
  prisma,
  env: {
    jwtSecret: process.env.JWT_SECRET,
    cohereApiKey: process.env.COHERE_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
      index: process.env.PINECONE_INDEX
    }
  }
}; 