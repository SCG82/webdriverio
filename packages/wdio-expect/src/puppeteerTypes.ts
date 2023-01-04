/**
 * HTTP request data. (copied from the puppeteer-core package as there is currently
 * no way to access these types otherwise)
 */
export type ResourcePriority = 'VeryLow' | 'Low' | 'Medium' | 'High' | 'VeryHigh'
export type MixedContentType = 'blockable' | 'optionally-blockable' | 'none'
export type ReferrerPolicy = 'unsafe-url' | 'no-referrer-when-downgrade' | 'no-referrer' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin'

export interface Request {
    /**
     * Request URL (without fragment).
     */
    url: string
    /**
     * Fragment of the requested URL starting with hash, if present.
     */
    urlFragment?: string
    /**
     * HTTP request method.
     */
    method: string
    /**
     * HTTP request headers.
     */
    headers: Record<string, string>
    /**
     * HTTP POST request data.
     */
    postData?: string
    /**
     * True when the request has POST data. Note that postData might still be omitted when this flag is true when the data is too long.
     */
    hasPostData?: boolean
    /**
     * The mixed content export type of the request.
     */
    mixedContentType?: MixedContentType
    /**
     * Priority of the resource request at the time request is sent.
     */
    initialPriority: ResourcePriority
    /**
     * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/
     */
    referrerPolicy: ReferrerPolicy
    /**
     * Whether is loaded via link preload.
     */
    isLinkPreload?: boolean
}
