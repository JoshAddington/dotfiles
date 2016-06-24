'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var sortProvider = require('./providers/importSortProvider');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var rootDir = context.asAbsolutePath(".");
    var disposable = vscode.commands.registerCommand('python.sortImports', function () {
        var activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            new sortProvider.PythonImportSortProvider().sortImports(rootDir, activeEditor.document).then(function (changes) {
                if (!Array.isArray(changes) || changes.length === 0) {
                    return;
                }
                activeEditor.edit(function (builder) {
                    builder.replace(changes[0].range, changes[0].newText);
                });
            });
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=sortImports.js.map