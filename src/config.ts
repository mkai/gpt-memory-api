import invariant from "tiny-invariant"

invariant(
  process.env.ALLOWED_TOKENS,
  "ALLOWED_TOKENS environment variable is not set",
)

export const parseAllowedTokens = (
  tokensString: string,
): Record<string, string> => {
  const tokens: Record<string, string> = {}

  for (const entry of tokensString.split(",")) {
    const [token, username] = entry.split(":").map((value) => value.trim())
    if (token && username) {
      tokens[token] = username
    }
  }

  return tokens
}

export const config = {
  allowedTokens: parseAllowedTokens(process.env.ALLOWED_TOKENS),
}
