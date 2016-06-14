'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var baseTestRunner = require('./baseTestRunner');
var PythonUnitTest = (function (_super) {
    __extends(PythonUnitTest, _super);
    function PythonUnitTest(pythonSettings, outputChannel) {
        _super.call(this, "unittest", pythonSettings, outputChannel, true);
    }
    PythonUnitTest.prototype.runTests = function (filePath) {
        var _this = this;
        if (filePath === void 0) { filePath = ""; }
        if (!this.pythonSettings.unitTest.unittestEnabled) {
            return Promise.resolve();
        }
        var ptyhonPath = this.pythonSettings.pythonPath;
        var unittestPath = " unittest";
        var cmdLine = "";
        if (typeof filePath !== "string" || filePath.length === 0) {
            cmdLine = ptyhonPath + " -m unittest discover";
        }
        else {
            cmdLine = ptyhonPath + " -m unittest " + filePath;
        }
        return new Promise(function (resolve) {
            _this.run(cmdLine).then(function (messages) {
                resolve(messages);
            });
        });
    };
    return PythonUnitTest;
}(baseTestRunner.BaseTestRunner));
exports.PythonUnitTest = PythonUnitTest;
//# sourceMappingURL=unittest.js.map