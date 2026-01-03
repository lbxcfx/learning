import { AppUtil } from '@pura/harmony-utils';

@Component
export struct SafeTop {
  safeTopColor: ResourceColor = $r("app.color.window_background_");

  build() {
    Stack()
      .backgroundColor(this.safeTopColor)
      .width("100%")
      .height(px2vp(AppUtil.getStatusBarHeight()))
  }
}