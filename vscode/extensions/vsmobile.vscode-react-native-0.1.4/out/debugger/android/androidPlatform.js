// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var Q = require("q");
var extensionMessaging_1 = require("../../common/extensionMessaging");
var log_1 = require("../../common/log/log");
var packageNameResolver_1 = require("../../common/android/packageNameResolver");
var outputVerifier_1 = require("../../common/outputVerifier");
var deviceHelper_1 = require("../../common/android/deviceHelper");
var package_1 = require("../../common/node/package");
var fileSystem_1 = require("../../common/node/fileSystem");
var reactNative_1 = require("../../common/reactNative");
/**
 * Android specific platform implementation for debugging RN applications.
 */
var AndroidPlatform = (function () {
    function AndroidPlatform(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.extensionMessageSender, extensionMessageSender = _c === void 0 ? new extensionMessaging_1.ExtensionMessageSender() : _c, _d = _b.deviceHelper, deviceHelper = _d === void 0 ? new deviceHelper_1.DeviceHelper() : _d, _e = _b.reactNative, reactNative = _e === void 0 ? new reactNative_1.ReactNative() : _e, _f = _b.fileSystem, fileSystem = _f === void 0 ? new fileSystem_1.FileSystem() : _f;
        this.extensionMessageSender = extensionMessageSender;
        this.deviceHelper = deviceHelper;
        this.reactNative = reactNative;
        this.fileSystem = fileSystem;
    }
    AndroidPlatform.prototype.runApp = function (runOptions) {
        var _this = this;
        var runAndroidSpawn = this.reactNative.runAndroid(runOptions.projectRoot);
        var output = new outputVerifier_1.OutputVerifier(function () {
            return Q(AndroidPlatform.RUN_ANDROID_SUCCESS_PATTERNS);
        }, function () {
            return Q(AndroidPlatform.RUN_ANDROID_FAILURE_PATTERNS);
        }).process(runAndroidSpawn);
        return output
            .finally(function () {
            return _this.deviceHelper.getConnectedDevices().then(function (devices) {
                _this.devices = devices;
                _this.debugTarget = _this.getTargetEmulator(runOptions, devices);
                return _this.getPackageName(runOptions.projectRoot).then(function (packageName) {
                    return _this.packageName = packageName;
                });
            });
        }).catch(function (reason) {
            if (reason.message === AndroidPlatform.MULTIPLE_DEVICES_ERROR && _this.devices.length > 1 && _this.debugTarget) {
                /* If it failed due to multiple devices, we'll apply this workaround to make it work anyways */
                return _this.deviceHelper.launchApp(runOptions.projectRoot, _this.packageName, _this.debugTarget);
            }
            else {
                return Q.reject(reason);
            }
        }).then(function () {
            return _this.startMonitoringLogCat(runOptions.logCatArguments).catch(function (error) {
                return log_1.Log.logWarning("Couldn't start LogCat monitor", error);
            });
        });
    };
    AndroidPlatform.prototype.enableJSDebuggingMode = function (runOptions) {
        return this.deviceHelper.reloadAppInDebugMode(runOptions.projectRoot, this.packageName, this.debugTarget);
    };
    AndroidPlatform.prototype.getPackageName = function (projectRoot) {
        return new package_1.Package(projectRoot, { fileSystem: this.fileSystem }).name().then(function (appName) {
            return new packageNameResolver_1.PackageNameResolver(appName).resolvePackageName(projectRoot);
        });
    };
    /**
     * Returns the target emulator, using the following logic:
     * *  If an emulator is specified and it is connected, use that one.
     * *  Otherwise, use the first one in the list.
     */
    AndroidPlatform.prototype.getTargetEmulator = function (runOptions, devices) {
        var activeFilterFunction = function (device) {
            return device.isOnline;
        };
        var targetFilterFunction = function (device) {
            return device.id === runOptions.target && activeFilterFunction(device);
        };
        if (runOptions && runOptions.target && devices) {
            /* check if the specified target is active */
            if (devices.some(targetFilterFunction)) {
                return runOptions.target;
            }
        }
        /* return the first active device in the list */
        var activeDevices = devices && devices.filter(activeFilterFunction);
        return activeDevices && activeDevices[0] && activeDevices[0].id;
    };
    AndroidPlatform.prototype.startMonitoringLogCat = function (logCatArguments) {
        return this.extensionMessageSender.sendMessage(extensionMessaging_1.ExtensionMessage.START_MONITORING_LOGCAT, [this.debugTarget, logCatArguments]);
    };
    AndroidPlatform.MULTIPLE_DEVICES_ERROR = "error: more than one device/emulator";
    // We should add the common Android build/run erros we find to this list
    AndroidPlatform.RUN_ANDROID_FAILURE_PATTERNS = {
        "Failed to install on any devices": "Could not install the app on any available device. Make sure you have a correctly"
            + " configured device or emulator running. See https://facebook.github.io/react-native/docs/android-setup.html",
        "com.android.ddmlib.ShellCommandUnresponsiveException": "An Android shell command timed-out. Please retry the operation.",
        "Android project not found": "Android project not found.",
        "error: more than one device/emulator": AndroidPlatform.MULTIPLE_DEVICES_ERROR,
    };
    AndroidPlatform.RUN_ANDROID_SUCCESS_PATTERNS = ["BUILD SUCCESSFUL", "Starting the app", "Starting: Intent"];
    return AndroidPlatform;
}());
exports.AndroidPlatform = AndroidPlatform;

//# sourceMappingURL=androidPlatform.js.map
