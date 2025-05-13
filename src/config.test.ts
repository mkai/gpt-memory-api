import { parseAllowedTokens } from "./config"

describe("config module", () => {
  describe("parseAllowedTokens", () => {
    const testCases = [
      {
        inputString: "token-1:username1",
        expectedResult: {
          "token-1": "username1",
        },
      },
      {
        inputString: "token-1:username1,token-2:username2",
        expectedResult: {
          "token-1": "username1",
          "token-2": "username2",
        },
      },
      {
        inputString: "token-3: username3 ",
        expectedResult: {
          "token-3": "username3",
        },
      },
    ]

    test.each(testCases)(
      `should parse allowed tokens from given string "$inputString"`,
      ({ inputString, expectedResult }) => {
        const result = parseAllowedTokens(inputString)
        expect(result).toEqual(expectedResult)
      },
    )

    it("should return an empty object if given string is empty", () => {
      const result = parseAllowedTokens("")
      expect(result).toEqual({})
    })

    it("should handle invalid format gracefully", () => {
      const result = parseAllowedTokens("invalid_format")
      expect(result).toEqual({})
    })
  })
})
