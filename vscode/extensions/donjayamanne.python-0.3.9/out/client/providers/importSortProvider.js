/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var PythonImportSortProvider = (function () {
    function PythonImportSortProvider() {
    }
    PythonImportSortProvider.prototype.sortImports = function (extensionDir, document) {
        return new Promise(function (resolve, reject) {
            var filePath = document.uri.fsPath;
            var importScript = path.join(extensionDir, "pythonFiles", "sortImports.py");
            if (!fs.existsSync(filePath)) {
                vscode.window.showErrorMessage("File " + filePath + " does not exist");
                return resolve([]);
            }
            var ext = path.extname(filePath);
            var tmp = require("tmp");
            tmp.file({ postfix: ext }, function _tempFileCreated(err, tmpFilePath, fd) {
                if (err) {
                    reject(err);
                    return;
                }
                var documentText = document.getText();
                fs.writeFile(tmpFilePath, documentText, function (ex) {
                    if (ex) {
                        vscode.window.showErrorMessage("Failed to create a temporary file, " + ex.message);
                        return;
                    }
                    child_process.exec("python \"" + importScript + "\" \"" + tmpFilePath + "\"", function (error, stdout, stderr) {
                        if (error || stderr) {
                            vscode.window.showErrorMessage("File " + filePath + " does not exist");
                            return resolve([]);
                        }
                        fs.readFile(tmpFilePath, function (ex, data) {
                            if (ex) {
                                vscode.window.showErrorMessage("Failed to create a temporary file for sorting, " + ex.message);
                                return;
                            }
                            var formattedText = data.toString('utf-8');
                            //Nothing to do 
                            if (document.getText() === formattedText) {
                                return resolve([]);
                            }
                            var range = new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
                            var txtEdit = new vscode.TextEdit(range, formattedText);
                            resolve([txtEdit]);
                        });
                    });
                });
            });
        });
    };
    return PythonImportSortProvider;
}());
exports.PythonImportSortProvider = PythonImportSortProvider;
//# sourceMappingURL=importSortProvider.js.map