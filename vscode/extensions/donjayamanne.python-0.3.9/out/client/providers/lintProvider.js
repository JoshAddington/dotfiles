/*---------------------------------------------------------
 ** Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vscode = require('vscode');
var path = require('path');
var linter = require('../linters/baseLinter');
var prospector = require('./../linters/prospector');
var pylint = require('./../linters/pylint');
var pep8 = require('./../linters/pep8Linter');
var flake8 = require('./../linters/flake8');
var pydocstyle = require('./../linters/pydocstyle');
var FILE_PROTOCOL = "file:///";
function uriToPath(pathValue) {
    if (pathValue.startsWith(FILE_PROTOCOL)) {
        pathValue = pathValue.substring(FILE_PROTOCOL.length);
    }
    return path.normalize(decodeURIComponent(pathValue));
}
var lintSeverityToVSSeverity = new Map();
lintSeverityToVSSeverity.set(linter.LintMessageSeverity.Error, vscode.DiagnosticSeverity.Error);
lintSeverityToVSSeverity.set(linter.LintMessageSeverity.Hint, vscode.DiagnosticSeverity.Hint);
lintSeverityToVSSeverity.set(linter.LintMessageSeverity.Information, vscode.DiagnosticSeverity.Information);
lintSeverityToVSSeverity.set(linter.LintMessageSeverity.Warning, vscode.DiagnosticSeverity.Warning);
function createDiagnostics(message, txtDocumentLines) {
    var sourceLine = txtDocumentLines[message.line - 1];
    var sourceStart = sourceLine.substring(message.column - 1);
    var endCol = txtDocumentLines[message.line - 1].length;
    //try to get the first word from the startig position
    if (message.possibleWord === "string" && message.possibleWord.length > 0) {
        endCol = message.column + message.possibleWord.length;
    }
    var range = new vscode.Range(new vscode.Position(message.line - 1, message.column), new vscode.Position(message.line - 1, endCol));
    var severity = lintSeverityToVSSeverity.get(message.severity);
    return new vscode.Diagnostic(range, message.code + ":" + message.message, severity);
}
var LintProvider = (function (_super) {
    __extends(LintProvider, _super);
    function LintProvider(context, settings, outputChannel) {
        _super.call(this, function () { });
        this.linters = [];
        this.pendingLintings = new Map();
        this.outputChannel = outputChannel;
        this.context = context;
        this.settings = settings;
        this.initialize();
    }
    LintProvider.prototype.initialize = function () {
        var _this = this;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection("python");
        var disposables = [];
        this.linters.push(new prospector.Linter(this.context.asAbsolutePath("."), this.settings, this.outputChannel));
        this.linters.push(new pylint.Linter(this.context.asAbsolutePath("."), this.settings, this.outputChannel));
        this.linters.push(new pep8.Linter(this.context.asAbsolutePath("."), this.settings, this.outputChannel));
        this.linters.push(new flake8.Linter(this.context.asAbsolutePath("."), this.settings, this.outputChannel));
        this.linters.push(new pydocstyle.Linter(this.context.asAbsolutePath("."), this.settings, this.outputChannel));
        var disposable = vscode.workspace.onDidChangeTextDocument(function (e) {
            if (e.document.languageId !== "python" || !_this.settings.linting.enabled || !_this.settings.linting.lintOnTextChange) {
                return;
            }
            _this.lintDocument(e.document.uri, e.document.getText().split(/\r?\n/g), 1000);
        });
        this.context.subscriptions.push(disposable);
        disposable = vscode.workspace.onDidSaveTextDocument(function (e) {
            if (e.languageId !== "python" || !_this.settings.linting.enabled || !_this.settings.linting.lintOnSave) {
                return;
            }
            _this.lintDocument(e.uri, e.getText().split(/\r?\n/g), 100);
        });
        this.context.subscriptions.push(disposable);
    };
    LintProvider.prototype.lintDocument = function (documentUri, documentLines, delay) {
        var _this = this;
        //Since this is a hack, lets wait for 2 seconds before linting
        //Give user to continue typing before we waste CPU time
        if (this.lastTimeout) {
            clearTimeout(this.lastTimeout);
            this.lastTimeout = 0;
        }
        this.lastTimeout = setTimeout(function () {
            _this.onLintDocument(documentUri, documentLines);
        }, delay);
    };
    LintProvider.prototype.onLintDocument = function (documentUri, documentLines) {
        var _this = this;
        if (this.pendingLintings.has(documentUri.fsPath)) {
            this.pendingLintings.get(documentUri.fsPath).cancel();
            this.pendingLintings.delete(documentUri.fsPath);
        }
        var cancelToken = new vscode.CancellationTokenSource();
        cancelToken.token.onCancellationRequested(function () {
            if (_this.pendingLintings.has(documentUri.fsPath)) {
                _this.pendingLintings.delete(documentUri.fsPath);
            }
        });
        this.pendingLintings.set(documentUri.fsPath, cancelToken);
        var consolidatedMessages = [];
        var promises = [];
        this.linters.forEach(function (linter) {
            promises.push(linter.runLinter(documentUri.fsPath, documentLines).then(function (diagnostics) {
                consolidatedMessages = consolidatedMessages.concat(diagnostics);
            }));
        });
        Promise.all(promises).then(function () {
            if (cancelToken.token.isCancellationRequested) {
                return;
            }
            var messages = [];
            //Limit the number of messages to the max value
            consolidatedMessages = consolidatedMessages.filter(function (value, index) { return index <= _this.settings.linting.maxNumberOfProblems; });
            //Build the message and suffix the message with the name of the linter used
            consolidatedMessages.forEach(function (d) {
                d.message = d.message + " (" + d.provider + ")";
                messages.push(createDiagnostics(d, documentLines));
            });
            _this.diagnosticCollection.delete(documentUri);
            _this.diagnosticCollection.set(documentUri, messages);
        });
    };
    return LintProvider;
}(vscode.Disposable));
exports.LintProvider = LintProvider;
//# sourceMappingURL=lintProvider.js.map