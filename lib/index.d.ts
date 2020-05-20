import { ApolloLink } from '@apollo/client';
import { HttpOptions } from '@apollo/client';
export declare type PrismicLinkOptions = HttpOptions & {
    accessToken?: string;
    repository?: string;
    previewRef?: string;
    uri?: string;
};
export declare function PrismicLink({ uri, accessToken, repository, previewRef, ...options }: PrismicLinkOptions): ApolloLink;
declare const _default: {
    PrismicLink: typeof PrismicLink;
};
export default _default;
