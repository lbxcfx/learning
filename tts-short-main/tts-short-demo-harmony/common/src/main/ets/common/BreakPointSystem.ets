import { display } from '@kit.ArkUI'
import { LogUtil } from '@pura/harmony-utils'

declare interface BreakPointTypeOption<T> {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  xxl?: T
}

export class BreakPointType<T> {
  options: BreakPointTypeOption<T>

  constructor(option: BreakPointTypeOption<T>) {
    this.options = option
  }

  getValue(currentBreakPoint: string) {
    if (currentBreakPoint === 'xs') { // <320
      return this.options.xs ?? this.options.sm
    } else if (currentBreakPoint === 'sm') { // <600
      return this.options.sm
    } else if (currentBreakPoint === 'md') { // <840
      return this.options.md
    } else if (currentBreakPoint === 'lg') {
      return this.options.lg
    } else if (currentBreakPoint === 'xl') {
      return this.options.xl ?? this.options.lg
    } else if (currentBreakPoint === 'xxl') {
      return this.options.xxl ?? this.options.xl ?? this.options.lg
    } else {
      return this.options.lg
    }
  }
}

export class BreakPointSystem {
  static currentBreakPoint = "sm"

  public static updateCurrentBreakpoint(windowWidthPx: number) {
    let windowWidthVp = windowWidthPx / display.getDefaultDisplaySync().densityPixels
    LogUtil.info("windowWidthVp=" + windowWidthVp)
    let breakpoint: string = ''
    if (windowWidthVp < 320) { // 小屏幕手机
      breakpoint = 'xs'
    } else if (windowWidthVp < 600) { // 手机
      breakpoint = 'sm'
    } else if (windowWidthVp < 840) { // 折叠屏
      breakpoint = 'md'
    } else if (windowWidthVp < 1024) { // 平板
      breakpoint = 'lg'
    } else {
      breakpoint = 'xl' // 平板横屏
    }
    if (BreakPointSystem.currentBreakPoint !== breakpoint) {
      BreakPointSystem.currentBreakPoint = breakpoint
      AppStorage.setOrCreate('currentBreakpoint', breakpoint)
      LogUtil.info('on current breakpoint: ' + breakpoint)
      // 使用状态变量记录当前断点值
    }
  }
}