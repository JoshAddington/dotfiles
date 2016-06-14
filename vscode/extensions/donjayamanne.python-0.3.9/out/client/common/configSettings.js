'use strict';
var vscode = require('vscode');
var PythonSettings = (function () {
    function PythonSettings() {
        var _this = this;
        vscode.workspace.onDidChangeConfiguration(function () {
            _this.initializeSettings();
        });
        this.initializeSettings();
    }
    PythonSettings.prototype.initializeSettings = function () {
        var pythonSettings = vscode.workspace.getConfiguration("python");
        this.pythonPath = pythonSettings.get("pythonPath");
        this.devOptions = pythonSettings.get("devOptions");
        this.devOptions = Array.isArray(this.devOptions) ? this.devOptions : [];
        var lintingSettings = pythonSettings.get("linting");
        if (this.linting) {
            Object.assign(this.linting, lintingSettings);
        }
        else {
            this.linting = lintingSettings;
        }
        var formattingSettings = pythonSettings.get("formatting");
        if (this.formatting) {
            Object.assign(this.formatting, formattingSettings);
        }
        else {
            this.formatting = formattingSettings;
        }
        var autoCompleteSettings = pythonSettings.get("autoComplete");
        if (this.autoComplete) {
            Object.assign(this.autoComplete, autoCompleteSettings);
        }
        else {
            this.autoComplete = autoCompleteSettings;
        }
        var unitTestSettings = pythonSettings.get("unitTest");
        if (this.unitTest) {
            Object.assign(this.unitTest, unitTestSettings);
        }
        else {
            this.unitTest = unitTestSettings;
        }
    };
    return PythonSettings;
}());
exports.PythonSettings = PythonSettings;
//# sourceMappingURL=configSettings.js.map