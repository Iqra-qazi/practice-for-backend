import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { once } from "node:events";
import app from "../src/app.js";
import { serializeAdminUser } from "../src/utils/adminUser.js";
import { serializeAuthResponse } from "../src/utils/authUser.js";
import { authorize } from "../src/middlewares/authorize.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

function runAuthorization(role, allowedRole) {
  const req = role ? { user: { role } } : {};
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;
  authorize(allowedRole)(req, response, () => {
    nextCalled = true;
  });
  return { ...response, nextCalled };
}

test("missing sessions receive 401 from existing protected routes", async () => {
  const authResponse = await fetch(`${baseUrl}/api/auth/me`);
  const adminResponse = await fetch(`${baseUrl}/api/admin/users`);

  assert.equal(authResponse.status, 401);
  assert.equal(adminResponse.status, 401);
});

test("role authorization requires an exact match", () => {
  assert.equal(runAuthorization("donor", "donor").nextCalled, true);
  assert.equal(runAuthorization("admin", "admin").nextCalled, true);

  const admin = runAuthorization("admin", "donor");
  assert.equal(admin.statusCode, 403);
  assert.equal(admin.nextCalled, false);

  const user = runAuthorization("user", "donor");
  assert.equal(user.statusCode, 403);
  assert.equal(user.nextCalled, false);

  const anonymous = runAuthorization(null, "donor");
  assert.equal(anonymous.statusCode, 401);
  assert.equal(anonymous.nextCalled, false);
});

test("auth response serializer excludes tokens and private account fields", () => {
  const response = serializeAuthResponse({
    _id: "account-id",
    username: "A Donor",
    email: "donor@example.test",
    role: "user",
    picture: null,
    password: "hash",
    token: "secret-token",
    cart: [{ product: "internal-product-id" }],
  });

  assert.deepEqual(response, {
    success: true,
    user: {
      id: "account-id",
      name: "A Donor",
      email: "donor@example.test",
      role: "user",
      picture: null,
    },
  });
  assert.equal("token" in response, false);
  assert.equal("password" in response.user, false);
});

test("admin account serializer only returns approved account fields", () => {
  const response = serializeAdminUser({
    _id: "account-id",
    username: "A Donor",
    email: "donor@example.test",
    role: "user",
    status: "active",
    password: "hash",
    token: "secret-token",
    cart: [{ product: "internal-product-id" }],
    privateField: "not for clients",
  });

  assert.deepEqual(response, {
    _id: "account-id",
    username: "A Donor",
    email: "donor@example.test",
    role: "user",
    status: "active",
  });
});

test("donor and patient APIs remain unavailable until their models exist", async () => {
  const unavailableEndpoints = [
    ["GET", "/api/dashboard/me"],
    ["GET", "/api/donor/profile"],
    ["PUT", "/api/donor/profile"],
    ["PATCH", "/api/donor/availability"],
    ["GET", "/api/donor/history"],
    ["GET", "/api/requests/nearby"],
    ["POST", "/api/requests/test-id/respond"],
    ["GET", "/api/requests/mine"],
    ["GET", "/api/notifications"],
  ];

  for (const [method, path] of unavailableEndpoints) {
    const response = await fetch(`${baseUrl}${path}`, { method });
    assert.equal(response.status, 404, `${method} ${path} should remain unimplemented`);
  }
});
