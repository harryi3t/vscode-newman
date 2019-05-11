import * as fs from 'fs';
import * as vscode from 'vscode';
import * as newman from 'newman';
import * as handlebars from 'handlebars';
import * as filesize from 'filesize';
import * as prettyms from 'pretty-ms';
import PreviewManager from './PreviewManager';

let template = fs.readFileSync('/users/harryi3t/Desktop/template.hbs', 'utf-8'),
		compiler = handlebars.compile(template),
		util = {
			prettyms (ms: any) {
				return (ms < 1998) ? `${parseInt(ms, 10)}ms` : prettyms(ms || 0);
			},
			filesize (bytes: number) {
				return filesize(bytes || 0, { spacer: '' });
			}
		};

function runCollectionFromTab () {
	// Check if a file is open in active tab
  if (!vscode.window.activeTextEditor) {
    vscode.window.showWarningMessage('No file in active tab! Please open a Postman Collection and try again.');
    return;
  }

  // Check if the file type is json
  let isJSON = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId.toLowerCase() === 'json';
  if (!isJSON) {
    vscode.window.showWarningMessage('The file is not a valid Postman Collection');
    return;
  }

  let collectionText = vscode.window.activeTextEditor.document.getText(),
      collectionJSON;

  try {
    collectionJSON = JSON.parse(collectionText);
  } catch (error) {
    vscode.window.showWarningMessage('The file is not a valid Postman Collection');
    return;
  }

  PreviewManager.createOrUpdate('Running collection....');

  newman.run({
    collection: collectionJSON,
    reporters: 'cli'
  }, function (err: any, summary: any) {
    let content = compiler({
      timestamp: Date(),
      version: '4.4.1',
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

    PreviewManager.createOrUpdate(content);
    vscode.window.showInformationMessage('Ran collection using newman!');
  });
}

export default {
  runCollectionFromTab
};