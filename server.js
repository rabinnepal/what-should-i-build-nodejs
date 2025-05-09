const app = require('./app');
const { prisma } = require('./config');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and Prisma client...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}); 