import * as v from "valibot"

type ValidationError = Error

const validate = <TData>(
  data: unknown,
  schema: Parameters<typeof v.parse>[0],
): [TData, undefined] | [undefined, ValidationError[]] => {
  try {
    return [v.parse(schema, data) as TData, undefined]
  } catch (err: unknown) {
    if (err instanceof v.ValiError) {
      const issues = err.issues as v.ValiError<typeof schema>["issues"]
      return [undefined, issues.map((issue) => new Error(issue.message))]
    }

    throw err
  }
}

const filenameSchema = v.pipe(
  v.string(),
  v.minLength(1, "file name is too short"),
  v.excludes("/", "filename must not contain directory separator"),
)

const fileSchema = v.object({
  filename: filenameSchema,
  contents: v.pipe(v.string(), v.maxLength(1000 * 1024, "file is too big")), // 0 bytes to 1 MB
})

export const validateFilename = (value: unknown) =>
  validate<v.InferOutput<typeof filenameSchema>>(value, filenameSchema)

export const validateFile = (value: unknown) =>
  validate<v.InferOutput<typeof fileSchema>>(value, fileSchema)
