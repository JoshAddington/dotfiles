/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
var path = require('path');
var vscode_1 = require('vscode');
var vscode_languageclient_1 = require('vscode-languageclient');
var pythonLanguageClient;
function activate(context) {
    // The server is implemented in node
    var serverModule = context.asAbsolutePath(path.join('out', 'server', 'server.js'));
    // The debug options for the server
    var debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    // Options to control the language client
    var clientOptions = {
        // Register the server for plain text documents
        documentSelector: ['python'],
        synchronize: {
            // Synchronize the setting section 'python' to the server
            configurationSection: 'python',
            // Notify the server about file changes to '.clientrc files contain in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    // Create the language client and start the client.
    pythonLanguageClient = new vscode_languageclient_1.LanguageClient('Python', serverOptions, clientOptions);
    var disposable = pythonLanguageClient.start();
    //Send info as soon as it starts
    var config = vscode_1.workspace.getConfiguration();
    pythonLanguageClient.notifyConfigurationChanged(config);
    var isWin = /^win/.test(process.platform);
    if (isWin) {
    }
    // Push the disposable to the context's subscriptions so that the 
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// 
// function onDidSaveTextDocument(textDocument: vscode.TextDocument) {
//     if (textDocument.languageId !== 'python') {
//         return;
//     }
//     var args: RequestParams = { processId: 0, uri: textDocument.uri };
//     pythonLanguageClient.sendRequest(Request.type, args)
// }
// 
// function _registerEvents(): void {
//     // subscribe to trigger when the file is saved
//     let subscriptions: Disposable[] = [];
//     workspace.onDidSaveTextDocument(this._onSave, this, subscriptions);
// }
// // 
// namespace Request {
// 	export const type: RequestType<RequestParams, RequestResult, RequestError> = { get method() { return 'request'; } };
// }
// /**
//  * The Request parameters
//  */
// export interface RequestParams {
// 	/**
// 	 * The process Id of the parent process that started
// 	 * the server.
// 	 */
// 	processId: number;
// 
// 	/**
// 	 * The uri. Is null
// 	 * if no folder is open.
// 	 */
// 	uri: vscode.Uri;
// }
// 
// /**
//  * The result returned from an initilize request.
//  */
// export interface RequestResult {
//     succesful: boolean;
// }
// 
// 
// /**
//  * The error returned if the initilize request fails.
//  */
// export interface RequestError {
// 	/**
// 	 * Indicates whether the client should retry to send the
// 	 * initilize request after showing the message provided
// 	 * in the {@link ResponseError}
// 	 */
// 	retry: boolean;
// } 
//# sourceMappingURL=languageClient.js.map