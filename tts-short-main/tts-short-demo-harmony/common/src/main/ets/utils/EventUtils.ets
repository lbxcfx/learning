import { AxiosResponse } from '@ohos/axios'
import { Network } from '../network/Network'
import { appProvider } from '../provider/AppProvider'

export class EventUtils {
  static sendEvent(eventid: string) {
    if (appProvider.getAppInfo!().debug) {
      return
    }
    Network.getAxiosInstance()
      .post<string, AxiosResponse<string>, EventParams>("/manage/sendEvent", { eventid: eventid })
      .then((_: AxiosResponse<string>) => {

      }).catch((_: Error) => {
    })
  }
}

interface EventParams {
  eventid: string
}