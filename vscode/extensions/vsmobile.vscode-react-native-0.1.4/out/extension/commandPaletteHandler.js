// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var vscode = require("vscode");
var Q = require("q");
var commandExecutor_1 = require("../common/commandExecutor");
var deviceHelper_1 = require("../common/android/deviceHelper");
var log_1 = require("../common/log/log");
var package_1 = require("../common/node/package");
var packageNameResolver_1 = require("../common/android/packageNameResolver");
var packagerStatusIndicator_1 = require("./packagerStatusIndicator");
var reactNativeProjectHelper_1 = require("../common/reactNativeProjectHelper");
var telemetryHelper_1 = require("../common/telemetryHelper");
var iOSDebugModeManager_1 = require("../common/ios/iOSDebugModeManager");
var CommandPaletteHandler = (function () {
    function CommandPaletteHandler(workspaceRoot, reactNativePackager, packagerStatusIndicator) {
        this.workspaceRoot = workspaceRoot;
        this.reactNativePackager = reactNativePackager;
        this.reactNativePackageStatusIndicator = packagerStatusIndicator;
    }
    /**
     * Starts the React Native packager
     */
    CommandPaletteHandler.prototype.startPackager = function () {
        var _this = this;
        return this.executeCommandInContext("startPackager", function () { return _this.reactNativePackager.start(); })
            .then(function () { return _this.reactNativePackageStatusIndicator.updatePackagerStatus(packagerStatusIndicator_1.PackagerStatus.PACKAGER_STARTED); });
    };
    /**
     * Kills the React Native packager invoked by the extension's packager
     */
    CommandPaletteHandler.prototype.stopPackager = function () {
        var _this = this;
        return this.executeCommandInContext("stopPackager", function () { return _this.reactNativePackager.stop(); })
            .then(function () { return _this.reactNativePackageStatusIndicator.updatePackagerStatus(packagerStatusIndicator_1.PackagerStatus.PACKAGER_STOPPED); });
    };
    /**
     * Executes the 'react-native run-android' command
     */
    CommandPaletteHandler.prototype.runAndroid = function () {
        var _this = this;
        /* If there are multiple devices available, the run-android command will install the application on each and then print a warning.
           The command will succeed but the application will not be launched on any device.
           We fix this behavior by checking if there are more than one devices available and running the application on each.  */
        return this.executeCommandInContext("runAndroid", function () { return _this.executeReactNativeRunCommand("run-android"); })
            .then(function () {
            var deviceHelper = new deviceHelper_1.DeviceHelper();
            var pkg = new package_1.Package(_this.workspaceRoot);
            return Q.all([
                pkg.name().then(function (appName) { return new packageNameResolver_1.PackageNameResolver(appName).resolvePackageName(_this.workspaceRoot); }),
                deviceHelper.getConnectedDevices(),
            ]).spread(function (packagName, devices) {
                if (devices.length > 1) {
                    var result_1 = Q(void 0);
                    /* if we have more than one device, launch the application on each */
                    devices.forEach(function (device) {
                        if (device.isOnline) {
                            result_1 = result_1.then(function () { return deviceHelper.launchApp(_this.workspaceRoot, packagName, device.id); });
                        }
                    });
                    return result_1;
                }
                else {
                    return Q.resolve(void 0);
                }
            });
        });
    };
    /**
     * Executes the 'react-native run-ios' command
     */
    CommandPaletteHandler.prototype.runIos = function () {
        var _this = this;
        return this.executeCommandInContext("runIos", function () {
            // Set the Debugging setting to disabled, because in iOS it's persisted across runs of the app
            return new iOSDebugModeManager_1.IOSDebugModeManager(_this.workspaceRoot).setSimulatorJSDebuggingModeSetting(/*enable=*/ false)
                .catch(function () { }) // If setting the debugging mode fails, we ignore the error and we run the run ios command anyways
                .then(function () { return _this.executeReactNativeRunCommand("run-ios"); });
        });
    };
    /**
     * Executes a react-native command passed after starting the packager
     * {command} The command to be executed
     * {args} The arguments to be passed to the command
     */
    CommandPaletteHandler.prototype.executeReactNativeRunCommand = function (command, args) {
        var _this = this;
        // Start the packager before executing the React-Native command
        log_1.Log.logMessage("Attempting to start the React Native packager");
        return this.reactNativePackager.start()
            .then(function () {
            return new commandExecutor_1.CommandExecutor(_this.workspaceRoot).spawnReactCommand(command, args).outcome;
        });
    };
    /**
     * Ensures that we are in a React Native project and then executes the operation
     * Otherwise, displays an error message banner
     * {operation} - a function that performs the expected operation
     */
    CommandPaletteHandler.prototype.executeCommandInContext = function (rnCommand, operation) {
        var reactNativeProjectHelper = new reactNativeProjectHelper_1.ReactNativeProjectHelper(vscode.workspace.rootPath);
        return telemetryHelper_1.TelemetryHelper.generate("RNCommand", function (generator) {
            generator.add("command", rnCommand, false);
            return reactNativeProjectHelper.isReactNativeProject().then(function (isRNProject) {
                generator.add("isRNProject", isRNProject, false);
                if (isRNProject) {
                    // Bring the log channel to focus
                    log_1.Log.setFocusOnLogChannel();
                    // Execute the operation
                    return operation();
                }
                else {
                    vscode.window.showErrorMessage("Current workspace is not a React Native project.");
                }
            });
        });
    };
    return CommandPaletteHandler;
}());
exports.CommandPaletteHandler = CommandPaletteHandler;

//# sourceMappingURL=commandPaletteHandler.js.map
