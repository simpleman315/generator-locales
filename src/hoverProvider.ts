import * as vscode from "vscode";

export default function (context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { pattern: "**/zh-CN.ts" },
      {
        provideHover(document: vscode.TextDocument, position: vscode.Position) {
          const line = document.lineAt(position);
          if (line.text && line.text.indexOf("lineNum") !== -1) {
            return new vscode.Hover("ctrl+click可以跳转到国际化所在文件位置");
          }
        },
      }
    )
  );
};
