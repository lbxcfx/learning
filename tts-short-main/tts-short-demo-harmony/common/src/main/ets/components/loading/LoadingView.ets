import { LoadingStatusView } from './LoadingStatusView';

@Component
export struct LoadingView {
  @Link uiState: number;
  @BuilderParam body: () => void = this.buildNone;
  @BuilderParam loading: () => void = this.buildDefaultLoading;
  @BuilderParam empty: () => void = this.buildNone;

  build() {
    if (this.uiState === 0) {
      this.loading()
    } else if (this.uiState > 0) {
      this.body()
    } else {
      this.empty()
    }
  }

  @Builder
  buildNone() {

  }

  @Builder
  buildDefaultLoading() {
    LoadingStatusView()
  }
}