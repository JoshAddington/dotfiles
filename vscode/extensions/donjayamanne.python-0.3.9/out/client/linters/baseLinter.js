'use strict';
var childProc_1 = require('./../common/childProc');
var vscode_1 = require('vscode');
var NamedRegexp = null;
var REGEX = '(?<line>\\d+),(?<column>\\d+),(?<type>\\w+),(?<code>\\w\\d+):(?<message>.*)\\r?(\\n|$)';
(function (LintMessageSeverity) {
    LintMessageSeverity[LintMessageSeverity["Hint"] = 0] = "Hint";
    LintMessageSeverity[LintMessageSeverity["Error"] = 1] = "Error";
    LintMessageSeverity[LintMessageSeverity["Warning"] = 2] = "Warning";
    LintMessageSeverity[LintMessageSeverity["Information"] = 3] = "Information";
})(exports.LintMessageSeverity || (exports.LintMessageSeverity = {}));
var LintMessageSeverity = exports.LintMessageSeverity;
function matchNamedRegEx(data, regex) {
    if (NamedRegexp === null) {
        NamedRegexp = require('named-js-regexp');
    }
    var compiledRegexp = NamedRegexp(regex, "g");
    var rawMatch = compiledRegexp.exec(data);
    if (rawMatch !== null) {
        return rawMatch.groups();
    }
    return null;
}
exports.matchNamedRegEx = matchNamedRegEx;
var BaseLinter = (function () {
    function BaseLinter(id, pythonSettings, outputChannel) {
        this.Id = id;
        this.pythonSettings = pythonSettings;
        this.outputChannel = outputChannel;
    }
    BaseLinter.prototype.runLinter = function (filePath, txtDocumentLines) {
        return Promise.resolve([]);
    };
    BaseLinter.prototype.run = function (commandLine, filePath, txtDocumentLines, cwd, regEx) {
        var _this = this;
        if (regEx === void 0) { regEx = REGEX; }
        var outputChannel = this.outputChannel;
        var linterId = this.Id;
        return new Promise(function (resolve, reject) {
            childProc_1.sendCommand(commandLine, cwd, true).then(function (data) {
                outputChannel.clear();
                outputChannel.append(data);
                var outputLines = data.split(/\r?\n/g);
                var diagnostics = [];
                outputLines.filter(function (value, index) { return index <= _this.pythonSettings.linting.maxNumberOfProblems; }).forEach(function (line) {
                    var match = matchNamedRegEx(line, regEx);
                    if (match == null) {
                        return;
                    }
                    try {
                        match.line = Number(match.line);
                        match.column = Number(match.column);
                        var sourceLine = txtDocumentLines[match.line - 1];
                        var sourceStart = sourceLine.substring(match.column - 1);
                        var endCol = txtDocumentLines[match.line - 1].length;
                        //try to get the first word from the startig position
                        var possibleProblemWords = sourceStart.match(/\w+/g);
                        var possibleWord;
                        if (possibleProblemWords != null && possibleProblemWords.length > 0 && sourceStart.startsWith(possibleProblemWords[0])) {
                            possibleWord = possibleProblemWords[0];
                        }
                        diagnostics.push({
                            code: match.code,
                            message: match.message,
                            column: match.column,
                            line: match.line,
                            possibleWord: possibleWord,
                            type: match.type,
                            provider: _this.Id
                        });
                    }
                    catch (ex) {
                        //Hmm, need to handle this later
                        var y = "";
                    }
                });
                resolve(diagnostics);
            }, function (error) {
                outputChannel.appendLine("Linting with " + linterId + " failed. If not installed please turn if off in settings.\n " + error);
                vscode_1.window.showInformationMessage("Linting with " + linterId + " failed. If not installed please turn if off in settings. View Python output for details.");
            });
        });
    };
    return BaseLinter;
}());
exports.BaseLinter = BaseLinter;
//# sourceMappingURL=baseLinter.js.map