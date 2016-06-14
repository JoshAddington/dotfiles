'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var baseLinter = require('./baseLinter');
var vscode_1 = require('vscode');
var childProc_1 = require('./../common/childProc');
var Linter = (function (_super) {
    __extends(Linter, _super);
    function Linter(rootDir, pythonSettings, outputChannel) {
        _super.call(this, "pydocstyle", pythonSettings, outputChannel);
    }
    Linter.prototype.runLinter = function (filePath, txtDocumentLines) {
        var _this = this;
        if (!this.pythonSettings.linting.pydocstyleEnabled) {
            return Promise.resolve([]);
        }
        var pydocStylePath = this.pythonSettings.linting.pydocStylePath;
        var cmdLine = pydocStylePath + " \"" + filePath + "\"";
        return new Promise(function (resolve) {
            _this.run(cmdLine, filePath, txtDocumentLines).then(function (messages) {
                //All messages in pep8 are treated as warnings for now
                messages.forEach(function (msg) {
                    msg.severity = baseLinter.LintMessageSeverity.Information;
                });
                resolve(messages);
            });
        });
    };
    Linter.prototype.run = function (commandLine, filePath, txtDocumentLines) {
        var _this = this;
        var outputChannel = this.outputChannel;
        var linterId = this.Id;
        return new Promise(function (resolve, reject) {
            var fileDir = path.dirname(filePath);
            childProc_1.sendCommand(commandLine, fileDir, true).then(function (data) {
                outputChannel.clear();
                outputChannel.append(data);
                var outputLines = data.split(/\r?\n/g);
                var diagnostics = [];
                var baseFileName = path.basename(filePath);
                //Remember, the first line of the response contains the file name and line number, the next line contains the error message
                //So we have two lines per message, hence we need to take lines in pairs
                var maxLines = _this.pythonSettings.linting.maxNumberOfProblems * 2;
                //First line is almost always empty
                while (outputLines.length > 0 && outputLines[0].trim().length === 0) {
                    outputLines.splice(0, 1);
                }
                outputLines = outputLines.filter(function (value, index) { return index < maxLines; });
                //Iterate through the lines (skipping the messages)
                //So, just iterate the response in pairs
                for (var counter = 0; counter < outputLines.length; counter = counter + 2) {
                    try {
                        var line = outputLines[counter];
                        if (line.trim().length === 0) {
                            continue;
                        }
                        var messageLine = outputLines[counter + 1];
                        var lineNumber = parseInt(line.substring(line.indexOf(baseFileName) + baseFileName.length + 1));
                        var code = messageLine.substring(0, messageLine.indexOf(":")).trim();
                        var message = messageLine.substring(messageLine.indexOf(":") + 1).trim();
                        var sourceLine = txtDocumentLines[lineNumber - 1];
                        var trmmedSourceLine = sourceLine.trim();
                        var sourceStart = sourceLine.indexOf(trmmedSourceLine);
                        var endCol = sourceStart + trmmedSourceLine.length;
                        diagnostics.push({
                            code: code,
                            message: message,
                            column: sourceStart,
                            line: lineNumber,
                            type: "",
                            provider: _this.Id
                        });
                    }
                    catch (ex) {
                        //Hmm, need to handle this later
                        var y = "";
                    }
                }
                resolve(diagnostics);
            }, function (error) {
                outputChannel.appendLine("Linting with " + linterId + " failed. If not installed please turn if off in settings.\n " + error);
                vscode_1.window.showInformationMessage("Linting with " + linterId + " failed. If not installed please turn if off in settings. View Python output for details.");
            });
        });
    };
    return Linter;
}(baseLinter.BaseLinter));
exports.Linter = Linter;
//# sourceMappingURL=pydocstyle.js.map