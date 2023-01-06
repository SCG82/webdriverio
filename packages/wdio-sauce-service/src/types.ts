import type { SauceConnectOptions } from 'saucelabs'
import type { Capabilities, Options } from '@wdio/types'

export interface SauceServiceConfig {
    /**
     * Specify the max error stack length represents the amount of error stack lines that will be
     * pushed to Sauce Labs when a test fails
     */
    maxErrorStackLength?: number

    /**
     * Specify tunnel identifier for Sauce Connect parent tunnel
     */
    parentTunnel?: string

    /**
     * Cucumber only. Set the job name to the Scenario name if only a single Scenario ran.
     * Useful when running in parallel with [wdio-cucumber-parallel-execution](https://github.com/SimitTomar/wdio-cucumber-parallel-execution).
     * @default false
     */
    preferScenarioName?: boolean

    /**
     * If true it runs Sauce Connect and opens a secure connection between a Sauce Labs virtual
     * machine running your browser tests.
     *
     * @default false
     */
    sauceConnect?: boolean

    /**
     * Apply Sauce Connect options (e.g. to change port number or logFile settings). See this
     * list for more information: https://github.com/bermi/sauce-connect-launcher#advanced-usage
     *
     * @default {}
     */
    sauceConnectOpts?: SauceConnectOptions

    /**
     * Use Sauce Connect as a Selenium Relay. See more [here](https://wiki.saucelabs.com/display/DOCS/Using+the+Selenium+Relay+with+Sauce+Connect+Proxy).
     * @deprecated
     */
    scRelay?: boolean

    /**
     * Dynamically control the name of the job
     */
    setJobName?: (
        config: Options.Testrunner,
        capabilities: Capabilities.RemoteCapability,
        suiteTitle: string
    ) => string

    /**
     * Automatically set the job status (passed/failed).
     * @default true
     */
    setJobStatus?: boolean

    /**
     * Specify tunnel identifier for Sauce Connect tunnel
     */
    tunnelIdentifier?: string

    /**
     * Upload WebdriverIO logs to the Sauce Labs platform.
     * @default true
     */
    uploadLogs?: boolean
}
