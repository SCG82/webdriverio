import BaseAction, { BaseActionParams } from './base.js'
import type { Browser, ChainablePromiseElement, Element } from '../../types'

export interface ScrollParams {
    /**
     * starting x coordinate
     */
    x: number
    /**
     * starting y coordinate
     */
    y: number
    /**
     * Delta X to scroll to target
     */
    deltaX: number
    /**
     * Delta Y to scroll to target
     */
    deltaY: number
    /**
     * element origin
     */
    origin?: Element<'async'> | ChainablePromiseElement<Element<'async'>>
    /**
     * duration ratio be the ratio of time delta and duration
     */
    duration: number
}

const DEFAULT_SCROLL_PARAMS: ScrollParams = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    duration: 0
}

export default class WheelAction extends BaseAction {
    constructor(instance: Browser<'async'>, params?: BaseActionParams) {
        super(instance, 'wheel', params)
    }

    /**
     * Scrolls a page to given coordinates or origin.
     */
    scroll(params?: Partial<ScrollParams>) {
        this.sequence.push({ type: 'scroll', ...DEFAULT_SCROLL_PARAMS, ...params })
        return this
    }
}
