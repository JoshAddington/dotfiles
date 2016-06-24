// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var Q = require("q");
var net = require("net");
var hostPlatform_1 = require("./hostPlatform");
exports.ErrorMarker = "vscodereactnative-error-marker";
/**
 * Defines the messages sent to the extension.
 * Add new messages to this enum.
 */
(function (ExtensionMessage) {
    ExtensionMessage[ExtensionMessage["START_PACKAGER"] = 0] = "START_PACKAGER";
    ExtensionMessage[ExtensionMessage["STOP_PACKAGER"] = 1] = "STOP_PACKAGER";
    ExtensionMessage[ExtensionMessage["PREWARM_BUNDLE_CACHE"] = 2] = "PREWARM_BUNDLE_CACHE";
    ExtensionMessage[ExtensionMessage["START_MONITORING_LOGCAT"] = 3] = "START_MONITORING_LOGCAT";
    ExtensionMessage[ExtensionMessage["STOP_MONITORING_LOGCAT"] = 4] = "STOP_MONITORING_LOGCAT";
    ExtensionMessage[ExtensionMessage["SEND_TELEMETRY"] = 5] = "SEND_TELEMETRY";
})(exports.ExtensionMessage || (exports.ExtensionMessage = {}));
var ExtensionMessage = exports.ExtensionMessage;
/**
 * Sends messages to the extension.
 */
var ExtensionMessageSender = (function () {
    function ExtensionMessageSender() {
    }
    ExtensionMessageSender.prototype.sendMessage = function (message, args) {
        var deferred = Q.defer();
        var messageWithArguments = { message: message, args: args };
        var body = "";
        var pipePath = hostPlatform_1.HostPlatform.getExtensionPipePath();
        var socket = net.connect(pipePath, function () {
            var messageJson = JSON.stringify(messageWithArguments);
            socket.write(messageJson);
        });
        socket.on("data", function (data) {
            body += data;
        });
        socket.on("error", function (data) {
            deferred.reject(new Error("An error ocurred while handling message: " + ExtensionMessage[message]));
        });
        socket.on("end", function () {
            try {
                if (body === exports.ErrorMarker) {
                    deferred.reject(new Error("An error ocurred while handling message: " + ExtensionMessage[message]));
                }
                else {
                    var responseBody = body ? JSON.parse(body) : null;
                    deferred.resolve(responseBody);
                }
            }
            catch (e) {
                deferred.reject(e);
            }
        });
        return deferred.promise;
    };
    return ExtensionMessageSender;
}());
exports.ExtensionMessageSender = ExtensionMessageSender;

//# sourceMappingURL=extensionMessaging.js.map
