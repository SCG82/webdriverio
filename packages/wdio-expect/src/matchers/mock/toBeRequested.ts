import type { Mock } from '../../types.js'

import { toBeRequestedTimes } from './toBeRequestedTimes.js'

export function toBeRequested(received: Mock, options: ExpectWebdriverIO.CommandOptions = {}): any {
    return toBeRequestedTimes.call({ ...(this || {}), expectation: 'called' }, received, { ...options, gte: 1 })
}
