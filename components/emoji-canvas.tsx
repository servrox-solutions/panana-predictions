"use client";

import { useEffect, useRef } from "react";

const EmojiCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emoji = "🍌";

  // Function to draw the emoji on the canvas
  const drawEmoji = (emoji: string, xOffset = 0, yOffset = 0) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.font = "48px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          emoji,
          canvas.width / 2 + xOffset,
          canvas.height / 2 + yOffset
        );
      }
    }
  };

  // Function to update the favicon dynamically
  const updateFavicon = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const favicons = document.querySelectorAll("link[rel='icon']");

      if (favicons && canvas) {
        favicons.forEach(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (favicon) => ((favicon as any).href = canvas.toDataURL("image/png"))
        );
      }
    }
  };

  // Function to handle the automatic shake animation
  const shakeAnimation = () => {
    let frame = 0;
    const maxFrames = 100; // Adjust the number of shake cycles
    const shakeInterval = setInterval(() => {
      const xOffset = Math.random() * 10 - 5;
      const yOffset = Math.random() * 10 - 5;

      drawEmoji(emoji, xOffset, yOffset);
      updateFavicon();

      frame++;
      if (frame >= maxFrames) {
        clearInterval(shakeInterval);
        drawEmoji(emoji); // Reset position after shaking
        updateFavicon();
        shakeAnimation(); // Loop the animation
      }
    }, 100); // Adjust the speed of shake
  };

  useEffect(() => {
    drawEmoji(emoji);
    updateFavicon();
    shakeAnimation(); // Start the animation automatically on mount
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width="64"
      height="64"
      style={{ display: "none" }} // Hide the canvas from rendering on the page
    ></canvas>
  );
};

export default EmojiCanvas;
