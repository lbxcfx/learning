import { AppUtil } from '@pura/harmony-utils';

@Component
export struct SafeBottom {
  safeBottomColor: ResourceColor = $r("app.color.window_background_");

  build() {
    Stack()
      .backgroundColor(this.safeBottomColor)
      .width("100%")
      .height(px2vp(AppUtil.getNavigationIndicatorHeight()))
  }
}