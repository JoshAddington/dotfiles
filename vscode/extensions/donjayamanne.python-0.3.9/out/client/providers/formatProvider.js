/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var path = require('path');
var yapfFormatter_1 = require('./../formatters/yapfFormatter');
var autoPep8Formatter_1 = require('./../formatters/autoPep8Formatter');
var PythonFormattingEditProvider = (function () {
    function PythonFormattingEditProvider(context, settings, outputChannel) {
        this.formatters = new Map();
        this.rootDir = context.asAbsolutePath(".");
        this.settings = settings;
        var yapfFormatter = new yapfFormatter_1.YapfFormatter(settings, outputChannel);
        var autoPep8 = new autoPep8Formatter_1.AutoPep8Formatter(settings, outputChannel);
        this.formatters.set(yapfFormatter.Id, yapfFormatter);
        this.formatters.set(autoPep8.Id, autoPep8);
    }
    PythonFormattingEditProvider.prototype.provideDocumentFormattingEdits = function (document, options, token) {
        var formatter = this.formatters.get(this.settings.formatting.provider);
        var fileDir = path.dirname(document.uri.fsPath);
        return formatter.formatDocument(document, options, token);
    };
    return PythonFormattingEditProvider;
}());
exports.PythonFormattingEditProvider = PythonFormattingEditProvider;
//# sourceMappingURL=formatProvider.js.map