export class TsUtils {
  static mergeObject(obj1: object, obj2: object): object {
    return { ...obj1, ...obj2 }
  }
}