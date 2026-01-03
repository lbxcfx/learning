@Component
export struct LoadingStatusView {
  bgColor: ResourceColor = $r('app.color.window_background_')
  color: ResourceColor = $r('app.color.default_loading_progress')

  build() {
    Stack({ alignContent: Alignment.Center }) {
      LoadingProgress().width(72).color(this.color)
    }.backgroundColor(this.bgColor)
    .width("100%")
    .height("100%")
  }
}