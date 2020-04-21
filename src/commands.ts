import * as vscode from 'vscode';
import generatorLocales  from './generatorLocales';
export default function command(context: vscode.ExtensionContext){
    context.subscriptions.push(vscode.commands.registerCommand('generator.locales', (uri) => {
        generatorLocales.generatorLocalesByDir(uri.fsPath);
    }));
};