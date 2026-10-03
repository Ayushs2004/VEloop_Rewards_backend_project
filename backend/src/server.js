const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

let server;

const startServer = async () => {
  try {
    console.log('[VELoop Rewards] Starting backend service...');
    await connectDB();

    // In development or when using in-memory DB, auto-seed if empty for instant evaluation readiness
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[VELoop Rewards] No existing users found. Auto-seeding demo datasets...');
      const seedData = require('./seed/seedData');
      await seedData(false);
    }

    server = app.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`  VELoop Rewards Wallet & Withdrawal Service Running   `);
      console.log(`  Environment: ${env.NODE_ENV}                         `);
      console.log(`  Port:        ${env.PORT}                             `);
      console.log(`  Health API:  http://localhost:${env.PORT}/health      `);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[VELoop Rewards] ERROR: Port ${env.PORT} is already in use by another running process.`);
        console.error(`[VELoop Rewards] To resolve: terminate the process using port ${env.PORT} or change PORT in .env`);
      } else {
        console.error('[VELoop Rewards] Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('[VELoop Rewards] Fatal initialization error:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('[VELoop Rewards] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[VELoop Rewards] Uncaught Exception:', err.message);
});

const handleShutdown = async (signal) => {
  console.log(`\n[VELoop Rewards] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('[VELoop Rewards] HTTP server closed.');
      await disconnectDB();
      console.log('[VELoop Rewards] Database disconnected.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
