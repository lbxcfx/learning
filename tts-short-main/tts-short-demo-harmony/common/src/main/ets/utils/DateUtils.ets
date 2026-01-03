import { DateUtil } from '@pura/harmony-utils'

export class DateUtils {
  static getWeekDay(date: number | string | Date): string {
    let number = DateUtil.getWeekDay(date)
    if (number === 1) {
      return '周一'
    } else if (number === 2) {
      return '周二'
    } else if (number === 3) {
      return '周三'
    } else if (number === 4) {
      return '周四'
    } else if (number === 5) {
      return '周五'
    } else if (number === 6) {
      return '周六'
    } else if (number === 7) {
      return '周日'
    }else {
      return '周一'
    }
  }
}