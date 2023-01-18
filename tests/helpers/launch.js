import { Launcher } from '@wdio/cli'

export default function launch (testName, ...args) {
    const launcher = new Launcher(...args)
    return launcher.run().then(async (exitCode) => {
        const isFailing = exitCode !== 0
        if (!isFailing) {
            return { skippedSpecs: launcher.interface._skippedSpecs }
        }

        throw new Error(`Smoke test "${testName}" failed`)
    })
}
