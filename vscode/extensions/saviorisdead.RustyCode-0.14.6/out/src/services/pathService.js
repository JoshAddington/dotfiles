"use strict";
var vscode = require('vscode');
var PathService = (function () {
    function PathService() {
    }
    PathService.getRacerPath = function () {
        var racerPath = vscode.workspace.getConfiguration('rust')['racerPath'];
        return racerPath || 'racer';
    };
    PathService.getRustfmtPath = function () {
        var rusfmtPath = vscode.workspace.getConfiguration('rust')['rustfmtPath'];
        return rusfmtPath || 'rustfmt';
    };
    PathService.getRustLangSrcPath = function () {
        var rustSrcPath = vscode.workspace.getConfiguration('rust')['rustLangSrcPath'];
        return rustSrcPath || '';
    };
    PathService.getCargoPath = function () {
        var cargoPath = vscode.workspace.getConfiguration('rust')['cargoPath'];
        return cargoPath || 'cargo';
    };
    PathService.getCargoHomePath = function () {
        var cargoHomePath = vscode.workspace.getConfiguration('rust')['cargoHomePath'];
        return cargoHomePath || process.env['CARGO_HOME'] || '';
    };
    return PathService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PathService;
//# sourceMappingURL=pathService.js.map