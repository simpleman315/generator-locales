import * as vscode from "vscode";
import * as path from "path";
import fileUtils from "./fileUtils";
import utils from "./utils";

// 国际化标识正则
const formatMessageReg = /formatMessage\(\{[\s]*id:\s*['|"]([1-9a-zA-Z.%]*)['|"][\s]*\}\)/g;
const formatMessageRegCap = /FormattedMessage[\s]*id=\s*['|"]([1-9a-zA-Z.%]*)['|"][\s\S]*>/g;
/**
 * @param {*} document
 * @param {*} position
 */
function provideDefinition(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  // const fileName = document.fileName;
  // const workDir = path.dirname(fileName);
  // const word = document.getText(document.getWordRangeAtPosition(position));
  const line = document.lineAt(position);
  let lineTxt = line.text.trim();

  if (lineTxt && lineTxt.indexOf("lineNum") !== -1) {
    let matches = lineTxt.split(" ");
    if (matches && matches.length === 5) {
      return new vscode.Location(
        vscode.Uri.file(matches[1]),
        new vscode.Position(parseInt(matches[3]) - 1, parseInt(matches[4]))
      );
    }
  }
}

/**
 * @param {*} document
 * @param {*} position
 */
function provideDefinitionForMsg(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  // const word = document.getText(document.getWordRangeAtPosition(position));
  const line = document.lineAt(position);
  const oriLineTxt = line.text;
  let lineTxt = line.text.trim();
  let formatMsgs = lineTxt.match(formatMessageReg);
  let matchFormMsgStr = "";
  if (formatMsgs && formatMsgs.length > 0) {
    formatMsgs.map((item) => {
      let matchs = formatMessageReg.exec(item);
      if (matchs && matchs.length >= 1) {
        const formMsg = matchs[1];
        const startIndex = oriLineTxt.indexOf(formMsg);
        const endIndex = startIndex + formMsg.length - 1;
        if (
          position.character >= startIndex &&
          position.character <= endIndex
        ) {
          matchFormMsgStr = formMsg;
        }
      }
    });
  }
  let formatMsgsCap = lineTxt.match(formatMessageRegCap);
  if (formatMsgsCap && formatMsgsCap.length > 0) {
    console.error(formatMsgsCap);
    formatMsgsCap.map((item) => {
      let matchs = formatMessageRegCap.exec(item);
      if (matchs && matchs.length >= 1) {
        const formMsg = matchs[1];
        const startIndex = oriLineTxt.indexOf(formMsg);
        const endIndex = startIndex + formMsg.length - 1;
        if (
          position.character >= startIndex &&
          position.character <= endIndex
        ) {
          matchFormMsgStr = formMsg;
        }
      }
    });
  }
  if (matchFormMsgStr) {
    const fileName = document.fileName;
    const workDir = path.dirname(fileName);
    const zhCNFile = fileUtils.findParentLocalesAndZh(workDir);
    if (zhCNFile) {
      const matchStrPositon = utils.findStrInFile(zhCNFile, matchFormMsgStr);
      if (matchStrPositon.col || matchStrPositon.row) {
        return new vscode.Location(
          vscode.Uri.file(zhCNFile),
          new vscode.Position(matchStrPositon.row, matchStrPositon.col)
        );
      }
    }
  }
}

export default function jumpToDefinition(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { pattern: "**/zh-CN.ts" },
      {
        provideDefinition,
      }
    ),
    vscode.languages.registerDefinitionProvider(
      { pattern: "**/*{.ts,.js,.jsx,.tsx}" },
      {
        provideDefinition: provideDefinitionForMsg,
      }
    )
  );
}
