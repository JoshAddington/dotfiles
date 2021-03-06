// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var fs = require("fs");
var path = require("path");
var Q = require("q");
var appWorker_1 = require("./appWorker");
var log_1 = require("../common/log/log");
var errorHelper_1 = require("../common/error/errorHelper");
var internalErrorCode_1 = require("../common/error/internalErrorCode");
var scriptImporter_1 = require("./scriptImporter");
var platformResolver_1 = require("./platformResolver");
var telemetryHelper_1 = require("../common/telemetryHelper");
var em = require("../common/extensionMessaging");
var entryPointHandler_1 = require("../common/entryPointHandler");
var Launcher = (function () {
    function Launcher(projectRootPath) {
        this.projectRootPath = projectRootPath;
    }
    Launcher.prototype.launch = function () {
        var _this = this;
        // Enable telemetry
        new entryPointHandler_1.EntryPointHandler(true).runApp("react-native-debug-process", function () { return _this.getAppVersion(); }, errorHelper_1.ErrorHelper.getInternalError(internalErrorCode_1.InternalErrorCode.DebuggingFailed), function () {
            return telemetryHelper_1.TelemetryHelper.generate("launch", function (generator) {
                var resolver = new platformResolver_1.PlatformResolver();
                var runOptions = _this.parseRunOptions();
                var mobilePlatform = resolver.resolveMobilePlatform(runOptions.platform);
                if (!mobilePlatform) {
                    throw new RangeError("The target platform could not be read. Did you forget to add it to the launch.json configuration arguments?");
                }
                else {
                    var sourcesStoragePath_1 = path.join(_this.projectRootPath, ".vscode", ".react");
                    var extensionMessageSender_1 = new em.ExtensionMessageSender();
                    return Q({})
                        .then(function () {
                        generator.step("startPackager");
                        return extensionMessageSender_1.sendMessage(em.ExtensionMessage.START_PACKAGER);
                    })
                        .then(function () {
                        var scriptImporter = new scriptImporter_1.ScriptImporter(sourcesStoragePath_1);
                        return scriptImporter.downloadDebuggerWorker(sourcesStoragePath_1).then(function () {
                            log_1.Log.logMessage("Downloaded debuggerWorker.js (Logic to run the React Native app) from the Packager.");
                        });
                    })
                        .then(function () {
                        generator.step("prewarmBundleCache");
                        log_1.Log.logMessage("Prewarming bundle cache. This may take a while ...");
                        return extensionMessageSender_1.sendMessage(em.ExtensionMessage.PREWARM_BUNDLE_CACHE, [runOptions.platform]);
                    })
                        .then(function () {
                        generator.step("mobilePlatform.runApp");
                        log_1.Log.logMessage("Building and running application.");
                        return mobilePlatform.runApp(runOptions);
                    })
                        .then(function () {
                        generator.step("Starting App Worker");
                        log_1.Log.logMessage("Starting debugger app worker.");
                        return new appWorker_1.MultipleLifetimesAppWorker(sourcesStoragePath_1, runOptions.debugAdapterPort).start();
                    }) // Start the app worker
                        .then(function () {
                        generator.step("mobilePlatform.enableJSDebuggingMode");
                        return mobilePlatform.enableJSDebuggingMode(runOptions);
                    }).then(function () {
                        return log_1.Log.logMessage("Debugging session started successfully.");
                    });
                }
            });
        });
    };
    Launcher.prototype.getAppVersion = function () {
        return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8")).version;
    };
    /**
     * Parses the launch arguments set in the launch configuration.
     */
    Launcher.prototype.parseRunOptions = function () {
        var result = { projectRoot: this.projectRootPath };
        // We expect our debugAdapter to pass in arguments as [platform, debugAdapterPort, target?];
        result.platform = process.argv[2].toLowerCase();
        result.debugAdapterPort = parseInt(process.argv[3], 10) || 9090;
        result.target = process.argv[4];
        result.logCatArguments = process.argv[5];
        return result;
    };
    return Launcher;
}());
exports.Launcher = Launcher;

//# sourceMappingURL=launcher.js.map
