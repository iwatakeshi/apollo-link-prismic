const PRISMIC_ENDPOINT_REG = /^https?:\/\/([^.]+)\.(?:cdn\.)?(wroom\.(?:test|io)|prismic\.io)\/graphql\/?/
//                                        ^                  ^
//                                        1                  2

export default function parseEndpoint(endpoint?: string) {
  if (!endpoint) return null

  const tokens = endpoint.match(PRISMIC_ENDPOINT_REG)

  if (tokens !== null && Array.isArray(tokens) && tokens.length === 3) {
    const [, /* endpoint */ repository, domain] = tokens

    return `https://${repository}.cdn.${domain}` // enforce the cdn
  }

  return null // not from prismic ? returns null.
}
