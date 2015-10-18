/// <reference path='common.d.ts' />
import fs = require('fs');

import _ = require('lodash');
import express = require('express');
import Q = require('q');

class CommandLoader {
    private _commands: { [command: string]: IKappaCommand } = {};
    private _dir: string = __dirname + '/commands';

    constructor () {
        var updateCommands = () => {
            fs.readdir(this._dir, (err, files) => {
                var commandFiles = _(files)
                    .filter(function (file) { return _.endsWith(file, '.js'); })
                    .map(function (file) { return file.replace('.js', ''); }).value();
                var currentCommands = _.keys(this._commands);

                _(commandFiles).difference(currentCommands).forEach((newCommand) => {
                    this._commands[newCommand] = require('./commands/' + newCommand);
                }).run();
                _(currentCommands).difference(commandFiles).forEach((removedCommand) => {
                    delete this._commands[removedCommand];
                }).run();
            });
        }

        updateCommands();
        fs.watch(this._dir, updateCommands);
    }

    describe (command: string): string {
        var description = 'Unknown command.';
        if (this.has(command) && _.isFunction(this._commands[command].execute)) {
            try {
                description = this._commands[command].describe();
            } finally {
                description = 'An error occurred retrieving description.'
            }
        }
        return description;
    }

    execute (command: string, args: string[]): Q.Promise<string> {
        if (this.has(command) && _.isFunction(this._commands[command].execute)) {
            return this._commands[command].execute(args);
        } else {
            return Q.when('Unknown command.');
        }
    }

    getCommands (): string {
        return _.keys(this._commands).join(',');
    }

    has (command: string): boolean {
        return _.has(this._commands , command);
    }
}

var app = express();
var commandLoader = new CommandLoader();

app.get('/commands', function (req, res) {
    res.send(commandLoader.getCommands());
});

app.get('/describe/:command', function (req, res) {
    res.send(commandLoader.describe(req.params.command));
});

app.get('/execute/:command', function (req, res) {
    if (commandLoader.has(req.params.command)) {
        commandLoader.execute(req.params.command, req.query.args)
        .then(function (response) {
            res.send(response);
        }, function (reason) {
            res.send(500, reason);
        });
    } else {
        res.send(404, 'Command not found');
    }
});

app.listen(8089, function () {
    console.log('KappaBot server listening for commands on 8089.');
});
