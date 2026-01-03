import { AppUtil, FileUtil, StrUtil } from '@pura/harmony-utils';

/**
 * 本地磁盘缓存
 */
export class DiskCacheUtils {
  static async put(filePath: string, data: object): Promise<number> {
    try {
      await FileUtil.unlink(DiskCacheUtils.getFilesDirPath("", filePath))
    } catch (e) {
    }
    return FileUtil.writeEasy(DiskCacheUtils.getFilesDirPath("", filePath), JSON.stringify(data), false)
  }

  static async get(filePath: string): Promise<object> {
    return FileUtil.readText(DiskCacheUtils.getFilesDirPath("", filePath)).then(data => {
      let result: object = JSON.parse(data)
      return result
    }).catch((_: Error) => {
      return []
    })
  }

  static getFilesDirPath(dirPath: string, fileName?: string): string {
    let filePath = AppUtil.getContext().filesDir; //根目录
    if (StrUtil.isNotEmpty(dirPath)) {
      if (StrUtil.startsWith(dirPath, filePath)) { //路径中包含根目录，是完整路径。
        filePath = dirPath;
      } else { //路径中不包含根目录，拼接成完整路径。
        filePath = filePath + FileUtil.separator + dirPath;
      }
      if (!FileUtil.accessSync(filePath)) {
        FileUtil.mkdirSync(filePath) //如果文件夹不存在就创建
      }
    }
    if (StrUtil.isNotEmpty(fileName)) {
      filePath = filePath + FileUtil.separator + fileName;
    }
    return filePath;
  }
}