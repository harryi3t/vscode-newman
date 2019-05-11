"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const fs = require("fs");
// import * as vscode from 'vscode';
const newman = require("newman");
const handlebars = require("handlebars");
const filesize = require("filesize");
const prettyms = require("pretty-ms");
let template = fs.readFileSync('/users/harryi3t/Desktop/template.hbs', 'utf-8'), compiler = handlebars.compile(template);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-newman" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable1 = vscode.commands.registerCommand('extension.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    let disposable2 = vscode.commands.registerCommand('extension.newman', () => {
        newman.run({
            collection: require('/users/harryi3t/Desktop/Send a test notification.postman_collection.json'),
            reporters: 'cli'
        }, function (err, summary) {
            console.log('collection run complete!', {
                err, summary
            });
        });
        // Display a message box to the user
        vscode.window.showInformationMessage('Ran collection using newman!');
    });
    context.subscriptions.push(disposable1);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
let util = {
    prettyms(ms) {
        return (ms < 1998) ? `${parseInt(ms, 10)}ms` : prettyms(ms || 0);
    },
    filesize(bytes) {
        return filesize(bytes || 0, { spacer: '' });
    }
};
newman.run({
    collection: require('/users/harryi3t/Desktop/Send a test notification.postman_collection.json'),
    reporters: 'cli'
}, function (err, summary) {
    console.log('collection run complete!', {
        err, summary
    });
    let content = compiler({
        timestamp: Date(),
        version: '1.1.1',
        aggregations: [{
                executions: summary.run.executions
            }],
        summary: {
            stats: summary.run.stats,
            collection: summary.collection,
            globals: summary.globals,
            environment: summary.environment,
            // failures: summary.run.failures,
            responseTotal: util.filesize(summary.run.transfers.responseTotal),
            responseAverage: util.prettyms(summary.run.timings.responseAverage),
            duration: util.prettyms(summary.run.timings.completed - summary.run.timings.started)
        }
    });
    fs.writeFileSync('/Users/harryi3t/work/playground/vscode-extension/vscode-newman/newman/report.html', content);
});
//# sourceMappingURL=extension.js.map