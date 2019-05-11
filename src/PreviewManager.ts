import * as path from 'path';
import * as vscode from 'vscode';

export default class PreviewManager {
	public static currentPanel: PreviewManager | undefined;

	public static readonly viewType = 'preview';

	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(content: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (PreviewManager.currentPanel) {
			PreviewManager.currentPanel._panel.webview.html = content;
			PreviewManager.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			PreviewManager.viewType,
			'Newman Report Preview',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true
			}
		);

		PreviewManager.currentPanel = new PreviewManager(panel, content);
	}

	private constructor(panel: vscode.WebviewPanel, content: string) {
		this._panel = panel;

		// Set the webview's initial html content
		this._update(content);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update(content);
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	private _update(content: string) {
		this._panel.title = 'Newman Report Preview';
		this._panel.webview.html = content;
	}
}