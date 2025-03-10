import { Context } from "hono"
import { bearerAuth } from "hono/bearer-auth"
import { HTTPException } from "hono/http-exception"

const tokens: Record<string, string> = {
  "e4c2ab4a-52c4-44de-a22d-fe35723e7b4f": "user1",
  "025f1586-a0ad-452c-8ceb-32d7951119ba": "user2",
}

export const getUsername = (ctx: Context): string => {
  const authHeader = ctx.req.header("Authorization")
  const [, token] = authHeader?.split(" ") ?? []
  const username = tokens[token]
  if (!username) {
    throw new HTTPException(401)
  }

  return username
}

export const authMiddleware = bearerAuth({ token: Object.keys(tokens) })
