'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var completionProvider_1 = require('./providers/completionProvider');
var hoverProvider_1 = require('./providers/hoverProvider');
var definitionProvider_1 = require('./providers/definitionProvider');
var referenceProvider_1 = require('./providers/referenceProvider');
var renameProvider_1 = require('./providers/renameProvider');
var formatProvider_1 = require('./providers/formatProvider');
var sortImports = require('./sortImports');
var lintProvider_1 = require('./providers/lintProvider');
var symbolProvider_1 = require('./providers/symbolProvider');
var formatOnSaveProvider_1 = require('./providers/formatOnSaveProvider');
var settings = require('./common/configSettings');
var testProvider_1 = require('./providers/testProvider');
// import {PythonSignatureHelpProvider} from './providers/signatureProvider';
var PYTHON = { language: 'python', scheme: 'file' };
var unitTestOutChannel;
var formatOutChannel;
var lintingOutChannel;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var rootDir = context.asAbsolutePath(".");
    var pythonSettings = new settings.PythonSettings();
    unitTestOutChannel = vscode.window.createOutputChannel(pythonSettings.unitTest.outputWindow);
    unitTestOutChannel.clear();
    formatOutChannel = vscode.window.createOutputChannel(pythonSettings.formatting.outputWindow);
    formatOutChannel.clear();
    lintingOutChannel = vscode.window.createOutputChannel(pythonSettings.linting.outputWindow);
    lintingOutChannel.clear();
    sortImports.activate(context);
    testProvider_1.activateUnitTestProvider(context, pythonSettings, unitTestOutChannel);
    formatOnSaveProvider_1.activateFormatOnSaveProvider(PYTHON, context, pythonSettings, formatOutChannel);
    //Enable indentAction
    vscode.languages.setLanguageConfiguration(PYTHON.language, {
        onEnterRules: [
            {
                beforeText: /^\s*(?:def|class|for|if|elif|else|while|try|with|finally).*?:\s*$/,
                action: { indentAction: vscode.IndentAction.Indent }
            }
        ]
    });
    context.subscriptions.push(vscode.languages.registerRenameProvider(PYTHON, new renameProvider_1.PythonRenameProvider(context)));
    context.subscriptions.push(vscode.languages.registerHoverProvider(PYTHON, new hoverProvider_1.PythonHoverProvider(context)));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(PYTHON, new definitionProvider_1.PythonDefinitionProvider(context)));
    context.subscriptions.push(vscode.languages.registerReferenceProvider(PYTHON, new referenceProvider_1.PythonReferenceProvider(context)));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(PYTHON, new completionProvider_1.PythonCompletionItemProvider(context), '.'));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(PYTHON, new symbolProvider_1.PythonSymbolProvider(context)));
    // context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(PYTHON, new PythonSignatureHelpProvider(context), '('));
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(PYTHON, new formatProvider_1.PythonFormattingEditProvider(context, pythonSettings, formatOutChannel)));
    context.subscriptions.push(new lintProvider_1.LintProvider(context, pythonSettings, lintingOutChannel));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map