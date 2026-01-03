import { ObjectUtils } from './ObjectUtils'

export class NumberUtils {
  static parseInt(str?: string | number): number {
    try {
      return parseInt(str!.toString())
    } catch (e) {
      return 0
    }
  }

  static parseFloat(str?: string | number): number {
    if (ObjectUtils.isEmptyOrNull(str)) {
      return 0
    }
    try {
      return parseFloat(str!.toString())
    } catch (e) {
      return 0
    }
  }

  static toFixed(fractionDigits: number, str?: string | number): string {
    try {
      return NumberUtils.parseFloat(str).toFixed(fractionDigits)
    } catch (e) {
      return "0"
    }
  }

  // 保留有效小数
  static toFixedValid(fractionDigits: number, str?: string | number): string {
    try {
      let s = NumberUtils.parseFloat(str).toFixed(fractionDigits);
      while (s.includes(".") && (s.endsWith(".") || s.endsWith("0"))) {
        s = s.slice(0, -1);
      }
      return s;
    } catch (e) {
      return "0"
    }
  }
}