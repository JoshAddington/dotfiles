/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var childProc_1 = require('./../common/childProc');
var BaseFormatter = (function () {
    function BaseFormatter(id, outputChannel) {
        this.Id = id;
        this.outputChannel = outputChannel;
    }
    BaseFormatter.prototype.formatDocument = function (document, options, token) {
        return Promise.resolve([]);
    };
    BaseFormatter.prototype.provideDocumentFormattingEdits = function (document, options, token, cmdLine) {
        var _this = this;
        var fileDir = path.dirname(document.uri.fsPath);
        return new Promise(function (resolve, reject) {
            //Todo: Save the contents of the file to a temporary file and format that instead saving the actual file
            //This could unnecessarily trigger other behaviours
            document.save().then(function (saved) {
                var filePath = document.uri.fsPath;
                if (!fs.existsSync(filePath)) {
                    vscode.window.showErrorMessage("File " + filePath + " does not exist");
                    return resolve([]);
                }
                _this.outputChannel.clear();
                childProc_1.sendCommand(cmdLine, fileDir).then(function (data) {
                    var formattedText = data;
                    if (document.getText() === formattedText) {
                        return resolve([]);
                    }
                    var range = new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
                    var txtEdit = new vscode.TextEdit(range, formattedText);
                    resolve([txtEdit]);
                }, function (errorMsg) {
                    vscode.window.showErrorMessage("There was an error in formatting the document. View the Python output window for details.");
                    _this.outputChannel.appendLine(errorMsg);
                    return resolve([]);
                });
            });
        });
    };
    return BaseFormatter;
}());
exports.BaseFormatter = BaseFormatter;
//# sourceMappingURL=baseFormatter.js.map