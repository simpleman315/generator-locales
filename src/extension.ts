import commands from "./commands";
import * as vscode from "vscode";
import jumpToDefinition from "./jumpToDefinition";
const hoverProvider = require("./hoverProvider");
/**
 * @param {*} context
 */
export function activate(context: vscode.ExtensionContext) {
  commands(context);
  hoverProvider(context);
  jumpToDefinition(context);
}
exports.activate = activate;

export function deactivate() {}
