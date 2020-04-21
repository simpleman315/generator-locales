# generator-locales README

This is the README for your extension "generator-locales". After writing up a brief description, we recommend including the following sections.

## Features

国际化文件生成插件，右键文件夹-》生成国际化，生成规则如下：

1、会遍历当前文件夹下所有文件并查找所有中文字符并写入当前文件下的locales/zh-CN.ts文件下

2、如果当前文件夹的子文件夹已经包含了locales目录，则该子文件夹不做处理

3、对如下目录的文件不处理："locales","images","assets","services","models","img",".umi"

4、自动生成的文件zh-CN.ts点击注释可以跳转到对应的文件目录

5、点击页面中的'menu.demo.xxx'可以跳转到国际化资源配置文件对应的位置(目前只支持跳转到zh-CN文件)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
