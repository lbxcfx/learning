import { LogUtil } from '@pura/harmony-utils'
import { Speaker, SpeechParams } from 'unishorttextspeechlibrary'

@Component
export struct ExperienceSetting {
  @Link speaker: Array<Speaker>
  @Link speechParams: SpeechParams
  @Link vcnSelectIndex: number

  build() {
    Column() {
      Text("在线体验")
        .fontSize(22)
        .fontWeight(FontWeight.Medium)
        .textAlign(TextAlign.Start)
        .width('100%')
        .height(40)
      Line().width('100%').height(1).backgroundColor($r('app.color.accent')).margin({ left: 20, right: 20 })
      Grid() {
        ForEach(this.speaker, (item: Speaker, index: number) => {
          GridItem() {
            this.buildVcnItem(item, index)
          }
        })
      }
      .padding({ left: 10, right: 10, top: 20 })
      .columnsTemplate('1fr 1fr')
      .columnsGap(10)
      .rowsGap(10)
      .cellLength(0)
      .layoutDirection(GridDirection.Column)
      .height(350)
      .width('100%')

      Row() {
        Text("音量:").fontSize(16).fontColor($r('app.color.font_dark'))
        Text("小").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 20 })
        Slider({ value: this.speechParams.volume }).layoutWeight(1).margin({ left: 8 }).onChange((value: number) => {
          this.speechParams.volume = value
          LogUtil.info(`音量大小是${value}`)
        })
        Text("大").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 8, right: 20 })
      }.width('90%')

      Row() {
        Text("语速:").fontSize(16).fontColor($r('app.color.font_dark'))
        Text("慢").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 20 })
        Slider({ value: this.speechParams.speed }).layoutWeight(1).margin({ left: 8 }).onChange((value: number) => {
          this.speechParams.speed = value
          LogUtil.info(`语速是${value}`)
        })
        Text("快").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 8, right: 20 })
      }.width('90%')

      Row() {
        Text("音高:").fontSize(16).fontColor($r('app.color.font_dark'))
        Text("低").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 20 })
        Slider({ value: this.speechParams.pitch }).layoutWeight(1).margin({ left: 8 }).onChange((value: number) => {
          this.speechParams.pitch = value
          LogUtil.info(`音高大小是${value}`)
        })
        Text("高").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 8, right: 20 })
      }.width('90%')

      Row() {
        Text("亮度:").fontSize(16).fontColor($r('app.color.font_dark'))
        Text("低").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 20 })
        Slider({ value: this.speechParams.bright }).layoutWeight(1).margin({ left: 8 }).onChange((value: number) => {
          this.speechParams.bright = value
          LogUtil.info(`亮度大小是${value}`)
        })
        Text("高").fontSize(14).fontColor($r('app.color.font_hint')).margin({ left: 8, right: 20 })
      }.width('90%')
    }.width('95%')
  }

  @Builder
  buildVcnItem(item: Speaker, index: number) {
    Stack({ alignContent: Alignment.TopEnd }) {
      Row() {
        Text("精品")
          .fontSize(12)
          .fontColor($r('app.color.font_white'))
          .borderRadius(5)
          .margin({ right: 8, top: 5 })
          .padding({ left: 5, right: 5 })
          .backgroundColor($r('app.color.font_red'))
          .height(25)
      }.alignItems(VerticalAlign.Center).justifyContent(FlexAlign.End).width('100%')

      Column() {
        Row() {
          Image(item.url).height(60).width(60).borderRadius(40)
          Column() {
            Text(item.vcnName).fontSize(16).fontColor($r('app.color.black'))
            Text(item.vcnTone).fontSize(16).fontColor($r('app.color.black'))
          }.alignItems(HorizontalAlign.Start).margin({ left: 5 })
        }

        Line().height(1).width('100%').margin({ top: 15 }).backgroundColor($r('app.color.font_gray'))
        Text(item.vcnScenario)
          .fontSize(14)
          .width('100%')
          .height(40)
          .width('100%')
          .textAlign(TextAlign.Center)
          .fontColor(index == this.vcnSelectIndex ? $r('app.color.white') : $r('app.color.font_dark'))
          .backgroundColor(index == this.vcnSelectIndex ? $r('app.color.accent') : $r('app.color.white'))
      }
      .margin({ top: 20 })
      .alignItems(HorizontalAlign.Center).justifyContent(FlexAlign.Center)
    }
    .onClick((event) => {
      this.vcnSelectIndex = index
      this.speechParams.vcn = item.vcn
    })
    .clickEffect({ level: ClickEffectLevel.LIGHT })
    .border({ color: $r('app.color.font_gray'), width: 1 })
    .borderRadius(5)
  }
}