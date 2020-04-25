import * as fs from "fs";
import * as vscode from "vscode";
import CONSTANTS from "./constants";

const utils = {
  /**
   * @param {*} arr 数组
   * @param {*} elm 元素
   * return 返回该元素在数组中的所有索引
   */
  findAllIndex(arr: any[], elm: any) {
    let results = [];
    let len = arr.length;
    let pos = 0;
    while (pos < len) {
      pos = arr.indexOf(elm, pos);
      if (pos === -1) {
        //未找到就退出循环完成搜索
        break;
      }
      results.push(pos); //找到就存储索引
      pos += 1; //并从下个位置开始搜索
    }
    return results;
  },
  /**
   * 从某个文件里面查找某个字符串，返回第一个匹配处的行与列，未找到返回第一行第一列
   * @param filePath 要查找的文件
   * @param reg 正则对象，最好不要带g，也可以是字符串
   */
  findStrInFile: function (filePath: string, reg: string) {
    const content = fs.readFileSync(filePath, "utf-8");
    let regExp = new RegExp(reg, "m");
    // 没找到直接返回
    if (content.search(regExp) < 0) {
      return { row: 0, col: 0 };
    }
    const rows = content.split("\n");
    // 分行查找只为了拿到行
    for (let i = 0; i < rows.length; i++) {
      let col = rows[i].search(regExp);
      if (col >= 0) {
        return { row: i, col };
      }
    }
    return { row: 0, col: 0 };
  },
  /**
   * 获取某个字符串在文件里第一次出现位置的范围，
   */
  getStrRangeInFile: function (filePath: string, str: string) {
    var pos = this.findStrInFile(filePath, str);
    return new vscode.Range(
      new vscode.Position(pos.row, pos.col),
      new vscode.Position(pos.row, pos.col + str.length)
    );
  },
  /**
   * 空格隔开的单词转成驼峰
   * @param words 空格分隔的单词
   */
  wordsToHump: function (words: string) {
    var arr = words.split(" ");
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === "") {
        arr.splice(i, 1);
        i--;
      } else {
        if (i >= 1) {
          arr[i] = arr[i].substring(0, 1).toUpperCase() + arr[i].substring(1);
        }
      }
    }
    let result = arr.join("");
    if (result) {
      result = utils.toLowerCaseFirstCap(result);
    }
    return result;
  },
  /**
   * 首字母转小写
   * @param str
   */
  toLowerCaseFirstCap(str: string) {
    if (str) {
      let result = str.replace(str[0], str[0].toLowerCase());
      return result;
    }
    return str;
  },
  /**
   * 通过目录路径获取文件名称，不包含扩展名
   * @param dir 目录路径
   */
  matchFileNameByDir: function (path: string) {
    let result = "";
    var pos1 = path.lastIndexOf("/");
    var pos2 = path.lastIndexOf("\\");
    var pos = Math.max(pos1, pos2);
    if (pos < 0) {
      return path;
    }
    result = path.substring(pos + 1);
    return utils.toLowerCaseFirstCap(result);
  },
  /**
   * 生成唯一ID
   */
  guid: function () {
    return Number(
      Math.random().toString().substr(3, 3) +
        Math.random().toString().substr(3, 3) +
        Math.random().toString().substr(3, 3) +
        Date.now()
    ).toString(36);
  },
  // 将中文数组切割成几个小的包含长字符的中文数据，用于减少百度翻译请求
  getConcatLongStrByAllZhCNs(allZhCNs: string[]) {
    let resultArr: string[] = [];
    if (allZhCNs && allZhCNs.length > 0) {
      let allZhCNsStr: string = allZhCNs.join(CONSTANTS.transSplitSymbolEN);
      // 替换所有中文分号字符防止被翻译成英文分号字符
      allZhCNsStr = allZhCNsStr.replace(CONSTANTS.transSplitSymbolZH, "");
      let processAllZhCNs = allZhCNsStr.split(CONSTANTS.transSplitSymbolEN);
      let longStr: string = "";
      processAllZhCNs.map((item, index) => {
        // 处理长中文，截取/后面的中文不做翻译
        if (item.indexOf("/") !== -1) {
          item = item.substring(0, item.indexOf("/"));
        }
        if (longStr.length <= 2000) {
          longStr += `${item}${CONSTANTS.transSplitSymbolZH}`;
          if (index === processAllZhCNs.length - 1) {
            // 过滤最后一个分割符号
            longStr = longStr.substring(0, longStr.length - 1);
            resultArr.push(longStr);
          }
        } else {
          // 过滤最后一个分割符号
          longStr = longStr.substring(0, longStr.length - 1);
          resultArr.push(longStr);
          longStr = `${item}${CONSTANTS.transSplitSymbolZH}`;
        }
      });
    }
    return resultArr;
  },
};
export default utils;
