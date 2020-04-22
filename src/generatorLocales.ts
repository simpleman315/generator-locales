import * as path from "path";
import * as vscode from "vscode";
import * as request from "request";
import fileUtils from "./fileUtils";
import utils from "./utils";
import CONSTANTS from "./constants";

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
  dir: string,
  allZhCNs: string[],
  allZhCNPositions: string[],
  allFormatMessages: string[],
  allFormatMessagePositions: string[],
  isExistLocalesMap: Map<string, string>
) {
  // request('dddd');
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
      data.push(`    '${key}': '${value}',`);
    }
  }
  // 设置还未配置的国际化资源
  if (allZhCNs && allZhCNs.length > 0) {
    let noRepeatAllZhCNs = [...new Set(allZhCNs)];
    noRepeatAllZhCNs.map((item) => {
      let allIndex = utils.findAllIndex(allZhCNs, item);
      allIndex.map((indexItem: any) => {
        data.push(`    ${allZhCNPositions[indexItem]}`);
      });
      data.push(`    '${CONSTANTS.genKey}': '${item}',`);
    });
  }

  // 重新设置已经配置的国际化资源所在文件位置
  if (allFormatMessages && allFormatMessages.length > 0) {
    let noRepeatAllFormatMessages = [...new Set(allFormatMessages)];
    noRepeatAllFormatMessages.map((item) => {
      let allIndex = utils.findAllIndex(allFormatMessages, item);
      allIndex.map((indexItem: any) => {
        data.push(`    ${allFormatMessagePositions[indexItem]}`);
      });
      data.push(`    '${item}': '${isExistLocalesMap.get(item)}',`);
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
}

async function translate(allZhCNs: string[]): Promise<any> {
  allZhCNs.map((item) => {
    let enItem = global.encodeURIComponent(item);
    request(
      "http://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=" + enItem,
      (err: any, response: any, body: any) => {
        if (!err && response.statusCode === 200) {
          let res = JSON.parse(body);
          console.error(res);
        }
      }
    );
  });

  return Promise.resolve(allZhCNs);
}

const generatorLocales = {
  /**
   *
   * @param {*} dir 需要生成国际化的文件目录
   */
  generatorLocalesByDir(dir: string) {
    fileUtils.createLocalesDirAndFile(dir);
    const isExistLocalesMap = fileUtils.convertLocalesFileToMap(dir);
    let allZhCNs: string[] = [];
    let allZhCNPositions: string[] = [];
    let allFormatMessages: string[] = [];
    let allFormatMessagePositions: string[] = [];
    const files = fileUtils.getFilesByDir(dir);
    if (files.length === 0) {
      vscode.window.showInformationMessage("国际化文件生成成功！");
      return;
    }
    let currIndex = 0;
    files.map((item: string) => {
      fileUtils.readFileChineseToArr(item, function (
        arr: string[],
        matchFileLine: string[],
        formatMessageArr: string[],
        formatMessageMatchFileLine: string[]
      ) {
        if (arr && arr.length > 0) {
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
          translate(allZhCNs);
          writeLocalesByData(
            dir,
            allZhCNs,
            allZhCNPositions,
            allFormatMessages,
            allFormatMessagePositions,
            isExistLocalesMap
          );
        }
      });
    });
  },
};

export default generatorLocales;
