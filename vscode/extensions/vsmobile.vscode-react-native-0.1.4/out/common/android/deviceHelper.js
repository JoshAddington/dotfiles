// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var childProcess_1 = require("../node/childProcess");
var commandExecutor_1 = require("../commandExecutor");
var DeviceHelper = (function () {
    function DeviceHelper() {
    }
    /**
     * Gets the list of Android connected devices and emulators.
     */
    DeviceHelper.prototype.getConnectedDevices = function () {
        var _this = this;
        var childProcess = new childProcess_1.ChildProcess();
        return childProcess.execToString("adb devices")
            .then(function (output) {
            return _this.parseConnectedDevices(output);
        });
    };
    /**
     * Broadcasts an intent to reload the application in debug mode.
     */
    DeviceHelper.prototype.reloadAppInDebugMode = function (projectRoot, packageName, debugTarget) {
        var enableDebugCommand = "adb " + (debugTarget ? "-s " + debugTarget : "") + " shell am broadcast -a \"" + packageName + ".RELOAD_APP_ACTION\" --ez jsproxy true";
        return new commandExecutor_1.CommandExecutor(projectRoot).execute(enableDebugCommand);
    };
    /**
     * Sends an intent which launches the main activity of the application.
     */
    DeviceHelper.prototype.launchApp = function (projectRoot, packageName, debugTarget) {
        var launchAppCommand = "adb -s " + debugTarget + " shell am start -n " + packageName + "/.MainActivity";
        return new commandExecutor_1.CommandExecutor(projectRoot).execute(launchAppCommand);
    };
    DeviceHelper.prototype.parseConnectedDevices = function (input) {
        var result = [];
        var regex = new RegExp("^(\\S+)\\t(\\S+)$", "mg");
        var match = regex.exec(input);
        while (match != null) {
            result.push({ id: match[1], isOnline: match[2] === "device" });
            match = regex.exec(input);
        }
        return result;
    };
    return DeviceHelper;
}());
exports.DeviceHelper = DeviceHelper;

//# sourceMappingURL=deviceHelper.js.map
