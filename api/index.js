import app from "../app.mjs";

// Plain Node (req, res) -> Fetch Request adapter.
// Vercel's Node runtime hands serverless functions a Node http
// IncomingMessage, not a web Request, so the Hono app is called
// through a real web Request built here. This keeps the same app
// working on Vercel, locally, and anywhere else Node serves HTTP.
export default async function handler(req, res) {
  const host = req.headers.host || "localhost";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const url = `${protocol}://${host}${req.url}`;
  const init = { method: req.method, headers: req.headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req; // Node Readable stream; undici accepts it as a body
    init.duplex = "half";
  }
  let request;
  try {
    request = new Request(url, init);
  } catch {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }
  let response;
  try {
    response = await app.fetch(request);
  } catch (e) {
    console.error("app error:", e);
    res.statusCode = 500;
    res.end("Internal Server Error");
    return;
  }
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
