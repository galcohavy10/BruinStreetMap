const request = require("supertest");
const app = require("../index.js"); // Import your Express app
const hardSetUp = require("../hardSetupDb.js");
const pool = require("../db.js"); // Ensure pool is imported

let testUserId;
let testPostId;
let testCommentId;

// Create test user, post, and comment before running tests
beforeAll(async () => {
  await hardSetUp();

  const userRes = await request(app)
    .post("/users/register")
    .send({
      username: "testuser",
      email: "test@example.com",
      major: "CS",
      clubs: ["AI"],
    });

  testUserId = userRes.body.user.id;

  const postRes = await request(app).post("/posts").send({
    user_id: testUserId,
    title: "Test Post",
    body: "This is a test post",
  });

  console.log(postRes.body);

  testPostId = postRes.body.post.id;

  const commentRes = await request(app).post("/comments").send({
    user_id: testUserId,
    post_id: testPostId,
    body: "This is a test comment",
  });

  testCommentId = commentRes.body.comment.id;
});

afterAll(async () => {
  await pool.end(); // Close DB connection after all tests
});

describe("Voting System Tests", () => {
  test("Upvote a post", async () => {
    const res = await request(app)
      .post(`/posts/${testPostId}/upvote`)
      .send({ user_id: testUserId });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Upvoted post successfully!");
  });

  test("Downvote a post", async () => {
    const res = await request(app)
      .post(`/posts/${testPostId}/downvote`)
      .send({ user_id: testUserId });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Downvoted post successfully!");
  });

  test("Get post vote count", async () => {
    const res = await request(app).get(`/posts/${testPostId}/votes`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("upvotes");
    expect(res.body).toHaveProperty("downvotes");
  });

  test("Upvote a comment", async () => {
    const res = await request(app)
      .post(`/comments/${testCommentId}/upvote`)
      .send({ user_id: testUserId });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Upvoted comment successfully!");
  });

  test("Downvote a comment", async () => {
    const res = await request(app)
      .post(`/comments/${testCommentId}/downvote`)
      .send({ user_id: testUserId });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Downvoted comment successfully!");
  });

  test("Get comment vote count", async () => {
    const res = await request(app).get(`/comments/${testCommentId}/votes`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("upvotes");
    expect(res.body).toHaveProperty("downvotes");
  });
});
