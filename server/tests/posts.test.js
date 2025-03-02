const request = require("supertest");
const app = require("../index.js"); // Import your Express app
const hardSetUp = require("../hardSetupDb.js");
const pool = require("../db.js");  // Ensure pool is imported

beforeAll(async () => {
  await hardSetUp();

  const userRes = await request(app)
    .post("/users/register")
    .send({
      username: "testuser",
      email: "test@example.com",
      password: "password",
      major: "CS",
      clubs: ["AI"],
    });

  testUserId = userRes.body.user.id;
});

afterAll(async () => {
  await pool.end(); // Close DB connection after all tests
});

describe("Post Tests", () => {
  let testUserId;
  let testPostId;

  test("Create a post", async () => {
    const res = await request(app).post("/posts").send({
      user_id: testUserId,
      title: "Test Post",
      body: "This is a test post",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("post");
    testPostId = res.body.post.id;
  });

  test("Get a post", async () => {
    const res = await request(app).get(`/posts/${testPostId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Post");
  });

  test("Filter posts by major", async () => {
    const res = await request(app).get("/posts/filter?major=CS");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
