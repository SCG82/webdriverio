/// <reference path="./standalone.d.ts"/>

declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect;
    }
}
