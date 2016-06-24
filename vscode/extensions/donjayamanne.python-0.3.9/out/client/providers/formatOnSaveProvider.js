'use strict';
//Solution for auto-formatting borrowed from the "go" language VSCode extension.
var vscode = require('vscode');
var yapfFormatter_1 = require('./../formatters/yapfFormatter');
var autoPep8Formatter_1 = require('./../formatters/autoPep8Formatter');
function activateFormatOnSaveProvider(languageFilter, context, settings, outputChannel) {
    var rootDir = context.asAbsolutePath(".");
    var formatters = new Map();
    var pythonSettings = settings;
    var yapfFormatter = new yapfFormatter_1.YapfFormatter(settings, outputChannel);
    var autoPep8 = new autoPep8Formatter_1.AutoPep8Formatter(settings, outputChannel);
    formatters.set(yapfFormatter.Id, yapfFormatter);
    formatters.set(autoPep8.Id, autoPep8);
    // TODO: This is really ugly.  I'm not sure we can do better until
    // Code supports a pre-save event where we can do the formatting before
    // the file is written to disk.	
    var ignoreNextSave = new WeakSet();
    var subscription = vscode.workspace.onDidSaveTextDocument(function (document) {
        if (document.languageId !== languageFilter.language || ignoreNextSave.has(document)) {
            return;
        }
        var textEditor = vscode.window.activeTextEditor;
        if (pythonSettings.formatting.formatOnSave && textEditor.document === document) {
            var formatter = formatters.get(pythonSettings.formatting.provider);
            formatter.formatDocument(document, null, null).then(function (edits) {
                return textEditor.edit(function (editBuilder) {
                    edits.forEach(function (edit) { return editBuilder.replace(edit.range, edit.newText); });
                });
            }).then(function (applied) {
                ignoreNextSave.add(document);
                return document.save();
            }).then(function () {
                ignoreNextSave.delete(document);
            }, function () {
                // Catch any errors and ignore so that we still trigger 
                // the file save.
            });
        }
    }, null, null);
    context.subscriptions.push(subscription);
}
exports.activateFormatOnSaveProvider = activateFormatOnSaveProvider;
//# sourceMappingURL=formatOnSaveProvider.js.map