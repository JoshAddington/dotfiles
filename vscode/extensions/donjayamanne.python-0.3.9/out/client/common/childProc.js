'use strict';
var child_process = require('child_process');
function sendCommand(commandLine, cwd, includeErrorAsResponse) {
    if (includeErrorAsResponse === void 0) { includeErrorAsResponse = false; }
    return new Promise(function (resolve, reject) {
        child_process.exec(commandLine, { cwd: cwd }, function (error, stdout, stderr) {
            if (includeErrorAsResponse) {
                return resolve(stdout + '\n' + stderr);
            }
            var hasErrors = (error && error.message.length > 0) || (stderr && stderr.length > 0);
            if (hasErrors && (typeof stdout !== "string" || stdout.length === 0)) {
                var errorMsg = (error && error.message) ? error.message : (stderr && stderr.length > 0 ? stderr + '' : "");
                return reject(errorMsg);
            }
            resolve(stdout + '');
        });
    });
}
exports.sendCommand = sendCommand;
//# sourceMappingURL=childProc.js.map