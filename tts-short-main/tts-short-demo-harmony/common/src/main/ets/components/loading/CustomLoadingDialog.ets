@CustomDialog
export struct CustomLoadingDialog {
  controller: CustomDialogController = new CustomDialogController({
    builder: CustomLoadingDialog({}),
  })

  build() {
    Stack({ alignContent: Alignment.Center }) {
      LoadingProgress().width(72).color($r("app.color.font_dark"))
    }.backgroundColor($r("app.color.white"))
    .width(150)
    .height(150)
    .border({ radius: 10 })
  }
}