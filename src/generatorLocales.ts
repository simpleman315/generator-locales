import * as path from "path";
import * as vscode from "vscode";
import * as request from "request-promise";
const md5 = require("blueimp-md5");
import fileUtils from "./fileUtils";
import utils from "./utils";
import { enSymbolsReg } from "./regExp";
import CONSTANTS from "./constants";
const localesIndent = "    ";

/**
 *
 * @param {*} dir
 * @param {*} allZhCNs 匹配到所有需国际化的中文
 * @param {*} allZhCNPositions 国际化资源在源文件中对应位置
 * @param {*} allFormatMessages 匹配到所有已经配置的国际化资源，为了重写标记位置
 * @param {*} allFormatMessagePositions 匹配到所有已经配置的国际化资源对应位置
 * @param {*} isExistLocalesMap 已经存在的国际化资源
 */
function writeLocalesByData(
  fileName: string,
  dir: string,
  allZhCNs: string[],
  transENByallZhCNs: string[],
  allZhCNPositions: string[],
  allFormatMessages: string[],
  allFormatMessagePositions: string[],
  isExistLocalesMap: Map<string, string>,
  statusBarItem: vscode.StatusBarItem
) {
  let data = [];
  data.push("export default {");
  // 获取已经配置过，但是页面未使用或者是路由类型的key
  let noSetMap = new Map();
  if (isExistLocalesMap && isExistLocalesMap.size > 0) {
    if (allFormatMessages && allFormatMessages.length > 0) {
      for (let [key, value] of isExistLocalesMap) {
        if (!allFormatMessages.includes(key)) {
          noSetMap.set(key, value);
        }
      }
    } else {
      noSetMap = isExistLocalesMap;
    }
  }
  // 设置已经存在的国际化，但页面未使用过
  if (noSetMap.size > 0) {
    for (let [key, value] of noSetMap) {
      data.push(`${localesIndent}'${key}': '${value}',`);
    }
  }

  // 设置还未配置的国际化资源
  if (allZhCNs && allZhCNs.length > 0) {
    let noRepeatAllZhCNs = [...new Set(allZhCNs)];
    let noRepeatTransENByallZhCNs = [...new Set(transENByallZhCNs)];
    noRepeatAllZhCNs.map((item, index) => {
      let genKey = `${fileName}.${noRepeatTransENByallZhCNs[index]}`;
      let allIndex = utils.findAllIndex(allZhCNs, item);
      allIndex.map((indexItem: any) => {
        data.push(`${localesIndent}${allZhCNPositions[indexItem]}`);
      });
      // 处理长中文
      let zhCN = item.replace("/", "");
      // 处理.分隔的国际化中文
      if (zhCN.indexOf(".") !== -1) {
        zhCN = zhCN.substring(zhCN.lastIndexOf(".") + 1);
      }
      data.push(`${localesIndent}'${genKey}': '${zhCN}',`);
    });
  }

  // 重新设置已经配置的国际化资源所在文件位置
  if (allFormatMessages && allFormatMessages.length > 0) {
    let noRepeatAllFormatMessages = [...new Set(allFormatMessages)];
    noRepeatAllFormatMessages.map((item) => {
      // 过滤页面中引入全局文件国家化资源的标签
      if (isExistLocalesMap.get(item)) {
        let allIndex = utils.findAllIndex(allFormatMessages, item);
        allIndex.map((indexItem: any) => {
          data.push(`${localesIndent}${allFormatMessagePositions[indexItem]}`);
        });
        data.push(
          `${localesIndent}'${item}': '${isExistLocalesMap.get(item)}',`
        );
      }
    });
  }
  // 去除最后一行逗号
  if (data.length > 1) {
    data[data.length - 1] = data[data.length - 1].substring(
      0,
      data[data.length - 1].length - 1
    );
  }
  data.push("};\n");
  fileUtils.writeFile(path.join(dir, "locales/zh-CN.ts"), data);
  vscode.window.showInformationMessage("国际化文件生成成功！");
  statusBarItem.hide();
}

/**
 * 百度翻译
 * @param allZhCNs 等待翻译中文列表
 */
async function translateBD(allZhCNs: string[]): Promise<any> {
  let translateAllZhCNs: string[] = [];
  const options = {
    method: "POST",
    url: "https://fanyi-api.baidu.com/api/trans/vip/translate",
    form: {
      q: "",
      from: "zh",
      to: "en",
      salt: 0,
      appid: CONSTANTS.appID,
      sign: "",
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const results = await Promise.all(
    allZhCNs.map(async (item, index) => {
      let salt = new Date().getTime();
      options.form.q = item;
      options.form.salt = salt;
      options.form.sign = md5(
        `${CONSTANTS.appID}${item}${salt}${CONSTANTS.key}`
      );
      // 百度开发api限制，1秒只能请求一次
      let timeout = (index + 1) * 2000;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(request(options));
        }, timeout);
      });
      // const result = await request(options);
      // return result;
    })
  );
  // 将拼接成的长字符翻译后转成原来的字符
  let resetTranslateAllZhCNs: string[] = [];
  results.map((item: any, index: number) => {
    try {
      let itemObj: any = JSON.parse(item);
      let translateWords = itemObj.trans_result[0].dst;
      resetTranslateAllZhCNs = resetTranslateAllZhCNs.concat(
        translateWords.split(CONSTANTS.transSplitSymbolEN)
      );
    } catch (error) {
      // 设置翻译失败的中文
      let failZhCNs = allZhCNs[index].split(CONSTANTS.transSplitSymbolEN);
      failZhCNs.map((item) => {
        resetTranslateAllZhCNs.push(`${CONSTANTS.translationFailed}${item}`);
      });
    }
  });

  // 处理成驼峰形式
  translateAllZhCNs = resetTranslateAllZhCNs.map((item: any, index: number) => {
    let translateWords = item;
    // 去除翻译文本包含的常用英文标点符号
    translateWords = translateWords.replace(enSymbolsReg, "");
    if (translateWords.indexOf("!") !== -1) {
      let results: string[] = [];
      let splitWords = translateWords.split("!");
      splitWords.map((subitem: string) => {
        if (subitem) {
          results.push(utils.wordsToHump(subitem));
        }
      });
      return results.join(".");
    }
    return utils.wordsToHump(translateWords);
  });
  return Promise.resolve(translateAllZhCNs);
}

const generatorLocales = {
  /**
   *
   * @param {*} dir 需要生成国际化的文件目录
   */
  generatorLocalesByDir(
    dir: string,
    moduleName: any,
    statusBarItem: vscode.StatusBarItem
  ) {
    let fileName = "";
    if (moduleName) {
      fileName = moduleName.toString();
    } else {
      fileName = utils.matchFileNameByDir(dir);
    }
    fileUtils.createLocalesDirAndFile(dir);
    const isExistLocalesMap = fileUtils.convertLocalesFileToMap(dir);
    let allZhCNs: string[] = [];
    let allZhCNPositions: string[] = [];
    let allFormatMessages: string[] = [];
    let allFormatMessagePositions: string[] = [];
    let includesZhCNFiles: string[] = [];
    const files = fileUtils.getFilesByDir(dir);
    if (files.length === 0) {
      vscode.window.showInformationMessage("国际化文件生成成功！");
      statusBarItem.hide();
      return;
    }
    let currIndex = 0;
    files.map((item: string) => {
      fileUtils.readFileChineseToArr(item, async function (
        arr: string[],
        matchFileLine: string[],
        formatMessageArr: string[],
        formatMessageMatchFileLine: string[]
      ) {
        if (arr && arr.length > 0) {
          includesZhCNFiles.push(item);
          allZhCNs = allZhCNs.concat(arr);
          allZhCNPositions = allZhCNPositions.concat(matchFileLine);
        }

        if (formatMessageArr && formatMessageArr.length > 0) {
          allFormatMessages = allFormatMessages.concat(formatMessageArr);
          allFormatMessagePositions = allFormatMessagePositions.concat(
            formatMessageMatchFileLine
          );
        }
        currIndex++;

        if (currIndex === files.length) {
          const allLongZhCNs = utils.getConcatLongStrByAllZhCNs(allZhCNs);
          const transENByallZhCNs = await translateBD(allLongZhCNs);
          // 将包含中文的文件替换成国际化标签，此处异步操作完成
          fileUtils.writeFormateMessageToFile(
            includesZhCNFiles,
            allZhCNs,
            transENByallZhCNs,
            fileName
          );
          writeLocalesByData(
            fileName,
            dir,
            allZhCNs,
            transENByallZhCNs,
            allZhCNPositions,
            allFormatMessages,
            allFormatMessagePositions,
            isExistLocalesMap,
            statusBarItem
          );
        }
      });
    });
  },
};

export default generatorLocales;
