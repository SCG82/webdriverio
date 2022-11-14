import { EventEmitter } from 'node:events'
import { expect, test, vi } from 'vitest'

import CucumberEventListener from '../src/cucumberEventListener.js'
import { gherkinDocument, pickle } from './fixtures/envelopes.js'

const pickleFilter = {
    matches: vi.fn().mockReturnValue(true),
}

test('getHookParams', () => {
    const eventBroadcaster = new EventEmitter()
    const listener = new CucumberEventListener(
        eventBroadcaster,
        pickleFilter as any,
    )
    listener['_currentPickle'] = 'foobar' as any
    expect(listener.getHookParams()).toBe('foobar')
})

test('getCurrentStep', () => {
    const eventBroadcaster = new EventEmitter()
    const listener = new CucumberEventListener(
        eventBroadcaster,
        pickleFilter as any,
    )
    listener.onGherkinDocument(gherkinDocument)
    listener.onPickleAccepted(pickle)
    expect(listener.getPickleIds({ browserName: 'chrome' })).toEqual(['13'])

    pickleFilter.matches.mockReturnValue(false)
    expect(listener.getPickleIds({ browserName: 'chrome' })).toEqual([])
})
