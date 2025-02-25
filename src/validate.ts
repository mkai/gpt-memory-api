import * as v from "valibot"

const validate = <TData>(
  data: unknown,
  schema: Parameters<typeof v.parse>[0],
): [TData, undefined] | [undefined, v.ValiError<typeof schema>["issues"]] => {
  try {
    return [v.parse(schema, data) as TData, undefined]
  } catch (err: unknown) {
    if (!(err instanceof v.ValiError)) {
      throw err
    }

    return [undefined, err.issues]
  }
}

const filenameSchema = v.pipe(
  v.string(),
  v.minLength(1, "file name is too short"),
  v.excludes("/", "filename must not contain directory separator"),
)

const fileSchema = v.object({
  filename: filenameSchema,
  contents: v.pipe(v.string(), v.maxLength(100 * 1024, "file is too big")), // 0 bytes to 100 kilobytes
})

export const validateFilename = (value: unknown) =>
  validate<v.InferOutput<typeof filenameSchema>>(value, filenameSchema)

export const validateFile = (value: unknown) =>
  validate<v.InferOutput<typeof fileSchema>>(value, fileSchema)
