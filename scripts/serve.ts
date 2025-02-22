import { serve } from "@hono/node-server"
import { app } from "../src/app"

serve({ fetch: app.fetch, port: 4444 }, ({ port }) =>
  console.info(`Listening on ${port}…`),
)
