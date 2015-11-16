/// <reference path='../common.d.ts' />
import Q = require('q');

class Countdown implements IKappaCommand {
    execute (args: string[]): Q.Promise<string> {
	var countdown = new Date("2015-11-20T18:00:00.000Z").getTime() - new Date().getTime();
        return Q.when(countdown.toString());
    }

    describe (): string {
        return 'This returns the time till novlovplov.'
    }
}

export = new Countdown();
