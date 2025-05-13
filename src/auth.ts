import { Context } from "hono"
import { bearerAuth } from "hono/bearer-auth"
import { HTTPException } from "hono/http-exception"
import { config } from "./config"

export const authMiddleware = bearerAuth({
  token: Object.keys(config.allowedTokens),
})

export const getUsername = (ctx: Context): string => {
  const authHeader = ctx.req.header("Authorization")
  const [, token] = authHeader?.split(" ") ?? []
  const username = config.allowedTokens[token]
  if (!username) {
    throw new HTTPException(401)
  }

  return username
}
