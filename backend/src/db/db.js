import mongoose from "mongoose";

const cacheKey = Symbol.for("rabta.mongoose.cache");

function getConnectionCache() {
  if (!globalThis[cacheKey]) {
    globalThis[cacheKey] = { promise: null };
    mongoose.connection.on("disconnected", () => {
      globalThis[cacheKey].promise = null;
    });
  }
  return globalThis[cacheKey];
}

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI must be configured.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const cache = getConnectionCache();
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri)
      .then(() => mongoose.connection)
      .catch(() => {
        cache.promise = null;
        throw new Error("MongoDB connection failed.");
      });
  }

  return cache.promise;
}
