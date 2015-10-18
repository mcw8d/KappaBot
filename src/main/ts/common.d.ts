/// <reference path='../../../typings/tsd.d.ts' />
declare interface IKappaCommand {
    execute: (args: string[]) => Q.Promise<string>;
    describe: () => string;
}