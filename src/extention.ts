// src/extension.ts
import * as vscode from 'vscode';
import { CodeAnalyzer } from './codeAnalyzer';
import { CodeVisualizer } from './codeAnalyzer';
import { ErrorDetector } from './errorDetector';
import { DebugVisualizer } from './debugVisualizer';

export function activate(context: vscode.ExtensionContext) {
    // Initialize components
    const codeAnalyzer = new CodeAnalyzer();
    const visualizer = new CodeVisualizer(context.extensionUri);
    const errorDetector = new ErrorDetector();
    const debugVisualizer = new DebugVisualizer(context);

    // Register webview panel for visualizations
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('codeVisualization', visualizer)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('codeVisualization.show', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const analysis = codeAnalyzer.analyzeCode(document);
                visualizer.visualizeAsTree(analysis.structure);
                errorDetector.detectErrors(document);
            }
        })
    );

    // Register document change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
            if (event.document === vscode.window.activeTextEditor?.document) {
                const analysis = codeAnalyzer.analyzeCode(event.document);
                visualizer.visualizeAsTree(analysis.structure);
                errorDetector.detectErrors(event.document);
            }
        })
    );
}

export function deactivate() {}