/*---------------------------------------------------------
 ** Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode_languageserver_1 = require('vscode-languageserver');
var path = require('path');
var child_process_1 = require('child_process');
// const REGEX = '(?<line>\\d+),(?<col>\\d+),(?<type>\\w+),(\\w\\d+):(?<message>.*)\\r?(\\n|$)';
var NamedRegexp = null;
function matchNamedRegEx(data, regex) {
    if (NamedRegexp === null) {
        NamedRegexp = require('named-js-regexp');
        compiledRegexp = NamedRegexp(regex, "g");
    }
    var rawMatch = compiledRegexp.exec(data);
    if (rawMatch !== null) {
        return rawMatch.groups();
    }
    return null;
}
var compiledRegexp;
var REGEX = '(?<line>\\d+),(?<column>\\d+),(?<type>\\w+),(?<code>\\w\\d+):(?<message>.*)\\r?(\\n|$)';
var FILE_PROTOCOL = "file:///";
var PYLINT_COMMANDLINE = " --msg-template='{line},{column},{category},{msg_id}:{msg}' --reports=n --output-format=text";
var PEP_COMMANDLINE = " --format='%(row)d,%(col)d,%(code)s,%(code)s:%(text)s'";
var PYLINT_CATEGORY_MAPPING = {};
PYLINT_CATEGORY_MAPPING["refactor"] = vscode_languageserver_1.DiagnosticSeverity.Hint;
PYLINT_CATEGORY_MAPPING["convention"] = vscode_languageserver_1.DiagnosticSeverity.Hint;
PYLINT_CATEGORY_MAPPING["warning"] = vscode_languageserver_1.DiagnosticSeverity.Warning;
PYLINT_CATEGORY_MAPPING["error"] = vscode_languageserver_1.DiagnosticSeverity.Error;
PYLINT_CATEGORY_MAPPING["fatal"] = vscode_languageserver_1.DiagnosticSeverity.Error;
function uriToPath(pathValue) {
    if (pathValue.startsWith(FILE_PROTOCOL)) {
        pathValue = pathValue.substring(FILE_PROTOCOL.length);
    }
    return path.normalize(decodeURIComponent(pathValue));
}
function getEnumValue(name) {
    return vscode_languageserver_1.DiagnosticSeverity[name];
}
var Linter = (function () {
    function Linter() {
    }
    Linter.prototype.run = function (textDocument, settings, isPep8) {
        PYLINT_CATEGORY_MAPPING["convention"] = getEnumValue(settings.linting.pylintCategorySeverity.convention);
        PYLINT_CATEGORY_MAPPING["refactor"] = getEnumValue(settings.linting.pylintCategorySeverity.refactor);
        PYLINT_CATEGORY_MAPPING["warning"] = getEnumValue(settings.linting.pylintCategorySeverity.warning);
        PYLINT_CATEGORY_MAPPING["error"] = getEnumValue(settings.linting.pylintCategorySeverity.error);
        PYLINT_CATEGORY_MAPPING["fatal"] = getEnumValue(settings.linting.pylintCategorySeverity.fatal);
        var filePath = uriToPath(textDocument.uri);
        var txtDocumentLines = textDocument.getText().split(/\r?\n/g);
        var dir = path.dirname(filePath);
        var maxNumberOfProblems = settings.linting.maxNumberOfProblems;
        var lintPath = isPep8 ? settings.linting.pep8Path : settings.linting.pylintPath;
        var lintArgs = isPep8 ? PEP_COMMANDLINE : PYLINT_COMMANDLINE;
        var cmd = lintPath + " " + lintArgs + " " + filePath;
        if (NamedRegexp === null) {
            NamedRegexp = require('named-js-regexp');
            compiledRegexp = NamedRegexp(REGEX, "g");
        }
        return new Promise(function (resolve, reject) {
            var dir = path.dirname(filePath);
            //var cmd: string = `${PYLINT_COMMANDLINE} ${filePath}`;
            child_process_1.exec(cmd, { cwd: dir }, function (error, stdout, stderr) {
                var outputLines = (stdout || "").split(/\r?\n/g);
                if (outputLines.length === 0 || outputLines[0] === "") {
                    var errorMessages = [];
                    if (error && error.message) {
                        errorMessages.push("Error Message (" + error.name + ") : " + error.message);
                    }
                    if (stderr && stderr.length > 0) {
                        errorMessages.push(stderr + '');
                    }
                    if (errorMessages.length === 0) {
                        return resolve([]);
                    }
                    var msg = "";
                    if (isPep8) {
                        msg = "If Pep8 isn't used an not installed, you can turn its usage off from the setting 'python.linting.pep8Enabled'." +
                            "If Pep8 is used, but cannot be located, then configure the path in 'python.linting.pep8Path'";
                    }
                    else {
                        msg = "If Pep8 isn't used an not installed, you can turn its usage off from the setting 'python.linting.pep8Enabled'." +
                            "If Pep8 is used, but cannot be located, then configure the path in 'python.linting.pep8Path'";
                    }
                    msg = msg + "\n" + errorMessages.join("\n");
                    console.error(msg);
                    return resolve([]);
                }
                var diagnostics = [];
                outputLines.forEach(function (line) {
                    if (diagnostics.length >= maxNumberOfProblems) {
                        return;
                    }
                    var match = matchNamedRegEx(line, REGEX);
                    if (match == null) {
                        return;
                    }
                    try {
                        match.line = parseInt(match.line);
                        match.column = parseInt(match.column);
                        var sourceLine = txtDocumentLines[match.line - 1];
                        var sourceStart = sourceLine.substring(match.column - 1);
                        var endCol = txtDocumentLines[match.line - 1].length;
                        //try to get the first word from the startig position
                        var possibleProblemWords = sourceStart.match(/\w+/g);
                        if (possibleProblemWords != null && possibleProblemWords.length > 0 && sourceStart.startsWith(possibleProblemWords[0])) {
                            endCol = match.column + possibleProblemWords[0].length;
                        }
                        var range = vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(match.line - 1, match.column), vscode_languageserver_1.Position.create(match.line - 1, endCol));
                        var severity = isPep8 ? vscode_languageserver_1.DiagnosticSeverity.Information : PYLINT_CATEGORY_MAPPING[match.type];
                        diagnostics.push(vscode_languageserver_1.Diagnostic.create(range, match.code + ":" + match.message, severity));
                    }
                    catch (ex) {
                        var y = "";
                    }
                });
                resolve(diagnostics);
            });
        });
    };
    return Linter;
}());
exports.Linter = Linter;
//# sourceMappingURL=pylint.js.map