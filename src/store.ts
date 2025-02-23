import { listObjects, getObject, putObject } from "./s3"

export type File = {
  filename: string
  contents: string
  lastModified?: Date
}

type FileListItem = Omit<File, "contents">

type ListFilesOptions = {
  prefix?: string
}

async function listFiles({ prefix = "" }: ListFilesOptions = {}): Promise<
  FileListItem[]
> {
  const objects = await listObjects(process.env.FILES_BUCKET_NAME!, prefix)
  return objects.map((o) => {
    return {
      filename: o.Key!.replace(prefix, ""),
      lastModified: o.LastModified,
    }
  })
}

const streamToString = (stream: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: any[] = []
    stream.on("data", (chunk: any) => chunks.push(chunk))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
  })

type GetFileOptions = {
  prefix?: string
}

async function getFile(
  filename: string,
  { prefix = "" }: GetFileOptions = {},
): Promise<File | undefined> {
  if (filename.includes("/")) {
    throw new Error("filename cannot include path separator")
  }

  const stream = await getObject(
    process.env.FILES_BUCKET_NAME!,
    prefix + filename,
  )
  if (!stream) {
    return
  }

  return {
    filename,
    contents: await streamToString(stream),
  }
}

type CreateFileOptions = {
  prefix?: string
}

async function createFile(
  filename: string,
  contents: string,
  { prefix = "" }: CreateFileOptions = {},
): Promise<void> {
  if (filename.includes("/")) {
    throw new Error("filename cannot include path separator")
  }

  return putObject(process.env.FILES_BUCKET_NAME!, prefix + filename, contents)
}

export async function listUserFiles(username: string): Promise<FileListItem[]> {
  return listFiles({ prefix: `${username}/` })
}

export async function getUserFile(
  username: string,
  filename: string,
): Promise<File | undefined> {
  return getFile(filename, { prefix: `${username}/` })
}

export async function createUserFile(
  username: string,
  filename: string,
  contents: string,
): Promise<void> {
  return createFile(filename, contents, { prefix: `${username}/` })
}
