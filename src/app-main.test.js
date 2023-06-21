const request = require('supertest');
const app = require('./app-main');

describe("GET /", () => {
  test("should respond with a 200 status code and an HTML view with the title set to /index", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  })
})
