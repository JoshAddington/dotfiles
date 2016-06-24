'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var baseLinter = require('./baseLinter');
var vscode_1 = require('vscode');
var PROSPECTOR_COMMANDLINE = " --output-format=vscode";
var REGEX = '(?<line>\\d+),(?<column>\\d+),(?<type>[\\w-]+),(?<code>[\\w-]+):(?<message>.*)\\r?(\\n|$)';
var Linter = (function (_super) {
    __extends(Linter, _super);
    function Linter(rootDir, pythonSettings, outputChannel) {
        _super.call(this, "prospector", pythonSettings, outputChannel);
    }
    Linter.prototype.runLinter = function (filePath, txtDocumentLines) {
        var _this = this;
        if (!this.pythonSettings.linting.prospectorEnabled) {
            return Promise.resolve([]);
        }
        var prospectorPath = this.pythonSettings.linting.prospectorPath;
        var prospectorSourcePath = this.pythonSettings.linting.prospectorSourcePath;
        var prospectorExtraCommands = this.pythonSettings.linting.prospectorExtraCommands;
        // prospector works best with relative path
        var fileName = filePath.replace(path.join(vscode_1.workspace.rootPath, prospectorSourcePath, '/'), '');
        var cmdLine = prospectorPath + " " + PROSPECTOR_COMMANDLINE + " " + prospectorExtraCommands + " \"" + fileName + "\"";
        return new Promise(function (resolve, reject) {
            _this.run(cmdLine, filePath, txtDocumentLines, path.join(vscode_1.workspace.rootPath, prospectorSourcePath), REGEX).then(function (messages) {
                //All messages in prospector are treated as warn, ings for now
                messages.forEach(function (msg) {
                    msg.severity = baseLinter.LintMessageSeverity.Information;
                });
                resolve(messages);
            }, reject);
        });
    };
    return Linter;
}(baseLinter.BaseLinter));
exports.Linter = Linter;
//# sourceMappingURL=prospector.js.map