import * as vscode from 'vscode';

const VIEW_TYPE = 'newman-report-preview';
const TITLE = 'Newman Report Preview';
let panel: vscode.WebviewPanel | null;

export default {
	createOrUpdate: function (content: string) {
		const column = vscode.window.activeTextEditor	? vscode.window.activeTextEditor.viewColumn : undefined;

		// If we already have a panel, show it.
		if (panel) {
			panel.webview.html = content;
			panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		panel = vscode.window.createWebviewPanel(VIEW_TYPE, TITLE, column || vscode.ViewColumn.One);
		panel.webview.html = content;

		panel.onDidDispose(() => {
			panel = null;
		});
	}
};