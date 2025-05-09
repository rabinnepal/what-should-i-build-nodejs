const request = require('supertest');
const { prisma } = require('../config');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Mock external services
const mockGenerateProjectIdeas = jest.fn().mockResolvedValue([
  { title: 'Test Project', description: 'Test Description' }
]);

const mockQuerySimilar = jest.fn().mockResolvedValue([
  { id: '1', score: 0.8, metadata: { title: 'Test Project' } }
]);

const mockStoreVector = jest.fn().mockResolvedValue(true);

const mockGenerateEmbedding = jest.fn().mockResolvedValue([0.1, 0.2, 0.3]);
const mockGenerateIdeaEmbedding = jest.fn().mockResolvedValue([0.1, 0.2, 0.3]);

jest.mock('../utils/gemini', () => ({
  generateProjectIdeas: (...args) => mockGenerateProjectIdeas(...args),
  generateProjectDescription: jest.fn().mockResolvedValue('Generated description')
}));

jest.mock('../utils/pinecone', () => ({
  querySimilar: (...args) => mockQuerySimilar(...args),
  storeVector: (...args) => mockStoreVector(...args)
}));

jest.mock('../utils/embed', () => ({
  generateEmbedding: (...args) => mockGenerateEmbedding(...args),
  generateIdeaEmbedding: (...args) => mockGenerateIdeaEmbedding(...args)
}));

describe('Route Tests', () => {
  let authToken;
  let testUser;
  let testIdea;

  // Setup before all tests
  beforeAll(async () => {
    // Clean up any existing data
    await prisma.vote.deleteMany();
    await prisma.idea.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123'
      }
    });

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser.id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create a test idea
    testIdea = await prisma.idea.create({
      data: {
        title: 'Test Idea',
        description: 'This is a test idea description',
        tags: ['test', 'nodejs'],
        authorId: testUser.id,
        embedding: [0.1, 0.2, 0.3]
      }
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    // Delete in correct order to handle foreign key constraints
    await prisma.vote.deleteMany();
    await prisma.idea.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // Reset mocks before each test
  beforeEach(() => {
    mockGenerateProjectIdeas.mockClear();
    mockQuerySimilar.mockClear();
    mockStoreVector.mockClear();
    mockGenerateEmbedding.mockClear();
    mockGenerateIdeaEmbedding.mockClear();
  });

  describe('Idea Routes', () => {
    test('should create a new idea', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Test Idea',
          description: 'This is another test idea',
          tags: ['test', 'javascript']
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Test Idea');
    });

    test('should get all ideas', async () => {
      const response = await request(app)
        .get('/api/ideas')
        .expect(200);

      expect(Array.isArray(response.body.ideas)).toBe(true);
      expect(response.body.ideas.length).toBeGreaterThan(0);
    });

    test('should get a single idea', async () => {
      const response = await request(app)
        .get(`/api/ideas/${testIdea.id}`)
        .expect(200);

      expect(response.body.id).toBe(testIdea.id);
      expect(response.body.title).toBe(testIdea.title);
    });

    test('should vote on an idea', async () => {
      const response = await request(app)
        .post(`/api/ideas/${testIdea.id}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ vote: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('upvotes');
      expect(response.body).toHaveProperty('downvotes');
      expect(response.body).toHaveProperty('score');
    });
  });

  describe('Quiz Routes', () => {
    test('should submit quiz and get suggestions', async () => {
      mockGenerateProjectIdeas.mockResolvedValueOnce([
        { title: 'Generated Project', description: 'Generated Description' }
      ]);

      mockQuerySimilar.mockResolvedValueOnce([
        { id: testIdea.id, score: 0.8 }
      ]);

      const response = await request(app)
        .post('/api/quiz/suggest')
        .send({
          answers: {
            experience: 'intermediate',
            interests: ['web', 'ai'],
            type: ['web', 'mobile'],
            time: 'medium'
          },
          filters: {
            difficulty: 'medium',
            vibe: 'creative',
            tech: 'javascript',
            time: '1-2 weeks'
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('ideas');
      expect(response.body).toHaveProperty('generatedIdeas');
      expect(Array.isArray(response.body.ideas)).toBe(true);
    });

    test('should validate quiz input', async () => {
      const response = await request(app)
        .post('/api/quiz/suggest')
        .send({
          answers: 'invalid',
          filters: {
            difficulty: 'invalid'
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Embedding Routes', () => {
    test('should search by vector', async () => {
      mockQuerySimilar.mockResolvedValueOnce([
        { id: testIdea.id, score: 0.8, metadata: { title: 'Test Project' } }
      ]);

      const response = await request(app)
        .post('/api/embeddings/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answersVector: [0.1, 0.2, 0.3, 0.4, 0.5],
          filters: {
            difficulty: 'medium'
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('matches');
      expect(Array.isArray(response.body.matches)).toBe(true);
    });

    test('should require authentication for vector search', async () => {
      const response = await request(app)
        .post('/api/embeddings/search')
        .send({
          answersVector: [0.1, 0.2, 0.3, 0.4, 0.5]
        })
        .expect(401);
    });

    test('should validate vector input', async () => {
      const response = await request(app)
        .post('/api/embeddings/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answersVector: ['invalid', 'not', 'numbers']
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid vector format');
    });
  });
}); 