"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismicLink = void 0;
const client_1 = require("@apollo/client");
const apollo_link_context_1 = require("apollo-link-context");
const Prismic = require("prismic-javascript");
const utils_1 = require("./utils");
function PrismicLink({ uri, accessToken, repository, previewRef, ...options }) {
    if (typeof uri === 'function')
        throw Error('Invalid uri provided.');
    const prismicEndpoint = utils_1.parseEndpoint(uri); // enforce cdn if it's the prismic endpoint
    if (prismicEndpoint && repository) {
        console.warn('`repository` is ignored since the graphql endpoint is valid.');
    }
    if (!prismicEndpoint && !repository) {
        throw new Error('Since you are using a custom GraphQL endpoint, you need to provide to PrismicLink your repository name as shown below:\n' +
            'PrismicLink({\n' +
            "  uri: 'https://mycustomdomain.com/graphql',\n" +
            "  accessToken: 'my_access_token', // could be undefined\n" +
            "  repository: 'my-prismic-repository'\n" +
            '})\n');
    }
    let apiEndpoint;
    let gqlEndpoint;
    if (prismicEndpoint) {
        apiEndpoint = `${prismicEndpoint}/api`;
        gqlEndpoint = `${prismicEndpoint}/graphql`;
    }
    else {
        apiEndpoint = `https://${repository}.cdn.prismic.io/api`;
        gqlEndpoint = uri;
    }
    const prismicClient = Prismic.client(apiEndpoint, { accessToken });
    const prismicLink = apollo_link_context_1.setContext((request, previousContext) => {
        return prismicClient.getApi().then((api) => ({
            headers: {
                'Prismic-ref': previewRef || api.masterRef?.ref,
                ...previousContext.headers,
                ...(api.integrationFieldRef
                    ? { 'Prismic-integration-field-ref': api.integrationFieldRef }
                    : {}),
                ...(accessToken ? { Authorization: `Token ${accessToken}` } : {}),
            },
        }));
    });
    const httpLink = new client_1.HttpLink({
        uri: gqlEndpoint,
        useGETForQueries: true,
        fetch: (url, options) => {
            const trimmed = utils_1.removeWhitespace(url);
            return fetch(trimmed, options);
        },
        ...options,
    });
    return prismicLink.concat(httpLink);
}
exports.PrismicLink = PrismicLink;
exports.default = {
    PrismicLink,
};
