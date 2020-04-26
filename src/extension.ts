import commands from "./commands";
import * as vscode from "vscode";
import jumpToDefinition from "./jumpToDefinition";
import hoverProvider from "./hoverProvider";
/**
 * @param {*} context
 */
export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  );
  statusBarItem.command = "generator.locales";
  statusBarItem.text = "正在生成国际化中...";
  commands(context,statusBarItem);
  hoverProvider(context);
  jumpToDefinition(context);
}
exports.activate = activate;

export function deactivate() {}
