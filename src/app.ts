import { Hono } from "hono"
import { cors } from "hono/cors"
import { bearerAuth } from "hono/bearer-auth"
import { logger } from "hono/logger"
import { getFile, createFile } from "./store"
import { listFiles } from "./store"
import openApiSpec from "../openapi.json"

const API_TOKEN = "b6636bbc-f772-4017-b465-898f4069ec36"

export const app = new Hono()

app.use("*", logger(), cors())

app.get("/api/v1/files", bearerAuth({ token: API_TOKEN }), async (ctx) => {
  const files = await listFiles()
  return ctx.json(files)
})

app.get(
  "/api/v1/files/:name",
  bearerAuth({ token: API_TOKEN }),
  async (ctx) => {
    const filename = ctx.req.param("name")
    const file = await getFile(filename)
    return ctx.json({
      filename: file.filename,
      contents: file.contents,
    })
  },
)

app.post(
  "/api/v1/files/:name",
  bearerAuth({ token: API_TOKEN }),
  async (ctx) => {
    const filename = ctx.req.param("name")
    const contents = await ctx.req.text()
    await createFile(filename, contents)
    return ctx.json(
      {
        filename,
      },
      { status: 201 },
    )
  },
)

app.get("/api/v1/openapi.json", (ctx) => ctx.json(openApiSpec))
