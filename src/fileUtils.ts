import * as fs from "fs";
import * as path from "path";
const join = path.join;
import * as readline from "readline";
import CONSTANTS from './constants';
// 中文汉子和符号正则
const chinaReg = /([\u4e00-\u9fa5\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]+)/g;

// 国际化标识正则
const formatMessageReg = /formatMessage\(\{[\s]*id:\s*['|"]([1-9a-zA-Z.]*)['|"][\s]*\}\)/g;
const formatMessageRegCap = /FormattedMessage[\s]*id=\s*['|"]([1-9a-zA-Z.]*)['|"][\s\S]*>/g;

// 单行注释正则
const commentReg = /(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g;

// 多行注释
const mulCommentReg = /^(^\s+)\*[\s\S]*/g;

// 行尾注释
const tailCommentReg = /(?<!\:)\/\/[^\n]*/g;

const fileUtils = {
  getFilesByDir(dir:string) {
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
    ];
    let fileResults:string[] = [];
    function findFile(path:string) {
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
    let fRead = fs.createReadStream(filePath);
    let objReadline = readline.createInterface({
      input: fRead,
    });
    let arr: string[] = [];
    let formatMessageArr: string[] = [];
    let matchFileLine: string[] = [];
    let formatMessageMatchFileLine: string[] = [];
    let lineNum = 1;
    objReadline.on("line", function (line) {
      let srcLine = line;
      let comment = line.match(commentReg);
      if (!(comment && comment.length > 0)) {
        let mulComment = line.match(mulCommentReg);
        if (!(mulComment && mulComment.length > 0)) {
          // 替换行尾注释
          line = line.replace(tailCommentReg, "");
          let regResult = line.match(chinaReg);
          if (regResult && regResult.length > 0) {
            regResult.map((item) => {
              arr.push(item);
              const positon = srcLine.indexOf(item);
              matchFileLine.push(
                `// ${filePath} lineNum: ${lineNum} ${positon}`
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
                  `// ${filePath} lineNum: ${lineNum} ${positon}`
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
                  `// ${filePath} lineNum: ${lineNum} ${positon}`
                );
              }
            });
          }
        }
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
          // 排除自动生成的key
          if (key !== CONSTANTS.genKey) {
            processDatas.set(key, val);
          }
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
};

export default fileUtils;
