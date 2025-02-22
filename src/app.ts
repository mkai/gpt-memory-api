import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { getFile, createFile } from "./store"
import { listFiles } from "./store"
import openApiSpec from "../openapi.json"

export const app = new Hono()

app.use("*", cors(), logger())

app.get("/api/v1/files", async (ctx) => {
  const files = await listFiles()
  return ctx.json(files)
})

app.get("/api/v1/files/:name", async (ctx) => {
  const filename = ctx.req.param("name")
  const file = await getFile(filename)
  return ctx.json({
    filename: file.filename,
    contents: file.contents,
  })
})

app.post("/api/v1/files/:name", async (ctx) => {
  const filename = ctx.req.param("name")
  const contents = await ctx.req.text()
  await createFile(filename, contents)
  return ctx.json(
    {
      filename,
    },
    { status: 201 },
  )
})

app.get("/api/v1/openapi.json", (ctx) => ctx.json(openApiSpec))
