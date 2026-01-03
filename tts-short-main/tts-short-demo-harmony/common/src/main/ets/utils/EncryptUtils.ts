import CryptoJS from '@ohos/crypto-js'

export class EncryptUtils {
  static encryptMD5ToString(data: string): string {
    return CryptoJS.MD5(data).toString();
  }
}