'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var baseLinter = require('./baseLinter');
var vscode_1 = require('vscode');
var PEP_COMMANDLINE = " --format='%(row)d,%(col)d,%(code)s,%(code)s:%(text)s'";
var Linter = (function (_super) {
    __extends(Linter, _super);
    function Linter(rootDir, pythonSettings, outputChannel) {
        _super.call(this, "pep8", pythonSettings, outputChannel);
    }
    Linter.prototype.runLinter = function (filePath, txtDocumentLines) {
        var _this = this;
        if (!this.pythonSettings.linting.pep8Enabled) {
            return Promise.resolve([]);
        }
        var pep8Path = this.pythonSettings.linting.pep8Path;
        var cmdLine = pep8Path + " " + PEP_COMMANDLINE + " \"" + filePath + "\"";
        return new Promise(function (resolve) {
            _this.run(cmdLine, filePath, txtDocumentLines, vscode_1.workspace.rootPath).then(function (messages) {
                //All messages in pep8 are treated as warnings for now
                messages.forEach(function (msg) {
                    msg.severity = baseLinter.LintMessageSeverity.Information;
                });
                resolve(messages);
            });
        });
    };
    return Linter;
}(baseLinter.BaseLinter));
exports.Linter = Linter;
//# sourceMappingURL=pep8Linter.js.map