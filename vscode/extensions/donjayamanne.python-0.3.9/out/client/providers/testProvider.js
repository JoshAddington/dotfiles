/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode = require('vscode');
var unittest = require('./../unittest/unittest');
var nosetest = require('./../unittest/nosetests');
var pythonOutputChannel;
var testProviders = [];
function activateUnitTestProvider(context, settings, outputChannel) {
    pythonOutputChannel = outputChannel;
    vscode.commands.registerCommand("python.runtests", function () { return runUnitTests(); });
    // 
    //     vscode.commands.registerTextEditorCommand("extension.paython.runCurrentTest", (textEditor) => {
    //         runUnitTests(textEditor.document.fileName);
    //     });
    testProviders.push(new unittest.PythonUnitTest(settings, outputChannel));
    testProviders.push(new nosetest.NoseTests(settings, outputChannel));
}
exports.activateUnitTestProvider = activateUnitTestProvider;
function runUnitTests(filePath) {
    if (filePath === void 0) { filePath = ""; }
    pythonOutputChannel.clear();
    var promise = [];
    testProviders.forEach(function (t) {
        promise.push(t.runTests(filePath));
    });
    Promise.all(promise).then(function () {
        pythonOutputChannel.show();
    });
}
//# sourceMappingURL=testProvider.js.map