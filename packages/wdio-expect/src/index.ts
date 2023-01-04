import { expect as expectLib } from 'expect'

import matchers from './matchers.js'
import { DEFAULT_OPTIONS } from './constants.js'
import type { DefaultOptions } from './types.js'
import { GLOBALS_ERROR_MESSAGE } from './utils.js'

expectLib.extend({ ...matchers })

export const expect = expectLib as unknown as ExpectWebdriverIO.Expect

export const getConfig = () => DEFAULT_OPTIONS

// export const expect = expectLib

export const setDefaultOptions = (options: DefaultOptions = {}): void => {
    Object.entries(options).forEach(([key, value]) => {
        if (key in DEFAULT_OPTIONS) {
            DEFAULT_OPTIONS[key as keyof DefaultOptions] = value
        }
    })
}

export const setOptions = setDefaultOptions

// export const expect<T = unknown>(actual: T): Matchers<T, T>
// export const expect: ExpectWebdriverIO.Expect = ((...args: any) => {
//     if (!globals.has('expect')) {
//         throw new Error(GLOBALS_ERROR_MESSAGE)
//     }
//     return globals.get('expect')(...args)
// }) as ExpectWebdriverIO.Expect

type SupportedGlobals = 'browser' | 'driver' | 'multiremotebrowser' | '$' | '$$' | 'expect'

declare global {
    // eslint-disable-next-line no-var
    var _wdioGlobals: Map<SupportedGlobals, any>
}

const globals: Map<SupportedGlobals, any> = globalThis._wdioGlobals = globalThis._wdioGlobals || new Map()

expect.extend = (...args: unknown[]) => {
    if (!globals.has('expect')) {
        throw new Error(GLOBALS_ERROR_MESSAGE)
    }
    const expect = globals.get('expect')
    return expect.extend(...args)
}

/**
 * allows to set global property to be imported and used later on
 * @private
 */
export function _setExpectGlobal (setGlobal = true) {
    globals.set('expect', expect)
    if (setGlobal) {
        // @ts-expect-error
        globalThis[key] = value
    }
}
