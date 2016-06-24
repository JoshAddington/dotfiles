'use strict';
var net = require('net');
function WaitForPortToOpen(port, timeout) {
    return new Promise(function (resolve, reject) {
        var timedOut = false;
        var handle = setTimeout(function () {
            timedOut = true;
            reject("Timeout after " + timeout + " milli-seconds");
        }, timeout);
        tryToConnect();
        function tryToConnect() {
            if (timedOut) {
                return;
            }
            var socket = net.connect({ port: port }, function () {
                if (timedOut) {
                    return;
                }
                resolve();
                socket.end();
                clearTimeout(handle);
            });
            socket.on("error", function (error) {
                if (timedOut) {
                    return;
                }
                if (error.code === "ECONNREFUSED" && !timedOut) {
                    setTimeout(function () {
                        tryToConnect();
                    }, 10);
                    return;
                }
                clearTimeout(handle);
                reject("Connection failed due to " + JSON.stringify(error));
            });
        }
    });
}
exports.WaitForPortToOpen = WaitForPortToOpen;
//# sourceMappingURL=OnPortOpenedHandler.js.map