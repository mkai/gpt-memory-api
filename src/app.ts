import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { HTTPException } from "hono/http-exception"
import { authMiddleware, getUsername } from "./auth"
import { listUserFiles, getUserFile, createUserFile } from "./store"
import openApiSpec from "../openapi.json"

export const app = new Hono()

app.use("*", logger(), cors())

app.get("/api/v1/files", authMiddleware, async (ctx) => {
  const username = getUsername(ctx)
  console.info(`Listing files for user ${username}…`)
  const files = await listUserFiles(username)
  return ctx.json(files)
})

app.get("/api/v1/files/:filename", authMiddleware, async (ctx) => {
  const username = getUsername(ctx)
  const filename = ctx.req.param("filename")
  if (filename.includes("/")) {
    console.info(`Got illegal filename: "${filename}"`)
    throw new HTTPException(400)
  }

  console.info(`Getting file ${username}/${filename}…`)
  const file = await getUserFile(username, filename)
  if (!file) {
    console.info("File not found: ", filename)
    throw new HTTPException(404)
  }

  return ctx.json({
    filename: file.filename,
    contents: file.contents,
  })
})

app.post("/api/v1/files", authMiddleware, async (ctx) => {
  const username = getUsername(ctx)
  const { filename, contents } = await ctx.req.json()
  if (filename.includes("/")) {
    console.info(`Got illegal filename: "${filename}"`)
    throw new HTTPException(400)
  }

  console.info(`Saving file ${username}/${filename} (${contents.length} bytes)`)
  await createUserFile(getUsername(ctx), filename, contents)
  return ctx.json({ filename })
})

app.get("/api/v1/openapi.json", (ctx) => ctx.json(openApiSpec))
