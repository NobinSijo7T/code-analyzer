import * as vscode from 'vscode';

interface CodeStructure {
    type: string;
    name: string;
    children?: CodeStructure[];
    range?: vscode.Range;
}

export class CodeAnalyzer {
    public analyzeCode(document: vscode.TextDocument): { structure: CodeStructure } {
        const text = document.getText();
        const structure: CodeStructure = {
            type: 'root',
            name: document.fileName,
            children: []
        };

        // Simple parsing for demonstration
        const lines: string[] = text.split('\n');
        let currentFunction: CodeStructure | null = null;
        let currentClass: CodeStructure | null = null;

        lines.forEach((line: string, index: number) => {
            const functionMatch = line.match(/function\s+(\w+)/);
            const classMatch = line.match(/class\s+(\w+)/);
            const methodMatch = line.match(/(\w+)\s*\([^)]*\)\s*{/);

            if (classMatch) {
                currentClass = {
                    type: 'class',
                    name: classMatch[1],
                    children: [],
                    range: new vscode.Range(
                        new vscode.Position(index, 0),
                        new vscode.Position(index, line.length)
                    )
                };
                structure.children?.push(currentClass);
            }
            else if (functionMatch) {
                currentFunction = {
                    type: 'function',
                    name: functionMatch[1],
                    range: new vscode.Range(
                        new vscode.Position(index, 0),
                        new vscode.Position(index, line.length)
                    )
                };
                if (currentClass) {
                    currentClass.children?.push(currentFunction);
                } else {
                    structure.children?.push(currentFunction);
                }
            }
            else if (methodMatch && currentClass) {
                const method: CodeStructure = {
                    type: 'method',
                    name: methodMatch[1],
                    range: new vscode.Range(
                        new vscode.Position(index, 0),
                        new vscode.Position(index, line.length)
                    )
                };
                currentClass.children?.push(method);
            }
        });

        return { structure };
    }
}

export class CodeVisualizer implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        this.updateWebview();
    }

    public visualizeAsTree(structure: any) {
        if (this._view) {
            this._view.webview.html = this.getVisualizationHtml(structure);
        }
    }

    private updateWebview() {
        if (this._view) {
            this._view.webview.html = this.getVisualizationHtml({ type: 'root', name: 'No code analyzed yet' });
        }
    }

    private getVisualizationHtml(structure: any): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .tree-node {
                        margin-left: 20px;
                        padding: 5px;
                    }
                    .node-type {
                        color: #666;
                        font-style: italic;
                    }
                </style>
            </head>
            <body>
                <div id="tree">${this.renderTreeNode(structure)}</div>
            </body>
            </html>
        `;
    }

    private renderTreeNode(node: any): string {
        let html = `
            <div class="tree-node">
                <span class="node-type">[${node.type}]</span> ${node.name}
        `;
        
        if (node.children && node.children.length > 0) {
            html += node.children.map((child: any) => this.renderTreeNode(child)).join('');
        }
        
        html += '</div>';
        return html;
    }
} 