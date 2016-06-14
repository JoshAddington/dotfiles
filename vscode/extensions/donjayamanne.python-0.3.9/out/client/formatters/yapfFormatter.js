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
var YapfFormatter = (function (_super) {
    __extends(YapfFormatter, _super);
    function YapfFormatter(settings, outputChannel) {
        _super.call(this, "yapf", outputChannel);
        this.pythonSettings = settings;
    }
    YapfFormatter.prototype.formatDocument = function (document, options, token) {
        var yapfPath = this.pythonSettings.formatting.yapfPath;
        var fileDir = path.dirname(document.uri.fsPath);
        return _super.prototype.provideDocumentFormattingEdits.call(this, document, options, token, yapfPath + " \"" + document.uri.fsPath + "\"");
    };
    return YapfFormatter;
}(baseFormatter_1.BaseFormatter));
exports.YapfFormatter = YapfFormatter;
//# sourceMappingURL=yapfFormatter.js.map