import * as vscode from 'vscode';
import Commands from './Commands';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.newman', Commands.runCollectionFromTab);

	context.subscriptions.push(disposable);
};