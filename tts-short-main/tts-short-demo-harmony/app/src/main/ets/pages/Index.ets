import { LogUtil, ToastUtil } from '@pura/harmony-utils';
import { BreakPointType, CustomToolbar, ObjectUtils, SafeBottom, SafeTop } from 'common';
import { DefaultSpeaker, Speaker, SpeechEngine, SpeechParams, SpeechSdk } from 'unishorttextspeechlibrary';
import { SDKParams } from '../constant/SDKParams';
import { BaseSetting } from '../widget/BaseSetting';
import { ExperienceSetting } from '../widget/ExperienceSetting';

@Entry
@Component
struct Index {
  @StorageLink('currentBreakpoint') currentBreakpoint: string = "sm";
  @State appKey: string = SDKParams.APP_KEY
  @State appSecret: string = SDKParams.APP_SECRET
  @State baseUrl: string = SDKParams.BASE_URL
  @State downloadPath: string = SDKParams.DOWNLOAD_URL
  @State speaker: Speaker[] = []
  @State vcnSelectIndex: number = 0
  @State @Watch('onChangeParams') speechParams: SpeechParams = {
    format: "pcm",
    vcn: "kiyo-plus",
    text: "云知声专注于物联网人工智能服务，拥有完全自主知识产权，是世界领先的智能语音识别AI技术企业之一。公司成立于2012年6月29日，总部位于北京，在上海、深圳、厦门、合肥均设有分公司",
    sample: 16000,
    speed: 50,
    volume: 50,
    pitch: 50,
    bright: 50
  }

  aboutToAppear(): void {
    SpeechEngine.getInstance().setSpeechParams(this.speechParams)
    const qualitySpeakers = new DefaultSpeaker().qualitySpeakers
    this.speaker.push(...qualitySpeakers)
    if (this.speaker.length > 0) {
      this.speechParams.vcn = this.speaker[0].vcn
    }
    SpeechEngine.getInstance().setSpeechCallback({
      onInitializationComplete: (): void => {
        LogUtil.info(`speech onInitializationComplete`)
      },
      onSpeechStart: (): void => {
        LogUtil.info(`speech speech start`)
      },
      onSpeechEnd: (): void => {
        LogUtil.info(`speech speech end`)
      },
      onError: (code: number, message: string): void => {
        LogUtil.error(`speech error,code is ${code},message is ${message}`)
      },
      onStatus: (status: string): void => {
        // LogUtil.info(`speech status,status is ${status}`)
      },
      onSpeechResultData: (value: string | ArrayBuffer): void => {

      }
    })
  }

  onCheckSDKParams() {
    if (this.appKey != SpeechSdk.appKey
      || this.appSecret != SpeechSdk.appSecret
      || this.downloadPath != SpeechSdk.downloadUrl
      || this.baseUrl != SpeechSdk.baseUrl
    ) {
      SpeechSdk.init(this.appKey, this.appSecret, this.baseUrl, this.downloadPath)
    }
  }

  onChangeParams() {
    SpeechEngine.getInstance().setSpeechParams(this.speechParams)
  }

  build() {
    Column() {
      SafeTop()
      CustomToolbar({
        navigation: this.customNavigation,
        title: $r('app.string.home_title')
      })
      List() {
        ListItem() {
          BaseSetting({
            appKey: this.appKey,
            appSecret: this.appSecret,
            webSocketPath: this.baseUrl,
            downloadPath: this.downloadPath
          })
        }

        ListItem() {
          ExperienceSetting({
            speaker: this.speaker,
            speechParams: this.speechParams,
            vcnSelectIndex: this.vcnSelectIndex
          })
        }

        ListItem() {
          this.inputText()
        }

      }
      .alignListItem(ListItemAlign.Center)
      .width(new BreakPointType({ sm: "100%", md: "75%", lg: "75%" }).getValue(this.currentBreakpoint))
      .height('auto')
      .layoutWeight(1)

      SafeBottom()
    }
    .backgroundColor($r('app.color.white')).height('100%')
    .height('100%')
    .width('100%')
  }

  @Builder
  baseSetting() {
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
          .margin({ left: 10 })
          .textAlign(TextAlign.Start)
          .height(40)
          .layoutWeight(1)
      }.alignItems(VerticalAlign.Center).width('100%').height(60).borderRadius(0)

      Row() {
        Text('AppSecret').fontColor($r('app.color.font_black')).fontSize(16).width(80)
        TextArea({ text: this.appSecret, placeholder: $r('app.string.appSecret_input_default_placeholder') })
          .onChange((text) => {
            this.appKey = text
          })
          .margin({ left: 10, top: 10 })
          .textAlign(TextAlign.Start)
          .height(40)
          .layoutWeight(1)
      }.alignItems(VerticalAlign.Center).width('100%').height(60).borderRadius(0)

      Row() {
        Text('试听地址').fontColor($r('app.color.font_black')).fontSize(16).width(80)
        TextArea({ text: this.baseUrl, placeholder: $r('app.string.webSocket_input_default_placeholder') })
          .onChange((text) => {
            this.baseUrl = text
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

  @Builder
  inputText() {
    Column() {
      TextArea({ text: this.speechParams.text, placeholder: $r("app.string.speech_input_default_placeholder") })
        .fontColor($r('app.color.font_dark'))
        .fontSize(16)
        .height(200)
        .width('100%')
        .margin({ top: 40 })
        .backgroundColor($r('app.color.window_background_'))
        .border({ radius: 10 })
        .onChange((text) => {
          this.speechParams.text = text;
        })
      Row() {
        Text(`${this.speechParams.text.length}/300`)
          .fontSize(16)
          .fontColor($r('app.color.font_gray'))
          .margin({ left: 20, top: 10 }).layoutWeight(1)
        Button("试听")
          .fontSize(16)
          .fontColor($r('app.color.font_white'))
          .backgroundColor($r('app.color.accent'))
          .padding({ left: 15, right: 15 })
          .height(40)
          .onClick(() => {
            if (ObjectUtils.isEmptyOrNull(this.speechParams.text)) {
              ToastUtil.showToast("请输入播报文本")
              return
            }
            this.onCheckSDKParams()
            SpeechEngine.getInstance().playSpeech(this.speechParams.text)
          })
          .clickEffect({ level: ClickEffectLevel.LIGHT })
        Button("停止")
          .fontSize(16)
          .fontColor($r('app.color.font_white'))
          .backgroundColor($r('app.color.accent'))
          .padding({ left: 15, right: 15 })
          .margin({ left: 15 })
          .height(40)
          .onClick(() => {
            SpeechEngine.getInstance().stopSpeech()
          })
          .clickEffect({ level: ClickEffectLevel.LIGHT })
        Button("下载")
          .visibility(Visibility.None)
          .fontSize(16)
          .fontColor($r('app.color.font_white'))
          .backgroundColor($r('app.color.accent'))
          .padding({ left: 15, right: 15 })
          .margin({ left: 15 })
          .height(40)
          .onClick(() => {
            SpeechEngine.getInstance().downloadSpeech()
          })
          .clickEffect({ level: ClickEffectLevel.LIGHT })
      }.height(60).width('100%').alignItems(VerticalAlign.Center).justifyContent(FlexAlign.Center)
    }.width('95%')
  }

  @Builder
  customNavigation() {

  }
}