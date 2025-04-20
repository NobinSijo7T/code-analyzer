"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// src/extension.ts
const vscode = require("vscode");
const codeAnalyzer_1 = require("./codeAnalyzer");
const codeAnalyzer_2 = require("./codeAnalyzer");
const errorDetector_1 = require("./errorDetector");
const debugVisualizer_1 = require("./debugVisualizer");
function activate(context) {
    // Initialize components
    const codeAnalyzer = new codeAnalyzer_1.CodeAnalyzer();
    const visualizer = new codeAnalyzer_2.CodeVisualizer(context.extensionUri);
    const errorDetector = new errorDetector_1.ErrorDetector();
    const debugVisualizer = new debugVisualizer_1.DebugVisualizer(context);
    // Register webview panel for visualizations
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('codeVisualization', visualizer));
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('codeVisualization.show', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const analysis = codeAnalyzer.analyzeCode(document);
            visualizer.visualizeAsTree(analysis.structure);
            errorDetector.detectErrors(document);
        }
    }));
    // Register document change listener
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            const analysis = codeAnalyzer.analyzeCode(event.document);
            visualizer.visualizeAsTree(analysis.structure);
            errorDetector.detectErrors(event.document);
        }
    }));
}
function deactivate() { }
//# sourceMappingURL=extention.js.map