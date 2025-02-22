import { listObjects, getObject, putObject } from "./s3"

export type File = {
  filename: string
  contents: string
  lastModified?: Date
}

type FileListItem = Omit<File, "contents">

export async function listFiles(): Promise<FileListItem[]> {
  const objects = await listObjects(process.env.FILES_BUCKET_NAME!)
  return objects.map((o) => {
    return {
      filename: o.Key!,
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

export async function getFile(filename: string): Promise<File> {
  const stream = await getObject(process.env.FILES_BUCKET_NAME!, filename)
  return {
    filename,
    contents: await streamToString(stream),
  }
}

export async function createFile(
  filename: string,
  contents: string,
): Promise<void> {
  return putObject(process.env.FILES_BUCKET_NAME!, filename, contents)
}
