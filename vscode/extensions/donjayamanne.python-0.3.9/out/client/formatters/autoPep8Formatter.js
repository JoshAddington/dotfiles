/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var baseFormatter_1 = require('./baseFormatter');
var AutoPep8Formatter = (function (_super) {
    __extends(AutoPep8Formatter, _super);
    function AutoPep8Formatter(settings, outputChannel) {
        _super.call(this, "autopep8", outputChannel);
        this.pythonSettings = settings;
    }
    AutoPep8Formatter.prototype.formatDocument = function (document, options, token) {
        var autopep8Path = this.pythonSettings.formatting.autopep8Path;
        var fileDir = path.dirname(document.uri.fsPath);
        return _super.prototype.provideDocumentFormattingEdits.call(this, document, options, token, autopep8Path + " \"" + document.uri.fsPath + "\"");
    };
    return AutoPep8Formatter;
}(baseFormatter_1.BaseFormatter));
exports.AutoPep8Formatter = AutoPep8Formatter;
//# sourceMappingURL=autoPep8Formatter.js.map