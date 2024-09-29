"use client";
import { Button, Text } from "@fluentui/react-components";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import "./page.css";
import {
  Home12Filled,
  ArrowUp12Filled,
  ArrowLeft12Filled,
  ArrowRight12Filled,
} from "@fluentui/react-icons";

import { dlog } from "@/lib/dlog";

import * as PIXI from "pixi.js";

const WIDTH = 1200;
const HEIGHT = 800;

const SUPPORTED_IMAGE_TYPES = ["png", "jpg", "jpeg"];

export default function Home() {
  const canvas_ref = useRef(null);
  const app_ref = useRef<PIXI.Application | null>(null);

  const [directory, setDirectory] = useState<string[]>([]);

  const imageRef = useRef<PIXI.Sprite>();

  const isBeingDraggedRef = useRef(false);
  const holdClickedPositionRef = useRef<Vec2>({ x: 0, y: 0 });

  const currentImgNameRef = useRef<string>("");

  const [currentSrc, setCurrentSrc] = useState<string>("");

  const isRegisteredRef = useRef(false);

  const loadedImageCountRef = useRef(0);

  useEffect(() => {
    dlog("Page loaded");
    changeDirectory("D:\\");
    app_ref.current = new PIXI.Application();
    const app = app_ref.current;
    const canvas = canvas_ref.current;
    if (canvas) {
      app.init({
        width: WIDTH,
        height: HEIGHT,
        canvas: canvas,
        autoStart: true,
        backgroundColor: 0xf3f3f3,
        resizeTo: window,
      });

      registerControls(
        canvas,
        imageRef,
        isBeingDraggedRef,
        holdClickedPositionRef,
        app_ref
      );
    }
    return () => {
      window.removeEventListener("keydown", (e) => registerKeyboardControls(e));
    };
  }, []);

  useEffect(() => {
    scrollToSelected();
  }, [currentSrc]);

  function changeDirectory(designatedPath: string = "") {
    invoke("get_dir", { path: designatedPath })
      .then((dir) => {
        setDirectory(dir as string[]);
      })
      .catch((e) => {
        console.error(e);
      });
    // getPreviousDir(designatedPath).then((d) => {
    //   previousPathRef.current = d;
    //   console.log(d + ": Prev");
    // });
  }

  function scrollToSelected() {
    document.getElementsByClassName("selected")[0]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  function changeToPreviousDir() {
    invoke("get_previous_dir", { childPath: "D:\\.kobo" }).then((dir) => {
      console.log(dir);
      changeDirectory(dir as string);
    });
  }

  function getFromCurrentDir(designatedPath: string = "", offset: number) {
    if (directory.includes(designatedPath)) {
      const targetIndex = directory.indexOf(designatedPath) + offset;
      if (targetIndex < directory.length) {
        const targetSrc = directory[targetIndex];
        changeImage(
          app_ref.current!,
          imageRef,
          convertFileSrc(targetSrc),
          loadedImageCountRef
        );
        currentImgNameRef.current = targetSrc;
        setCurrentSrc(targetSrc);
      }
    }
  }

  function registerKeyboardControls(e: KeyboardEvent) {
    if (e.repeat) {
      return;
    }
    switch (e.key) {
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        getFromCurrentDir(currentImgNameRef.current, -1);
        break;
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        getFromCurrentDir(currentImgNameRef.current, 1);
        break;
    }
  }

  return (
    <div className="root">
      <div className="file-list-container">
        {directory.map((dir, index) => (
          <div
            className={"file-entry" + (currentSrc === dir ? " selected" : "")}
            key={index}
            onClick={() => {
              if (currentSrc === dir) {
                scrollToSelected();
                return;
              }
              if (SUPPORTED_IMAGE_TYPES.includes(getFileExtension(dir))) {
                if (!isRegisteredRef.current) {
                  window.addEventListener("keydown", (e) =>
                    registerKeyboardControls(e)
                  );
                  isRegisteredRef.current = true;
                }
                changeImage(
                  app_ref.current!,
                  imageRef,
                  convertFileSrc(dir),
                  loadedImageCountRef
                );
                currentImgNameRef.current = dir;
                setCurrentSrc(dir);
              } else changeDirectory(dir);
            }}
          >
            <Text>{dir}</Text>
          </div>
        ))}
      </div>

      <canvas ref={canvas_ref} width={WIDTH} height={HEIGHT} />

      <div className="button-container">
        <Button
          onClick={() => changeDirectory("D:\\")}
          icon={<Home12Filled />}
          size="small"
        />
        <Button
          onClick={() => {
            changeToPreviousDir();
          }}
          icon={<ArrowUp12Filled />}
          size="small"
        />
        <Button
          onClick={() => getFromCurrentDir(currentImgNameRef.current, 1)}
          icon={<ArrowRight12Filled />}
          size="small"
        />
        <Button
          onClick={() => getFromCurrentDir(currentImgNameRef.current, -1)}
          icon={<ArrowLeft12Filled />}
          size="small"
        />
      </div>

      {/* <div>
        {grList.map((gr, index) => (
          <div key={index}>
            <Text>
              {index}: {gr}
            </Text>
            <Button
              onClick={() => {
                grListRef.current[index].destroy();
                setGrList([
                  ...grList.slice(0, index),
                  ...grList.slice(index + 1),
                ]);
                grListRef.current.splice(index, 1);
                app_ref.current!.render();
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </div> */}
    </div>
  );
}

function moveSprite(
  sprite: PIXI.Sprite,
  x_increment: number = 0,
  y_increment: number = 0
) {
  if (sprite == null) return;
  sprite.x += x_increment;
  sprite.y += y_increment;
}

function changeImage(
  app: PIXI.Application,
  spriteRef: MutableRefObject<PIXI.Sprite | undefined>,
  newSpriteSrc: string,
  cacheCount: MutableRefObject<number>
) {
  PIXI.Assets.load(newSpriteSrc).then((img) => {
    const isSpriteLoaded = spriteRef.current != null;
    const newSprite = PIXI.Sprite.from(img);
    newSprite.anchor.set(isSpriteLoaded ? spriteRef.current!.anchor.x : 0.5);
    newSprite.scale.set(isSpriteLoaded ? spriteRef.current!.scale.x : 0.35);
    newSprite.x = isSpriteLoaded ? spriteRef.current!.x : app.screen.width / 2;
    newSprite.y = isSpriteLoaded ? spriteRef.current!.y : app.screen.height / 2;
    if (isSpriteLoaded) {
      PIXI.Assets.unload(spriteRef.current!.texture.source.label);
      app.stage.removeChild(spriteRef.current!);
      spriteRef.current!.destroy();
      if (cacheCount.current > 5) {
        PIXI.Cache.reset();
        cacheCount.current = 0;
      }
    }
    spriteRef.current = newSprite;
    app.stage.addChild(spriteRef.current);
    cacheCount.current += 1;
    app.render();
  });
}

// function formToRect(
//   formData: FormData,
//   app: PIXI.Application,
//   func: (
//     app: PIXI.Application,
//     x: number,
//     y: number,
//     width: number,
//     height: number
//   ) => PIXI.Graphics
// ) {
//   const x: number = Number(formData.get("x") as string);
//   const y: number = Number(formData.get("y") as string);
//   const width: number = Number(formData.get("width") as string);
//   const height: number = Number(formData.get("height") as string);

//   return func(app, x, y, width, height);
// }

// function createRect(
//   app: PIXI.Application,
//   x: number,
//   y: number,
//   width: number,
//   height: number
// ) {
//   const rect = new PIXI.Graphics().rect(x, y, width, height).fill(0xff0000);
//   app.stage.addChild(rect);
//   app.render();
//   return rect;
// }
type Vec2 = { x: number; y: number };

// function setSpritePosition(img: PIXI.Sprite, x: number, y: number) {
//   img.x = x;
//   img.y = y;
// }

function registerControls(
  canvas: HTMLCanvasElement,
  img: MutableRefObject<PIXI.Sprite | undefined>,
  isBeingDragged: MutableRefObject<boolean>,
  clickedPositionHolder: MutableRefObject<Vec2>,
  app: MutableRefObject<PIXI.Application | null>
) {
  canvas.addEventListener("pointerdown", (e) => {
    if (img.current == null) return;
    isBeingDragged.current = true;
    clickedPositionHolder.current = { x: e.x, y: e.y };
  });
  window.addEventListener("pointermove", (e) => {
    if (img.current == null) return;
    if (isBeingDragged.current) {
      const rootElement = document.getElementsByClassName(
        "root"
      ) as HTMLCollectionOf<HTMLElement>;
      rootElement[0].style.cursor = "grabbing";
      moveSprite(
        img.current,
        (e.x - clickedPositionHolder.current.x),
        (e.y - clickedPositionHolder.current.y)
      );
      clickedPositionHolder.current = { x: e.x, y: e.y };
      app.current!.render();
    }
  });
  window.addEventListener("pointerup", () => {
    if (img.current == null) return;
    const rootElement = document.getElementsByClassName(
      "root"
    ) as HTMLCollectionOf<HTMLElement>;
    rootElement[0].style.cursor = "default";
    isBeingDragged.current = false;
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (img.current == null) return;
    const ratio = Math.max(0.8, (e.deltaY / 80) * -1);
    const normalizedX = img.current.x - canvas.width / 2;
    const normalizedY = img.current.y - canvas.height / 2;
    img.current.x = canvas.width / 2 + normalizedX * ratio;
    img.current.y = canvas.height / 2 + normalizedY * ratio;
    img.current.scale.x *= ratio;
    img.current.scale.y *= ratio;
    console.log(e.offsetX, e.offsetY);
    app.current!.render();
  });
}

function getFileExtension(filename: string): string {
  const result = filename.split(".").pop();
  return result ? result : "";
}
