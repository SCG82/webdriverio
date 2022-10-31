import path from 'node:path'

import { describe, expect, it, vi, beforeEach } from 'vitest'
import got from 'got'
import logger from '@wdio/logger'
import type { Browser, MultiRemoteBrowser } from 'webdriverio'

import BrowserstackService from '../src/service.js'

const jasmineSuiteTitle = 'Jasmine__TopLevel__Suite'
const sessionBaseUrl = 'https://api.browserstack.com/automate/sessions'
const sessionId = 'session123'
const sessionIdA = 'session456'

vi.mock('got')
vi.mock('@wdio/logger', () => import(path.join(process.cwd(), '__mocks__', '@wdio/logger')))

const log = logger('test')
let service: BrowserstackService
let browser: Browser<'async'> | MultiRemoteBrowser<'async'>

beforeEach(() => {
    vi.mocked(log.info).mockClear()
    vi.mocked(got).mockClear()
    vi.mocked(got.put).mockClear()
    vi.mocked(got).mockResolvedValue({
        body: {
            automation_session: {
                browser_url: 'https://www.browserstack.com/automate/builds/1/sessions/2'
            }
        }
    })
    vi.mocked(got.put).mockResolvedValue({})

    browser = {
        sessionId: sessionId,
        config: {},
        capabilities: {
            device: '',
            os: 'OS X',
            os_version: 'Sierra',
            browserName: 'chrome'
        },
        instances: ['browserA', 'browserB'],
        isMultiremote: false,
        browserA: {
            sessionId: sessionIdA,
            capabilities: {
                'bstack:options': {
                    device: '',
                    os: 'Windows',
                    osVersion: 10,
                    browserName: 'chrome'
                }
            }
        },
        browserB: {}
    } as unknown as Browser<'async'> | MultiRemoteBrowser<'async'>
    service = new BrowserstackService({} as any, [] as any, { user: 'foo', key: 'bar' } as any)
})

it('should initialize correctly', () => {
    service = new BrowserstackService({} as any, [] as any, {} as any)
    expect(service['_failReasons']).toEqual([])
})

describe('onReload()', () => {
    it('should update and get session', async () => {
        const updateSpy = vi.spyOn(service, '_update')
        service['_browser'] = browser
        await service.onReload('1', '2')
        expect(updateSpy).toHaveBeenCalled()
        expect(got.put).toHaveBeenCalled()
        expect(got).toHaveBeenCalled()
    })

    it('should update and get multiremote session', async () => {
        browser.isMultiremote = true as any
        service['_browser'] = browser
        const updateSpy = vi.spyOn(service, '_update')
        await service.onReload('1', '2')
        expect(updateSpy).toHaveBeenCalled()
        expect(got.put).toHaveBeenCalled()
        expect(got).toHaveBeenCalled()
    })

    it('should reset failures', async () => {
        const updateSpy = vi.spyOn(service, '_update')
        service['_browser'] = browser

        service['_failReasons'] = ['Custom Error: Button should be enabled', 'Expected something']
        await service.onReload('1', '2')
        expect(updateSpy).toHaveBeenCalledWith('1', {
            status: 'failed',
            reason: 'Custom Error: Button should be enabled' + '\n' + 'Expected something'
        })
        expect(service['_failReasons']).toEqual([])
    })
})

describe('beforeSession', () => {
    it('should set some default to make missing user and key parameter apparent', () => {
        service.beforeSession({} as any)
        expect(service['_config']).toEqual({ user: 'NotSetUser', key: 'NotSetKey' })
    })

    it('should set username default to make missing user parameter apparent', () => {
        service.beforeSession({ user: 'foo' } as any)
        expect(service['_config']).toEqual({ user: 'foo', key: 'NotSetKey' })
    })

    it('should set key default to make missing key parameter apparent', () => {
        service.beforeSession({ key: 'bar' } as any)
        expect(service['_config']).toEqual({ user: 'NotSetUser', key: 'bar' })
    })
})

describe('_printSessionURL', () => {
    it('should get and log session details', async () => {
        browser.isMultiremote = false
        service['_browser'] = browser
        const logInfoSpy = vi.spyOn(log, 'info').mockImplementation((string) => string)
        await service._printSessionURL()
        expect(got).toHaveBeenCalledWith(
            `${sessionBaseUrl}/${sessionId}.json`,
            { username: 'foo', password: 'bar', responseType: 'json' })
        expect(logInfoSpy).toHaveBeenCalled()
        expect(logInfoSpy).toHaveBeenCalledWith(
            'OS X Sierra chrome session: https://www.browserstack.com/automate/builds/1/sessions/2'
        )
    })

    it('should get and log multi remote session details', async () => {
        browser.isMultiremote = true as any
        service['_browser'] = browser
        const logInfoSpy = vi.spyOn(log, 'info').mockImplementation((string) => string)
        await service._printSessionURL()
        expect(got).toHaveBeenCalledWith(
            `${sessionBaseUrl}/${sessionIdA}.json`,
            { username: 'foo', password: 'bar', responseType: 'json' })
        expect(logInfoSpy).toHaveBeenCalled()
        expect(logInfoSpy).toHaveBeenCalledWith(
            'Windows 10 chrome session: https://www.browserstack.com/automate/builds/1/sessions/2'
        )
    })
})

describe('_printSessionURL Appium', () => {
    beforeEach(() => {
        vi.mocked(got).mockResolvedValue({
            body: {
                automation_session: {
                    name: 'Smoke Test',
                    duration: 65,
                    os: 'ios',
                    os_version: '12.1',
                    browser_version: 'app',
                    browser: null,
                    device: 'iPhone XS',
                    status: 'failed',
                    reason: 'CLIENT_STOPPED_SESSION',
                    browser_url: 'https://app-automate.browserstack.com/builds/1/sessions/2'
                }
            }
        })

        browser.capabilities = {
            device: 'iPhone XS',
            os: 'iOS',
            os_version: '12.1',
            browserName: '',
        }
    })

    it('should get and log session details', async () => {
        service['_browser'] = browser
        await service._printSessionURL()
        expect(log.info).toHaveBeenCalled()
        expect(log.info).toHaveBeenCalledWith(
            'iPhone XS iOS 12.1 session: https://app-automate.browserstack.com/builds/1/sessions/2'
        )
    })
})

describe('before', () => {
    it('should set auth to default values if not provided', async () => {
        let service = new BrowserstackService({} as any, [{}] as any, { capabilities: {} })

        await service.beforeSession({} as any as any)
        await service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])
        expect(service['_config'].user).toEqual('NotSetUser')
        expect(service['_config'].key).toEqual('NotSetKey')

        service = new BrowserstackService({} as any, [{}] as any, { capabilities: {} })
        service.beforeSession({ user: 'blah' } as any as any)
        await service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])

        expect(service['_config'].user).toEqual('blah')
        expect(service['_config'].key).toEqual('NotSetKey')
        service = new BrowserstackService({} as any, [{}] as any, { capabilities: {} })
        service.beforeSession({ key: 'blah' } as any as any)
        await service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])
        expect(service['_config'].user).toEqual('NotSetUser')
        expect(service['_config'].key).toEqual('blah')
    })

    it('should initialize correctly', () => {
        const service = new BrowserstackService({} as any, [{}] as any, {
            user: 'foo',
            key: 'bar',
            capabilities: {}
        })
        service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])
        expect(service['_sessionBaseUrl']).toEqual(sessionBaseUrl)
    })

    it('should initialize correctly for multiremote', () => {
        const service = new BrowserstackService(
            {} as any,
            [{}] as any,
            {
                user: 'foo',
                key: 'bar',
                capabilities: [{}]
            }
        )
        service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])
        expect(service['_sessionBaseUrl']).toEqual(sessionBaseUrl)
    })

    it('should initialize correctly for appium', () => {
        const service = new BrowserstackService(
            {} as any,
            [{ app: 'test-app' }] as any,
            {
                user: 'foo',
                key: 'bar',
                capabilities: {
                    app: 'test-app'
                } as any
            }
        )
        browser.capabilities = {
            app: 'test-app',
            device: 'iPhone XS',
            os: 'iOS',
            os_version: '12.1',
            browserName: '',
        }
        service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])
        expect(service['_sessionBaseUrl']).toEqual('https://api-cloud.browserstack.com/app-automate/sessions')
    })

    it('should initialize correctly for appium without global browser capabilities', () => {
        const service = new BrowserstackService({} as any, {
            app: 'bs://BrowserStackMobileAppId'
        }, {
            user: 'foo',
            key: 'bar',
            capabilities: {
                app: 'test-app' as any
            }
        })
        service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])
        expect(service['_sessionBaseUrl']).toEqual('https://api-cloud.browserstack.com/app-automate/sessions')
    })

    it('should initialize correctly for appium if using valid W3C Webdriver capabilities', () => {
        const service = new BrowserstackService({} as any, {
            app: 'bs://BrowserStackMobileAppId'
        }, {
            user: 'foo',
            key: 'bar',
            capabilities: {
                ['appium:app']: 'test-app'
            } as any
        })
        service.before(service['_config'] as any, [], browser)

        expect(service['_failReasons']).toEqual([])
        expect(service['_sessionBaseUrl']).toEqual('https://api-cloud.browserstack.com/app-automate/sessions')
    })

    it('should log the url', async () => {
        const service = new BrowserstackService({} as any, [{}] as any, { capabilities: {} })

        await service.before(service['_config'] as any, [], browser)
        expect(log.info).toHaveBeenCalled()
        expect(log.info).toHaveBeenCalledWith(
            'OS X Sierra chrome session: https://www.browserstack.com/automate/builds/1/sessions/2')
    })
})

describe('beforeSuite', () => {
    it('should send request to set the session name as suite name for Mocha tests', async () => {
        await service.before(service['_config'] as any, [], browser)
        expect(service['_suiteTitle']).toBeUndefined()
        expect(service['_fullTitle']).toBeUndefined()
        await service.beforeSuite({ title: 'foobar' } as any)
        expect(service['_suiteTitle']).toBe('foobar')
        expect(service['_fullTitle']).toBe('foobar')
        expect(got.put).toBeCalledWith(
            `${sessionBaseUrl}/${sessionId}.json`,
            {
                json: { name: 'foobar' },
                username: 'foo',
                password: 'bar'
            }
        )
    })

    it('should not send request to set the session name as suite name for Jasmine tests', async () => {
        await service.before(service['_config'] as any, [], browser)
        expect(service['_suiteTitle']).toBeUndefined()
        expect(service['_fullTitle']).toBeUndefined()
        await service.beforeSuite({ title: jasmineSuiteTitle } as any)
        expect(service['_suiteTitle']).toBe(jasmineSuiteTitle)
        expect(service['_fullTitle']).toBeUndefined()
        expect(got.put).not.toBeCalled()
    })

    it('should not send request to set the session name if option setSessionName is false', async () => {
        const service = new BrowserstackService({ setSessionName: false } as any, [] as any, { user: 'foo', key: 'bar' } as any)
        await service.beforeSuite({ title: 'Project Title' } as any)
        expect(got.put).not.toBeCalled()
    })
})

describe('beforeTest', () => {
    it('should not send request to set the session name if option setSessionName is false', async () => {
        const service = new BrowserstackService({ setSessionName: false } as any, [] as any, { user: 'foo', key: 'bar' } as any)
        await service.beforeSuite({ title: 'Project Title' } as any)
        await service.beforeTest({ title: 'Test Title', parent: 'Suite Title' } as any)
        expect(got.put).not.toBeCalled()
    })

    describe('sessionNamePrependTopLevelSuiteTitle is true', () => {
        it('should set title for Mocha tests using concatenation of top level suite name, innermost suite name, and test title', async () => {
            const service = new BrowserstackService({ sessionNamePrependTopLevelSuiteTitle: true } as any, [] as any, { user: 'foo', key: 'bar' } as any)
            await service.before(service['_config'] as any, [], browser)
            await service.beforeSuite({ title: 'Project Title' } as any)
            expect(service['_fullTitle']).toBe('Project Title')
            await service.beforeTest({ title: 'Test Title', parent: 'Suite Title' } as any)
            expect(service['_fullTitle']).toBe('Project Title - Suite Title - Test Title')
            expect(got.put).toBeCalledTimes(2)
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'Project Title' },
                    username: 'foo',
                    password: 'bar'
                }
            )
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'Project Title - Suite Title - Test Title' },
                    username: 'foo',
                    password: 'bar'
                }
            )
        })
    })

    describe('sessionNameOmitTestTitle is true', () => {
        beforeEach(() => {
            service = new BrowserstackService({ sessionNameOmitTestTitle: true } as any, [] as any, { user: 'foo', key: 'bar' } as any)
        })
        it('should not set title for Mocha tests', async () => {
            await service.before(service['_config'] as any, [], browser)
            await service.beforeSuite({ title: 'Suite Title' } as any)
            expect(service['_fullTitle']).toBe('Suite Title')
            await service.beforeTest({ title: 'bar', parent: 'Suite Title' } as any)
            expect(service['_fullTitle']).toBe('Suite Title')
            await service.afterTest({ title: 'bar', parent: 'Suite Title' } as any, undefined as never, {} as any)
            expect(service['_fullTitle']).toBe('Suite Title')
            expect(got.put).toBeCalledTimes(1)
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'Suite Title' },
                    username: 'foo',
                    password: 'bar'
                }
            )
        })
    })

    describe('sessionNamePrependTopLevelSuiteTitle is true, sessionNameOmitTestTitle is true', () => {
        beforeEach(() => {
            service = new BrowserstackService({ sessionNameOmitTestTitle: true, sessionNamePrependTopLevelSuiteTitle: true } as any, [] as any, { user: 'foo', key: 'bar' } as any)
        })
        it('should set title for Mocha tests using concatenation of top level suite name and innermost suite name', async () => {
            await service.before(service['_config'] as any, [], browser)
            await service.beforeSuite({ title: 'Project Title' } as any)
            expect(service['_fullTitle']).toBe('Project Title')
            await service.beforeTest({ title: 'Test Title', parent: 'Suite Title' } as any)
            expect(service['_fullTitle']).toBe('Project Title - Suite Title')
            expect(got.put).toBeCalledTimes(2)
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'Project Title' },
                    username: 'foo',
                    password: 'bar'
                }
            )
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'Project Title - Suite Title' },
                    username: 'foo',
                    password: 'bar'
                }
            )
        })
    })

    describe('sessionNameFormat is defined', () => {
        beforeEach(() => {
            service = new BrowserstackService({
                sessionNameFormat: (config, caps, suiteTitle, testTitle) => {
                    if (testTitle) {
                        return `${config.region} - ${(caps as any).browserName} - ${suiteTitle} - ${testTitle}`
                    }
                    return `${config.region} - ${(caps as any).browserName} - ${suiteTitle}`
                }
            } as any, {
                browserName: 'foobar'
            }, {
                user: 'foo',
                key: 'bar',
                region: 'barfoo'
            } as any)
        })
        it('should set title via sessionNameFormat method', async () => {
            await service.before(service['_config'] as any, [], browser)
            service['_browser'] = browser
            service['_suiteTitle'] = 'Suite Title'
            await service.beforeSuite({ title: 'Suite Title' } as any)
            expect(service['_fullTitle']).toBe('barfoo - foobar - Suite Title')
            await service.beforeTest({ title: 'Test Title', parent: 'Suite Title' } as any)
            expect(service['_fullTitle']).toBe('barfoo - foobar - Suite Title - Test Title')
            expect(got.put).toBeCalledTimes(2)
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'barfoo - foobar - Suite Title' },
                    username: 'foo',
                    password: 'bar'
                }
            )
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'barfoo - foobar - Suite Title - Test Title' },
                    username: 'foo',
                    password: 'bar'
                }
            )
        })
    })

    describe('Jasmine only', () => {
        it('should set suite name of first test as title', async () => {
            await service.before(service['_config'] as any, [], browser)
            await service.beforeSuite({ title: jasmineSuiteTitle } as any)
            await service.beforeTest({ fullName: 'foo bar baz', description: 'baz' } as any)
            service.afterTest({ fullName: 'foo bar baz', description: 'baz' } as any, undefined as never, {} as any)
            expect(service['_fullTitle']).toBe('foo bar')
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'foo bar' },
                    username: 'foo',
                    password: 'bar'
                }
            )
        })

        it('should set parent suite name as title', async () => {
            await service.before(service['_config'] as any, [], browser)
            await service.beforeSuite({ title: jasmineSuiteTitle } as any)
            await service.beforeTest({ fullName: 'foo bar baz', description: 'baz' } as any)
            await service.beforeTest({ fullName: 'foo xyz', description: 'xyz' } as any)
            service.afterTest({ fullName: 'foo bar baz', description: 'baz' } as any, undefined as never, {} as any)
            service.afterTest({ fullName: 'foo xyz', description: 'xyz' } as any, undefined as never, {} as any)
            expect(service['_fullTitle']).toBe('foo')
            expect(got.put).toBeCalledWith(
                `${sessionBaseUrl}/${sessionId}.json`,
                {
                    json: { name: 'foo' },
                    username: 'foo',
                    password: 'bar'
                }
            )
        })
    })
})

describe('afterTest', () => {
    it('should increment failure reasons on fails', () => {
        service.before(service['_config'] as any, [], browser)
        service['_fullTitle'] = ''
        service.beforeSuite({ title: 'foo' } as any)
        service.beforeTest({ title: 'foo', parent: 'bar' } as any)
        service.afterTest(
            { title: 'foo', parent: 'bar' } as any,
            undefined as never,
            { error: { message: 'cool reason' }, result: 1, duration: 5, passed: false } as any)
        expect(service['_failReasons']).toContain('cool reason')

        service.beforeTest({ title: 'foo2', parent: 'bar2' } as any)
        service.afterTest(
            { title: 'foo2', parent: 'bar2' } as any,
            undefined as never,
            { error: { message: 'not so cool reason' }, result: 1, duration: 7, passed: false } as any)

        expect(service['_failReasons']).toHaveLength(2)
        expect(service['_failReasons']).toContain('cool reason')
        expect(service['_failReasons']).toContain('not so cool reason')

        service.beforeTest({ title: 'foo3', parent: 'bar3' } as any)
        service.afterTest(
            { title: 'foo3', parent: 'bar3' } as any,
            undefined as never,
            { error: undefined, result: 1, duration: 7, passed: false } as any)

        expect(service['_fullTitle']).toBe('bar3 - foo3')
        expect(service['_failReasons']).toHaveLength(3)
        expect(service['_failReasons']).toContain('cool reason')
        expect(service['_failReasons']).toContain('not so cool reason')
        expect(service['_failReasons']).toContain('Unknown Error')
    })

    it('should not increment failure reasons on passes', () => {
        service.before(service['_config'] as any, [], browser)
        service.beforeSuite({ title: 'foo' } as any)
        service.beforeTest({ title: 'foo', parent: 'bar' } as any)
        service.afterTest(
            { title: 'foo', parent: 'bar' } as any,
            undefined as never,
            { error: { message: 'cool reason' }, result: 1, duration: 5, passed: true } as any)
        expect(service['_failReasons']).toEqual([])

        service.beforeTest({ title: 'foo2', parent: 'bar2' } as any)
        service.afterTest(
            { title: 'foo2', parent: 'bar2' } as any,
            undefined as never,
            { error: { message: 'not so cool reason' }, result: 1, duration: 5, passed: true } as any)

        expect(service['_fullTitle']).toBe('bar2 - foo2')
        expect(service['_failReasons']).toEqual([])
    })
})

describe('afterScenario', () => {
    it('should increment failure reasons on non-passing statuses (strict mode off)', () => {
        service = new BrowserstackService({} as any, [] as any,
            { user: 'foo', key: 'bar', cucumberOpts: { strict: false } } as any)

        expect(service['_failReasons']).toEqual([])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'SKIPPED' } })
        expect(service['_failReasons']).toEqual([])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'FAILED', message: 'I am Error, most likely' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'SKIPPED' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'FAILED', message: 'I too am Error' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely', 'I too am Error'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'UNDEFINED', message: 'Step XYZ is undefined' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely', 'I too am Error', 'Step XYZ is undefined'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'AMBIGUOUS', message: 'Step XYZ2 is ambiguous' } })
        expect(service['_failReasons']).toEqual(
            ['I am Error, most likely',
                'I too am Error',
                'Step XYZ is undefined',
                'Step XYZ2 is ambiguous'])

        service.afterScenario({ pickle: { name: 'Can do something' }, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'PENDING' } })
        expect(service['_failReasons']).toEqual(
            ['I am Error, most likely',
                'I too am Error',
                'Step XYZ is undefined',
                'Step XYZ2 is ambiguous'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'SKIPPED' } })
        expect(service['_failReasons']).toEqual([
            'I am Error, most likely',
            'I too am Error',
            'Step XYZ is undefined',
            'Step XYZ2 is ambiguous'])
    })

    it('should increment failure reasons on non-passing statuses (strict mode on)', () => {
        service = new BrowserstackService({} as any, [] as any,
            { user: 'foo', key: 'bar', cucumberOpts: { strict: true }, capabilities: {} })

        expect(service['_failReasons']).toEqual([])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'SKIPPED' } })
        expect(service['_failReasons']).toEqual([])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, message: 'I am Error, most likely', status: 'FAILED' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'SKIPPED' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'FAILED', message: 'I too am Error' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely', 'I too am Error'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'UNDEFINED', message: 'Step XYZ is undefined' } })
        expect(service['_failReasons']).toEqual(['I am Error, most likely', 'I too am Error', 'Step XYZ is undefined'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'AMBIGUOUS', message: 'Step XYZ2 is ambiguous' } })
        expect(service['_failReasons']).toEqual(
            ['I am Error, most likely',
                'I too am Error',
                'Step XYZ is undefined',
                'Step XYZ2 is ambiguous'])

        service.afterScenario({ pickle: { name: 'Can do something' }, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'PENDING' } })
        expect(service['_failReasons']).toEqual(
            ['I am Error, most likely',
                'I too am Error',
                'Step XYZ is undefined',
                'Step XYZ2 is ambiguous',
                'Some steps/hooks are pending for scenario "Can do something"'])

        service.afterScenario({ pickle: {}, result: { duration: { seconds: 0, nanos: 1000000 }, willBeRetried: false, status: 'SKIPPED' } })
        expect(service['_failReasons']).toEqual([
            'I am Error, most likely',
            'I too am Error',
            'Step XYZ is undefined',
            'Step XYZ2 is ambiguous',
            'Some steps/hooks are pending for scenario "Can do something"'])
    })
})

describe('after', () => {
    it('should call _update when session has no errors (exit code 0)', async () => {
        const updateSpy = vi.spyOn(service, '_update')
        await service.before(service['_config'] as any, [], browser)

        service['_failReasons'] = []
        service['_fullTitle'] = 'foo - bar'

        await service.after(0)

        expect(updateSpy).toHaveBeenCalledWith(service['_browser']?.sessionId,
            {
                status: 'passed',
                name: 'foo - bar'
            })
        expect(got.put).toHaveBeenCalledWith(
            `${sessionBaseUrl}/${sessionId}.json`,
            { json: {
                status: 'passed',
                name: 'foo - bar'
            }, username: 'foo', password: 'bar' })
    })

    it('should call _update when session has errors (exit code 1)', async () => {
        const updateSpy = vi.spyOn(service, '_update')
        await service.before(service['_config'] as any, [], browser)

        service['_fullTitle'] = 'foo - bar'
        service['_failReasons'] = ['I am failure']
        await service.after(1)

        expect(updateSpy).toHaveBeenCalledWith(service['_browser']?.sessionId,
            {
                status: 'failed',
                name: 'foo - bar',
                reason: 'I am failure'
            })
        expect(got.put).toHaveBeenCalledWith(
            `${sessionBaseUrl}/${sessionId}.json`,
            { json: {
                status: 'failed',
                name: 'foo - bar',
                reason: 'I am failure'
            }, username: 'foo', password: 'bar' })
    })

    it('should not set session status if option setSessionStatus is false', async () => {
        const service = new BrowserstackService({ setSessionStatus: false } as any, [] as any, { user: 'foo', key: 'bar' } as any)
        const updateSpy = vi.spyOn(service, '_update')
        await service.before(service['_config'] as any, [], browser)

        service['_fullTitle'] = 'foo - bar'
        service['_failReasons'] = ['I am failure']
        await service.after(1)

        expect(updateSpy).not.toHaveBeenCalled()
        expect(got.put).not.toHaveBeenCalled()
    })

    it('should not set session name if option setSessionName is false', async () => {
        const service = new BrowserstackService({ setSessionName: false } as any, [] as any, { user: 'foo', key: 'bar' } as any)
        const updateSpy = vi.spyOn(service, '_update')
        await service.before(service['_config'] as any, [], browser)

        service['_failReasons'] = []
        service['_fullTitle'] = 'foo - bar'

        await service.after(0)

        expect(updateSpy).toHaveBeenCalledWith(service['_browser']?.sessionId, { status: 'passed' })
        expect(got.put).toHaveBeenCalledWith(
            `${sessionBaseUrl}/${sessionId}.json`,
            { json: { status: 'passed' }, username: 'foo', password: 'bar' })
    })

    describe('Cucumber only', function () {
        it('should call _update with status "failed" if strict mode is "on" and all tests are pending', async () => {
            service = new BrowserstackService({} as any, [] as any,
                { user: 'foo', key: 'bar', cucumberOpts: { strict: true } } as any)

            const updateSpy = vi.spyOn(service, '_update')

            await service.before(service['_config'] as any, [], browser)
            await service.beforeFeature(null, { name: 'Feature1' })

            await service.afterScenario({ pickle: { name: 'Can do something but pending 1' },  result: { status: 'PENDING' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something but pending 2' },  result: { status: 'PENDING' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something but pending 3' },  result: { status: 'PENDING' } as any })

            await service.after(1)

            expect(updateSpy).toHaveBeenLastCalledWith(service['_browser']?.sessionId, {
                name: 'Feature1',
                reason: 'Some steps/hooks are pending for scenario "Can do something but pending 1"' + '\n' +
                        'Some steps/hooks are pending for scenario "Can do something but pending 2"' + '\n' +
                        'Some steps/hooks are pending for scenario "Can do something but pending 3"',
                status: 'failed',
            })
            expect(updateSpy).toHaveBeenCalled()
        })

        it('should call _update with status "passed" when strict mode is "off" and only passed and pending tests ran', async () => {
            service = new BrowserstackService({} as any, [] as any,
                { user: 'foo', key: 'bar', cucumberOpts: { strict: false } } as any)

            const updateSpy = vi.spyOn(service, '_update')

            await service.before(service['_config'] as any, [], browser)
            await service.beforeFeature(null, { name: 'Feature1' })

            await service.afterScenario({ pickle: { name: 'Can do something' },  result: { status: 'PASSED' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something' },  result: { status: 'PENDING' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something' },  result: { status: 'PASSED' } as any })

            await service.after(0)

            expect(updateSpy).toHaveBeenCalled()
            expect(updateSpy).toHaveBeenLastCalledWith(service['_browser']?.sessionId, {
                name: 'Feature1',
                status: 'passed',
            })
        })

        it('should call _update with status is "failed" when strict mode is "on" and only passed and pending tests ran', async () => {
            service = new BrowserstackService({} as any, [] as any,
                { user: 'foo', key: 'bar', cucumberOpts: { strict: true } } as any)

            const updateSpy = vi.spyOn(service, '_update')

            await service.before(service['_config'] as any, [], browser)
            await service.beforeFeature(null, { name: 'Feature1' })

            await service.afterScenario({ pickle: { name: 'Can do something 1' },  result: { status: 'PASSED' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something but pending' },  result: { status: 'PENDING' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something 2' },  result: { status: 'PASSED' } as any })

            await service.after(1)

            expect(updateSpy).toHaveBeenCalled()
            expect(updateSpy).toHaveBeenCalledWith(service['_browser']?.sessionId, {
                name: 'Feature1',
                reason: 'Some steps/hooks are pending for scenario "Can do something but pending"',
                status: 'failed',
            })
        })

        it('should call _update with status "passed" when all tests are skipped', async () => {
            const updateSpy = vi.spyOn(service, '_update')

            await service.before(service['_config'] as any, [], browser)
            await service.beforeFeature(null, { name: 'Feature1' })

            await service.afterScenario({ pickle: { name: 'Can do something skipped 1' },  result: { status: 'SKIPPED' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something skipped 2' },  result: { status: 'SKIPPED' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something skipped 3' },  result: { status: 'SKIPPED' } as any })

            await service.after(0)

            expect(updateSpy).toHaveBeenCalledWith(service['_browser']?.sessionId, {
                name: 'Feature1',
                status: 'passed',
            })
        })

        it('should call _update with status "failed" when strict mode is "on" and only failed and pending tests ran', async () => {
            service = new BrowserstackService({} as any, [] as any,
                { user: 'foo', key: 'bar', cucumberOpts: { strict: true } } as any)

            const updateSpy = vi.spyOn(service, '_update')
            const afterSpy = vi.spyOn(service, 'after')

            await service.beforeSession(service['_config'] as any)
            await service.before(service['_config'] as any, [], browser)
            await service.beforeFeature(null, { name: 'Feature1' })

            expect(updateSpy).toHaveBeenCalledWith(service['_browser']?.sessionId, {
                name: 'Feature1'
            })

            await service.afterScenario({ pickle: { name: 'Can do something failed 1' },  result: { message: 'I am error, hear me roar', status: 'FAILED' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something but pending 2' },  result: { status: 'PENDING' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something but passed 3' },  result: { status: 'SKIPPED' } as any })

            await service.after(1)

            expect(updateSpy).toHaveBeenCalledTimes(2)
            expect(updateSpy).toHaveBeenLastCalledWith(
                service['_browser']?.sessionId, {
                    name: 'Feature1',
                    reason:
                        'I am error, hear me roar' +
                        '\n' +
                        'Some steps/hooks are pending for scenario "Can do something but pending 2"',
                    status: 'failed',
                })
            expect(afterSpy).toHaveBeenCalledTimes(1)
        })

        it('should call _update with status "failed" when strict mode is "off" and only failed and pending tests ran', async () => {
            const updateSpy = vi.spyOn(service, '_update')

            await service.beforeSession(service['_config'] as any)
            await service.before(service['_config'] as any, [], browser)
            await service.beforeFeature(null, { name: 'Feature1' })

            expect(updateSpy).toHaveBeenCalledWith(service['_browser']?.sessionId, {
                name: 'Feature1'
            })

            await service.afterScenario({ pickle: { name: 'Can do something failed 1' },  result: { message: 'I am error, hear me roar', status: 'FAILED' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something but pending 2' },  result: { status: 'PENDING' } as any })
            await service.afterScenario({ pickle: { name: 'Can do something but passed 3' },  result: { status: 'SKIPPED' } as any })

            await service.after(1)

            expect(updateSpy).toHaveBeenCalledTimes(2)
            expect(updateSpy).toHaveBeenLastCalledWith(
                service['_browser']?.sessionId, {
                    name: 'Feature1',
                    reason: 'I am error, hear me roar',
                    status: 'failed',
                }
            )
        })

        describe('preferScenarioName', () => {
            describe('enabled', () => {
                [
                    { status: 'FAILED', body: {
                        name: 'Can do something single',
                        reason: 'Unknown Error',
                        status: 'failed',
                    } }
                    /*, 5, 4, 0*/
                ].map(({ status, body }) =>
                    it(`should call _update /w status failed and name of Scenario when single "${status}" Scenario ran`, async () => {
                        service = new BrowserstackService({ preferScenarioName : true } as any, [] as any,
                            { user: 'foo', key: 'bar', cucumberOpts: { strict: false } } as any)
                        service.before({}, [], browser)

                        const updateSpy = vi.spyOn(service, '_update')

                        await service.beforeFeature(null, { name: 'Feature1' })
                        await service.afterScenario({ pickle: { name: 'Can do something single' }, result: { status } as any })
                        await service.after(1)

                        expect(updateSpy).toHaveBeenLastCalledWith(service['_browser']?.sessionId, body)
                    })
                )

                it('should call _update /w status passed and name of Scenario when single "passed" Scenario ran', async () => {
                    service = new BrowserstackService({ preferScenarioName : true } as any, [] as any,
                        { user: 'foo', key: 'bar', cucumberOpts: { strict: false } } as any)
                    service.before({}, [], browser)

                    const updateSpy = vi.spyOn(service, '_update')

                    await service.beforeFeature(null, { name: 'Feature1' })

                    await service.afterScenario({
                        pickle: { name: 'Can do something single' },
                        result: { status: 'passed' } as any
                    })

                    await service.after(0)

                    expect(updateSpy).toHaveBeenLastCalledWith(service['_browser']?.sessionId, {
                        name: 'Can do something single',
                        status: 'passed',
                    })
                })
            })

            describe('disabled', () => {
                ['FAILED', 'AMBIGUOUS', 'UNDEFINED', 'UNKNOWN'].map(status =>
                    it(`should call _update /w status failed and name of Feature when single "${status}" Scenario ran`, async () => {
                        service = new BrowserstackService({ preferScenarioName : false } as any, [] as any,
                            { user: 'foo', key: 'bar', cucumberOpts: { strict: false } } as any)
                        service.before({}, [], browser)

                        const updateSpy = vi.spyOn(service, '_update')

                        await service.beforeFeature(null, { name: 'Feature1' })

                        await service.afterScenario({ pickle: { name: 'Can do something single' }, result: { status } as any })

                        await service.after(1)

                        expect(updateSpy).toHaveBeenLastCalledWith(service['_browser']?.sessionId, {
                            name: 'Feature1',
                            reason: 'Unknown Error',
                            status: 'failed',
                        })
                    })
                )

                it('should call _update /w status passed and name of Feature when single "passed" Scenario ran', async () => {
                    service = new BrowserstackService({ preferScenarioName : false } as any, [] as any,
                        { user: 'foo', key: 'bar', cucumberOpts: { strict: false } } as any)
                    service.before({}, [], browser)

                    const updateSpy = vi.spyOn(service, '_update')

                    await service.beforeFeature(null, { name: 'Feature1' })

                    await service.afterScenario({
                        pickle: { name: 'Can do something single' },
                        result: { status: 'PASSED' } as any
                    })
                    await service.after(0)

                    expect(updateSpy).toHaveBeenLastCalledWith(service['_browser']?.sessionId, {
                        name: 'Feature1',
                        status: 'passed',
                    })
                })
            })
        })
    })
})
