declare namespace JSX {
  export interface IntrinsicElements<M> {
    frame: {
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
    button: {
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
      text: string
      onClick: (
        state: any,
        frame: WoWAPI.Button,
        key: WoWAPI.MouseButton,
        down: boolean,
      ) => any
    }
  }
}
