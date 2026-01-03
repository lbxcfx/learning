import { common } from '@kit.AbilityKit';
import { BreakpointSystem, CommonSdk } from 'common';
import { SpeechSdk } from 'unishorttextspeechlibrary';
import { window } from '@kit.ArkUI';
import { AppUtil } from '@pura/harmony-utils';
import { SDKParams } from './constant/SDKParams';

export class InitializeApp {
  static initOnCreate(context: common.AbilityStageContext) {
    CommonSdk.initOnCreate(context.getApplicationContext())
    SpeechSdk.init(SDKParams.APP_KEY, SDKParams.APP_SECRET)
  }

  static initOnWindowStageCreate(context: common.UIAbilityContext, windowStage: window.WindowStage) {
    CommonSdk.initOnWindowStageCreate(context, windowStage)
    // 初始化状态栏
    AppUtil.setStatusBar(true, true, "#F1F2F3")
    let window = windowStage.getMainWindowSync()
    // 响应式
    BreakpointSystem.updateCurrentBreakpoint(window.getWindowProperties().windowRect.width)
    window.on("windowSizeChange", (windowRect => {
      BreakpointSystem.updateCurrentBreakpoint(windowRect.width)
    }))

  }
}