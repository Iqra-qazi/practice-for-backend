import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { once } from "node:events";
import { createServer } from "node:http";
import mongoose from "mongoose";
import connectDB from "../src/db/db.js";
import { validateServerEnvironment, requiredServerVariables } from "../src/config/environment.js";
import { getAuthCookieOptions } from "../src/utils/jwt.js";
import { AdminSeedError, seedAdminAccount } from "../src/utils/adminSeed.js";

process.env.CLIENT_URL = "https://client.example.test";
Object.assign(
  process.env,
  Object.fromEntries(requiredServerVariables.map((name) => [name, `deployment-test-${name.toLowerCase()}`])),
);
const { default: app } = await import("../src/app.js");
const { default: apiHandler } = await import("../api/index.js");

let server;
let apiServer;
let baseUrl;
let apiBaseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  apiServer = createServer((req, res) => apiHandler(req, res));
  apiServer.listen(0, "127.0.0.1");
  await Promise.all([once(server, "listening"), once(apiServer, "listening")]);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  apiBaseUrl = `http://127.0.0.1:${apiServer.address().port}`;
});

after(async () => {
  await Promise.all([server, apiServer].filter(Boolean).map((currentServer) =>
    new Promise((resolve, reject) => {
      currentServer.close((error) => (error ? reject(error) : resolve()));
    }),
  ));
});

test("server environment validation reports missing names without values", () => {
  assert.throws(
    () => validateServerEnvironment({}),
    new RegExp(requiredServerVariables.join("|")),
  );
  const environment = Object.fromEntries(requiredServerVariables.map((name) => [name, "test-value"]));
  assert.equal(validateServerEnvironment(environment), environment);
});

test("MongoDB connection initialization is cached without opening a real connection", async () => {
  const previousUri = process.env.MONGODB_URI;
  const originalConnect = mongoose.connect;
  const cacheKey = Symbol.for("rabta.mongoose.cache");
  let connectionAttempts = 0;
  process.env.MONGODB_URI = "deployment-test-uri";
  mongoose.connect = async () => {
    connectionAttempts += 1;
    return mongoose;
  };

  try {
    await connectDB();
    await connectDB();
    assert.equal(connectionAttempts, 1);
  } finally {
    mongoose.connect = originalConnect;
    if (globalThis[cacheKey]) globalThis[cacheKey].promise = null;
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
  }
});

test("health returns only the public status field", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("Vercel rewrite path reaches the API handler without opening MongoDB for health or logout", async () => {
  const health = await fetch(`${apiBaseUrl}/api?__vercel_path=health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });

  const logout = await fetch(`${apiBaseUrl}/api?__vercel_path=auth/logout`, {
    method: "POST",
  });
  assert.equal(logout.status, 204);

  const unavailable = await fetch(`${apiBaseUrl}/api?__vercel_path=cron/test`);
  assert.equal(unavailable.status, 404);

  const blockedOrigin = await fetch(`${apiBaseUrl}/api?__vercel_path=auth/login`, {
    method: "POST",
    headers: {
      Origin: "https://other.example.test",
      "content-type": "application/json",
    },
    body: "{}",
  });
  assert.equal(blockedOrigin.status, 403);
});

test("CORS allows the configured origin and rejects other origins", async () => {
  const allowed = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: process.env.CLIENT_URL },
  });
  assert.equal(allowed.headers.get("access-control-allow-origin"), process.env.CLIENT_URL);
  assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");

  const blocked = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: "https://other.example.test" },
  });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get("access-control-allow-origin"), null);
});

test("public signup rejects role assignment before accessing a database", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "not-an-admin",
      email: "not-an-admin@example.test",
      password: "example-password",
      role: "admin",
    }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /Role cannot be assigned/);
});

test("protected routes reject missing sessions and unknown routes stay unavailable", async () => {
  const protectedResponse = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(protectedResponse.status, 401);

  const cronResponse = await fetch(`${baseUrl}/api/cron/test`);
  assert.equal(cronResponse.status, 404);
});

test("JSON request body limit is enforced", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ value: "x".repeat(1024 * 1024) }),
  });
  assert.equal(response.status, 413);
});

test("malformed request errors do not expose stack details", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.deepEqual(body, { success: false, message: "Invalid request." });
  assert.equal("stack" in body, false);
});

test("production auth cookie is HttpOnly, secure, cross-site, and path-scoped", () => {
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    assert.deepEqual(getAuthCookieOptions(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  } finally {
    if (previousEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnvironment;
  }
});

test("Vercel preview auth cookies remain cross-site compatible", () => {
  const previousEnvironment = process.env.NODE_ENV;
  const previousVercel = process.env.VERCEL;
  process.env.NODE_ENV = "development";
  process.env.VERCEL = "1";
  try {
    assert.deepEqual(getAuthCookieOptions(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  } finally {
    if (previousEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnvironment;
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
  }
});

test("logout clears the HttpOnly cookie server-side", async () => {
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const response = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
    assert.equal(response.status, 204);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /token=/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=None/i);
  } finally {
    if (previousEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnvironment;
  }
});

test("admin seed creates once, hashes the password, and refuses a second admin", async () => {
  const records = [];
  const fakeUserModel = {
    async exists(filter) {
      return records.some((record) =>
        Object.entries(filter).every(([key, value]) => record[key] === value),
      );
    },
    async create(record) {
      records.push(record);
      return record;
    },
  };
  let hashedPassword;

  const first = await seedAdminAccount({
    userModel: fakeUserModel,
    hashPassword: async (password) => {
      hashedPassword = `hashed:${password}`;
      return hashedPassword;
    },
    email: "First.Admin@example.test",
    password: "long-test-password",
  });
  assert.equal(first.email, "first.admin@example.test");
  assert.equal(first.password, hashedPassword);
  assert.notEqual(first.password, "long-test-password");

  await assert.rejects(
    seedAdminAccount({
      userModel: fakeUserModel,
      hashPassword: async (password) => password,
      email: "another.admin@example.test",
      password: "another-long-password",
    }),
    AdminSeedError,
  );
  assert.equal(records.length, 1);
});
