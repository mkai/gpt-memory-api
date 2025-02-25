import { validateFilename, validateFile } from "./validate"

describe("validateFilename", () => {
  it("should return the filename if valid", () => {
    const [filename, errors] = validateFilename("valid_filename.txt")

    expect(filename).toBe("valid_filename.txt")
    expect(errors).toBeUndefined()
  })

  it("should return errors if filename is invalid", () => {
    const [filename, errors] = validateFilename("invalid/filename.txt")

    expect(filename).toBeUndefined()
    expect(errors?.length).toBe(1)
    expect(errors![0].message).toBe(
      "filename must not contain directory separator",
    )
  })
})

describe("validateFile", () => {
  it("should return the file object if valid", () => {
    const fileInput = {
      filename: "valid_filename.txt",
      contents: "file contents",
    }

    const [file, errors] = validateFile(fileInput)

    expect(file).toEqual(fileInput)
    expect(errors).toBeUndefined()
  })

  it("should return errors if file object is invalid", () => {
    const fileInput = {
      filename: "invalid/filename.txt",
      contents: "file contents",
    }

    const [file, errors] = validateFile(fileInput)

    expect(file).toBeUndefined()
    expect(errors?.length).toBe(1)
    expect(errors![0].message).toBe(
      "filename must not contain directory separator",
    )
  })

  it("should return errors if file object is missing properties", () => {
    const fileInput = { filename: "valid_filename.txt" }

    const [file, errors] = validateFile(fileInput)

    expect(file).toBeUndefined()
    expect(errors?.length).toBe(1)
    expect(errors![0].message).toContain(
      'Expected "contents" but received undefined',
    )
  })
})
