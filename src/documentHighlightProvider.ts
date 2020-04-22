import * as vscode from 'vscode';

// function provideDocumentHighlights(document, position, token) {
function provideDocumentHighlights() {
  let startPosition = new vscode.Position(0, 1);
  let endPosition = new vscode.Position(2, 6);
  let range = new vscode.Range(startPosition, endPosition);
  let res = [];
  res.push(new vscode.DocumentHighlight(range));
  return res;
}

export default function (context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentHighlightProvider(
      { pattern: "**/zh-CN.ts" },
      { provideDocumentHighlights }
    )
  );
};
