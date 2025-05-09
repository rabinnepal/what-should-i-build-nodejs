const request = require('supertest');
const { prisma } = require('../config');
const app = require('../app');

describe('Authentication Tests', () => {
  // Clean up database before each test
  beforeEach(async () => {
    // Delete in correct order to handle foreign key constraints
    await prisma.vote.deleteMany();
    await prisma.idea.deleteMany();
    await prisma.user.deleteMany();
  });

  // Clean up database after all tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Social Login', () => {
    test('should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get('/api/auth/google')
        .expect(302);

      expect(response.header.location).toContain('accounts.google.com');
    });

    test('should redirect to GitHub OAuth', async () => {
      const response = await request(app)
        .get('/api/auth/github')
        .expect(302);

      expect(response.header.location).toContain('github.com');
    });

    test('should handle Google callback with new user', async () => {
      const response = await request(app)
        .get('/api/auth/google/callback?code=test-code')
        .expect(302);

      expect(response.header.location).toBe(`${process.env.CLIENT_URL}/auth/callback?token=test-token`);
    });

    test('should handle GitHub callback with new user', async () => {
      const response = await request(app)
        .get('/api/auth/github/callback?code=test-code')
        .expect(302);

      expect(response.header.location).toBe(`${process.env.CLIENT_URL}/auth/callback?token=test-token`);
    });

    test('should handle OAuth error', async () => {
      const response = await request(app)
        .get('/api/auth/google/callback?error=access_denied')
        .expect(302);

      expect(response.header.location).toBe(`${process.env.CLIENT_URL}/auth/error`);
    });
  });
}); 