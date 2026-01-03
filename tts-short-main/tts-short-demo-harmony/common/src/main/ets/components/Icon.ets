@Component
export struct Icon {
  @Prop src?: string | PixelMap | Resource = ""
  iconSize: number = 24
  borderRadiusSize: number = 0
  outSize: Resource | number = 40

  build() {
    Stack({ alignContent: Alignment.Center }) {
      Image(this.src)
        .width(this.iconSize)
        .height(this.iconSize)
        .border({ radius: this.borderRadiusSize })
    }.width(this.outSize).height(this.outSize)
  }
}