const mongoose = require('mongoose');
const env = require('./env');

let memServerInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If in-memory mode explicitly requested or in test mode
  if (env.USE_IN_MEMORY_DB || process.env.NODE_ENV === 'test') {
    try {
      const { MongoMemoryReplSet, MongoMemoryServer } = require('mongodb-memory-server');
      try {
        // Try starting replica set first to support multi-document transactions in memory
        memServerInstance = await MongoMemoryReplSet.create({
          replSet: { count: 1, storageEngine: 'wiredTiger' }
        });
        const uri = memServerInstance.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] Connected to In-Memory MongoDB ReplicaSet at: ${uri}`);
        return mongoose.connection;
      } catch (replSetErr) {
        console.warn(`[Database] MongoMemoryReplSet failed, falling back to standalone MongoMemoryServer: ${replSetErr.message}`);
        memServerInstance = await MongoMemoryServer.create();
        const uri = memServerInstance.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] Connected to Standalone In-Memory MongoDB at: ${uri}`);
        return mongoose.connection;
      }
    } catch (memErr) {
      console.warn(`[Database] In-memory mongo could not be initialized: ${memErr.message}. Attempting direct URI.`);
    }
  }

  // Attempt connecting to configured MONGO_URI
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`[Database] Connected to MongoDB at: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (err) {
    console.warn(`[Database] Could not connect to MONGO_URI (${env.MONGO_URI}): ${err.message}`);
    // If not production, fall back to MongoMemoryServer so the app can run smoothly anywhere
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Database] Attempting fallback to mongodb-memory-server for zero-friction local development...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memServerInstance = await MongoMemoryServer.create();
        const uri = memServerInstance.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] Successfully connected to fallback In-Memory MongoDB at: ${uri}`);
        return mongoose.connection;
      } catch (fallbackErr) {
        console.error(`[Database] In-memory fallback also failed: ${fallbackErr.message}`);
        throw err;
      }
    }
    throw err;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memServerInstance) {
    await memServerInstance.stop();
    memServerInstance = null;
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
