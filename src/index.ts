import { HttpLink, ApolloLink } from '@apollo/client'
import { setContext } from 'apollo-link-context'
import Prismic = require('prismic-javascript')

import { HttpOptions } from '@apollo/client'
import { parseEndpoint, removeWhitespace } from './utils'

export type PrismicLinkOptions = HttpOptions & {
  accessToken?: string
  repository?: string
  previewRef?: string
  uri?: string
}

export function PrismicLink({
  uri,
  accessToken,
  repository,
  previewRef,
  ...options
}: PrismicLinkOptions) {
  if (typeof uri === 'function') throw Error('Invalid uri provided.')
  const prismicEndpoint = parseEndpoint(uri) // enforce cdn if it's the prismic endpoint

  if (prismicEndpoint && repository) {
    console.warn('`repository` is ignored since the graphql endpoint is valid.')
  }

  if (!prismicEndpoint && !repository) {
    throw new Error(
      'Since you are using a custom GraphQL endpoint, you need to provide to PrismicLink your repository name as shown below:\n' +
        'PrismicLink({\n' +
        "  uri: 'https://mycustomdomain.com/graphql',\n" +
        "  accessToken: 'my_access_token', // could be undefined\n" +
        "  repository: 'my-prismic-repository'\n" +
        '})\n'
    )
  }

  let apiEndpoint
  let gqlEndpoint

  if (prismicEndpoint) {
    apiEndpoint = `${prismicEndpoint}/api`
    gqlEndpoint = `${prismicEndpoint}/graphql`
  } else {
    apiEndpoint = `https://${repository}.cdn.prismic.io/api`
    gqlEndpoint = uri
  }

  const prismicClient = Prismic.client(apiEndpoint, { accessToken })

  const prismicLink = (setContext(
    (request: any, previousContext: { headers: any }) => {
      return prismicClient.getApi().then((api: any) => ({
        headers: {
          'Prismic-ref': previewRef || api.masterRef.ref,
          ...previousContext.headers,
          ...(api.integrationFieldRef
            ? { 'Prismic-integration-field-ref': api.integrationFieldRef }
            : {}),
          ...(accessToken ? { Authorization: `Token ${accessToken}` } : {}),
        },
      }))
    }
  ) as unknown) as ApolloLink

  const httpLink = new HttpLink({
    uri: gqlEndpoint,
    useGETForQueries: true,
    fetch: (url: string, options: object) => {
      const trimmed = removeWhitespace(url)
      return fetch(trimmed, options)
    },
    ...options,
  })

  return prismicLink.concat(httpLink)
}

export default {
  PrismicLink,
}
