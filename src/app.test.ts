import { MiddlewareHandler } from "hono"
import { authMiddleware, getUsername } from "./auth"
import { listUserFiles, getUserFile, createUserFile } from "./store"
import { validateFilename, validateFile } from "./validate"
import { app } from "./app"

vi.mock("./auth")
vi.mock("./store")
vi.mock("./validate")

const mockedAuthMiddleware = vi.mocked(authMiddleware, true)
const mockedGetUsername = vi.mocked(getUsername, true)
const mockedListUserFiles = vi.mocked(listUserFiles, true)
const mockedGetUserFile = vi.mocked(getUserFile, true)
const mockedCreateUserFile = vi.mocked(createUserFile, true)
const mockedValidateFilename = vi.mocked(validateFilename, true)
const mockedValidateFile = vi.mocked(validateFile, true)

describe("app", () => {
  const username = "testuser"
  const filename = "testfile.txt"
  const contents = "file contents"

  const dummyAuthMiddleware: MiddlewareHandler = async (_, next) => await next()

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("GET /api/v1/files", () => {
    it("should list files for a user", async () => {
      mockedAuthMiddleware.mockImplementation(dummyAuthMiddleware)
      mockedGetUsername.mockReturnValue(username)
      mockedListUserFiles.mockResolvedValue([
        { filename, lastModified: new Date() },
      ])

      const res = await app.request("/api/v1/files", { method: "GET" })

      expect(mockedGetUsername).toHaveBeenCalled()
      expect(mockedListUserFiles).toHaveBeenCalledWith(username)
      expect(res.status).toBe(200)
    })
  })

  describe("GET /api/v1/files/:filename", () => {
    it("should get a file for a user", async () => {
      mockedAuthMiddleware.mockImplementation(dummyAuthMiddleware)
      mockedGetUsername.mockReturnValue(username)
      mockedValidateFilename.mockReturnValue([filename, undefined])
      mockedGetUserFile.mockResolvedValue({ filename, contents })

      const res = await app.request(`/api/v1/files/${filename}`, {
        method: "GET",
      })

      expect(mockedGetUsername).toHaveBeenCalled()
      expect(mockedValidateFilename).toHaveBeenCalledWith(filename)
      expect(mockedGetUserFile).toHaveBeenCalledWith(username, filename)
      expect(res.status).toBe(200)
    })

    it("should return 404 if file does not exist", async () => {
      mockedAuthMiddleware.mockImplementation(dummyAuthMiddleware)
      mockedGetUsername.mockReturnValue(username)
      mockedValidateFilename.mockReturnValue([filename, undefined])
      mockedGetUserFile.mockResolvedValue(undefined)

      const res = await app.request(`/api/v1/files/${filename}`, {
        method: "GET",
      })

      expect(res.status).toBe(404)
    })

    it("should return 400 if filename is invalid", async () => {
      mockedAuthMiddleware.mockImplementation(dummyAuthMiddleware)
      mockedValidateFilename.mockReturnValue([
        undefined,
        [new Error("invalid")],
      ])

      const res = await app.request(`/api/v1/files/<dummy>`, {
        method: "GET",
      })

      expect(res.status).toBe(400)
    })
  })

  describe("POST /api/v1/files", () => {
    it("should create a file for a user", async () => {
      mockedAuthMiddleware.mockImplementation(dummyAuthMiddleware)
      mockedGetUsername.mockReturnValue(username)
      mockedValidateFile.mockReturnValue([{ filename, contents }, undefined])
      mockedCreateUserFile.mockResolvedValue()

      const res = await app.request("/api/v1/files", {
        method: "POST",
        body: JSON.stringify({ filename, contents }),
      })

      expect(mockedGetUsername).toHaveBeenCalled()
      expect(mockedValidateFile).toHaveBeenCalledWith({ filename, contents })
      expect(mockedCreateUserFile).toHaveBeenCalledWith(
        username,
        filename,
        contents,
      )
      expect(res.status).toBe(200)
    })

    it("should return 400 if file data is invalid", async () => {
      mockedAuthMiddleware.mockImplementation(dummyAuthMiddleware)
      mockedValidateFile.mockReturnValue([undefined, [new Error("invalid")]])

      const res = await app.request("/api/v1/files", {
        method: "POST",
        body: JSON.stringify({ filename: "invalid/filename.txt" }),
      })

      expect(res.status).toBe(400)
    })
  })
})
