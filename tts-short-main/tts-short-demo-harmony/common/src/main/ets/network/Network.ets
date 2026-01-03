import { AxiosInstance } from '@ohos/axios'

let axios: AxiosInstance

export class Network {
  static init(axiosInstance: AxiosInstance) {
    axios = axiosInstance
  }

  static getAxiosInstance(): AxiosInstance {
    return axios;
  }
}