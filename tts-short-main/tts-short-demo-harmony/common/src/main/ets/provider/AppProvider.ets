import router from '@ohos.router'
import { AppWebViewRouterParams } from '../data/AppWebViewRouterParams'
import { AppInfo } from './AppInfo'
import { LogUtil } from '@pura/harmony-utils';

export let appProvider: AppProvider = {
  toAppWeb: (params) => {
    router.pushNamedRoute({ name: "AppWebView", params: params }).then(() => {
    }).catch((e: Error) => {
      LogUtil.error(JSON.stringify(e))
    })
  },
  toAgreement: () => {
    let url = appProvider.getAppInfo!().agreementUrl
    appProvider.toAppWeb!({ url: url })
  },
  toPrivacy: () => {
    let url = appProvider.getAppInfo!().privacyUrl
    appProvider.toAppWeb!({ url: url })
  }
}

/**
 * 跨模块通讯接口
 */
class AppProvider {
  /*
   * 通用接口
   * */
  getAppInfo?: () => AppInfo
  toAgreement?: () => void
  toPrivacy?: () => void
  goHome?: () => void //回到首页
  toLogin?: () => void //登录
  toAppWeb?: (params: AppWebViewRouterParams) => void
}