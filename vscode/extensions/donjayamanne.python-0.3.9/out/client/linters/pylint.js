'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var baseLinter = require('./baseLinter');
var vscode_1 = require('vscode');
var PYLINT_COMMANDLINE = " --msg-template='{line},{column},{category},{msg_id}:{msg}' --reports=n --output-format=text";
var Linter = (function (_super) {
    __extends(Linter, _super);
    function Linter(rootDir, pythonSettings, outputChannel) {
        _super.call(this, "pylint", pythonSettings, outputChannel);
    }
    Linter.prototype.parseMessagesSeverity = function (category) {
        if (this.pythonSettings.linting.pylintCategorySeverity[category]) {
            var severityName = this.pythonSettings.linting.pylintCategorySeverity[category];
            if (baseLinter.LintMessageSeverity[severityName]) {
                return baseLinter.LintMessageSeverity[severityName];
            }
        }
        return baseLinter.LintMessageSeverity.Information;
    };
    Linter.prototype.runLinter = function (filePath, txtDocumentLines) {
        var _this = this;
        if (!this.pythonSettings.linting.pylintEnabled) {
            return Promise.resolve([]);
        }
        var pylintPath = this.pythonSettings.linting.pylintPath;
        var cmdLine = pylintPath + " " + PYLINT_COMMANDLINE + " \"" + filePath + "\"";
        return new Promise(function (resolve, reject) {
            _this.run(cmdLine, filePath, txtDocumentLines, vscode_1.workspace.rootPath).then(function (messages) {
                messages.forEach(function (msg) {
                    msg.severity = _this.parseMessagesSeverity(msg.type);
                });
                resolve(messages);
            }, reject);
        });
    };
    return Linter;
}(baseLinter.BaseLinter));
exports.Linter = Linter;
//# sourceMappingURL=pylint.js.map