import AbilityStage from '@ohos.app.ability.AbilityStage';
import { InitializeApp } from './InitializeApp';

export default class AppStage extends AbilityStage {

  onCreate() {
    InitializeApp.initOnCreate(this.context)
  }
}