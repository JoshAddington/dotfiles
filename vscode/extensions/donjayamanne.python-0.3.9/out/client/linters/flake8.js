'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var baseLinter = require('./baseLinter');
var vscode_1 = require('vscode');
var FLAKE8_COMMANDLINE = " --format='%(row)d,%(col)d,%(code)s,%(code)s:%(text)s'";
var Linter = (function (_super) {
    __extends(Linter, _super);
    function Linter(rootDir, pythonSettings, outputChannel) {
        _super.call(this, "flake8", pythonSettings, outputChannel);
    }
    Linter.prototype.runLinter = function (filePath, txtDocumentLines) {
        var _this = this;
        if (!this.pythonSettings.linting.flake8Enabled) {
            return Promise.resolve([]);
        }
        var flake8Path = this.pythonSettings.linting.flake8Path;
        var cmdLine = flake8Path + " " + FLAKE8_COMMANDLINE + " \"" + filePath + "\"";
        return new Promise(function (resolve, reject) {
            _this.run(cmdLine, filePath, txtDocumentLines, vscode_1.workspace.rootPath).then(function (messages) {
                //All messages in pep8 are treated as warnings for now
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
//# sourceMappingURL=flake8.js.map