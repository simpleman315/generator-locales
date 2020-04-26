import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";
const join = path.join;
import * as readline from "readline";
import CONSTANTS from "./constants";
import utils from "./utils";
import {
  chinaReg,
  matchCusChinaReg,
  matchCusLongChinaReg,
  formatMessageReg,
  formatMessageRegCap,
  commentReg,
  mulCommentReg,
  matchConsoleReg,
  startPath,
  slashReg,
  impFormatMessageReg,
} from "./regExp";

interface ZhCNObjs {
  zhCN: string;
  en: String;
}
const fileUtils = {
  getFilesByDir(dir: string) {
    const filterDirectory = [
      "locales",
      "images",
      "assets",
      "services",
      "models",
      "img",
      ".umi",
    ];
    const filterFileType = [
      ".less",
      ".sass",
      ".png",
      ".jpeg",
      ".gif",
      ".d.ts",
      ".md",
      ".html",
    ];
    let fileResults: string[] = [];
    function findFile(path: string) {
      let files = fs.readdirSync(path);
      let hasIncludeLocalesDir = false;
      if (path !== dir) {
        hasIncludeLocalesDir = files.some((item) => {
          let fPath = join(path, item);
          let stat = fs.statSync(fPath);
          return stat.isDirectory() && item === "locales";
        });
      }
      if (!hasIncludeLocalesDir) {
        files.forEach(function (item) {
          let fPath = join(path, item);
          let stat = fs.statSync(fPath);
          if (stat.isDirectory() && !filterDirectory.includes(item)) {
            findFile(fPath);
          }
          if (stat.isFile()) {
            let filterFile = filterFileType.filter(
              (item) => fPath.indexOf(item) !== -1
            );
            if (filterFile.length === 0) {
              fileResults.push(fPath);
            }
          }
        });
      }
    }
    findFile(dir);
    return fileResults;
  },

  /*
   * 按行读取文件内容中的中文短语
   * 返回：字符串数组
   * 参数：fReadName:文件名路径
   * callback:回调函数
   * */
  readFileChineseToArr(filePath: string, callback: any) {
    const relativePath = fileUtils.getRelativePath(filePath);
    let data = fs.readFileSync(filePath, "utf-8");
    // 替换单行注释
    data = data.replace(commentReg, (...args) => {
      return args[0].replace(chinaReg, "");
    });
    // 替换多行注释
    data = data.replace(mulCommentReg, (...args) => {
      return args[0].replace(chinaReg, "");
    });

    // 替换控制台输入表达式
    data = data.replace(matchConsoleReg, (...args) => {
      return args[0].replace(chinaReg, "");
    });
    const readable = Readable.from(data);
    // let fRead = fs.createReadStream(filePath);
    let objReadline = readline.createInterface({
      input: readable,
    });
    let arr: string[] = [];
    let formatMessageArr: string[] = [];
    let matchFileLine: string[] = [];
    let formatMessageMatchFileLine: string[] = [];
    let lineNum = 1;
    // 自动import formMessage会增加一行
    if (!data.match(impFormatMessageReg)) {
      lineNum = 2;
    };
    objReadline.on("line", function (line) {
      let srcLine = line;

      // 匹配自定义表单.国际化 中文
      line = line.replace(matchCusChinaReg, (...args) => {
        const positon = srcLine.indexOf(args[0]);
        matchFileLine.push(`// ${relativePath} lineNum: ${lineNum} ${positon}`);
        arr.push(args[0]);
        return "";
      });

      // 匹配很长需要切割的中文
      line = line.replace(matchCusLongChinaReg, (...args) => {
        const positon = srcLine.indexOf(args[0]);
        matchFileLine.push(`// ${relativePath} lineNum: ${lineNum} ${positon}`);
        arr.push(args[0]);
        return "";
      });

      let regResult = line.match(chinaReg);
      if (regResult && regResult.length > 0) {
        regResult.map((item) => {
          arr.push(item);
          const positon = srcLine.indexOf(item);
          matchFileLine.push(
            `// ${relativePath} lineNum: ${lineNum} ${positon}`
          );
        });
      }

      let formatMsgs = line.match(formatMessageReg);
      if (formatMsgs && formatMsgs.length > 0) {
        formatMsgs.map((item) => {
          let matches = formatMessageReg.exec(item);
          if (matches && matches.length >= 1) {
            formatMessageArr.push(matches[1]);
            const positon = srcLine.indexOf(item);
            formatMessageMatchFileLine.push(
              `// ${relativePath} lineNum: ${lineNum} ${positon}`
            );
          }
        });
      }
      let formatMsgsCap = line.match(formatMessageRegCap);
      if (formatMsgsCap && formatMsgsCap.length > 0) {
        formatMsgsCap.map((item) => {
          let matches = formatMessageRegCap.exec(item);
          if (matches && matches.length >= 1) {
            formatMessageArr.push(matches[1]);
            const positon = srcLine.indexOf(item);
            formatMessageMatchFileLine.push(
              `// ${relativePath} lineNum: ${lineNum} ${positon}`
            );
          }
        });
      }
      lineNum += 1;
    });
    objReadline.on("close", function () {
      callback(
        arr,
        matchFileLine,
        formatMessageArr,
        formatMessageMatchFileLine
      );
    });
  },
  /**
   *
   * @param {*} filePath //文件路径
   * @param {*} insertData //新增内容
   * @param {*} reverseLine //倒数第几行
   */
  writeFileToLine(filePath: string, insertData: string[], reverseLine: number) {
    let data = fs.readFileSync(filePath, "utf8");
    let datas = data.split("\n");
    // 移除末尾空行
    while (datas && datas[datas.length - 1] === "") {
      datas.pop();
    }
    datas.splice(datas.length - reverseLine, 0, ...insertData);
    fs.writeFileSync(filePath, datas.join("\n"));
  },
  /**
   *
   * @param {*} filePath //文件路径
   * @param {*} data //新增内容
   */
  writeFile(filePath: string, data: string[]) {
    fs.writeFileSync(filePath, data.join("\n"));
  },
  /**
   * 将文件中的中文替换成国际化标签
   * @param filePath 文件路径
   * @param genKey 国际化key
   */
  replaceZhbyGenkey(filePath: string, zhCN: string, genKey: string) {
    console.error(filePath);
    console.error(genKey);
  },
  /**
   *
   * @param includesZhCNFiles 包含中文的文件
   * @param allZhCNs 所有匹配的中文
   * @param transENByallZhCNs 所有中文对应的英文
   * @param keyName 国际化key头部唯一名称
   */
  writeFormateMessageToFile(
    includesZhCNFiles: string[],
    allZhCNs: string[],
    transENByallZhCNs: string[],
    keyName: string
  ) {
    if (
      includesZhCNFiles &&
      includesZhCNFiles.length > 0 &&
      allZhCNs &&
      allZhCNs.length > 0
    ) {
      includesZhCNFiles.map((item) => {
        fileUtils.replaceChZhToFormatmessage({
          filePath: item,
          allZhCNs,
          transENByallZhCNs,
          keyName,
        });
      });
    }
  },
  /**
   * 返回将中文替换成国际化标签后的文本
   * @param filePath 文件目录
   * @param callback 回调函数
   */
  replaceChZhToFormatmessage(options: any) {
    const filterMap = new Map();
    let { filePath, allZhCNs, transENByallZhCNs, keyName } = options;
    let data = fs.readFileSync(filePath, "utf-8");
    if (!data.match(impFormatMessageReg)) {
      data = `import { formatMessage } from 'umi-plugin-react/locale';\n${data}`;
    };
    // 替换单行注释
    data = data.replace(commentReg, (...args) => {
      const id = utils.guid();
      filterMap.set(id, args[0]);
      return id;
    });
    // 替换多行注释
    data = data.replace(mulCommentReg, (...args) => {
      const id = utils.guid();
      filterMap.set(id, args[0]);
      return id;
    });
    // 替换控制台输入表达式
    data = data.replace(matchConsoleReg, (...args) => {
      const id = utils.guid();
      filterMap.set(id, args[0]);
      return id;
    });
    // 占位单引号防止正则匹配错误
    const guid = utils.guid();
    const qguid = utils.guid();
    const allZhCNObjs: ZhCNObjs[] = [];
    allZhCNs.map((item: string, index: number) => {
      allZhCNObjs.push({
        zhCN: item,
        en: transENByallZhCNs[index],
      });
    });
    // 字符长的中文排在前面，防止正则包含匹配
    allZhCNObjs.sort((a: ZhCNObjs, b: ZhCNObjs) => {
      return b.zhCN.length - a.zhCN.length;
    });
    // 正则替换文件中的中文为国际化表达式
    data = fileUtils._replaceZhCNToFormatMessage(
      data,
      keyName,
      allZhCNObjs,
      guid,
      qguid
    );
    //替换回单引号和`符号
    let guidReg = new RegExp(guid, "g");
    data = data.replace(guidReg, "'");
    let qguidReg = new RegExp(qguid, "g");
    data = data.replace(qguidReg, "`");
    // 还原过滤字符串
    for (let [key, value] of filterMap) {
      data = data.replace(key, value);
    }
    fs.writeFileSync(filePath, data);
  },

  /**
   * 将data中的中文替换成国际化标签
   * @param data 需要替换的字符串
   * @param keyName 国际化标签前缀
   * @param allZhCNObjs 中英文对象数组
   * @param guid 单引号替换字符
   * @param qguid `符号替换字符
   */
  _replaceZhCNToFormatMessage(
    data: string,
    keyName: string,
    allZhCNObjs: ZhCNObjs[],
    guid: string,
    qguid: string
  ): string {
    allZhCNObjs.map((item: ZhCNObjs, index: number) => {
      let key = `${keyName}.${item.en}`;
      // 匹配类似页面中message.error('国际化xxx')或者 return '国际化xxx'的中文
      let matchRegStr1 = `(')([^\r\n']*)(${item.zhCN})([^\r\n']*)(')`;
      const matchReg1 = new RegExp(matchRegStr1, "g");
      data = data.replace(matchReg1, (...args: any) => {
        return `${qguid}${args[2]}\${formatMessage({ id: ${guid}${key}${guid} })}${args[4]}${qguid}`;
      });
      // 匹配类似页面中message.error(`国际化xxx${text}`)或者 return `xxx${国际化}`的中文
      let matchRegStr2 = `(\`)([^\r\n\`]*)(${item.zhCN})([^\r\n\`]*)(\`)`;
      const matchReg2 = new RegExp(matchRegStr2, "g");
      data = data.replace(matchReg2, (...args: any) => {
        return `${args[1]}${args[2]}\${formatMessage({ id: ${guid}${key}${guid} })}${args[4]}${args[5]}`;
      });

      // 匹配类似页面中<div title="国际化"></div>的中文
      let matchRegStr3 = `(\\")(${item.zhCN})(\\")`;
      const matchReg3 = new RegExp(matchRegStr3, "g");
      data = data.replace(
        matchReg3,
        `{formatMessage({ id: ${guid}${key}${guid} })}`
      );
      // 匹配类似页面中<div>国际化</div>的中文
      let matchRegStr4 = `(${item.zhCN})`;
      const matchReg4 = new RegExp(matchRegStr4, "g");
      data = data.replace(matchReg4, (...args: any) => {
        return `{formatMessage({ id: ${guid}${key}${guid} })}`;
      });
    });
    return data;
  },
  /**
   *
   * @param {*} dir
   */
  createLocalesDirAndFile(dir: string) {
    try {
      let data = "export default {\n};";
      const exists = fs.existsSync(path.join(dir, "locales"));
      if (!exists) {
        fs.mkdirSync(path.join(dir, "locales"));
        fs.writeFileSync(path.join(dir, "locales/zh-CN.ts"), data);
      } else {
        const fileExists = fs.existsSync(path.join(dir, "locales/zh-CN.ts"));
        if (!fileExists) {
          fs.writeFileSync(path.join(dir, "locales/zh-CN.ts"), data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  /**
   * 将国际化js文件转成对象
   * @param {*} dir
   */
  convertLocalesFileToMap(dir: string) {
    const processDatas = new Map();
    let data = fs.readFileSync(path.join(dir, "locales/zh-CN.ts"), "utf-8");
    const datas = data.split("\n");
    datas.map((item: string) => {
      if (
        item.indexOf("export default") === -1 &&
        !item.match(commentReg) &&
        item.indexOf("};") === -1
      ) {
        item = item.trim();
        if (item.lastIndexOf(",") === item.length) {
          item = item.substring(0, item.lastIndexOf(","));
        }
        const items = item.split(":");
        if (items.length === 2) {
          let key = items[0].trim();
          let val = items[1].trim();
          key = key.substring(key.indexOf("'") + 1, key.lastIndexOf("'"));
          val = val.substring(val.indexOf("'") + 1, val.lastIndexOf("'"));
          processDatas.set(key, val);
        }
      }
    });
    return processDatas;
  },
  /**
   * 向上查找最近的locales目录下的zh-CN.ts文件
   * @param {*} dir
   */
  findParentLocalesAndZh(dir: string) {
    let result = "";
    function find(currDir: string) {
      const fileExists = fs.existsSync(path.join(currDir, "/locales/zh-CN.ts"));
      if (!fileExists) {
        const parentDir = path.resolve(currDir, "..");
        find(parentDir);
      } else {
        result = `${currDir}/locales/zh-CN.ts`;
      }
    }
    find(dir);
    return result;
  },
  /**
   * 获取当前工作空间目录，由于vscode开启了多目录模式，需要通过当前路径和工作空间文件数组来比对匹配
   * @param currFilePath 当前路径
   */
  getWorkRootDirByCurrFilePath(currFilePath: string) {
    let workRoot = "";
    const workspaceFolder = vscode.workspace.workspaceFolders;
    if (workspaceFolder && workspaceFolder.length > 0) {
      workspaceFolder.some((item) => {
        let findIndex = item.uri.fsPath.lastIndexOf(path.sep);
        let rootPath = item.uri.fsPath.substring(findIndex);
        let matchs = currFilePath.match(startPath);
        if (
          matchs &&
          matchs.length === 1 &&
          matchs[0].replace(slashReg, "") === rootPath.replace(slashReg, "")
        ) {
          workRoot = item.uri.fsPath.substring(0, findIndex);
          return true;
        }
      });
    }
    return workRoot;
  },
  /**
   * 通过当前路径获取文件相对根目录路径
   * @param currFilePath 当前路径
   */
  getRelativePath(currFilePath: string) {
    let relativePath = "";
    const workspaceFolder = vscode.workspace.workspaceFolders;
    if (workspaceFolder && workspaceFolder.length > 0) {
      workspaceFolder.some((item) => {
        let findIndex = currFilePath.indexOf(item.uri.fsPath);
        if (findIndex !== -1) {
          relativePath = currFilePath.substring(item.uri.fsPath.length);
          relativePath = `${path.sep}${item.name}${relativePath}`;
          return true;
        }
      });
    }
    return relativePath;
  },
};

export default fileUtils;
