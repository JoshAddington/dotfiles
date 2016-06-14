// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var fs = require("fs");
var path = require("path");
var http = require("http");
var telemetry_1 = require("../common/telemetry");
var telemetryHelper_1 = require("../common/telemetryHelper");
var extensionMessaging_1 = require("../common/extensionMessaging");
var version = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8")).version;
function bailOut(reason) {
    // Things have gone wrong in initialization: Report the error to telemetry and exit
    telemetryHelper_1.TelemetryHelper.sendSimpleEvent(reason);
    process.exit(1);
}
function parseLogCatArguments(userProvidedLogCatArguments) {
    return Array.isArray(userProvidedLogCatArguments)
        ? userProvidedLogCatArguments.join(" ") // If it's an array, we join the arguments
        : userProvidedLogCatArguments; // If not, we leave it as-is
}
function isNullOrUndefined(value) {
    return typeof value === "undefined" || value === null;
}
// Enable telemetry
telemetry_1.Telemetry.init("react-native-debug-adapter", version, { isExtensionProcess: false });
var nodeDebugFolder;
var vscodeDebugAdapterPackage;
// nodeDebugLocation.json is dynamically generated on extension activation.
// If it fails, we must not have been in a react native project
try {
    /* tslint:disable:no-var-requires */
    nodeDebugFolder = require("./nodeDebugLocation.json").nodeDebugPath;
    vscodeDebugAdapterPackage = require(path.join(nodeDebugFolder, "node_modules", "vscode-debugadapter"));
}
catch (e) {
    // Nothing we can do here: can't even communicate back because we don't know how to speak debug adapter
    bailOut("cannotFindDebugAdapter");
}
// Temporarily dummy out the DebugSession.run function so we do not start the debug adapter until we are ready
var originalDebugSessionRun = vscodeDebugAdapterPackage.DebugSession.run;
vscodeDebugAdapterPackage.DebugSession.run = function () { };
var nodeDebug;
try {
    /* tslint:disable:no-var-requires */
    nodeDebug = require(path.join(nodeDebugFolder, "out", "node", "nodeDebug"));
}
catch (e) {
    // Unable to find nodeDebug, but we can make our own communication channel now
    var debugSession = new vscodeDebugAdapterPackage.DebugSession();
    // Note: this will not work in the context of debugging the debug adapter and communicating over a socket,
    // but in that case we have much better ways to investigate errors.
    debugSession.start(process.stdin, process.stdout);
    debugSession.sendEvent(new vscodeDebugAdapterPackage.OutputEvent("Unable to start debug adapter: " + e.toString(), "stderr"));
    debugSession.sendEvent(new vscodeDebugAdapterPackage.TerminatedEvent());
    bailOut("cannotFindNodeDebugAdapter");
}
vscodeDebugAdapterPackage.DebugSession.run = originalDebugSessionRun;
// Intecept the "launchRequest" instance method of NodeDebugSession to interpret arguments
var originalNodeDebugSessionLaunchRequest = nodeDebug.NodeDebugSession.prototype.launchRequest;
nodeDebug.NodeDebugSession.prototype.launchRequest = function (request, args) {
    var _this = this;
    // Create a server waiting for messages to re-initialize the debug session;
    var reinitializeServer = http.createServer(function (req, res) {
        res.statusCode = 404;
        if (req.url === "/refreshBreakpoints") {
            res.statusCode = 200;
            if (_this) {
                var sourceMaps = _this._sourceMaps;
                if (sourceMaps) {
                    // Flush any cached source maps
                    sourceMaps._allSourceMaps = {};
                    sourceMaps._generatedToSourceMaps = {};
                    sourceMaps._sourceToGeneratedMaps = {};
                }
                // Send an "initialized" event to trigger breakpoints to be re-sent
                _this.sendEvent(new vscodeDebugAdapterPackage.InitializedEvent());
            }
        }
        res.end();
    });
    var debugServerListeningPort = parseInt(args.internalDebuggerPort, 10) || 9090;
    reinitializeServer.listen(debugServerListeningPort);
    reinitializeServer.on("error", function (err) {
        telemetryHelper_1.TelemetryHelper.sendSimpleEvent("reinitializeServerError");
        _this.sendEvent(new vscodeDebugAdapterPackage.OutputEvent("Error in debug adapter server: " + err.toString(), "stderr"));
        _this.sendEvent(new vscodeDebugAdapterPackage.OutputEvent("Breakpoints may not update. Consider restarting and specifying a different 'internalDebuggerPort' in launch.json"));
    });
    // We do not permit arbitrary args to be passed to our process
    args.args = [
        args.platform,
        debugServerListeningPort.toString(),
        args.target || "simulator",
    ];
    if (!isNullOrUndefined(args.logCatArguments)) {
        args.args = args.args.concat([parseLogCatArguments(args.logCatArguments)]);
    }
    originalNodeDebugSessionLaunchRequest.call(this, request, args);
};
// Intecept the "launchRequest" instance method of NodeDebugSession to interpret arguments
var originalNodeDebugSessionDisconnectRequest = nodeDebug.NodeDebugSession.prototype.disconnectRequest;
function customDisconnectRequest(response, args) {
    var _this = this;
    try {
        // First we tell the extension to stop monitoring the logcat, and then we disconnect the debugging session
        var extensionMessageSender = new extensionMessaging_1.ExtensionMessageSender();
        extensionMessageSender.sendMessage(extensionMessaging_1.ExtensionMessage.STOP_MONITORING_LOGCAT)
            .finally(function () { return originalNodeDebugSessionDisconnectRequest.call(_this, response, args); })
            .done(function () { }, function (reason) {
            return process.stderr.write("WARNING: Couldn't stop monitoring logcat: " + (reason.message || reason) + "\n");
        });
    }
    catch (exception) {
        // This is a "nice to have" feature, so we just fire the message and forget. We don't event handle
        // errors in the response promise
        process.stderr.write("WARNING: Couldn't stop monitoring logcat. Sync exception: " + (exception.message || exception) + "\n");
        originalNodeDebugSessionDisconnectRequest.call(this, response, args);
    }
}
nodeDebug.NodeDebugSession.prototype.disconnectRequest = customDisconnectRequest;
vscodeDebugAdapterPackage.DebugSession.run(nodeDebug.NodeDebugSession);

//# sourceMappingURL=nodeDebugWrapper.js.map
