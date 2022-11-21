export const nyrotapp = async <M>({
  model,
  view,
}: {
  model: M
  view: (model: M) => ViewResult<M> | null
}) => {
  while (true) {
    const tree = view(model)
    // if we couldn't make a tree, then just bail
    if (!tree) {
      return
    }

    const { widget, events } = tree
    // TODO: maybe set this to some one off that
    // we can use to capture global events?
    widget.frame.SetParent(UIParent)
    const event = await Promise.any(events)
    model = event(model)
    freeWidget(tree.widget)
  }
}

type ViewResult<M> = {
  widget: Widget<M>
  events: Promise<(model: M) => M>[]
}

interface TreeBuilder {
  <M>(
    kind: "frame",
    attributes: Frame<M>["attributes"],
    children: (ViewResult<M> | null)[],
  ): ViewResult<M> | null
  <M>(
    kind: "button",
    attributes: Button<M>["attributes"],
    children: (ViewResult<M> | null)[],
  ): ViewResult<M> | null
}
export const n: TreeBuilder = <M>(
  kind: Widget<M>["kind"],
  attributes: Widget<M>["attributes"],
  children: (ViewResult<M> | null)[],
): ViewResult<M> | null => {
  const result: ViewResult<M> | null = (() => {
    switch (kind) {
      case "frame":
        return frame(attributes)
      case "button":
        return button(attributes as Button<M>["attributes"])
      default: {
        const unknownFrameKind: never = kind
        print(`Unknown Frame Kind: ${unknownFrameKind}`)
        return null
      }
    }
  })()

  if (!result) {
    return result
  }

  // filter out any children that we couldn't create
  const nonNullChildren = children.filter(
    (child): child is ViewResult<M> => child !== null,
  )

  // set all the children to be the parent of this widget
  for (const child of nonNullChildren) {
    child.widget.frame.SetParent(result.widget.frame)
  }
  result.widget.children = nonNullChildren.map(({ widget }) => widget)

  // copy all children events up to the top
  result.events = nonNullChildren.reduce(
    (events, child) => [...events, ...child.events] as ViewResult<M>["events"],
    result.events,
  )

  return result
}
/*
    type FrameType = "Frame" | "Button" | "Cooldown"
        | "ColorSelect" | "EditBox" | "GameTooltip" | "MessageFrame"
        | "Minimap" | "Model" | "ScrollFrame" | "ScrollingMessageFrame"
        | "SimpleHTML" | "Slider" | "StatusBar";
 */
type Widget<M> = Frame<M> | Button<M>
type Frame<M> = {
  kind: "frame"
  // frame: WoWAPI.UIObject | WoWAPI.Frame | WoWAPI.Slider | WoWAPI.EditBox
  frame: WoWAPI.Frame
  attributes: {
    width: number
    height: number
    position: {
      anchor:
        | "TOPLEFT"
        | "TOPRIGHT"
        | "BOTTOMLEFT"
        | "BOTTOMRIGHT"
        | "TOP"
        | "BOTTOM"
        | "LEFT"
        | "RIGHT"
        | "CENTER"
      offsetHorizontal: number
      offsetVertical: number
    }
  }
  children: Widget<M>[]
}
type Button<M> = {
  kind: "button"
  frame: WoWAPI.Button
  attributes: Frame<M>["attributes"] & {
    text: string
    onClick: (
      state: M,
      frame: WoWAPI.Button,
      key: WoWAPI.MouseButton,
      down: boolean,
    ) => M
  }
  children: Widget<M>[]
}

const frame = <M>(attributes: Frame<M>["attributes"]): ViewResult<M> => {
  // exhaustive type checking seems really fiddly from Object.* inference
  // so we are splitting it out and asserting the proper type
  const keys: (keyof Widget<M>["attributes"])[] = Object.keys(
    attributes,
  ) as (keyof Widget<M>["attributes"])[]

  const baseFrame = allocateFrame()
  for (const key of keys) {
    switch (key) {
      case "width":
        baseFrame.SetWidth(attributes.width)
        break
      case "height":
        baseFrame.SetHeight(attributes.height)
      case "position":
        baseFrame.SetPoint(
          attributes.position.anchor,
          attributes.position.offsetHorizontal,
          attributes.position.offsetVertical,
        )
        break
      default: {
        const uncheckedKey: never = key
        print(`Unhandled/Invalid attribute ${uncheckedKey}`)
      }
    }
  }
  baseFrame.SetBackdrop({
    bgFile: "Interface\\DialogFrame\\UI-DialogBox-Background",
    edgeFile: "Interface\\DialogFrame\\UI-DialogBox-Border",
    tile: true,
    tileSize: 32,
    edgeSize: 32,
    insets: { left: 11, right: 12, top: 12, bottom: 11 },
  })
  baseFrame.SetBackdropColor(1, 0, 0, 1)
  baseFrame.Show()
  baseFrame.SetAlpha(1)
  return {
    widget: {
      kind: "frame",
      frame: baseFrame,
      attributes,
      children: [],
    },
    events: [],
  }
}
const button = <M>(attributes: Button<M>["attributes"]): ViewResult<M> => {
  const events: ViewResult<M>["events"] = []
  // exhaustive type checking seems really fiddly from Object.* inference
  // so we are splitting it out and asserting the proper type
  const keys: (keyof Button<M>["attributes"])[] = Object.keys(
    attributes,
  ) as (keyof Button<M>["attributes"])[]

  const button = allocateButton()
  for (const key of keys) {
    switch (key) {
      case "width":
        button.SetWidth(attributes.width)
        break
      case "height":
        button.SetHeight(attributes.height)
      case "position":
        button.SetPoint(
          attributes.position.anchor,
          attributes.position.offsetHorizontal,
          attributes.position.offsetVertical,
        )
        break
      case "text":
        button.SetText(attributes.text)
        break
      case "onClick":
        events.push(
          new Promise((resolve) => {
            button.SetScript(
              "OnClick",
              (
                self: WoWAPI.Frame,
                mouseKey: WoWAPI.MouseButton,
                down: boolean,
              ) =>
                resolve((state) =>
                  attributes[key](state, self as WoWAPI.Button, mouseKey, down),
                ),
            )
          }),
        )
        break
      default: {
        const uncheckedKey: never = key
        print(`Unhandled/Invalid attribute ${uncheckedKey}`)
      }
    }
  }
  button.SetAlpha(1)
  ;(button as any).SetNormalTexture(
    "Interface\\DialogFrame\\UI-DialogBox-Header",
  )
  button.Show()
  return {
    widget: {
      kind: "button",
      frame: button,
      attributes,
      children: [],
    },
    events,
  }
}

const widgetPool: {
  frame: Frame<any>["frame"][]
  button: Button<any>["frame"][]
} = {
  frame: [],
  button: [],
}

const allocateButton = <M>(): Button<M>["frame"] =>
  widgetPool.button.pop() ??
  CreateFrame("Button", undefined, undefined, "UIPanelButtonTemplate")
const allocateFrame = <M>(): Frame<M>["frame"] =>
  widgetPool.frame.pop() ??
  CreateFrame("Frame", undefined, undefined, "BackdropTemplate")

const freeWidget = <M>(widget: Widget<M>) => {
  widget.frame.Hide()
  widget.children.forEach((child) => freeWidget(child))
  widget.frame.SetParent(null)

  switch (widget.kind) {
    case "frame":
      widgetPool[widget.kind] = [...widgetPool[widget.kind], widget.frame]
      break
    case "button":
      widgetPool[widget.kind] = [...widgetPool[widget.kind], widget.frame]
      // we have to explicitly pass undefined or it crashes
      widget.frame.SetScript("OnClick", undefined)
      break
    default:
      const invalidWidget: never = widget
      print(
        `Attempt to free invalid or unhandled widget: ${
          (invalidWidget as any).kind
        }`,
      )
      return
  }
}
