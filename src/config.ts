import type { CategoryInfo } from "./types/index.js";

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";

export const DESIGN_ARENA_API_URL =
  "https://www.designarena.ai/api/leaderboard";

export const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export const LEADERBOARD_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
export const MODEL_LIST_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const CATEGORIES: Record<string, CategoryInfo> = {
  allcategories: {
    displayName: "All Categories",
    description: "Overall rankings across all design benchmark categories.",
  },
  website: {
    displayName: "Website",
    description: "Models generate a complete website from a text prompt. Output: single-file HTML with inline CSS and JavaScript. May use Tailwind CSS, Three.js, D3, or Recharts. Tests responsive layout, modern UI patterns, visual polish, and code quality.",
  },
  gamedev: {
    displayName: "Game Dev",
    description: "Models generate a playable browser game from a text prompt. Output: single HTML file with inline CSS and JavaScript. Must include game mechanics, scoring system, and game states (start, play, game over). May use Canvas API, WebGL, or Three.js. Tests playability, fun factor, and code structure.",
  },
  "3d": {
    displayName: "3D Design",
    description: "Models generate an interactive 3D scene from a text prompt. Output: single HTML file using WebGL, Three.js, Babylon.js, or CSS 3D transforms with inline JavaScript. Must include proper lighting, materials, camera controls, and smooth animation. Tests visual fidelity and interactivity.",
  },
  dataviz: {
    displayName: "Data Viz",
    description: "Models generate interactive data visualizations from a text prompt. Output: single HTML file using D3.js, Chart.js, Recharts, Canvas API, or inline SVG with JavaScript. Must include interactive charts with hover states, tooltips, and responsive scaling. Tests data clarity and presentation.",
  },
  uicomponent: {
    displayName: "UI Component",
    description: "Models generate a production-ready UI component from a text prompt. Output: single HTML file with inline CSS and JavaScript. Must demonstrate all interaction states: default, hover, active, focus, loading, disabled, and error. Tests visual design, accessibility, and micro-interactions.",
  },
  image: {
    displayName: "Image",
    description: "Models generate an image from a text prompt. Output: image file (PNG/JPEG). This is a non-code visual generation task. Tests visual quality, prompt adherence, artistic coherence, and detail.",
  },
  logo: {
    displayName: "Logo",
    description: "Models generate a logo design from a text prompt. Output: image file or SVG. Tests brand identity, simplicity, scalability, memorability, and visual balance.",
  },
  svg: {
    displayName: "SVG",
    description: "Models generate SVG markup from a text prompt. Output: SVG code (XML-based vector graphics). Tests path quality, visual clarity, code cleanliness, and scalability.",
  },
  video: {
    displayName: "Video",
    description: "Models generate a video from a text prompt. Output: video file (MP4/WebM). This is a non-code visual generation task. Tests motion quality, temporal coherence, visual composition, and prompt adherence.",
  },
  imagetoimage: {
    displayName: "Image to Image",
    description: "Models transform an existing image based on a text prompt. Input: image + text. Output: modified image file. Tests edit accuracy, style transfer quality, and detail preservation.",
  },
  slides: {
    displayName: "Slides",
    description: "Models generate a presentation from a text prompt. Output: PDF or PowerPoint file. Tests information hierarchy, visual consistency, slide layout, and typography.",
  },
  graphicdesign: {
    displayName: "Graphic Design",
    description: "Models generate graphic design assets (posters, banners, marketing materials) from a text prompt. Output: image file. Tests typography, composition, color theory, and visual impact.",
  },
  tts: {
    displayName: "Text-to-Speech",
    description: "Models generate speech audio from text input. Output: audio file (MP3/WAV). Tests naturalness, prosody, clarity, emotional expression, and voice quality.",
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const VALID_CATEGORIES = Object.keys(CATEGORIES) as CategoryKey[];

export function categoryDisplayName(key: CategoryKey): string {
  return CATEGORIES[key].displayName;
}

export function categoryDescription(key: CategoryKey): string {
  return CATEGORIES[key].description;
}

/** Compact description for JSON Schema enum parameter */
export function buildCategoryParamDescription(prefix = "Design category to filter by"): string {
  const entries = VALID_CATEGORIES.map((key) => {
    if (key === "allcategories") return key;
    return `${key} (${CATEGORIES[key].description.split(". ")[0].toLowerCase()})`;
  });
  return `${prefix}. Options: ${entries.join(", ")}. Defaults to "allcategories".`;
}
