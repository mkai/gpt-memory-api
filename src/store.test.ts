import { listObjects, getObject, putObject } from "./s3"
import { listUserFiles, getUserFile, createUserFile } from "./store"

vitest.mock("./s3")

const mockedListObjects = vitest.mocked(listObjects, true)
const mockedGetObject = vitest.mocked(getObject, true)
const mockedPutObject = vitest.mocked(putObject, true)

describe("store module", () => {
  const username = "testuser"
  const filename = "testfile.txt"
  const contents = "file contents"

  beforeEach(() => {
    vitest.resetAllMocks()
  })

  describe("listUserFiles", () => {
    it("should list files for a user", async () => {
      const s3Objects = [
        { Key: `${username}/file1.txt`, LastModified: new Date() },
        { Key: `${username}/file2.txt`, LastModified: new Date() },
      ]
      mockedListObjects.mockResolvedValue(s3Objects)

      const files = await listUserFiles(username)

      expect(mockedListObjects).toHaveBeenCalledWith(
        process.env.FILES_BUCKET_NAME!,
        `${username}/`,
      )
      expect(files).toEqual([
        { filename: "file1.txt", lastModified: s3Objects[0].LastModified },
        { filename: "file2.txt", lastModified: s3Objects[1].LastModified },
      ])
    })
  })

  describe("getUserFile", () => {
    it("should get a file for a user", async () => {
      const dummyStream = {
        transformToString: vi.fn().mockResolvedValue(contents),
      } as unknown as Awaited<ReturnType<typeof getObject>>
      mockedGetObject.mockResolvedValue(dummyStream)

      const file = await getUserFile(username, filename)

      expect(mockedGetObject).toHaveBeenCalledWith(
        process.env.FILES_BUCKET_NAME!,
        `${username}/${filename}`,
      )
      expect(file).toEqual({ filename, contents })
    })

    it("should return undefined if file does not exist", async () => {
      mockedGetObject.mockResolvedValue(undefined)

      const file = await getUserFile(username, filename)

      expect(mockedGetObject).toHaveBeenCalledWith(
        process.env.FILES_BUCKET_NAME!,
        `${username}/${filename}`,
      )
      expect(file).toBeUndefined()
    })
  })

  describe("createUserFile", () => {
    it("should create a file for a user", async () => {
      await createUserFile(username, filename, contents)

      expect(mockedPutObject).toHaveBeenCalledWith(
        process.env.FILES_BUCKET_NAME!,
        `${username}/${filename}`,
        contents,
      )
    })
  })
})
