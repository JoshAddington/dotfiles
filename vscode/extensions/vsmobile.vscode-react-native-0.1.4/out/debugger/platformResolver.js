// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var PlatformResolver = (function () {
    function PlatformResolver() {
    }
    /**
     * Resolves the mobile application target platform.
     */
    PlatformResolver.prototype.resolveMobilePlatform = function (mobilePlatformString) {
        switch (mobilePlatformString) {
            // We lazyly load the strategies, because some components might be
            // missing on some platforms (like XCode in Windows)
            case "ios":
                var ios = require("./ios/iOSPlatform");
                return new ios.IOSPlatform();
            case "android":
                var android = require("./android/androidPlatform");
                return new android.AndroidPlatform();
            default:
                return null;
        }
    };
    return PlatformResolver;
}());
exports.PlatformResolver = PlatformResolver;

//# sourceMappingURL=platformResolver.js.map
