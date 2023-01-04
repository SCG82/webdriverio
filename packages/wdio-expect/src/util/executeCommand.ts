import type { DefaultOptions } from '../types.js'
import { refetchElements } from './refetchElements.js'

/**
 * make sure that condition passes for element or every element of elements array
 * @param el element or elements array
 * @param condition
 */
export async function executeCommand(
    el: WebdriverIO.Element | WebdriverIO.ElementArray,
    condition: (el: WebdriverIO.Element, ...params: any[]) => Promise<{
        result: boolean;
        value?: any;
    }>,
    options: DefaultOptions = {},
    params: any[] = [],
    fullRefetch = false
) {
    const { isNot = false } = this
    const elements = Array.isArray(el) ? await refetchElements(el, options.wait, fullRefetch) : ([el] as WebdriverIO.ElementArray)

    if (elements.length === 0) {
        return {
            el: elements,
            success: false,
        }
    }

    const results: {
        result: boolean;
        value?: any;
    }[] = []

    for (const element of elements) {
        results.push(await condition(element, ...params, options))
    }

    const values = [...new Set(results.filter(result => result.result === isNot).map(result => result.value))]

    return {
        el: Array.isArray(el) ? elements : el,
        success: results.every(result => result.result === true),
        values: values.length > 1 ? values : values[0]
    }
}
