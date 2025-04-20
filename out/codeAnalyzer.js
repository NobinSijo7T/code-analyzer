"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeVisualizer = exports.CodeAnalyzer = void 0;
const vscode = require("vscode");
class CodeAnalyzer {
    analyzeCode(document) {
        const text = document.getText();
        const structure = {
            type: 'root',
            name: document.fileName,
            children: []
        };
        // Simple parsing for demonstration
        const lines = text.split('\n');
        let currentFunction = null;
        let currentClass = null;
        lines.forEach((line, index) => {
            const functionMatch = line.match(/function\s+(\w+)/);
            const classMatch = line.match(/class\s+(\w+)/);
            const methodMatch = line.match(/(\w+)\s*\([^)]*\)\s*{/);
            if (classMatch) {
                currentClass = {
                    type: 'class',
                    name: classMatch[1],
                    children: [],
                    range: new vscode.Range(new vscode.Position(index, 0), new vscode.Position(index, line.length))
                };
                structure.children?.push(currentClass);
            }
            else if (functionMatch) {
                currentFunction = {
                    type: 'function',
                    name: functionMatch[1],
                    range: new vscode.Range(new vscode.Position(index, 0), new vscode.Position(index, line.length))
                };
                if (currentClass) {
                    currentClass.children?.push(currentFunction);
                }
                else {
                    structure.children?.push(currentFunction);
                }
            }
            else if (methodMatch && currentClass) {
                const method = {
                    type: 'method',
                    name: methodMatch[1],
                    range: new vscode.Range(new vscode.Position(index, 0), new vscode.Position(index, line.length))
                };
                currentClass.children?.push(method);
            }
        });
        return { structure };
    }
}
exports.CodeAnalyzer = CodeAnalyzer;
class CodeVisualizer {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        this.updateWebview();
    }
    visualizeAsTree(structure) {
        if (this._view) {
            this._view.webview.html = this.getVisualizationHtml(structure);
        }
    }
    updateWebview() {
        if (this._view) {
            this._view.webview.html = this.getVisualizationHtml({ type: 'root', name: 'No code analyzed yet' });
        }
    }
    getVisualizationHtml(structure) {
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
    renderTreeNode(node) {
        let html = `
            <div class="tree-node">
                <span class="node-type">[${node.type}]</span> ${node.name}
        `;
        if (node.children && node.children.length > 0) {
            html += node.children.map((child) => this.renderTreeNode(child)).join('');
        }
        html += '</div>';
        return html;
    }
}
exports.CodeVisualizer = CodeVisualizer;
//# sourceMappingURL=codeAnalyzer.js.map