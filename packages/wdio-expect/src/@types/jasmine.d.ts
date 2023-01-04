/// <reference path="./expect-webdriverio.d.ts"/>

declare module jasmine {
    interface AsyncMatchers<T, U> extends ExpectWebdriverIO.Matchers<Promise<void>, T> {}
}
