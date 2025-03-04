import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.selectPhpMethod', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;
        
        const methodRange = findMethodRange(document, position);
        
        if (methodRange) {
            editor.selection = new vscode.Selection(methodRange.start, methodRange.end);
            vscode.env.clipboard.writeText(document.getText(methodRange));
            vscode.window.showInformationMessage('Método copiado al portapapeles');
        } else {
            vscode.window.showWarningMessage('No se encontró un método en la posición actual');
        }
    });

    context.subscriptions.push(disposable);
}

function findMethodRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Expresión regular para encontrar métodos PHP incluyendo PHPDoc
    const methodRegex = /(\/\*\*[\s\S]*?\*\/\s*)?(public|private|protected)?(\s+static)?\s+function\s+\w+\s*\([^)]*\)\s*\{/gm;

    let match;
    while ((match = methodRegex.exec(text)) !== null) {
        const startOffset = match.index;
        const matchLength = match[0].length;
        const openingBraceOffset = startOffset + matchLength - 1; // Posición de '{'

        let braceBalance = 1;
        let currentOffset = openingBraceOffset + 1;

        // Encontrar el cierre balanceado de las llaves
        while (currentOffset < text.length && braceBalance > 0) {
            const char = text[currentOffset];
            if (char === '{') braceBalance++;
            else if (char === '}') braceBalance--;
            currentOffset++;
        }

        if (braceBalance === 0) {
            const endOffset = currentOffset;
            // Verificar si el cursor está dentro de este método
            if (offset >= startOffset && offset < endOffset) {
                const startPos = document.positionAt(startOffset);
                const endPos = document.positionAt(endOffset);
                return new vscode.Range(startPos, endPos);
            }
        }
    }

    return undefined;
}

export function deactivate() {}