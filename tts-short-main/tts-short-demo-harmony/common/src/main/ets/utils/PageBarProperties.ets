import { AppUtil, ClickUtil } from '@pura/harmony-utils'
import { window } from '@kit.ArkUI'
import { ObjectUtils } from './ObjectUtils'

/**
 * page自定义SystemBarProperties
 */
export class PageBarProperties {
  private static systemBarProperties?: window.SystemBarProperties
  private originalBarProperties?: window.SystemBarProperties

  /**
   * 设置自定义属性
   */
  setCustom(properties: window.SystemBarProperties = { isStatusBarLightIcon: true }) {
    if (ObjectUtils.isEmptyOrNull(this.originalBarProperties)) {
      this.originalBarProperties = PageBarProperties.getWindowSystemBarProperties()
    }
    PageBarProperties.setWindowSystemBarProperties(properties)
  }

  /**
   * 还原自定义属性
   */
  setOriginal() {
    if (!ObjectUtils.isEmptyOrNull(this.originalBarProperties)) {
      PageBarProperties.setWindowSystemBarProperties(this.originalBarProperties!)
    }
  }

  private static getWindowSystemBarProperties(): window.SystemBarProperties {
    if (!ObjectUtils.isEmptyOrNull(PageBarProperties.systemBarProperties)) {
      return PageBarProperties.systemBarProperties!
    }
    return AppUtil.getMainWindow().getWindowSystemBarProperties()
  }

  private static setWindowSystemBarProperties(systemBarProperties: window.SystemBarProperties) {
    PageBarProperties.systemBarProperties = systemBarProperties
    ClickUtil.debounce(() => {
      AppUtil.getMainWindow().setWindowSystemBarProperties(systemBarProperties)
    }, 50)
  }
}