import { useEffect, useRef, useState } from "react";
import { parseWordleGrid } from "../wordle";
import * as Sentry from "@sentry/react";

const WORDLE_REGEX =
  /Wordle (?<version>[0-9]+) (?<attempts>[1-6])\/6\*?(\s+)(?<blocks>[\s\S]*)/;

function parseWordleString(str: string) {
  const match = str.match(WORDLE_REGEX);
  if (!match) {
    return null;
  }
  return match.groups as {
    version: string;
    attempts: string;
    blocks: string;
  };
}

const blob = new Blob(["hello"], {
  type: "text/plain",
});

async function makeCavasBlob(canvas: HTMLCanvasElement) {
  return blob;
}

const CANVAS_FONT_SIZE = 48;
const CANVAS_LINE_HEIGHT = CANVAS_FONT_SIZE * 1.1;

let canvasBlob = null;

const makeImagePromise = async (canvas: HTMLCanvasElement) => {
  // const response = await fetch('https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png');
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });
};

export default function Index() {
  const [input, setInput] = useState("");
  const results = parseWordleString(input);
  const blocks = results?.blocks;
  const version = results?.version;
  const attempts = results?.attempts;
  const alt = parseWordleGrid(blocks ?? "");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CAN_USE_CLIPBOARD_ITEM = typeof ClipboardItem !== "undefined";

  canvasRef?.current?.toBlob((blob) => {
    canvasBlob = blob;
  });

  function handleImageCopy() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    // Safar handles clipboard permissions differently than Chrome. First
    // try to do it Safari's way.
    const titleBlob = new Blob([`Wordle ${version} ${attempts}/6`], {
      type: "text/plain",
    });

    try {
      navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": Promise.resolve(titleBlob),
          // @ts-ignore
          "image/png": makeImagePromise(canvas).catch((err) => {
            console.error(err);
          }),
        }),
      ]);
    } catch (err) {
      try {
        canvas.toBlob((blob) => {
          navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": titleBlob,
              "image/png": blob!,
            }),
          ]);
        });
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
      }
    }
  }

  function getCanvasDimensionsForBlocks(blocks: string): {
    width: number;
    height: number;
  } {
    const lines = blocks?.trim()?.split("\n") ?? [];
    const paddingTop = CANVAS_FONT_SIZE;
    const paddingBottom = CANVAS_FONT_SIZE;
    const padding = paddingTop + paddingBottom;
    const height = CANVAS_FONT_SIZE * lines.length + padding;
    const width = CANVAS_FONT_SIZE * 5 + padding;
    return { width, height };
  }

  function handleTextCopy() {
    if (alt) {
      navigator.clipboard.writeText(alt);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas !== null) {
      const context = canvas.getContext("2d");
      if (context == null) return;
      const lines = blocks?.trim()?.split("\n") ?? [];
      context.font = `${CANVAS_FONT_SIZE}px serif`;
      context.textAlign = "center";
      context.textBaseline = "top";
      console.log("blocks", blocks);
      for (const [index, line] of lines.entries()) {
        const x = canvas.width / 2;
        const y = CANVAS_FONT_SIZE + index * CANVAS_LINE_HEIGHT;
        const spaced_line = [...line].join(
          // Unicode hair space
          "\u200a"
        );
        context.fillText(spaced_line, x, y);
      }
    }
  }, [input]);

  const isInvalid = input && results == null;

  const { width, height } = getCanvasDimensionsForBlocks(blocks ?? "");
  return (
    <div className="container">
      <h1>Accessible Wordle</h1>
      <div className="content">
        <div className="intro">
          <p>
            Paste in the text from your{" "}
            <a href="https://www.powerlanguage.co.uk/wordle/">Wordle</a> game
            and we'll generate a screenshot and alt text that you can share
            online. You can right click on the image to save or copy it.
          </p>
        </div>

        <div className="input-group">
          <button
            className="read-button"
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setInput(text);
            }}
          >
            Read from Clipboard
          </button>
          <textarea
            rows={10}
            value={input}
            placeholder="Or paste in your Wordle text here"
            onChange={(e) => setInput(e.target.value)}
          />

          {isInvalid && (
            <span className="error">
              Unable to parse the provided input as a Wordle grid
            </span>
          )}
        </div>
      </div>

      {input && !isInvalid && (
        <div>
          <hr />
          <h2>Results</h2>
          <div className="image-section">
            <canvas ref={canvasRef} width={width} height={height} />
            <span className="alt">{alt}</span>
          </div>
          {CAN_USE_CLIPBOARD_ITEM && (
            <div className="button-section">
              <button onClick={handleImageCopy}>Copy Image</button>
              <button onClick={handleTextCopy}>Copy Text</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
