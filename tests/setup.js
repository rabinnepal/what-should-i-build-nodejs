// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
process.env.CLIENT_URL = 'http://localhost:3000';

// Increase timeout for tests
jest.setTimeout(10000); 