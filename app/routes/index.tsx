import { useEffect, useRef, useState } from "react";
import { parseWordleGrid } from "../wordle";

const WORDLE_REGEX =
  /Wordle (?<version>[0-9]+) (?<attempts>[1-6])\/6(\s+)(?<blocks>[\s\S]*)/;

interface BlockGroup {
  color: string;
  count: number;
}


type BlockRowDescriptor = BlockGroup[];

function getBlockRowDescriptor(row: string): BlockRowDescriptor {
  const chars = [...row];
  const descriptors = [];
  let current: BlockGroup | null = null;
  for (let i = 0; i < chars.length; i++) {
    const block = chars[i];
    const color = getBlockColor(block);
    if (current == null) {
      current = {
        color,
        count: 1,
      };
    } else if (current.color === color) {
      current.count++;
    } else {
      descriptors.push(current);
      current = {
        color,
        count: 1,
      };
    }
  }
  if (current != null) {
    descriptors.push(current);
  }
  return descriptors;
}

function getBlockColor(char: string) {
  switch (char) {
    case "⬜":
      return "gray";
    case "🟨":
      return "yellow";
    case "🟩":
      return "green";
    default:
      console.trace("oops", char);
      return "";
  }
}

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

const CANVAS_FONT_SIZE = 48;
const CANVAS_LINE_HEIGHT = CANVAS_FONT_SIZE * 1.1;

export default function Index() {
  const [input, setInput] = useState('');
  const results = parseWordleString(input);
  const blocks = results?.blocks;
  const version = results?.version;
  const attempts = results?.attempts;
  const alt = parseWordleGrid(blocks ?? "");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CAN_USE_CLIPBOARD_ITEM = typeof ClipboardItem !== "undefined";


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

  function handleImageCopy() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.toBlob((blob) => {
      const item = new ClipboardItem({
        "text/plain": new Blob([`Wordle ${version} ${attempts}/6`], {
          type: "text/plain",
        }),
        "image/png": blob!,
      });
      navigator.clipboard.write([item]);
    });
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
        context.fillText(line, x, y);
      }
    }
  }, [input]);

  const { width, height } = getCanvasDimensionsForBlocks(blocks ?? "");
  return (
    <div className="container">
      <h1>Accessible Wordle Results</h1>
      <p>
        Paste in the text from your Wordle game and we'll generate a screenshot
        and alt text that you can share online. You can right click on the image
        to save or copy it.
      </p>
      <textarea
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {input && (
        <div>
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
