import commands from "./commands";
import * as vscode from "vscode";
import jumpToDefinition from "./jumpToDefinition";
import hoverProvider from "./hoverProvider";
import fileUtils from "./fileUtils";
/**
 * @param {*} context
 */
export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  );
  let wordRootDir = fileUtils.getWorkRootDir();
  const watcher = vscode.workspace.createFileSystemWatcher(
    "**/snippets/*.json"
  );
  // 监听snippets文件修改
  watcher.onDidChange((e) => {
    let path = e.fsPath;
    fileUtils.watchSnippetsFileAndUpdate(wordRootDir, path);
  });

  // 复制项目snip到.vscode目录
  fileUtils.createSnippetsFile(wordRootDir);
  statusBarItem.command = "generator.locales";
  statusBarItem.text = "正在生成国际化中...";
  commands(context, statusBarItem);
  hoverProvider(context);
  jumpToDefinition(context);
}
exports.activate = activate;

export function deactivate() {}
