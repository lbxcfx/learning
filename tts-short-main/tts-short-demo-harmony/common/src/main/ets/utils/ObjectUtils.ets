import { List } from '@kit.ArkTS';
import { TsUtils } from './TsUtils';

export class ObjectUtils {
  static filterNull(obj: object) {
    let keys = Object.keys(obj)
    let result: object = JSON.parse("{}")

    keys.forEach((key) => {
      if (!ObjectUtils.isEmptyOrNull(obj[key])) {
        result[key] = obj[key]
      }
    })
    return result
  }

  static mergeObject(obj1: object, obj2: object): object {
    return TsUtils.mergeObject(obj1, obj2)
  }

  static isEmptyOrNull(obj?: Object): boolean {
    if (obj === undefined) {
      return true
    }
    if (obj === null) {
      return true
    }
    if (typeof obj === 'object') {
      if (Object.keys(obj).length === 0) {
        return true
      }
    }
    if (typeof obj === 'string') {
      if (obj.trim().length === 0) {
        return true
      }
    }
    if (Array.isArray(obj) || obj instanceof List) {
      if (obj.length === 0) {
        return true
      }
    }
    return false
  }

  static isEmptyOrNulls(objs: object[]) {
    if (ObjectUtils.isEmptyOrNull(objs)) {
      return true
    }
    for (let i = 0; i < objs.length; i++) {
      if (ObjectUtils.isEmptyOrNull(objs[i])) {
        return true
      }
    }
    return false
  }

  static toNumber(obj?: Object | null, defaultValue: number = 0): number {
    try {
      return obj as number
    } catch (e) {
      return defaultValue
    }
  }

  static toString(obj?: Object | null, defaultValue: string = ""): string {
    try {
      return obj as string
    } catch (e) {
      return defaultValue
    }
  }

  static toBoolean(obj?: Object | null, defaultValue: boolean = false): boolean {
    try {
      return obj as boolean
    } catch (e) {
      return defaultValue
    }
  }
}