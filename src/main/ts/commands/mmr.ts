/// <reference path='../common.d.ts' />
import http = require('http');

import _ = require('lodash');
import Q = require('q');

interface IAccountData {
    accountID: string;
    steamID: string;
    username: string;
    startingMMR: number;
    currentMMR: number;
    lastPlayed: string;
    createdAt: string;
    updatedAt: string;
    Matches: IMatchData[];
}

interface IMatchData {
    id: number;
    matchID: number;
    startTime: string;
    win: boolean;
    mmrChange: number;
    accountID: string;
    hero: number;
    createdAt: string;
    updatedAt: string;
}

class MMR implements IKappaCommand {
    private _novlovUrl = 'http://novlovplov.xyz/api';
    private _accounts = 'accounts';

    describe (): string {
        return 'Calls to an MMR bot and returns the current stats of the MMR challenge.';
    }

    execute (args: string[]): Q.Promise<string> {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.getAccounts().then((accounts) => {
            var sortedAccounts = _.sortByOrder(accounts, [function (account) {
                return account.currentMMR - account.startingMMR;
            }], ['desc']);
            var dailyMMRs: number[] = _.map(sortedAccounts, (account) => {
                var updatedAt = new Date(account.updatedAt);
                var dailyMMR = 0;
                if (updatedAt >= today) {
                    dailyMMR = _(account.Matches).filter(function (match: IMatchData) {
                        return ((new Date(match.createdAt)) >= today);
                    }).reduce(function (acc, match) {
                        return acc + match.mmrChange;
                    }, 0);
                }
                return dailyMMR;
            });
            var response = 'Username: daily, total\n';
            response += _.map(dailyMMRs, function (dailyMMR, idx) {
                var account = sortedAccounts[idx];
                return `${account.username}: ${dailyMMR}, ${account.currentMMR - account.startingMMR}`;
            }).join('\n');
            return response;
        });
    }

    getAccounts (): Q.Promise<IAccountData[]> {
        var deferred = Q.defer<IAccountData[]>();
        http.get(`${this._novlovUrl}/accounts`, function (res) {
            var resultJSON = '';
            res.on('data', function (data) {
                resultJSON += data;
            });
            res.on('end', function () {
                try {
                    deferred.resolve(JSON.parse(resultJSON));
                } catch (e) {
                    deferred.reject(e);
                }
            });
        });
        return deferred.promise;
    }
}

export = new MMR();
