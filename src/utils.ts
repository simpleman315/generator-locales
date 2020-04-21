import * as fs from "fs";
import * as os from "os";
import * as vscode from "vscode";
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
    const rows = content.split(os.EOL);
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
};
export default utils;
