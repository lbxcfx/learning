import { router } from '@kit.ArkUI';
import { ObjectUtils } from '../utils/ObjectUtils';
import { Icon } from './Icon';

@Component
export struct CustomToolbar {
  bgColor: ResourceColor | string = $r('app.color.window_background_')
  @BuilderParam navigation: () => void = this.defaultNavigation;
  @BuilderParam custom: () => void = this.defaultCustom;
  @BuilderParam menu: () => void = this.defaultMenu;
  @Prop title: ResourceStr | string = ""
  @Prop subTitle: ResourceStr = ""
  titleColor: ResourceColor | string = $r("app.color.font_dark")
  textShadow: ShadowOptions | Array<ShadowOptions> = { radius: 0 }

  build() {
    Row() {
      this.navigation()
      if (!ObjectUtils.isEmptyOrNull(this.title)) {
        Column() {
          Text(this.title)
            .width("100%")
            .textAlign(TextAlign.Center)
            .fontColor(this.titleColor)
            .fontSize(20)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .ellipsisMode(EllipsisMode.END)
            .textShadow(this.textShadow)

          if (!ObjectUtils.isEmptyOrNull(this.subTitle)) {
            Text(this.subTitle)
              .width("100%")
              .fontColor(this.titleColor)
              .fontSize(14)
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .ellipsisMode(EllipsisMode.END)
              .textShadow(this.textShadow)
          }
        }.padding({ right: 10 }).layoutWeight(1)
      }
      this.custom()
      this.menu()
    }.height($r("app.float.tabBarHeight")).width("100%").alignItems(VerticalAlign.Center).backgroundColor(this.bgColor)
  }

  @Builder
  private defaultNavigation() {
    Icon({ src: $r("app.media.ic_public_back_0"), outSize: $r("app.float.tabBarHeight") })
      .clickEffect({ level: ClickEffectLevel.LIGHT })
      .onClick(() => {
        router.back()
      })
  }

  @Builder
  private defaultCustom() {

  }

  @Builder
  private defaultMenu() {

  }
}