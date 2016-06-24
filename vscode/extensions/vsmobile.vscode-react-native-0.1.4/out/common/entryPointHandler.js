// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var errorHelper_1 = require("../common/error/errorHelper");
var telemetryHelper_1 = require("../common/telemetryHelper");
var telemetry_1 = require("../common/telemetry");
var log_1 = require("../common/log/log");
/* This class should we used for each entry point of the code, so we handle telemetry and error reporting properly */
var EntryPointHandler = (function () {
    function EntryPointHandler(isDebugeeProcess, logger) {
        if (isDebugeeProcess === void 0) { isDebugeeProcess = false; }
        if (logger) {
            log_1.Log.SetGlobalLogger(logger);
        }
        this.isDebugeeProcess = isDebugeeProcess;
    }
    /* This method should wrap any async entry points to the code, so we handle telemetry and error reporting properly */
    EntryPointHandler.prototype.runFunction = function (taskName, error, codeToRun, errorsAreFatal) {
        if (errorsAreFatal === void 0) { errorsAreFatal = false; }
        return this.handleErrors(error, telemetryHelper_1.TelemetryHelper.generate(taskName, codeToRun), /*errorsAreFatal*/ errorsAreFatal);
    };
    // This method should wrap the entry point of the whole app, so we handle telemetry and error reporting properly
    EntryPointHandler.prototype.runApp = function (appName, getAppVersion, error, codeToRun) {
        try {
            telemetry_1.Telemetry.init(appName, getAppVersion(), { isExtensionProcess: !this.isDebugeeProcess });
            return this.runFunction(appName, error, codeToRun, true);
        }
        catch (error) {
            log_1.Log.logError(error, false);
            throw error;
        }
    };
    EntryPointHandler.prototype.handleErrors = function (error, resultOfCode, errorsAreFatal) {
        var _this = this;
        resultOfCode.done(function () { }, function (reason) {
            var shouldLogStack = !errorsAreFatal || _this.isDebugeeProcess;
            log_1.Log.logError(errorHelper_1.ErrorHelper.wrapError(error, reason), /*logStack*/ shouldLogStack);
            // For the debugee process we don't want to throw an exception because the debugger
            // will appear to the user if he turned on the VS Code uncaught exceptions feature.
            if (errorsAreFatal) {
                if (_this.isDebugeeProcess) {
                    process.exit(1);
                }
                else {
                    throw reason;
                }
            }
        });
    };
    return EntryPointHandler;
}());
exports.EntryPointHandler = EntryPointHandler;

//# sourceMappingURL=entryPointHandler.js.map
