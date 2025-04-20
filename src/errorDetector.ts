import * as vscode from 'vscode';

export class ErrorDetector {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('codeVisualization');
    }

    public detectErrors(document: vscode.TextDocument) {
        const text = document.getText();
        const lines: string[] = text.split('\n');
        const diagnostics: vscode.Diagnostic[] = [];

        // Simple error detection for demonstration
        lines.forEach((line: string, index: number) => {
            // Check for potential null pointer issues
            if (line.includes('.') && !line.includes('?.') && !line.includes('!.')) {
                const dotIndex = line.indexOf('.');
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(index, dotIndex),
                        new vscode.Position(index, dotIndex + 1)
                    ),
                    'Potential null pointer access. Consider using optional chaining (?.) or null assertion (!.)',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }

            // Check for TODO comments
            if (line.includes('TODO')) {
                const todoIndex = line.indexOf('TODO');
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(index, todoIndex),
                        new vscode.Position(index, todoIndex + 4)
                    ),
                    'TODO comment found',
                    vscode.DiagnosticSeverity.Information
                );
                diagnostics.push(diagnostic);
            }

            // Check for empty catch blocks
            if (line.includes('catch') && lines[index + 1]?.trim() === '}') {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(index, 0),
                        new vscode.Position(index + 1, lines[index + 1].length)
                    ),
                    'Empty catch block detected',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }
        });

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }
} 