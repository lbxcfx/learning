import { AxiosResponse } from '@ohos/axios'
import { AppUtil, DialogUtil, WantUtil } from '@pura/harmony-utils'
import { Network } from '../network/Network'
import { AppInfo } from '../provider/AppInfo'
import { appProvider } from '../provider/AppProvider'

/**
 * 软件更新
 */
export class UpdateUtils {
  static check() {
    let app: AppInfo = appProvider.getAppInfo!()
    Network.getAxiosInstance().post<ProductData, AxiosResponse<ProductData>, object>("/company/productDetail", {
      name: app.name
    }).then((response: AxiosResponse<ProductData>) => {
      let productData: ProductData = response.data
      if (productData.version.localeCompare(app.versionName) > 0) {
        UpdateUtils.showDialog(productData)
      }
    })
  }

  static showDialog(productData: ProductData) {
    DialogUtil.showPrimaryDialog({
      title: $r("app.string.version_title", productData.version),
      message: $r("app.string.version_content", productData.update_content),
      autoCancel: true,
      secondaryButton: {
        value: "",
        action: () => {
        }
      },
      primaryButton: {
        value: $r("app.string.sure"),
        fontColor: $r("app.color.accent"),
        action: () => {
          WantUtil.toAppGalleryDetail(AppUtil.getBundleName())
        }
      }
    })
  }
}

interface ProductData {
  name: string
  update_url: string
  download_url: string
  update_content: string
  descript: string
  version: string
  market: string
}