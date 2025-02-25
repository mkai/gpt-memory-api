import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { HTTPException } from "hono/http-exception"
import { validateFilename, validateFile } from "./validate"
import { authMiddleware, getUsername } from "./auth"
import { listUserFiles, getUserFile, createUserFile } from "./store"
import openApiSpec from "../openapi.json"

export const app = new Hono()

app.use(logger())
app.use(cors())

app.get("/api/v1/files", authMiddleware, async (ctx) => {
  const username = getUsername(ctx)
  console.info(`Listing files for user ${username}…`)
  const files = await listUserFiles(username)
  return ctx.json(files)
})

app.get("/api/v1/files/:filename", authMiddleware, async (ctx) => {
  const username = getUsername(ctx)
  const filenameInput: unknown = ctx.req.param("filename")
  const [filename, errors] = validateFilename(filenameInput)
  if (!filename) {
    console.info("Invalid request data:", filenameInput, errors)
    throw new HTTPException(400)
  }

  console.info(`Getting file ${username}/${filename}…`)
  const file = await getUserFile(username, filename)
  if (!file) {
    console.info(`File not found: "${username}/${filename}"`)
    throw new HTTPException(404)
  }

  return ctx.json({
    filename: file.filename,
    contents: file.contents,
  })
})

app.post("/api/v1/files", authMiddleware, async (ctx) => {
  const username = getUsername(ctx)
  const fileInput: unknown = await ctx.req.json()
  const [file, errors] = validateFile(fileInput)
  if (!file) {
    console.info("Invalid request data:", fileInput, errors)
    throw new HTTPException(400)
  }

  const { filename, contents } = file
  console.info(`Saving file ${username}/${filename} (${contents.length} bytes)`)
  await createUserFile(getUsername(ctx), filename, contents)
  return ctx.json({ filename })
})

app.get("/api/v1/openapi.json", (ctx) => ctx.json(openApiSpec))
