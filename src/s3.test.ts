import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3"
import { listObjects, getObject, putObject } from "./s3"

const mockS3Client = vi.hoisted(() => ({
  send: vi.fn(),
}))

vi.mock("@aws-sdk/client-s3", async () => {
  const originalModule = await vi.importActual("@aws-sdk/client-s3")
  return {
    ...originalModule,
    S3Client: vi.fn().mockImplementation(() => mockS3Client),
  }
})

describe("s3 module", () => {
  const bucketName = "test-bucket"
  const key = "test-key"
  const body = "test-body"

  beforeEach(() => {
    vitest.resetAllMocks()
  })

  describe("listObjects", () => {
    it("should list objects in the bucket", async () => {
      const mockResponse = { Contents: [{ Key: key }] }
      mockS3Client.send.mockResolvedValue(mockResponse)

      const result = await listObjects(bucketName)

      expect(result).toEqual(mockResponse.Contents)
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(ListObjectsV2Command),
      )
      const command = mockS3Client.send.mock.calls[0][0] as ListObjectsV2Command
      expect(command.input).toEqual({
        Bucket: "test-bucket",
      })
    })

    it("should handle errors", async () => {
      mockS3Client.send.mockRejectedValue(new Error("S3 error"))

      await expect(listObjects(bucketName)).rejects.toThrow("S3 error")
    })
  })

  describe("getObject", () => {
    it("should get an object from the bucket", async () => {
      const mockResponse = { Body: body }
      mockS3Client.send.mockResolvedValue(mockResponse)

      const result = await getObject(bucketName, key)

      expect(result).toEqual(body)
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand),
      )
      const command = mockS3Client.send.mock.calls[0][0] as GetObjectCommand
      expect(command.input).toEqual({
        Bucket: "test-bucket",
        Key: "test-key",
      })
    })

    it("should return undefined if object does not exist", async () => {
      mockS3Client.send.mockRejectedValue(
        new NoSuchKey({
          $metadata: { httpStatusCode: 404 },
          message: "Not Found",
        }),
      )

      const result = await getObject(bucketName, key)

      expect(result).toBeUndefined()
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand),
      )
      const command = mockS3Client.send.mock.calls[0][0] as GetObjectCommand
      expect(command.input).toEqual({
        Bucket: "test-bucket",
        Key: "test-key",
      })
    })

    it("should throw an error if object cannot be fetched", async () => {
      mockS3Client.send.mockRejectedValue(new Error("S3 error"))

      await expect(getObject(bucketName, key)).rejects.toThrow("S3 error")
    })
  })

  describe("putObject", () => {
    it("should put an object in the bucket", async () => {
      mockS3Client.send.mockResolvedValue(undefined)

      await putObject(bucketName, key, body)

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand),
      )
      const command = mockS3Client.send.mock.calls[0][0] as PutObjectCommand
      expect(command.input).toEqual({
        Bucket: "test-bucket",
        Key: "test-key",
        Body: "test-body",
      })
    })

    it("should handle errors", async () => {
      mockS3Client.send.mockRejectedValue(new Error("S3 error"))

      await expect(putObject(bucketName, key, body)).rejects.toThrow("S3 error")
    })
  })
})
