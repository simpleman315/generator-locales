// 中文汉子正则
export const chinaReg = /([\u4e00-\u9fa5]+)/g;

// 中文汉子和符号正则
export const chinaAndChinaSymbolsReg = /([\u4e00-\u9fa5\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]+)/g;

// 中文标点符号正则
export const chinaSymbolsReg = /[丨\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]+/g;
// 增加自定义规则匹配，比如（表格.表单.国际化）
export const matchCusChinaReg = /([\u4e00-\u9fa5]+[.]{1}[\u4e00-\u9fa5.]*[\u4e00-\u9fa5]+)/g;

// 增加自定义规则匹配，比如（很长的中文文字需要/截取）
export const matchCusLongChinaReg = /([\u4e00-\u9fa5\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]+[/]{1}[\u4e00-\u9fa5\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]+)/g;

// 国际化标识正则
export const formatMessageReg = /formatMessage\(\{[\s]*id:\s*['|"]([1-9a-zA-Z.%]*)['|"][\s]*\}\)/g;
export const formatMessageRegCap = /FormattedMessage[\s]*id=\s*['|"]([1-9a-zA-Z.%]*)['|"][\s\S]*>/g;

// 单行注释正则
export const commentReg = /(\/\/[^\n\r]*[\n\r]+)/g;

// 多行注释
export const mulCommentReg = /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)/g;


// 匹配chrome console命令正则
export const matchConsoleReg = /console\..*\(.*\)/g;

// 匹配路径前缀，兼容mac和windows路径
export const startPath = /[\/\\][^\/\\]*/;
// 匹配正斜杠和反斜杠
export let slashReg = /[\/\\]/g;
// 常用英文字符正则
export const enSymbolsReg = /[@#()'",;?%&$~:*-]/g;

// 验证是否有导入国际化语句
export const impFormatMessageReg = /(import(.*)formatMessage)|(import(.*)FormattedMessage)/g;
