import WDIOReporter from '@wdio/reporter'
import type { Reporters } from '@wdio/types'
import chalk from 'chalk'

/**
 * Initialize a new `Dot` matrix test reporter.
 */
export default class DotReporter extends WDIOReporter {
    constructor(options: Reporters.Options) {
        super(Object.assign({ stdout: true }, options))
    }

    /**
     * pending tests
     */
    onTestSkip(): void {
        this.write(chalk.cyanBright('.'))
    }

    /**
     * passing tests
     */
    onTestPass(): void {
        this.write(chalk.greenBright('.'))
    }

    /**
     * failing tests
     */
    onTestFail(): void {
        this.write(chalk.redBright('F'))
    }
}
