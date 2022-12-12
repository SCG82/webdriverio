import type { Options, Capabilities } from '@wdio/types'
import type { AttachOptions } from '../src/types'

export type RemoteOptions = Options.WebdriverIO & Omit<Options.Testrunner, 'capabilities'>

export const remote = async function (
    params: RemoteOptions,
    remoteModifier?: Function
): Promise<WebdriverIO.Browser> {
    const { remote } = await import('../src/index.js')
    return remote(params, remoteModifier)
}

export const attach = async function (attachOptions: AttachOptions): Promise<WebdriverIO.Browser> {
    const { attach } = await import('../src/index.js')
    return attach(attachOptions)
}

export const multiremote = async function (
    params: Capabilities.MultiRemoteCapabilities,
    { automationProtocol }: { automationProtocol?: string } = {}
): Promise<WebdriverIO.MultiRemoteBrowser> {
    const { multiremote } = await import('../src/index.js')
    return multiremote(params, { automationProtocol })
}
