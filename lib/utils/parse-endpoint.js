"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PRISMIC_ENDPOINT_REG = /^https?:\/\/([^.]+)\.(?:cdn\.)?(wroom\.(?:test|io)|prismic\.io)\/graphql\/?/;
//                                        ^                  ^
//                                        1                  2
function parseEndpoint(endpoint) {
    if (!endpoint)
        return null;
    const tokens = endpoint.match(PRISMIC_ENDPOINT_REG);
    if (tokens !== null && Array.isArray(tokens) && tokens.length === 3) {
        const [, /* endpoint */ repository, domain] = tokens;
        return `https://${repository}.cdn.${domain}`; // enforce the cdn
    }
    return null; // not from prismic ? returns null.
}
exports.default = parseEndpoint;
