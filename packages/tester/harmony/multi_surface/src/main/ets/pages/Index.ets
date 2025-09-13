const PAGES = [
  ['app_name', "App"],
  ['tester', "Tester Example"],
  ['animations', "Animations Example"],
  ['checkerboard', "Checkerboard Example"],
  ['chessboard', "Chessboard Example"],
  ['cursor', "Cursor Example"],
  ['image_gallery', "ImageGallery Example"],
  ['large_image_scroll', "LargeImageScroll Example"],
  ['text_scroll', "TextScroll Example"],
  ['flat_list', "FlatListVsScrollView Example"],
  ['toggling', "TogglingComponent Example"],
  ['sticky_headers', "StickyHeaders Example"],
]

@Entry
@Component
struct Index {
  pathStack: NavPathStack = new NavPathStack()

  aboutToAppear(): void {
    AppStorage.setOrCreate("PathStack", this.pathStack)
  }

  build() {
    Navigation(this.pathStack) {
      Column() {
        List({ space: 12, initialIndex: 0 }) {
          ListItem() {
            Text("Go to standalone app")
              .fontColor(Color.Blue)
              .width('100%')
              .textAlign(TextAlign.Center)
              .onClick(() => {
                this.pathStack.pushPath({ name: "ReactApplicationPage" })
              })
              .margin(12)
          }

          ForEach(PAGES, (appKeyAndTitle: [string, string], index: number) => {
            ListItem() {
              Text("Go to " + appKeyAndTitle[1])
                .fontColor(Color.Blue)
                .width('100%')
                .textAlign(TextAlign.Center)
                .onClick(() => {
                  this.pathStack.pushPath({ name: "ReactPage", param: appKeyAndTitle[0] })
                })
                .margin(12)
            }
          }, (appKeyAndTitle: [string, string]) => appKeyAndTitle[0])

          ListItem() {
            Text("Go to Transparent Example")
              .fontColor(Color.Blue)
              .width('100%')
              .textAlign(TextAlign.Center)
              .onClick(() => {
                this.pathStack.pushPath({ name: "TransparentPage", param: "transparent" })
              })
          }
          .margin(12)
        }
        .height('100%')
        .width('100%')
        .divider({ strokeWidth: 4 })
      }
      .height('100%')
      .margin(32)
    }
    .id("Index")
    .mode(NavigationMode.Stack)
  }
}
