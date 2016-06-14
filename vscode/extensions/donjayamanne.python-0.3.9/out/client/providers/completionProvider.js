/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode = require('vscode');
var proxy = require('./jediProxy');
function parseData(data) {
    if (data && data.items.length > 0) {
        return data.items.map(function (item) {
            var completionItem = new vscode.CompletionItem(item.text);
            completionItem.documentation = item.description;
            return completionItem;
        });
    }
    return [];
}
var PythonCompletionItemProvider = (function () {
    function PythonCompletionItemProvider(context) {
        this.jediProxyHandler = new proxy.JediProxyHandler(context, [], parseData);
    }
    PythonCompletionItemProvider.prototype.provideCompletionItems = function (document, position, token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var filename = document.fileName;
            if (document.lineAt(position.line).text.match(/^\s*\/\//)) {
                return resolve([]);
            }
            if (position.character <= 0) {
                return resolve([]);
            }
            var txt = document.getText(new vscode.Range(new vscode.Position(position.line, position.character - 1), position));
            var type = proxy.CommandType.Completions;
            var columnIndex = position.character;
            var source = document.getText();
            var cmd = {
                command: type,
                fileName: filename,
                columnIndex: columnIndex,
                lineIndex: position.line,
                source: source
            };
            _this.jediProxyHandler.sendCommand(cmd, resolve, token);
        });
    };
    return PythonCompletionItemProvider;
}());
exports.PythonCompletionItemProvider = PythonCompletionItemProvider;
//# sourceMappingURL=completionProvider.js.map