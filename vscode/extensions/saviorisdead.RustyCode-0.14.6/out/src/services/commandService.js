"use strict";
var vscode = require('vscode');
var cp = require('child_process');
var path = require('path');
var kill = require('tree-kill');
var findUp = require('find-up');
var pathService_1 = require('./pathService');
var errorRegex = /^(.*):(\d+):(\d+):\s+(\d+):(\d+)\s+(warning|error|note|help):\s+(.*)$/;
var ChannelWrapper = (function () {
    function ChannelWrapper(channel) {
        this.channel = channel;
    }
    ChannelWrapper.prototype.append = function (task, message) {
        if (task === this.owner) {
            this.channel.append(message);
        }
    };
    ChannelWrapper.prototype.clear = function (task) {
        if (task === this.owner) {
            this.channel.clear();
        }
    };
    ChannelWrapper.prototype.show = function () {
        this.channel.show(true);
    };
    ChannelWrapper.prototype.setOwner = function (owner) {
        this.owner = owner;
    };
    return ChannelWrapper;
}());
var CargoTask = (function () {
    function CargoTask(args, channel) {
        this.arguments = args;
        this.channel = channel;
        this.interrupted = false;
    }
    CargoTask.prototype.execute = function (cwd) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var cargoPath = pathService_1.default.getCargoPath();
            var startTime = Date.now();
            var task = 'cargo ' + _this.arguments.join(' ');
            var output = '';
            _this.channel.clear(_this);
            _this.channel.append(_this, "Running \"" + task + "\":\n");
            _this.process = cp.spawn(cargoPath, _this.arguments, { cwd: cwd });
            _this.process.stdout.on('data', function (data) {
                _this.channel.append(_this, data.toString());
            });
            _this.process.stderr.on('data', function (data) {
                output += data.toString();
                _this.channel.append(_this, data.toString());
            });
            _this.process.on('error', function (error) {
                if (error.code === 'ENOENT') {
                    vscode.window.showInformationMessage('The "cargo" command is not available. Make sure it is installed.');
                }
            });
            _this.process.on('exit', function (code) {
                _this.process.removeAllListeners();
                _this.process = null;
                var endTime = Date.now();
                _this.channel.append(_this, "\n\"" + task + "\" completed with code " + code);
                _this.channel.append(_this, "\nIt took approximately " + (endTime - startTime) / 1000 + " seconds");
                if (code === 0 || _this.interrupted) {
                    resolve(_this.interrupted ? '' : output);
                }
                else {
                    if (code !== 101) {
                        vscode.window.showWarningMessage("Cargo unexpectedly stopped with code " + code);
                    }
                    reject(output);
                }
            });
        });
    };
    CargoTask.prototype.kill = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (!_this.interrupted && _this.process) {
                kill(_this.process.pid, 'SIGINT', resolve);
                _this.interrupted = true;
            }
        });
    };
    return CargoTask;
}());
var CommandService = (function () {
    function CommandService() {
    }
    CommandService.formatCommand = function (commandName) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return vscode.commands.registerCommand(commandName, function () {
            _this.runCargo(args, true, true);
        });
    };
    CommandService.buildExampleCommand = function (commandName, release) {
        var _this = this;
        return vscode.commands.registerCommand(commandName, function () {
            _this.buildExample(release);
        });
    };
    CommandService.runExampleCommand = function (commandName, release) {
        var _this = this;
        return vscode.commands.registerCommand(commandName, function () {
            _this.runExample(release);
        });
    };
    CommandService.stopCommand = function (commandName) {
        var _this = this;
        return vscode.commands.registerCommand(commandName, function () {
            if (_this.currentTask) {
                _this.currentTask.kill();
            }
        });
    };
    CommandService.determineExampleName = function () {
        var showDocumentIsNotExampleWarning = function () {
            vscode.window.showWarningMessage('Current document is not an example');
        };
        var filePath = vscode.window.activeTextEditor.document.uri.fsPath;
        var dir = path.basename(path.dirname(filePath));
        if (dir !== 'examples') {
            showDocumentIsNotExampleWarning();
            return '';
        }
        var filename = path.basename(filePath);
        if (!filename.endsWith('.rs')) {
            showDocumentIsNotExampleWarning();
            return '';
        }
        return path.basename(filename, '.rs');
    };
    CommandService.buildExample = function (release) {
        var exampleName = this.determineExampleName();
        if (exampleName.length === 0) {
            return;
        }
        var args = ['build', '--example', exampleName];
        if (release) {
            args.push('--release');
        }
        this.runCargo(args, true, true);
    };
    CommandService.runExample = function (release) {
        var exampleName = this.determineExampleName();
        if (exampleName.length === 0) {
            return;
        }
        var args = ['run', '--example', exampleName];
        if (release) {
            args.push('--release');
        }
        this.runCargo(args, true, true);
    };
    CommandService.parseDiagnostics = function (cwd, output) {
        var errors = {};
        for (var _i = 0, _a = output.split('\n'); _i < _a.length; _i++) {
            var line = _a[_i];
            var match = line.match(errorRegex);
            if (match) {
                var filename = match[1];
                if (!errors[filename]) {
                    errors[filename] = [];
                }
                errors[filename].push({
                    filename: filename,
                    startLine: Number(match[2]) - 1,
                    startCharacter: Number(match[3]) - 1,
                    endLine: Number(match[4]) - 1,
                    endCharacter: Number(match[5]) - 1,
                    severity: match[6],
                    message: match[7]
                });
            }
        }
        this.diagnostics.clear();
        if (!Object.keys(errors).length) {
            return;
        }
        for (var _b = 0, _c = Object.keys(errors); _b < _c.length; _b++) {
            var filename = _c[_b];
            var fileErrors = errors[filename];
            var diagnostics = fileErrors.map(function (error) {
                var range = new vscode.Range(error.startLine, error.startCharacter, error.endLine, error.endCharacter);
                var severity;
                if (error.severity === 'warning') {
                    severity = vscode.DiagnosticSeverity.Warning;
                }
                else if (error.severity === 'error') {
                    severity = vscode.DiagnosticSeverity.Error;
                }
                else if (error.severity === 'note') {
                    severity = vscode.DiagnosticSeverity.Information;
                }
                else if (error.severity === 'help') {
                    severity = vscode.DiagnosticSeverity.Hint;
                }
                return new vscode.Diagnostic(range, error.message, severity);
            });
            var uri = vscode.Uri.file(path.join(cwd, filename));
            this.diagnostics.set(uri, diagnostics);
        }
    };
    CommandService.runCargo = function (args, force, visible) {
        var _this = this;
        if (force === void 0) { force = false; }
        if (visible === void 0) { visible = false; }
        if (force && this.currentTask) {
            this.channel.setOwner(null);
            this.currentTask.kill().then(function () {
                _this.runCargo(args, force, visible);
            });
            return;
        }
        else if (this.currentTask) {
            return;
        }
        this.currentTask = new CargoTask(args, this.channel);
        if (visible) {
            this.channel.setOwner(this.currentTask);
            this.channel.show();
        }
        CommandService.cwd().then(function (value) {
            if (typeof value === 'string') {
                _this.currentTask.execute(value).then(function (output) {
                    _this.parseDiagnostics(value, output);
                }, function (output) {
                    _this.parseDiagnostics(value, output);
                }).then(function () {
                    _this.currentTask = null;
                });
            }
            else {
                vscode.window.showErrorMessage(value.message);
            }
        });
    };
    CommandService.cwd = function () {
        if (vscode.window.activeTextEditor === null) {
            return Promise.resolve(new Error('No active document'));
        }
        else {
            var fileName = vscode.window.activeTextEditor.document.fileName;
            if (!fileName.startsWith(vscode.workspace.rootPath)) {
                return Promise.resolve(new Error('Current document not in the workspace'));
            }
            return findUp('Cargo.toml', { cwd: path.dirname(fileName) }).then(function (value) {
                if (value === null) {
                    return new Error('There is no Cargo.toml near active document');
                }
                else {
                    return path.dirname(value);
                }
            });
        }
    };
    CommandService.diagnostics = vscode.languages.createDiagnosticCollection('rust');
    CommandService.channel = new ChannelWrapper(vscode.window.createOutputChannel('Cargo'));
    return CommandService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommandService;
//# sourceMappingURL=commandService.js.map