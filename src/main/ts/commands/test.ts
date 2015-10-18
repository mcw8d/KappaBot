/// <reference path='../common.d.ts' />
import Q = require('q');

class Test implements IKappaCommand {
    execute (args: string[]): Q.Promise<string> {
        return Q.when('This was a test');
    }

    describe (): string {
        return 'This is a test command implementation.'
    }
}

export = new Test();
