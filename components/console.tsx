import React, { useEffect, useRef } from "react";

interface ConsoleProps {
  text: string;
}

export const Console: React.FC<ConsoleProps> = ({ text }) => {
  // Prevent duplicate logs
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!hasLogged.current) {
      displaySVGInConsole(text);
      hasLogged.current = true;
    }
  }, [text]);

  return null;
};

// Function to display the SVG in the developer console
function displaySVGInConsole(text: string) {
  const { svgWidth, svgHeight } = calculateSVGDimensions();

  const svgContent = generateSVG(svgWidth, svgHeight, text);

  const dataUrl = svgToDataUrl(svgContent);

  logSVGToConsole(dataUrl, svgWidth, svgHeight);
}

// Calculate SVG dimensions based on available console space
function calculateSVGDimensions() {
  // Viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Estimate console dimensions by comparing outer and inner sizes
  const widthDiff = window.outerWidth - viewportWidth;
  const heightDiff = window.outerHeight - viewportHeight;

  let consoleWidth = 0;
  let consoleHeight = 0;

  // Determine if the console is docked on the side or bottom/top
  if (widthDiff > heightDiff) {
    // Console is likely docked on the side
    consoleWidth = widthDiff;
    consoleHeight = viewportHeight;
  } else {
    // Console is likely docked on the bottom or top
    consoleWidth = viewportWidth;
    consoleHeight = heightDiff;
  }

  // Adjust dimensions to prevent scrollbars
  const paddingOffset = 30; // Increased from 20 to 30 to ensure no scrollbars
  const maxDimension = Math.max(
    Math.min(consoleWidth, consoleHeight) - paddingOffset,
    100
  );

  return {
    svgWidth: maxDimension,
    svgHeight: maxDimension,
  };
}

// Generate the SVG content
function generateSVG(svgWidth: number, svgHeight: number, text: string) {
  const bananaAnimations = generateBananaAnimations(svgWidth, svgHeight);

  return `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-gradient)"/>
      ${bananaAnimations}
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;
          overflow: hidden; text-align: center;
        ">
          <style>
            @keyframes textAnimation {
              0% { transform: scale(0.8) rotate(-5deg); opacity: 0.5; }
              50% { transform: scale(1.1) rotate(2deg); opacity: 1; }
              100% { transform: scale(0.8) rotate(-5deg); opacity: 0.5; }
            }
            @keyframes colorChange {
              0% { color: #e94560; }
              50% { color: #0f3460; }
              100% { color: #e94560; }
            }
            .animated-text {
              font-family: 'Arial Black', sans-serif;
              font-size: ${svgWidth * 0.1}px;
              font-weight: bold;
              text-shadow: 0 0 10px rgba(255,255,255,0.5);
              animation: textAnimation 4s infinite, colorChange 6s infinite;
              filter: url(#glow);
            }
          </style>
          <div class="animated-text">${text}</div>
        </div>
      </foreignObject>
    </svg>
  `;
}

// Generate banana animations
function generateBananaAnimations(svgWidth: number, svgHeight: number) {
  const bananaEmoji = "🍌";
  const numBananas = 20;
  let bananasSvg = "";

  for (let i = 0; i < numBananas; i++) {
    const x = Math.random() * svgWidth;
    const size = 20 + Math.random() * 30; // Random size between 20 and 50
    const duration = 3 + Math.random() * 5; // Between 3 and 8 seconds
    const delay = Math.random() * 5; // Random delay between 0 and 5 seconds

    bananasSvg += `
      <text x="${x}" y="-${size}" font-size="${size}" opacity="0.8">
        ${bananaEmoji}
        <animate attributeName="y" from="-${size}" to="${svgHeight + size}"
          dur="${duration}s" repeatCount="indefinite" begin="${delay}s" />
      </text>
    `;
  }

  return bananasSvg;
}

// Encode SVG content to data URL
function svgToDataUrl(svgContent: string) {
  const base64Svg = window.btoa(unescape(encodeURIComponent(svgContent)));
  return `data:image/svg+xml;base64,${base64Svg}`;
}

// Log the SVG to the console
function logSVGToConsole(dataUrl: string, svgWidth: number, svgHeight: number) {
  // Calculate padding to center the SVG
  const paddingVertical = svgHeight / 2;
  const paddingHorizontal = svgWidth / 2;

  // Reduce padding slightly to prevent scrollbars
  const adjustedPaddingVertical = paddingVertical - 10;
  const adjustedPaddingHorizontal = paddingHorizontal - 10;

  // Log the SVG to the console
  console.log(
    "%c ",
    `
      background: url('${dataUrl}') no-repeat center center;
      background-size: contain;
      padding: ${adjustedPaddingVertical}px ${adjustedPaddingHorizontal}px;
      line-height: ${svgHeight}px;
      font-size: 0;
    `
  );
}
