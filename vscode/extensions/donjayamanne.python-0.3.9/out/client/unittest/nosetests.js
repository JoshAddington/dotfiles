'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var baseTestRunner = require('./baseTestRunner');
var NoseTests = (function (_super) {
    __extends(NoseTests, _super);
    function NoseTests(pythonSettings, outputChannel) {
        _super.call(this, "nosetests", pythonSettings, outputChannel, true);
    }
    NoseTests.prototype.runTests = function (filePath) {
        var _this = this;
        if (filePath === void 0) { filePath = ""; }
        if (!this.pythonSettings.unitTest.nosetestsEnabled) {
            return Promise.resolve();
        }
        var nosetestsPath = this.pythonSettings.unitTest.nosetestPath;
        var cmdLine = nosetestsPath + " " + filePath;
        return new Promise(function (resolve) {
            _this.run(cmdLine).then(function (messages) {
                resolve(messages);
            });
        });
    };
    return NoseTests;
}(baseTestRunner.BaseTestRunner));
exports.NoseTests = NoseTests;
//# sourceMappingURL=nosetests.js.map