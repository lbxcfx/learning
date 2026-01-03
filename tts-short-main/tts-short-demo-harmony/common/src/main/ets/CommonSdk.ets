import { common } from '@kit.AbilityKit'
import { window } from '@kit.ArkUI'
import { AppUtil } from '@pura/harmony-utils'


export class CommonSdk {
  static initOnCreate(context: common.ApplicationContext) {
    // MMKVUtils.init(context)
  }

  static initOnWindowStageCreate(context: common.UIAbilityContext, windowStage: window.WindowStage) {
    // 工具类初始化
    AppUtil.init(context)
  }
}