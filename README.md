## Description
This software is made using [Tauri](https://tauri.app/), [Next.js](https://nextjs.org/), and [pixi.js](https://pixijs.com/). <br>
Currently have no functionality other than being able to navigate files and view images.

![screenshot1724](https://github.com/user-attachments/assets/e1f3ad05-58c2-4b60-abdf-553db23aff40)
## Controls
- Mouse Click : Pan
- Scroll Up/Down : Zoom
- Right Arrow / Down Arrow / Right Arrow Icon : Next image
- Up Arrow / Left Arrow / Left Arrow Icon : Previous image
- Up Arrow Icon : Previous directory (currently buggy)

## Build
1. Follow the step in the [link1](https://tauri.app/v1/guides/getting-started/prerequisites) and [link2](https://tauri.app/v1/guides/getting-started/setup/next-js#create-the-rust-project) to install the dependencies.
2. Install [pnpm](https://pnpm.io/).
3. Clone the repo and execute the following,
```
pnpm tauri build
```
## TODO
- [ ] Add always on top feature
- [ ] Multiple images in one canvas
