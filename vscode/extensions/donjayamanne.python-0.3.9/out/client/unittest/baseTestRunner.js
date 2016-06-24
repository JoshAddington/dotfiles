'use strict';
var childProc_1 = require('./../common/childProc');
var vscode_1 = require('vscode');
var BaseTestRunner = (function () {
    function BaseTestRunner(id, pythonSettings, outputChannel, includeErrorAsResponse) {
        if (includeErrorAsResponse === void 0) { includeErrorAsResponse = false; }
        this.Id = id;
        this.pythonSettings = pythonSettings;
        this.outputChannel = outputChannel;
        this.includeErrorAsResponse = includeErrorAsResponse;
    }
    BaseTestRunner.prototype.runTests = function (filePath) {
        return Promise.resolve();
    };
    BaseTestRunner.prototype.run = function (commandLine) {
        var _this = this;
        var outputChannel = this.outputChannel;
        var linterId = this.Id;
        return new Promise(function (resolve, reject) {
            childProc_1.sendCommand(commandLine, vscode_1.workspace.rootPath, _this.includeErrorAsResponse).then(function (data) {
                outputChannel.append(data);
                outputChannel.show();
            }, function (error) {
                outputChannel.append(error);
                outputChannel.show();
            });
        });
    };
    return BaseTestRunner;
}());
exports.BaseTestRunner = BaseTestRunner;
//# sourceMappingURL=baseTestRunner.js.map