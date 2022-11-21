import { nyrotapp, n } from "nyrotapp"

const [addonName, addonTable] = [...$vararg]

nyrotapp<{}>({
  model: {},
  view: () => (
    <frame
      height={1000}
      width={1000}
      position={{
        anchor: "CENTER",
        offsetHorizontal: 0,
        offsetVertical: 0,
      }}
    >
      <button
        {...{
          height: 20,
          width: 100,
          position: {
            anchor: "CENTER",
            offsetHorizontal: 0,
            offsetVertical: 0,
          },
          text: "hello world",
          onClick: (state: {}, ...args: any[]) => (
            print("one", ...args), state
          ),
        }}
      />
      <button
        {...{
          height: 20,
          width: 100,
          position: {
            anchor: "CENTER",
            offsetHorizontal: 0,
            offsetVertical: 20,
          },
          text: "hello world 2",
          onClick: (state: {}, ...args: any[]) => (
            print("two", ...args), state
          ),
        }}
      />
    </frame>
  ),
})
