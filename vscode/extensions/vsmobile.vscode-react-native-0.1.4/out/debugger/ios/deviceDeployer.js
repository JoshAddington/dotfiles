// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var path = require("path");
var commandExecutor_1 = require("../../common/commandExecutor");
var xcodeproj_1 = require("../../common/ios/xcodeproj");
var errorHelper_1 = require("../../common/error/errorHelper");
var internalErrorCode_1 = require("../../common/error/internalErrorCode");
var DeviceDeployer = (function () {
    function DeviceDeployer(projectRoot) {
        this.projectRoot = projectRoot;
    }
    DeviceDeployer.prototype.deploy = function () {
        var _this = this;
        return new xcodeproj_1.Xcodeproj().findXcodeprojFile(this.projectRoot).then(function (projectFile) {
            var projectName = path.basename(projectFile, path.extname(projectFile));
            var pathToCompiledApp = path.join(_this.projectRoot, "ios", "build", "Build", "Products", "Debug-iphoneos", projectName + ".app");
            return new commandExecutor_1.CommandExecutor(_this.projectRoot)
                .spawn("ideviceinstaller", ["-i", pathToCompiledApp]).catch(function (err) {
                if (err.code === "ENOENT") {
                    throw errorHelper_1.ErrorHelper.getNestedError(err, internalErrorCode_1.InternalErrorCode.IDeviceInstallerNotFound);
                }
                throw err;
            });
        });
    };
    return DeviceDeployer;
}());
exports.DeviceDeployer = DeviceDeployer;

//# sourceMappingURL=deviceDeployer.js.map
