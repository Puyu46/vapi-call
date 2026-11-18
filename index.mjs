import { serve } from "@hono/node-server";
import app from "./app.mjs";

serve({ fetch: app.fetch, port: 4242 });
console.log("Agent Demo API listening on :4242");
