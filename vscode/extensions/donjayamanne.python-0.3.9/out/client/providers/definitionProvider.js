/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode = require('vscode');
var proxy = require('./jediProxy');
function parseData(data) {
    if (data) {
        var definitionResource = vscode.Uri.file(data.definition.fileName);
        var range = new vscode.Range(data.definition.lineIndex, data.definition.columnIndex, data.definition.lineIndex, data.definition.columnIndex);
        return new vscode.Location(definitionResource, range);
    }
    return null;
}
var PythonDefinitionProvider = (function () {
    function PythonDefinitionProvider(context) {
        this.jediProxyHandler = new proxy.JediProxyHandler(context, null, parseData);
    }
    PythonDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var filename = document.fileName;
            if (document.lineAt(position.line).text.match(/^\s*\/\//)) {
                return resolve();
            }
            if (position.character <= 0) {
                return resolve();
            }
            var source = document.getText();
            var range = document.getWordRangeAtPosition(position);
            var columnIndex = range.isEmpty ? position.character : range.end.character;
            var cmd = {
                command: proxy.CommandType.Definitions,
                fileName: filename,
                columnIndex: columnIndex,
                lineIndex: position.line,
                source: source
            };
            _this.jediProxyHandler.sendCommand(cmd, resolve, token);
        });
    };
    return PythonDefinitionProvider;
}());
exports.PythonDefinitionProvider = PythonDefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map