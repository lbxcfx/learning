import { DateUtil } from '@pura/harmony-utils'

export class ThrottleUtils {
  private static map: Map<string, number> = new Map()

  static single(tag: string, func: () => void, wait: number = 1000) {
    let lastTime: number = ThrottleUtils.map[tag] ?? 0
    if (DateUtil.getTodayTime() - lastTime > wait) {
      func()
      ThrottleUtils.map[tag] = DateUtil.getTodayTime()
    }

  }
}