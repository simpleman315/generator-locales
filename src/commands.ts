import * as vscode from "vscode";
import generatorLocales from "./generatorLocales";
export default function command(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("generator.locales", (uri) => {
      vscode.window
        .showInputBox({
          // 调出输入框
          prompt: "需保证全局唯一",
          placeHolder: "输入国际化模块名称前缀，不输入默认为当前目录名称",
        })
        .then(function (moduleName) {
          generatorLocales.generatorLocalesByDir(uri.fsPath, moduleName);
        });
    })
  );
}
