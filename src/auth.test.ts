import { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { authMiddleware, getUsername } from "./auth"
import { config } from "./config"

// Note: these tests rely on `ALLOWED_TOKENS` environment variable being set (see vitest.setup.ts)

describe("auth module", () => {
  describe("authMiddleware", () => {
    it("should allow requests with valid token", async () => {
      const validToken = Object.keys(config.allowedTokens)[0]
      const mockContext = {
        req: { header: vi.fn().mockReturnValue(`Bearer ${validToken}`) },
      } as unknown as Context<any, string, object> // eslint-disable-line @typescript-eslint/no-explicit-any

      const nextMock = vi.fn()

      await authMiddleware(mockContext, nextMock)

      expect(mockContext.req.header).toHaveBeenCalledWith("Authorization") // eslint-disable-line @typescript-eslint/unbound-method
      expect(nextMock).toHaveBeenCalled()
    })

    it("should reject requests with invalid token", async () => {
      const invalidToken = "invalid-token"
      const mockContext = {
        req: { header: vi.fn().mockReturnValue(`Bearer ${invalidToken}`) },
      } as unknown as Context<any, string, object> // eslint-disable-line @typescript-eslint/no-explicit-any

      const nextMock = vi.fn()

      await expect(authMiddleware(mockContext, nextMock)).rejects.toThrow(
        new HTTPException(401, {
          res: expect.any(Response) as Response,
        }),
      )
      expect(mockContext.req.header).toHaveBeenCalledWith("Authorization") // eslint-disable-line @typescript-eslint/unbound-method
      expect(nextMock).not.toHaveBeenCalled()
    })

    it("should reject requests with missing authorization header", async () => {
      const mockContext = {
        req: { header: vi.fn().mockReturnValue(null) },
      } as unknown as Context<any, string, object> // eslint-disable-line @typescript-eslint/no-explicit-any

      const nextMock = vi.fn()

      await expect(authMiddleware(mockContext, nextMock)).rejects.toThrow(
        new HTTPException(401, {
          res: expect.any(Response) as Response,
        }),
      )
      expect(mockContext.req.header).toHaveBeenCalledWith("Authorization") // eslint-disable-line @typescript-eslint/unbound-method
      expect(nextMock).not.toHaveBeenCalled()
    })
  })

  describe("getUsername", () => {
    it("should return username for valid token", () => {
      const validToken = Object.keys(config.allowedTokens)[0]
      const expectedUsername = config.allowedTokens[validToken]

      const mockContext = {
        req: {
          header: vi.fn().mockReturnValue(`Bearer ${validToken}`),
        },
      } as unknown as Context<any, string, object> // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = getUsername(mockContext)

      expect(result).toBe(expectedUsername)
      expect(mockContext.req.header).toHaveBeenCalledWith("Authorization") // eslint-disable-line @typescript-eslint/unbound-method
    })

    it("should throw 401 error for invalid token", () => {
      const invalidToken = "invalid-token"
      const mockContext = {
        req: {
          header: vi.fn().mockReturnValue(`Bearer ${invalidToken}`),
        },
      } as unknown as Context

      expect(() => getUsername(mockContext)).toThrow(HTTPException)
    })

    it("should throw 401 error for missing authorization header", () => {
      const mockContext = {
        req: {
          header: vi.fn().mockReturnValue(undefined),
        },
      } as unknown as Context

      expect(() => getUsername(mockContext)).toThrow(HTTPException)
    })
  })
})
