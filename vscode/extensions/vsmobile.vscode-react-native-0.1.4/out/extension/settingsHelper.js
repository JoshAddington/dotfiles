// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
var Q = require("q");
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var fileSystem_1 = require("../common/node/fileSystem");
var SettingsHelper = (function () {
    function SettingsHelper() {
    }
    Object.defineProperty(SettingsHelper, "settingsJsonPath", {
        get: function () {
            return path.join(vscode.workspace.rootPath, ".vscode", "settings.json");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SettingsHelper, "launchJsonPath", {
        get: function () {
            return path.join(vscode.workspace.rootPath, ".vscode", "launch.json");
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Constructs a JSON object from tsconfig.json. Will create the file if needed.
     */
    SettingsHelper.readSettingsJson = function () {
        var settingsJsonPath = SettingsHelper.settingsJsonPath;
        var fileSystem = new fileSystem_1.FileSystem();
        return fileSystem.exists(settingsJsonPath)
            .then(function (exists) {
            if (!exists) {
                return fileSystem.writeFile(settingsJsonPath, "{}")
                    .then(function () { return "{}"; });
            }
            return fileSystem.readFile(settingsJsonPath, "utf-8");
        })
            .then(function (jsonContents) {
            return JSON.parse(jsonContents);
        });
    };
    /**
     * Writes out a JSON configuration object to the tsconfig.json file.
     */
    SettingsHelper.writeSettingsJson = function (settingsJson) {
        var settingsJsonPath = SettingsHelper.settingsJsonPath;
        return Q.nfcall(fs.writeFile, settingsJsonPath, JSON.stringify(settingsJson, null, 4));
    };
    /**
     * Enable javascript intellisense via typescript.
     */
    SettingsHelper.setTypeScriptTsdk = function (path) {
        return SettingsHelper.readSettingsJson()
            .then(function (settingsJson) {
            if (settingsJson["typescript.tsdk"] !== path) {
                settingsJson["typescript.tsdk"] = path;
                return SettingsHelper.writeSettingsJson(settingsJson);
            }
        });
    };
    /**
     * Removes javascript intellisense via typescript.
     */
    SettingsHelper.removeTypeScriptTsdk = function () {
        return SettingsHelper.readSettingsJson()
            .then(function (settingsJson) {
            if (settingsJson["typescript.tsdk"] !== undefined) {
                delete settingsJson["typescript.tsdk"];
                return SettingsHelper.writeSettingsJson(settingsJson);
            }
        });
    };
    SettingsHelper.getTypeScriptTsdk = function () {
        return SettingsHelper.readSettingsJson()
            .then(function (settingsJson) {
            return settingsJson["typescript.tsdk"] || null;
        });
    };
    return SettingsHelper;
}());
exports.SettingsHelper = SettingsHelper;

//# sourceMappingURL=settingsHelper.js.map
