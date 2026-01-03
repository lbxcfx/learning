# Demo说明
此demo是基于Umi + ant design实现，详细信息请参考 [Umi](https://umijs.org/zh-CN)

# 快速上手
  ## 1.安装Node.js
  可以到[NodeJs](https://nodejs.org/en/download/)下载安装
  ## 2.安装依赖
  在命令行中进入到此目录下执行
  ```bash
    $ npm install
  ```
  注：由于node下载第三方依赖包是从国外服务器下载，下载的速度可能非常的缓慢且有可能会出现异常，所以为了提高效率，我们还是把npm的镜像源替换成淘宝的镜像源或者使用cnpm，具体操作方法可参考 [npm更换淘宝镜像](https://www.cnblogs.com/cythia/p/10985080.html)。

  ## 3.开始调试
  ```bash
    $ npm run start
  ```
  ## 4.修改配置
  在页面中填写AppKey、Secret和Path。
  AppKey、Secret可以在 云知声AI开放平台-控制台-我的应用中查看
  Path可以在 我的应用-应用详情中的API 地址模块中找到

  
# 其他说明
打包好的文件存放在dist目标，可以直接打开dist目录中的index.html,核心代码在/src/layout/ttsShort/Text.tsx文件中。





