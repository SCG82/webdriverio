import fs from 'node:fs'
import path from 'node:path'

export default class SmokeServiceLauncher {
    logFile: fs.WriteStream
    constructor (options: { logDir?: string } = {}) {
        const logFilePath = options.logDir
            ? path.join(options.logDir, 'launcher.log')
            : path.join(process.cwd(), 'tests', 'helpers', 'launcher.log')
        this.logFile = fs.createWriteStream(logFilePath)
    }
    onPrepare () { this.logFile.write('onPrepare called\n') } // eslint-disable-line no-console
    onWorkerStart () { this.logFile.write('onWorkerStart called\n')} // eslint-disable-line no-console
    onWorkerEnd () { this.logFile.write('onWorkerEnd called\n')} // eslint-disable-line no-console
    onComplete () { this.logFile.write('onComplete called\n') } // eslint-disable-line no-console
}
