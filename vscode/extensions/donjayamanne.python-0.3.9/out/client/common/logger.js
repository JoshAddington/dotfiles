"use strict";
var vscode = require('vscode');
var settings = require('./configSettings');
var outChannel;
var pythonSettings;
var Logger = (function () {
    function Logger() {
    }
    Logger.initializeChannel = function () {
        if (pythonSettings)
            return;
        pythonSettings = new settings.PythonSettings();
        if (pythonSettings.devOptions.indexOf("DEBUG") >= 0) {
            outChannel = vscode.window.createOutputChannel('PythonExtLog');
        }
    };
    Logger.write = function (category, title, message) {
        if (category === void 0) { category = "log"; }
        if (title === void 0) { title = ""; }
        Logger.initializeChannel();
        if (title.length > 0) {
            Logger.writeLine(category, "---------------------------");
            Logger.writeLine(category, title);
        }
        Logger.writeLine(category, message);
    };
    Logger.writeLine = function (category, line) {
        if (category === void 0) { category = "log"; }
        console[category](line);
        if (outChannel) {
            outChannel.appendLine(line);
        }
    };
    return Logger;
}());
function error(title, message) {
    if (title === void 0) { title = ""; }
    Logger.write.apply(Logger, ["error", title, message]);
}
exports.error = error;
function warn(title, message) {
    if (title === void 0) { title = ""; }
    Logger.write.apply(Logger, ["warn", title, message]);
}
exports.warn = warn;
function log(title, message) {
    if (title === void 0) { title = ""; }
    Logger.write.apply(Logger, ["log", title, message]);
}
exports.log = log;
//# sourceMappingURL=logger.js.map