@Component
export struct BaseSetting {
  @Link appKey: string
  @Link appSecret: string
  @Link webSocketPath: string
  @Link downloadPath: string

  build() {
    Column() {
      Text("基础设置")
        .fontSize(22)
        .fontWeight(FontWeight.Medium)
        .textAlign(TextAlign.Start)
        .width('100%')
        .height(40)

      Line().width('100%').height(1).backgroundColor($r('app.color.accent'))

      Row() {
        Text('AppKey').fontColor($r('app.color.font_black')).fontSize(16).width(80)
        TextArea({
          text: this.appKey,
          placeholder: $r('app.string.appKey_input_default_placeholder')
        })
          .onChange((text) => {
            this.appKey = text
          })
          .margin({ left: 10, top: 20 })
          .textAlign(TextAlign.Start)
          .height('auto')
          .layoutWeight(1)
      }.alignItems(VerticalAlign.Center).width('100%').height('auto').borderRadius(0)

      Row() {
        Text('AppSecret').fontColor($r('app.color.font_black')).fontSize(16).width(80)
        TextArea({ text: this.appSecret, placeholder: $r('app.string.appSecret_input_default_placeholder') })
          .onChange((text) => {
            this.appSecret = text
          })
          .margin({ left: 10, top: 10 })
          .textAlign(TextAlign.Start)
          .height('auto')
          .layoutWeight(1)
      }.alignItems(VerticalAlign.Center).width('100%').height('auto').borderRadius(0)

      Row() {
        Text('试听地址').fontColor($r('app.color.font_black')).fontSize(16).width(80)
        TextArea({ text: this.webSocketPath, placeholder: $r('app.string.webSocket_input_default_placeholder') })
          .onChange((text) => {
            this.webSocketPath = text
          })
          .margin({ left: 10, top: 10 })
          .textAlign(TextAlign.Start)
          .height(40)
          .layoutWeight(1)
      }.alignItems(VerticalAlign.Center).width('100%').height(60).borderRadius(0)

      Row() {
        Text('下载地址').fontColor($r('app.color.font_black')).fontSize(16).width(80)
        TextArea({ text: this.downloadPath, placeholder: $r('app.string.download_input_default_placeholder') })
          .onChange((text) => {
            this.downloadPath = text
          })
          .margin({ left: 10, top: 10 })
          .textAlign(TextAlign.Start)
          .height(40)
          .layoutWeight(1)
      }.alignItems(VerticalAlign.Center).width('100%').height(60).borderRadius(0)
    }.width('95%')
  }
}