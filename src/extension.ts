import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.selectPhpMethod', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;
        
        // Encontrar el inicio y fin del método
        const methodRange = findMethodRange(document, position);
        
        if (methodRange) {
            // Seleccionar el rango completo
            editor.selection = new vscode.Selection(methodRange.start, methodRange.end);
            
            // Copiar al portapapeles
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
    
    // Expresión regular corregida y más clara para detectar métodos PHP
    const methodPattern = new RegExp(
        `(?:\\s*\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +  // Comentario PHPDoc opcional
        `(?:public|private|protected)?` +           // Modificador de acceso opcional
        `(?:\\s*static)?` +                         // Modificador static opcional
        `\\s*function\\s+\\w+\\s*\\(\\s*` +         // Definición de función
        `[\\s\\S]*?\\{\\s*` +                       // Cuerpo del método (hasta abrir llave)
        `[\\s\\S]*?\\}\\s*`,                        // Cuerpo del método (hasta cerrar llave)
        'g'
    );
    
    let match;
    let methodRange: vscode.Range | undefined;
    
    while ((match = methodPattern.exec(text)) !== null) {
        const startOffset = match.index;
        let endOffset = match.index + match[0].length;
        
        if (offset >= startOffset && offset <= endOffset) {
            const startPos = document.positionAt(startOffset);
            const endPos = document.positionAt(endOffset);
            methodRange = new vscode.Range(startPos, endPos);
            break;
        }
    }
    
    return methodRange;
}

export function deactivate() {}