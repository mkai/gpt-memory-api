import { Context } from "hono"
import { bearerAuth } from "hono/bearer-auth"
import { HTTPException } from "hono/http-exception"

const tokens: Record<string, string> = {
  "b6636bbc-f772-4017-b465-898f4069ec36": "user1",
  "0dfe9da8-4065-4dd3-a793-5200107fe455": "user2",
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
