import { nyrotapp, n } from "nyrotapp"

const [addonName, addonTable] = [...$vararg]

nyrotapp<{}>({
  model: {},
  view: () =>
    n(
      "frame",
      {
        height: 1000,
        width: 1000,
        position: {
          anchor: "CENTER",
          offsetHorizontal: 0,
          offsetVertical: 0,
        },
      },
      [
        n(
          "button",
          {
            height: 20,
            width: 100,
            position: {
              anchor: "CENTER",
              offsetHorizontal: 0,
              offsetVertical: 0,
            },
            text: "hello world",
            onClick: (state: {}, ...args: any[]) => (print(...args), state),
          },
          [],
        ),
      ],
    ),
})
