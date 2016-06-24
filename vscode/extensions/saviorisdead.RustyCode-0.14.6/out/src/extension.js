"use strict";
var vscode = require('vscode');
var formatService_1 = require('./services/formatService');
var filterService_1 = require('./services/filterService');
var statusBarService_1 = require('./services/statusBarService');
var suggestService_1 = require('./services/suggestService');
var pathService_1 = require('./services/pathService');
var commandService_1 = require('./services/commandService');
function activate(ctx) {
    // Set path to Rust language sources
    var rustSrcPath = pathService_1.default.getRustLangSrcPath();
    if (rustSrcPath) {
        process.env['RUST_SRC_PATH'] = rustSrcPath;
    }
    // Initialize suggestion service
    var suggestService = new suggestService_1.default();
    ctx.subscriptions.push(suggestService.start());
    // Initialize format service
    var formatService = new formatService_1.default();
    ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(filterService_1.default.getRustModeFilter(), formatService));
    // Initialize status bar service
    ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(statusBarService_1.default.toggleStatus.bind(statusBarService_1.default)));
    var alreadyAppliedFormatting = new WeakSet();
    ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(function (document) {
        if (document.languageId !== 'rust') {
            return;
        }
        var rustConfig = vscode.workspace.getConfiguration('rust');
        // Incredibly ugly hack to work around no presave event
        // based on https://github.com/Microsoft/vscode-go/pull/115/files
        if (rustConfig['formatOnSave'] && !alreadyAppliedFormatting.has(document)) {
            var textEditor_1 = vscode.window.activeTextEditor;
            formatService.provideDocumentFormattingEdits(document).then(function (edits) {
                return textEditor_1.edit(function (editBuilder) {
                    edits.forEach(function (edit) { return editBuilder.replace(edit.range, edit.newText); });
                });
            }).then(function () {
                alreadyAppliedFormatting.add(document);
                return document.save();
            });
        }
        else {
            alreadyAppliedFormatting.delete(document);
            if (rustConfig['checkOnSave']) {
                switch (rustConfig['checkWith']) {
                    case 'clippy':
                        vscode.commands.executeCommand('rust.cargo.clippy');
                        break;
                    case 'build':
                        vscode.commands.executeCommand('rust.cargo.build.debug');
                        break;
                    default:
                        vscode.commands.executeCommand('rust.cargo.check');
                }
            }
        }
    }));
    // Watch for configuration changes for ENV
    ctx.subscriptions.push(vscode.workspace.onDidChangeConfiguration(function () {
        var rustLangPath = pathService_1.default.getRustLangSrcPath();
        if (process.env['RUST_SRC_PATH'] !== rustLangPath) {
            process.env['RUST_SRC_PATH'] = rustLangPath;
        }
        console.log(process.env);
    }));
    // Commands
    // Cargo build
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.build.debug', 'build'));
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.build.release', 'build', '--release'));
    ctx.subscriptions.push(commandService_1.default.buildExampleCommand('rust.cargo.build.example.debug', false));
    ctx.subscriptions.push(commandService_1.default.buildExampleCommand('rust.cargo.build.example.release', true));
    ctx.subscriptions.push(commandService_1.default.runExampleCommand('rust.cargo.run.example.debug', false));
    ctx.subscriptions.push(commandService_1.default.runExampleCommand('rust.cargo.run.example.release', true));
    // Cargo run
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.run.debug', 'run'));
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.run.release', 'run', '--release'));
    // Cargo test
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.test.debug', 'test'));
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.test.release', 'test', '--release'));
    // Cargo bench
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.bench', 'bench'));
    // Cargo doc
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.doc', 'doc'));
    // Cargo update
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.update', 'update'));
    // Cargo clean
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.clean', 'clean'));
    // Cargo check
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.check', 'rustc', '--', '-Zno-trans'));
    // Cargo clippy
    ctx.subscriptions.push(commandService_1.default.formatCommand('rust.cargo.clippy', 'clippy'));
    // Racer crash error
    ctx.subscriptions.push(suggestService.racerCrashErrorCommand('rust.racer.showerror'));
    // Cargo terminate
    ctx.subscriptions.push(commandService_1.default.stopCommand('rust.cargo.terminate'));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map