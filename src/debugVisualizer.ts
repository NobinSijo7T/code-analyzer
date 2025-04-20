import * as vscode from 'vscode';

export class DebugVisualizer {
    private debugPanel: vscode.WebviewPanel | undefined;

    constructor(private context: vscode.ExtensionContext) {
        // Register debug session event handlers
        vscode.debug.onDidStartDebugSession(this.handleDebugSessionStart.bind(this));
        vscode.debug.onDidTerminateDebugSession(this.handleDebugSessionEnd.bind(this));
        vscode.debug.onDidChangeBreakpoints(this.handleBreakpointChange.bind(this));
    }

    private createDebugPanel() {
        this.debugPanel = vscode.window.createWebviewPanel(
            'debugVisualization',
            'Debug Visualization',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.debugPanel.onDidDispose(() => {
            this.debugPanel = undefined;
        });

        this.updateDebugView();
    }

    private handleDebugSessionStart(_session: vscode.DebugSession) {
        if (!this.debugPanel) {
            this.createDebugPanel();
        }
        this.updateDebugView();
    }

    private handleDebugSessionEnd(_session: vscode.DebugSession) {
        if (this.debugPanel) {
            this.debugPanel.dispose();
        }
    }

    private handleBreakpointChange(_event: vscode.BreakpointsChangeEvent) {
        this.updateDebugView();
    }

    private async updateDebugView() {
        if (!this.debugPanel) return;

        const session = vscode.debug.activeDebugSession;
        if (!session) {
            this.debugPanel.webview.html = this.getDebugViewHtml({ status: 'No active debug session' });
            return;
        }

        // Get current stack trace and variables
        const stackTrace = await session.customRequest('stackTrace', { threadId: 1 });
        const scopes = await session.customRequest('scopes', { frameId: stackTrace.stackFrames[0].id });
        const variables = await session.customRequest('variables', { variablesReference: scopes.scopes[0].variablesReference });

        const debugState = {
            status: 'Debugging',
            stackTrace: stackTrace.stackFrames,
            variables: variables.variables
        };

        this.debugPanel.webview.html = this.getDebugViewHtml(debugState);
    }

    private getDebugViewHtml(state: any): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    .section {
                        margin-bottom: 20px;
                    }
                    .variable {
                        margin: 5px 0;
                        padding: 5px;
                        background-color: #f0f0f0;
                    }
                    .stack-frame {
                        margin: 5px 0;
                        padding: 5px;
                        border-left: 3px solid #007acc;
                    }
                </style>
            </head>
            <body>
                <h2>Debug Status: ${state.status}</h2>
                ${state.stackTrace ? this.renderStackTrace(state.stackTrace) : ''}
                ${state.variables ? this.renderVariables(state.variables) : ''}
            </body>
            </html>
        `;
    }

    private renderStackTrace(stackFrames: any[]): string {
        return `
            <div class="section">
                <h3>Stack Trace</h3>
                ${stackFrames.map(frame => `
                    <div class="stack-frame">
                        ${frame.name} (${frame.source.name}:${frame.line})
                    </div>
                `).join('')}
            </div>
        `;
    }

    private renderVariables(variables: any[]): string {
        return `
            <div class="section">
                <h3>Variables</h3>
                ${variables.map(variable => `
                    <div class="variable">
                        ${variable.name}: ${variable.value}
                    </div>
                `).join('')}
            </div>
        `;
    }
} 