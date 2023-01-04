import type { Matchers } from 'expect'
import type { Request } from './puppeteerTypes.js'

export type WdioExpect = {
    <T = unknown>(actual: T): WdioMatchers<void, T>
    extend(map: Record<string, Function>): void
} & AsymmetricMatchers

export type AsymmetricMatchers = {
    any(expectedObject: any): PartialMatcher
    anything(): PartialMatcher
    arrayContaining(sample: Array<unknown>): PartialMatcher
    objectContaining(sample: Record<string, unknown>): PartialMatcher
    stringContaining(expected: string): PartialMatcher
    stringMatching(expected: string | RegExp): PartialMatcher
    not: AsymmetricMatchers
}

export type WdioElementMaybePromise =
    | WebdriverIO.Element
    | WebdriverIO.ElementArray
    | Promise<WebdriverIO.Element>
    | Promise<WebdriverIO.ElementArray>

export interface WdioMatchers<R extends void | Promise<void>, T> extends Readonly<Matchers<R>> {
    not: WdioMatchers<R, T>
    resolves: WdioMatchers<Promise<void>, T>
    rejects: WdioMatchers<Promise<void>, T>

    // ===== $ or $$ =====
    /**
     * `WebdriverIO.Element` -> `isDisplayed`
     */
    toBeDisplayed(options?: CommandOptions): R

    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toExist(options?: CommandOptions): R
    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toBePresent(options?: CommandOptions): R
    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toBeExisting(options?: CommandOptions): R

    /**
     * `WebdriverIO.Element` -> `getAttribute`
     */
    toHaveAttribute(
        attribute: string,
        value?: string | RegExp,
        options?: StringOptions
    ): R
    /**
     * `WebdriverIO.Element` -> `getAttribute`
     */
    toHaveAttr(
        attribute: string,
        value?: string | RegExp,
        options?: StringOptions
    ): R

    /**
     * `WebdriverIO.Element` -> `getAttribute`
     * Element's attribute includes the value.
     */
    toHaveAttributeContaining(
        attribute: string,
        contains: string | RegExp,
        options?: StringOptions
    ): R
    /**
     * `WebdriverIO.Element` -> `getAttribute`
     * Element's attribute includes the value.
     */
    toHaveAttrContaining(
        attribute: string,
        contains: string | RegExp,
        options?: StringOptions
    ): R

    /**
     * `WebdriverIO.Element` -> `getAttribute` class
     * @deprecated since v1.3.1 - use `toHaveElementClass` instead.
     */
    toHaveClass(className: string | RegExp, options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `getAttribute` class
     */
    toHaveElementClass(className: string | RegExp, options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `getAttribute` class
     * @deprecated since v1.3.1 - use `toHaveElementClassContaining` instead.
     * Element's class includes the className.
     */
    toHaveClassContaining(
        className: string | RegExp,
        options?: StringOptions
    ): R

    /**
     * `WebdriverIO.Element` -> `getAttribute` class
     * Element's class includes the className.
     */
    toHaveElementClassContaining(
        className: string | RegExp,
        options?: StringOptions
    ): R

    /**
     * `WebdriverIO.Element` -> `getProperty`
     */
    toHaveElementProperty(
        property: string | RegExp,
        value?: any,
        options?: StringOptions
    ): R

    /**
     * `WebdriverIO.Element` -> `getProperty` value
     */
    toHaveValue(value: string | RegExp, options?: StringOptions): R
    /**
     * `WebdriverIO.Element` -> `getProperty` value
     * Element's value includes the value.
     */
    toHaveValueContaining(value: string | RegExp, options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `isClickable`
     */
    toBeClickable(options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `!isEnabled`
     */
    toBeDisabled(options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `isDisplayedInViewport`
     */
    toBeDisplayedInViewport(options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `isEnabled`
     */
    toBeEnabled(options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `isFocused`
     */
    toBeFocused(options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `isSelected`
     */
    toBeSelected(options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `isSelected`
     */
    toBeChecked(options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `$$('./*').length`
     * supports less / greater then or equals to be passed in options
     */
    toHaveChildren(size?: number | NumberOptions, options?: NumberOptions): R

    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     */
    toHaveHref(href: string | RegExp, options?: StringOptions): R
    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     */
    toHaveLink(href: string | RegExp, options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     * Element's href includes the value provided
     */
    toHaveHrefContaining(href: string | RegExp, options?: StringOptions): R
    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     * Element's href includes the value provided
     */
    toHaveLinkContaining(href: string | RegExp, options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `getProperty` value
     */
    toHaveId(id: string | RegExp, options?: StringOptions): R

    /**
     * `WebdriverIO.Element` -> `getText`
     */
    toHaveText(
        text: string | RegExp | Array<string | RegExp>,
        options?: StringOptions
    ): R
    /**
     * `WebdriverIO.Element` -> `getText`
     * Element's text includes the text provided
     */
    toHaveTextContaining(
        text: string | RegExp | Array<string | RegExp>,
        options?: StringOptions
    ): R

    /**
     * `WebdriverIO.Element` -> `getAttribute("style")`
     */
    toHaveStyle(style: { [key: string]: string }, options?: StringOptions): R

    // ===== browser only =====
    /**
     * `WebdriverIO.Browser` -> `getUrl`
     */
    toHaveUrl(url: string | RegExp, options?: StringOptions): R

    // ===== browser only =====
    /**
     * `WebdriverIO.Browser` -> `getUrl`
     * Browser's url includes the provided text
     */
    toHaveUrlContaining(url: string | RegExp, options?: StringOptions): R

    /**
     * `WebdriverIO.Browser` -> `getTitle`
     */
    toHaveTitle(title: string | RegExp, options?: StringOptions): R

    // ===== browser only =====
    /**
     * `WebdriverIO.Browser` -> `getTitle`
     * Browser's title includes the provided text
     */
    toHaveTitleContaining(title: string | RegExp, options?: StringOptions): R

    // ===== $$ only =====
    /**
     * `WebdriverIO.ElementArray` -> `$$('...').length`
     * supports less / greater then or equals to be passed in options
     */
    toBeElementsArrayOfSize(
        size: number | NumberOptions,
        options?: NumberOptions
    ): R

    // ==== network mock ====

    /**
     * Check that `WebdriverIO.Mock` was called
     */
    toBeRequested(options?: CommandOptions): R

    /**
     * Check that `WebdriverIO.Mock` was called N times
     */
    toBeRequestedTimes(
        times: number | NumberOptions,
        options?: NumberOptions
    ): R

    /**
     * Check that `WebdriverIO.Mock` was called with the specific parameters
     */
    toBeRequestedWith(
        requestedWith: RequestedWith,
        options?: CommandOptions
    ): R
}

export interface DefaultOptions {
    /**
     * time in ms to wait for expectation to succeed. Default: 3000
     */
    wait?: number

    /**
     * interval between attempts. Default: 100
     */
    interval?: number
}

export interface CommandOptions extends DefaultOptions {
    /**
     * user message to prepend before assertion error
     */
    message?: string
}

export interface StringOptions extends CommandOptions {
    /**
     * apply `toLowerCase` to both actual and expected values
     */
    ignoreCase?: boolean

    /**
     * apply `trim` to actual value
     */
    trim?: boolean

    /**
     * expect actual value to contain expected value.
     * Otherwise strict equal
     */
    containing?: boolean

    /**
     * might be helpful to force converting property value to string
     */
    asString?: boolean
}

export interface NumberOptions extends CommandOptions {
    /**
     * equals
     */
    eq?: number
    /**
     * less than or equals
     */
    lte?: number

    /**
     * greater than or equals
     */
    gte?: number
}

export type RequestedWith = {
    url?: string | PartialMatcher | ((url: string) => boolean)
    method?: string | Array<string>
    statusCode?: number | Array<number>
    requestHeaders?:
        | Record<string, string>
        | PartialMatcher
        | ((headers: Record<string, string>) => boolean)
    responseHeaders?:
        | Record<string, string>
        | PartialMatcher
        | ((headers: Record<string, string>) => boolean)
    postData?:
        | string
        | JsonCompatible
        | PartialMatcher
        | ((r: string | undefined) => boolean)
    response?:
        | string
        | JsonCompatible
        | PartialMatcher
        | ((r: string) => boolean)
}

export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [x: string]: JsonPrimitive | JsonObject | JsonArray }
export type JsonArray = Array<JsonPrimitive | JsonObject | JsonArray>
export type JsonCompatible = JsonObject | JsonArray

export interface PartialMatcher {
    sample?: any
    asymmetricMatch?(...args: any[]): boolean
}

export interface CSSValue {
    type: string
    string: string
    unit: string
    value: any
}

export interface ParsedColor extends Partial<CSSValue> {
    rgb?: string
    rgba?: string
    hex?: string
}

export interface ParsedCSSValue {
    property?: string
    value?: string
    parsed: ParsedColor
}

export interface Matches extends Request {
    /**
     * body response of actual resource
     */
    body: string | Buffer | JsonCompatible
    /**
     * HTTP response headers.
     */
    responseHeaders: Record<string, string>
    /**
     * HTTP response status code.
     */
    statusCode: number
}

export interface Mock extends MockFunctions, MockProperties {}

interface MockFunctions {
    clear: () => void
    restore: () => void
    respond: (overwrite: MockOverwrite, params?: MockResponseParams) => void
    respondOnce: (overwrite: MockOverwrite, params?: MockResponseParams) => void
    abort: (errorReason: ErrorReason, sticky?: boolean) => void
    abortOnce: (errorReason: ErrorReason, sticky?: boolean) => void
    waitForResponse: (options: WaitForOptions) => Promise<boolean> | Promise<Promise<boolean>>
}

type MockOverwriteFunction = (request: Matches, client: any) => Promise<string | Record<string, any>>
type MockOverwrite = string | Record<string, any> | MockOverwriteFunction

type MockProperties = {
    readonly calls: Matches[]
}

type MockResponseParams = {
    statusCode?: number | ((request: Matches) => number)
    headers?: Record<string, string> | ((request: Matches) => Record<string, string>)
    /**
     * fetch real response before responding with mocked data. Default: true
     */
    fetchResponse?: boolean
}

type ErrorReason = 'Failed' | 'Aborted' | 'TimedOut' | 'AccessDenied' | 'ConnectionClosed' | 'ConnectionReset' | 'ConnectionRefused' | 'ConnectionAborted' | 'ConnectionFailed' | 'NameNotResolved' | 'InternetDisconnected' | 'AddressUnreachable' | 'BlockedByClient' | 'BlockedByResponse'

type WaitForOptions = {
    timeout?: number,
    interval?: number,
    timeoutMsg?: string,
    reverse?: boolean,
}
