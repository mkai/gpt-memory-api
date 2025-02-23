import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3"

const s3 = new S3Client({ region: "eu-central-1" })

const ensureTrailingSlash = (str: string) =>
  str.endsWith("/") ? str : `${str}/`

export async function listObjects(bucketName: string, prefix?: string) {
  const params = {
    Bucket: bucketName,
    Prefix: prefix ? ensureTrailingSlash(prefix) : undefined,
  }

  const command = new ListObjectsV2Command(params)
  try {
    const data = await s3.send(command)
    return data.Contents || []
  } catch (error: unknown) {
    console.error("Error listing files in S3 bucket", error)
    throw error
  }
}

export async function getObject(bucketName: string, key: string) {
  const params = {
    Bucket: bucketName,
    Key: key,
  }

  const command = new GetObjectCommand(params)
  try {
    const file = await s3.send(command)
    if (!file || !file.Body) {
      throw new Error("file not found or empty")
    }

    return file.Body
  } catch (error: unknown) {
    if (error instanceof NoSuchKey) {
      return
    }

    console.error("Error getting file from S3", error)
    throw error
  }
}

export async function putObject(
  bucketName: string,
  key: string,
  body: string | Uint8Array | Buffer,
) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: body,
  }

  const command = new PutObjectCommand(params)
  try {
    await s3.send(command)
  } catch (error: unknown) {
    console.error("Error uploading file to S3", error)
    throw error
  }
}
