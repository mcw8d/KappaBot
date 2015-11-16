/// <reference path='../common.d.ts' />
import Q = require('q');

class Countdown implements IKappaCommand {
    execute (args: string[]): Q.Promise<string> {
	var countdown = new Date("2015-11-20T18:00:00.000Z").getTime() - new Date().getTime();

        var x = countdown / 1000;
        var seconds = Math.floor(x % 60);
	x /= 60;
        var minutes = Math.floor(x % 60);
        x /= 60;
        var hours = Math.floor(x % 24);
        x /= 24;
        var days = Math.floor(x);
	var output = ("Days until Novlovplov: " + days + " Days," + hours + " Hours," + minutes + " Minutes, and " + seconds + " Seconds.");
        return Q.when(output);
    }

    describe (): string {
        return 'This returns the time till novlovplov.'
    }
}

export = new Countdown();
