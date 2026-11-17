import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import Prism from "prismjs";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "prismjs/themes/prism-tomorrow.css";

import "prismjs/components/prism-markup";
import "prismjs/components/prism-json";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-xml-doc";

import "./App.css";

// Configure marked to use Prism for fenced code blocks inside Markdown
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight(code, lang) {
    const language = Prism.languages[lang] ? lang : "none";
    if (language === "none") return code;
    return Prism.highlight(code, Prism.languages[language], language);
  },
});

const API_URL = "https://db.yurphagames.net/api/v1/posts";

const SOCIAL_LINKS = [
  {
    label: "YouTube (@Yurpha)",
    url: "https://www.youtube.com/@Yurpha",
    type: "youtube",
  },
  {
    label: "YouTube (@YurphaGames)",
    url: "https://www.youtube.com/@YurphaGames",
    type: "youtube",
  },
  {
    label: "GitHub",
    url: "https://github.com/DasStudioINC",
    type: "github",
  },
  {
    label: "Reddit",
    url: "https://www.reddit.com/r/YurphaGames/",
    type: "reddit",
  },
];

const EXTENSION_META = {
  zip: {
    lang: "none",
    label: "ZIP Archive",
    color: "#58a6ff",
    badge: "ZIP",
    kind: "zip",
  },
  js: {
    lang: "javascript",
    label: "JavaScript",
    color: "#f7df1e",
    badge: "JS",
    kind: "text",
  },
  mjs: {
    lang: "javascript",
    label: "JavaScript",
    color: "#f7df1e",
    badge: "JS",
    kind: "text",
  },
  cjs: {
    lang: "javascript",
    label: "JavaScript",
    color: "#f7df1e",
    badge: "JS",
    kind: "text",
  },
  jsx: {
    lang: "jsx",
    label: "React JSX",
    color: "#61dafb",
    badge: "JSX",
    kind: "text",
  },
  ts: {
    lang: "typescript",
    label: "TypeScript",
    color: "#3178c6",
    badge: "TS",
    kind: "text",
  },
  tsx: {
    lang: "typescript",
    label: "React TSX",
    color: "#3178c6",
    badge: "TSX",
    kind: "text",
  },
  json: {
    lang: "json",
    label: "JSON",
    color: "#cbcb41",
    badge: "JSON",
    kind: "text",
  },
  css: {
    lang: "css",
    label: "CSS",
    color: "#563d7c",
    badge: "CSS",
    kind: "text",
  },
  html: {
    lang: "markup",
    label: "HTML",
    color: "#e34c26",
    badge: "HTML",
    kind: "text",
  },
  xml: {
    lang: "markup",
    label: "XML",
    color: "#f16529",
    badge: "XML",
    kind: "text",
  },
  java: {
    lang: "java",
    label: "Java",
    color: "#f89820",
    badge: "JAVA",
    kind: "text",
  },
  cs: {
    lang: "csharp",
    label: "C#",
    color: "#9b4f96",
    badge: "C#",
    kind: "text",
  },
  py: {
    lang: "python",
    label: "Python",
    color: "#3572a5",
    badge: "PY",
    kind: "text",
  },
  sql: {
    lang: "sql",
    label: "SQL",
    color: "#e38c00",
    badge: "SQL",
    kind: "text",
  },
  sh: {
    lang: "bash",
    label: "Shell Script",
    color: "#89e051",
    badge: "SH",
    kind: "text",
  },
  bat: {
    lang: "bash",
    label: "Batch Script",
    color: "#c1f12e",
    badge: "BAT",
    kind: "text",
  },
  ps1: {
    lang: "bash",
    label: "PowerShell",
    color: "#4da3ff",
    badge: "PS1",
    kind: "text",
  },
  yml: {
    lang: "yaml",
    label: "YAML",
    color: "#cb171e",
    badge: "YAML",
    kind: "text",
  },
  yaml: {
    lang: "yaml",
    label: "YAML",
    color: "#cb171e",
    badge: "YAML",
    kind: "text",
  },
  md: {
    lang: "markdown",
    label: "Markdown",
    color: "#58a6ff",
    badge: "MD",
    kind: "markdown",
  },
  markdown: {
    lang: "markdown",
    label: "Markdown",
    color: "#58a6ff",
    badge: "MD",
    kind: "markdown",
  },
  properties: {
    lang: "yaml",
    label: "Properties",
    color: "#8b949e",
    badge: "CFG",
    kind: "text",
  },
  ini: {
    lang: "yaml",
    label: "INI Config",
    color: "#8b949e",
    badge: "INI",
    kind: "text",
  },
  cfg: {
    lang: "yaml",
    label: "Config",
    color: "#8b949e",
    badge: "CFG",
    kind: "text",
  },
  log: {
    lang: "none",
    label: "Log File",
    color: "#8b949e",
    badge: "LOG",
    kind: "text",
  },
  csv: {
    lang: "none",
    label: "CSV Data",
    color: "#3fb950",
    badge: "CSV",
    kind: "text",
  },
  txt: {
    lang: "none",
    label: "Plain Text",
    color: "#8b949e",
    badge: "TXT",
    kind: "text",
  },
};

const IMAGE_MIMES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const VIDEO_MIMES = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogg",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
};

const AUDIO_MIMES = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  aac: "audio/aac",
  opus: "audio/opus",
  weba: "audio/webm",
};

const BINARY_EXTENSIONS = new Set([
  "exe",
  "dll",
  "so",
  "dylib",
  "bin",
  "dat",
  "jar",
  "class",
  "7z",
  "rar",
  "tar",
  "gz",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "unitypackage",
  "asset",
  "prefab",
  "fbx",
  "obj",
  "blend",
]);

function getExtension(filename) {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase().trim() : "";
}

function getPreviewKind(filename) {
  const ext = getExtension(filename);
  if (ext === "zip") return "zip";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (IMAGE_MIMES[ext]) return "image";
  if (VIDEO_MIMES[ext]) return "video";
  if (AUDIO_MIMES[ext]) return "audio";
  if (ext === "pdf") return "pdf";
  if (BINARY_EXTENSIONS.has(ext)) return "binary";
  return "text";
}

function getMimeType(filename) {
  const ext = getExtension(filename);
  return (
    IMAGE_MIMES[ext] ||
    VIDEO_MIMES[ext] ||
    AUDIO_MIMES[ext] ||
    (ext === "pdf"
      ? "application/pdf"
      : ext === "json"
        ? "application/json"
        : ext === "md" || ext === "markdown"
          ? "text/markdown"
          : "application/octet-stream")
  );
}

function getFileMeta(filename) {
  const ext = getExtension(filename);
  const kind = getPreviewKind(filename);

  if (kind === "image") {
    return {
      lang: "none",
      label: `${ext.toUpperCase()} Image`,
      color: "#a371f7",
      badge: ext.toUpperCase() || "IMG",
      kind: "image",
    };
  }
  if (kind === "video") {
    return {
      lang: "none",
      label: `${ext.toUpperCase()} Video`,
      color: "#f778ba",
      badge: ext.toUpperCase() || "VID",
      kind: "video",
    };
  }
  if (kind === "audio") {
    return {
      lang: "none",
      label: `${ext.toUpperCase()} Audio`,
      color: "#3fb950",
      badge: ext.toUpperCase() || "AUD",
      kind: "audio",
    };
  }
  if (kind === "pdf") {
    return {
      lang: "none",
      label: "PDF Document",
      color: "#ff7b72",
      badge: "PDF",
      kind: "pdf",
    };
  }
  if (EXTENSION_META[ext]) return EXTENSION_META[ext];
  if (kind === "binary") {
    return {
      lang: "none",
      label: `${ext.toUpperCase()} Binary`,
      color: "#f85149",
      badge: ext.toUpperCase() || "BIN",
      kind: "binary",
    };
  }
  return {
    lang: "none",
    label: ext ? ext.toUpperCase() : "File",
    color: "#8b949e",
    badge: ext ? ext.toUpperCase() : "FILE",
    kind: "text",
  };
}

function getPostDisplayMeta(post) {
  const rawCandidate =
    post.fileName ||
    post.originalFileName ||
    post.fileType ||
    post.mimeType ||
    post.postName ||
    "";

  const explicitExt = getExtension(rawCandidate);
  if (
    explicitExt &&
    (EXTENSION_META[explicitExt] ||
      IMAGE_MIMES[explicitExt] ||
      VIDEO_MIMES[explicitExt] ||
      AUDIO_MIMES[explicitExt] ||
      explicitExt === "pdf" ||
      BINARY_EXTENSIONS.has(explicitExt))
  ) {
    return getFileMeta(`file.${explicitExt}`);
  }

  const name = `${post.postName || ""} ${post.fileType || ""}`.toLowerCase();

  if (/\b(md|markdown|readme|changelog)\b/.test(name)) {
    return {
      lang: "markdown",
      label: "Markdown Document",
      color: "#58a6ff",
      badge: "MD",
      kind: "markdown",
    };
  }
  if (/\bjson\b|postman/.test(name)) {
    return {
      lang: "json",
      label: "JSON Document",
      color: "#cbcb41",
      badge: "JSON",
      kind: "text",
    };
  }
  if (/\b(mp4|webm|mov|mkv|avi|video)\b/.test(name)) {
    return {
      lang: "none",
      label: "Video File",
      color: "#f778ba",
      badge: "VIDEO",
      kind: "video",
    };
  }
  if (/\b(mp3|wav|ogg|flac|m4a|audio|sound|music)\b/.test(name)) {
    return {
      lang: "none",
      label: "Audio File",
      color: "#3fb950",
      badge: "AUDIO",
      kind: "audio",
    };
  }
  if (/\b(png|jpg|jpeg|gif|webp|svg|image|screenshot)\b/.test(name)) {
    return {
      lang: "none",
      label: "Image File",
      color: "#a371f7",
      badge: "IMAGE",
      kind: "image",
    };
  }
  if (/\bpdf\b/.test(name)) {
    return {
      lang: "none",
      label: "PDF Document",
      color: "#ff7b72",
      badge: "PDF",
      kind: "pdf",
    };
  }
  if (/\b(exe|installer|setup)\b/.test(name)) {
    return {
      lang: "none",
      label: "Executable",
      color: "#f85149",
      badge: "EXE",
      kind: "binary",
    };
  }
  if (/\bsql\b/.test(name)) {
    return {
      lang: "sql",
      label: "SQL Script",
      color: "#e38c00",
      badge: "SQL",
      kind: "text",
    };
  }

  return {
    lang: "none",
    label: "ZIP Archive",
    color: "#58a6ff",
    badge: "ZIP",
    kind: "zip",
  };
}

function getActionButtonText(kind) {
  switch (kind) {
    case "video":
      return "Play Video";
    case "audio":
      return "Play Audio";
    case "image":
      return "View Image";
    case "pdf":
      return "View PDF";
    case "markdown":
      return "Read Doc";
    case "text":
      return "View Code";
    case "binary":
      return "Inspect";
    default:
      return "Browse Archive";
  }
}

function detectResponseFormat(arrayBuffer, contentTypeHeader, post) {
  const bytes = new Uint8Array(arrayBuffer);
  const ct = (contentTypeHeader || "").toLowerCase();

  // 1. ZIP: PK\x03\x04
  if (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)
  ) {
    return { isZip: true, ext: "zip", mime: "application/zip" };
  }

  // 2. Images
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { isZip: false, ext: "png", mime: "image/png" };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { isZip: false, ext: "jpg", mime: "image/jpeg" };
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { isZip: false, ext: "gif", mime: "image/gif" };
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { isZip: false, ext: "webp", mime: "image/webp" };
  }

  // 3. Videos
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    return { isZip: false, ext: "mp4", mime: "video/mp4" };
  }
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return { isZip: false, ext: "webm", mime: "video/webm" };
  }

  // 4. Audio
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) ||
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
  ) {
    return { isZip: false, ext: "mp3", mime: "audio/mpeg" };
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x41 &&
    bytes[10] === 0x56 &&
    bytes[11] === 0x45
  ) {
    return { isZip: false, ext: "wav", mime: "audio/wav" };
  }
  if (
    bytes[0] === 0x4f &&
    bytes[1] === 0x67 &&
    bytes[2] === 0x67 &&
    bytes[3] === 0x53
  ) {
    return { isZip: false, ext: "ogg", mime: "audio/ogg" };
  }
  if (
    bytes[0] === 0x66 &&
    bytes[1] === 0x4c &&
    bytes[2] === 0x61 &&
    bytes[3] === 0x43
  ) {
    return { isZip: false, ext: "flac", mime: "audio/flac" };
  }

  // 5. PDF
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return { isZip: false, ext: "pdf", mime: "application/pdf" };
  }

  // 6. Non-ZIP archives / Windows EXE
  if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72) {
    return {
      isZip: false,
      ext: "rar",
      mime: "application/vnd.rar",
      unsupportedArchive: "RAR Archive (.rar)",
    };
  }
  if (bytes[0] === 0x37 && bytes[1] === 0x7a) {
    return {
      isZip: false,
      ext: "7z",
      mime: "application/x-7z-compressed",
      unsupportedArchive: "7-Zip Archive (.7z)",
    };
  }
  if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return { isZip: false, ext: "exe", mime: "application/x-msdownload" };
  }

  // 7. Fall back to Content-Type header or post metadata
  if (ct.includes("video/"))
    return { isZip: false, ext: "mp4", mime: ct.split(";")[0] };
  if (ct.includes("audio/"))
    return { isZip: false, ext: "mp3", mime: ct.split(";")[0] };
  if (ct.includes("image/"))
    return { isZip: false, ext: "png", mime: ct.split(";")[0] };
  if (ct.includes("pdf"))
    return { isZip: false, ext: "pdf", mime: "application/pdf" };
  if (ct.includes("markdown"))
    return { isZip: false, ext: "md", mime: "text/markdown" };

  // 8. Check if it's readable UTF-8 text / JSON / Markdown
  const sample = new TextDecoder("utf-8", { fatal: false }).decode(
    bytes.slice(0, 2048),
  );
  const trimmed = sample.trim();
  const postMeta = getPostDisplayMeta(post);

  if (
    ct.includes("json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    postMeta.badge === "JSON"
  ) {
    return { isZip: false, ext: "json", mime: "application/json" };
  }

  const explicitExt = getExtension(post.fileName || post.postName || "");
  if (explicitExt && EXTENSION_META[explicitExt]) {
    return { isZip: false, ext: explicitExt, mime: "text/plain" };
  }

  if (postMeta.badge === "MD") {
    return { isZip: false, ext: "md", mime: "text/markdown" };
  }

  return { isZip: false, ext: "txt", mime: "text/plain" };
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildFileTree(files) {
  const root = { name: "", path: "", isDir: true, children: {} };

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    parts.forEach((part, idx) => {
      const isLast = idx === parts.length - 1;
      const currentPath = parts.slice(0, idx + 1).join("/");

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          isDir: isLast ? file.isDir : true,
          fileData: isLast && !file.isDir ? file : null,
          children: {},
        };
      }
      current = current.children[part];
    });
  }

  function toSortedArray(node) {
    return Object.values(node.children)
      .map((child) => ({
        ...child,
        childrenList: toSortedArray(child),
      }))
      .sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  return toSortedArray(root);
}

function formatDate(dateString) {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TreeNode({
  node,
  depth,
  selectedPath,
  expandedDirs,
  toggleDir,
  onSelectFile,
}) {
  if (node.isDir) {
    const isOpen = !!expandedDirs[node.path];
    return (
      <div className="tree-branch">
        <button
          type="button"
          className={`tree-item tree-folder ${isOpen ? "open" : ""}`}
          style={{ paddingLeft: `${12 + depth * 15}px` }}
          onClick={() => toggleDir(node.path)}
        >
          <svg
            className={`tree-chevron ${isOpen ? "rotated" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <svg
            className="folder-icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
          </svg>
          <span className="tree-label">{node.name}</span>
        </button>
        {isOpen &&
          node.childrenList.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedDirs={expandedDirs}
              toggleDir={toggleDir}
              onSelectFile={onSelectFile}
            />
          ))}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;
  const meta = getFileMeta(node.name);

  return (
    <button
      type="button"
      className={`tree-item tree-file ${isSelected ? "active" : ""}`}
      style={{ paddingLeft: `${26 + depth * 15}px` }}
      onClick={() => onSelectFile(node.fileData)}
    >
      <span
        className="file-type-pill"
        style={{
          color: meta.color,
          borderColor: `${meta.color}44`,
          backgroundColor: `${meta.color}14`,
        }}
      >
        {meta.badge}
      </span>
      <span className="tree-label">{node.name}</span>
    </button>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  const [currentOpen, setCurrentOpen] = useState(true);
  const [deprecatedOpen, setDeprecatedOpen] = useState(false);

  // Archive / Standalone File Viewer State
  const [viewingPost, setViewingPost] = useState(null);
  const [isSingleFileMode, setIsSingleFileMode] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [zipFiles, setZipFiles] = useState([]);
  const [treeFilter, setTreeFilter] = useState("");
  const [expandedDirs, setExpandedDirs] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageCheckerBg, setImageCheckerBg] = useState(true);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Markdown view mode: "preview" | "raw"
  const [mdViewMode, setMdViewMode] = useState("preview");

  // Mobile drawer state for ZIP file tree
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const loadedPosts = (Array.isArray(data) ? data : []).sort((a, b) => {
        const dateA = new Date(a.postDate || 0).getTime();
        const dateB = new Date(b.postDate || 0).getTime();
        return dateB - dateA;
      });

      setPosts(loadedPosts);

      if (selectedPost) {
        const updatedSelectedPost = loadedPosts.find(
          (post) => post.searchTitle === selectedPost.searchTitle,
        );
        setSelectedPost(updatedSelectedPost || null);
      }
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  // Lock background scroll & handle Escape key while modal is open
  useEffect(() => {
    if (!viewingPost) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (mobileTreeOpen) {
          setMobileTreeOpen(false);
        } else {
          closeViewer();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewingPost, mobileTreeOpen]);

  function getDownloadUrl(searchTitle) {
    return `${API_URL}/search/${encodeURIComponent(searchTitle)}/post`;
  }

  function clearMediaUrl() {
    setMediaPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function openArchiveViewer(post) {
    setViewingPost(post);
    setIsSingleFileMode(false);
    setZipLoading(true);
    setZipError("");
    setZipFiles([]);
    setTreeFilter("");
    setActiveFile(null);
    setFileContent("");
    setImageZoom(1);
    setMdViewMode("preview");
    setMobileTreeOpen(false);
    clearMediaUrl();
    setExpandedDirs({});

    try {
      const response = await fetch(getDownloadUrl(post.searchTitle));
      if (!response.ok) {
        throw new Error(`Failed to fetch file (HTTP ${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const detected = detectResponseFormat(
        arrayBuffer,
        response.headers.get("content-type"),
        post,
      );

      if (detected.unsupportedArchive) {
        throw new Error(
          `This item is a ${detected.unsupportedArchive} (${formatBytes(arrayBuffer.byteLength)}), which cannot be unpacked in the browser. Use the Download button instead.`,
        );
      }

      // STANDALONE FILE MODE
      if (!detected.isZip) {
        setIsSingleFileMode(true);
        const baseName = (post.fileName || post.postName || "file").replace(
          /\.[^/.]+$/,
          "",
        );
        const virtualPath = `${baseName}.${detected.ext}`;
        const singleFile = {
          path: virtualPath,
          isDir: false,
          size: arrayBuffer.byteLength,
          entry: null,
          rawBuffer: arrayBuffer,
          mime: detected.mime,
        };

        setZipFiles([singleFile]);
        setActiveFile(singleFile);

        const kind = getPreviewKind(virtualPath);
        if (
          kind === "image" ||
          kind === "video" ||
          kind === "audio" ||
          kind === "pdf"
        ) {
          const blob = new Blob([arrayBuffer], { type: detected.mime });
          setMediaPreviewUrl(URL.createObjectURL(blob));
        } else if (kind === "text" || kind === "markdown") {
          let decoded = new TextDecoder("utf-8").decode(arrayBuffer);
          if (detected.ext === "json") {
            try {
              decoded = JSON.stringify(JSON.parse(decoded), null, 2);
            } catch {
              // Keep raw string if JSON has trailing comments/formatting
            }
          }
          setFileContent(decoded);
        }
        return;
      }

      // ZIP ARCHIVE MODE
      setIsSingleFileMode(false);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const entries = [];
      const initialExpanded = {};

      zip.forEach((relativePath, zipEntry) => {
        entries.push({
          path: relativePath,
          isDir: zipEntry.dir,
          size: zipEntry._data?.uncompressedSize ?? null,
          entry: zipEntry,
        });

        const parts = relativePath.split("/").filter(Boolean);
        if (parts.length > 1) {
          initialExpanded[parts[0]] = true;
        }
      });

      setZipFiles(entries);
      setExpandedDirs(initialExpanded);

      const firstPreviewable =
        entries.find((e) => !e.isDir && /readme/i.test(e.path)) ||
        entries.find((e) => !e.isDir && getPreviewKind(e.path) !== "binary") ||
        entries.find((e) => !e.isDir);

      if (firstPreviewable) {
        await selectZipFile(firstPreviewable);
      } else {
        setMobileTreeOpen(true);
      }
    } catch (err) {
      setZipError(err.message || "Could not read file contents.");
    } finally {
      setZipLoading(false);
    }
  }

  async function selectZipFile(fileObj) {
    setActiveFile(fileObj);
    setCopied(false);
    setImageZoom(1);
    setMdViewMode("preview");
    setMobileTreeOpen(false);
    clearMediaUrl();

    if (!fileObj.entry) return;

    const kind = getPreviewKind(fileObj.path);

    if (
      kind === "image" ||
      kind === "video" ||
      kind === "audio" ||
      kind === "pdf"
    ) {
      setFileContentLoading(true);
      try {
        const rawBlob = await fileObj.entry.async("blob");
        const typedBlob = new Blob([rawBlob], {
          type: getMimeType(fileObj.path),
        });
        setMediaPreviewUrl(URL.createObjectURL(typedBlob));
      } finally {
        setFileContentLoading(false);
      }
      return;
    }

    if (kind === "binary") {
      setFileContent("");
      return;
    }

    setFileContentLoading(true);
    try {
      let text = await fileObj.entry.async("string");
      if (getExtension(fileObj.path) === "json") {
        try {
          text = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          // Keep original formatting if not strict JSON
        }
      }
      setFileContent(text);
    } catch {
      setFileContent("[Unable to decode file as UTF-8 text]");
    } finally {
      setFileContentLoading(false);
    }
  }

  async function downloadSingleEntry(fileObj) {
    if (!fileObj) return;
    const filename = fileObj.path.split("/").pop() || "download";
    let blob;
    if (fileObj.entry) {
      const raw = await fileObj.entry.async("blob");
      blob = new Blob([raw], { type: getMimeType(fileObj.path) });
    } else if (fileObj.rawBuffer) {
      blob = new Blob([fileObj.rawBuffer], {
        type: fileObj.mime || getMimeType(fileObj.path),
      });
    } else {
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function toggleDir(dirPath) {
    setExpandedDirs((prev) => ({
      ...prev,
      [dirPath]: !prev[dirPath],
    }));
  }

  function closeViewer() {
    clearMediaUrl();
    setViewingPost(null);
    setIsSingleFileMode(false);
    setZipFiles([]);
    setActiveFile(null);
    setFileContent("");
    setMdViewMode("preview");
    setMobileTreeOpen(false);
  }

  const filteredZipFiles = useMemo(() => {
    if (!treeFilter.trim()) return zipFiles;
    const q = treeFilter.toLowerCase();
    return zipFiles.filter((f) => !f.isDir && f.path.toLowerCase().includes(q));
  }, [zipFiles, treeFilter]);

  const fileTree = useMemo(() => buildFileTree(zipFiles), [zipFiles]);

  const activeKind = useMemo(
    () => (activeFile ? getPreviewKind(activeFile.path) : "text"),
    [activeFile],
  );

  const activeFileMeta = useMemo(
    () => (activeFile ? getFileMeta(activeFile.path) : null),
    [activeFile],
  );

  const isTextLike = activeKind === "text" || activeKind === "markdown";

  const highlightedLines = useMemo(() => {
    if (!activeFile || !isTextLike || !fileContent) return [];
    const lang = activeFileMeta?.lang || "none";
    const grammar = Prism.languages[lang];

    const html = grammar
      ? Prism.highlight(fileContent, grammar, lang)
      : fileContent
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

    return html.split("\n");
  }, [activeFile, isTextLike, activeFileMeta, fileContent]);

  const renderedMarkdownHtml = useMemo(() => {
    if (activeKind !== "markdown" || !fileContent) return "";
    const rawHtml = marked.parse(fileContent);
    return DOMPurify.sanitize(rawHtml);
  }, [activeKind, fileContent]);

  const filteredPosts = posts.filter((post) =>
    (post.postName || "Unnamed file")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const totalCurrentCount = posts.filter(
    (post) => (post.version || "current").toLowerCase() === "current",
  ).length;

  const totalDeprecatedCount = posts.filter(
    (post) => (post.version || "").toLowerCase() === "deprecated",
  ).length;

  const currentPosts = filteredPosts.filter(
    (post) => (post.version || "current").toLowerCase() === "current",
  );

  const deprecatedPosts = filteredPosts.filter(
    (post) => (post.version || "").toLowerCase() === "deprecated",
  );

  const renderFileRow = (post, index) => {
    const isCurrent = (post.version || "current").toLowerCase() === "current";
    const formattedDate = formatDate(post.postDate);
    const postMeta = getPostDisplayMeta(post);

    return (
      <div
        className={`file-row ${isCurrent ? "" : "deprecated-row"} ${
          selectedPost?.searchTitle === post.searchTitle ? "selected" : ""
        }`}
        key={post.searchTitle || index}
        onClick={() => setSelectedPost(post)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedPost(post);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="file-details">
          <div
            className="file-icon"
            style={{
              borderColor: `${postMeta.color}44`,
              background: `${postMeta.color}14`,
              color: postMeta.color,
            }}
          >
            {postMeta.kind === "video" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : postMeta.kind === "audio" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            ) : postMeta.kind === "image" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            ) : postMeta.kind === "markdown" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            ) : postMeta.kind === "text" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 8v13H3V8" />
                <path d="M1 3h22v5H1z" />
                <path d="M10 12h4" />
              </svg>
            )}
            <span>{postMeta.badge}</span>
          </div>

          <div className="file-name">
            <strong>{post.postName || "Unnamed file"}</strong>

            <div className="file-submeta">
              <span style={{ color: postMeta.color, fontWeight: 600 }}>
                {postMeta.label}
              </span>
              <span className="meta-separator">•</span>
              <span>
                {post.userHandle
                  ? `Uploaded by ${post.userHandle}`
                  : "Repository File"}
              </span>
              {formattedDate && (
                <>
                  <span className="meta-separator">•</span>
                  <span>{formattedDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="file-actions">
          <span
            className={`version-badge ${isCurrent ? "current" : "deprecated"}`}
          >
            {isCurrent ? "Current" : "Deprecated"}
          </span>

          <div className="file-action-buttons">
            <button
              type="button"
              className="view-button"
              onClick={(event) => {
                event.stopPropagation();
                openArchiveViewer(post);
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{getActionButtonText(postMeta.kind)}</span>
            </button>

            <a
              className={`download-button ${isCurrent ? "" : "secondary"}`}
              href={getDownloadUrl(post.searchTitle)}
              onClick={(event) => event.stopPropagation()}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  const selectedIsCurrent = selectedPost
    ? (selectedPost.version || "current").toLowerCase() === "current"
    : true;

  const selectedPostMeta = selectedPost
    ? getPostDisplayMeta(selectedPost)
    : null;
  const totalFileCount = zipFiles.filter((f) => !f.isDir).length;
  const totalFolderCount = zipFiles.filter((f) => f.isDir).length;

  return (
    <div className="app">
      <header className="header">
        <div className="brand-cluster">
          <a href="/" className="logo">
            <span className="logo-mark">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </span>
            <span className="logo-text">
              <span className="logo-title">DB Downloader</span>
              <span className="logo-subtitle">Yurpha Games Repository</span>
            </span>
          </a>
        </div>
      </header>

      <main className="main-layout">
        <aside
          className={`repository-panel ${selectedPost ? "has-selection" : ""}`}
        >
          <div>
            <div className="panel-eyebrow">
              <span className="status-dot"></span>
              <span>
                {selectedPost ? "Package Inspector" : "Yurpha Games DB"}
              </span>
            </div>

            <h1>
              {selectedPost
                ? selectedPost.postName || "Unnamed file"
                : "Database & Build Archives"}
            </h1>

            <div className="panel-divider"></div>

            <p>
              {selectedPost
                ? selectedPost.description ||
                  "No description available for this item."
                : "Select any file or archive from the release list to inspect its type, notes, and preview."}
            </p>

            {selectedPost && (
              <>
                <div className="selected-meta-strip">
                  <div className="meta-row">
                    <span>Type</span>
                    <strong style={{ color: selectedPostMeta?.color }}>
                      {selectedPostMeta?.label}
                    </strong>
                  </div>
                  <div className="meta-row">
                    <span>Status</span>
                    <strong
                      style={{
                        color: selectedIsCurrent
                          ? "var(--green-text)"
                          : "var(--red-text)",
                      }}
                    >
                      {selectedIsCurrent ? "Current Release" : "Deprecated"}
                    </strong>
                  </div>
                  {selectedPost.userHandle && (
                    <div className="meta-row">
                      <span>Publisher</span>
                      <strong>{selectedPost.userHandle}</strong>
                    </div>
                  )}
                  {formatDate(selectedPost.postDate) && (
                    <div className="meta-row">
                      <span>Published</span>
                      <strong>{formatDate(selectedPost.postDate)}</strong>
                    </div>
                  )}
                </div>

                <div className="sidebar-cta-stack">
                  <button
                    type="button"
                    className="sidebar-view-cta"
                    onClick={() => openArchiveViewer(selectedPost)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>{getActionButtonText(selectedPostMeta?.kind)}</span>
                  </button>

                  <a
                    className="sidebar-download-cta"
                    href={getDownloadUrl(selectedPost.searchTitle)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download File</span>
                  </a>
                </div>
              </>
            )}
          </div>

          <div className="repository-stats-grid">
            <div className="stat-card">
              <span>Total</span>
              <strong>{posts.length}</strong>
            </div>

            <div className="stat-card stat-current">
              <span>Current</span>
              <strong>{totalCurrentCount}</strong>
            </div>

            <div className="stat-card stat-deprecated">
              <span>Deprecated</span>
              <strong>{totalDeprecatedCount}</strong>
            </div>
          </div>
        </aside>

        <section className="downloads-section">
          <div className="downloads-header">
            <div>
              <h2>Releases & Archives</h2>
              <p>
                Download up-to-date database packages or browse legacy builds.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={loadPosts}
              disabled={loading}
            >
              <svg
                className={loading ? "spin" : ""}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>{loading ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>

          <div className="search-bar">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              placeholder="Filter archives by name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && <button onClick={() => setSearch("")}>Clear</button>}
          </div>

          <div className="downloads-list">
            {loading && (
              <div className="skeleton-container">
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
              </div>
            )}

            {!loading && error && (
              <div className="message error">
                <strong>Unable to reach repository server</strong>
                <p>{error}</p>
                <button onClick={loadPosts}>Retry Connection</button>
              </div>
            )}

            {!loading && !error && filteredPosts.length === 0 && (
              <div className="message">
                <strong>No archives found</strong>
                <p>
                  {search
                    ? `No files matched "${search}". Try clearing your search filter.`
                    : "No downloadable files are currently published in this repository."}
                </p>
              </div>
            )}

            {!loading && !error && currentPosts.length > 0 && (
              <div className="version-group">
                <button
                  className="group-header"
                  onClick={() => setCurrentOpen(!currentOpen)}
                >
                  <div className="group-header-left">
                    <span className="group-indicator current"></span>
                    <span>Current Releases</span>
                    <span className="group-count">{currentPosts.length}</span>
                  </div>
                  <span
                    className={`group-chevron ${currentOpen ? "open" : ""}`}
                  >
                    <span className="group-chevron-text">
                      {currentOpen ? "Collapse" : "Expand"}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {currentOpen && (
                  <div className="group-content">
                    {currentPosts.map((post, idx) => renderFileRow(post, idx))}
                  </div>
                )}
              </div>
            )}

            {!loading && !error && deprecatedPosts.length > 0 && (
              <div className="version-group">
                <button
                  className="group-header"
                  onClick={() => setDeprecatedOpen(!deprecatedOpen)}
                >
                  <div className="group-header-left">
                    <span className="group-indicator deprecated"></span>
                    <span>Deprecated Releases</span>
                    <span className="group-count">
                      {deprecatedPosts.length}
                    </span>
                  </div>
                  <span
                    className={`group-chevron ${deprecatedOpen ? "open" : ""}`}
                  >
                    <span className="group-chevron-text">
                      {deprecatedOpen ? "Collapse" : "Expand"}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {deprecatedOpen && (
                  <div className="group-content">
                    {deprecatedPosts.map((post, idx) =>
                      renderFileRow(post, idx),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="downloads-footer">
            <span>
              Showing {filteredPosts.length} of {posts.length} archives
            </span>
            <span>Endpoint: db.yurphagames.net</span>
          </div>
        </section>
      </main>

      {/* Adaptive Viewer Modal: Single-File Theater OR Split ZIP Tree Explorer */}
      {viewingPost && (
        <div className="zip-modal-backdrop" onClick={closeViewer}>
          <div
            className={`zip-modal ${isSingleFileMode ? "single-file-modal" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="zip-modal-header">
              <div className="zip-modal-title">
                {/* Mobile drawer button for ZIP archives */}
                {!isSingleFileMode && !zipLoading && !zipError && (
                  <button
                    type="button"
                    className={`mobile-tree-toggle ${mobileTreeOpen ? "active" : ""}`}
                    onClick={() => setMobileTreeOpen((prev) => !prev)}
                    aria-label="Toggle archive files"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Files ({totalFileCount})</span>
                  </button>
                )}

                <span
                  className="zip-badge"
                  style={
                    isSingleFileMode && activeFileMeta
                      ? {
                          color: activeFileMeta.color,
                          borderColor: `${activeFileMeta.color}55`,
                          backgroundColor: `${activeFileMeta.color}18`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="zip-badge-dot"
                    style={
                      isSingleFileMode && activeFileMeta
                        ? {
                            background: activeFileMeta.color,
                            boxShadow: `0 0 8px ${activeFileMeta.color}`,
                          }
                        : undefined
                    }
                  ></span>
                  {isSingleFileMode
                    ? `${activeFileMeta?.badge || "FILE"} VIEWER`
                    : "ARCHIVE EXPLORER"}
                </span>
                <h3>{viewingPost.postName || "File Viewer"}</h3>
                {!zipLoading &&
                  !zipError &&
                  !isSingleFileMode &&
                  zipFiles.length > 0 && (
                    <span className="zip-summary-pill">
                      {totalFileCount} {totalFileCount === 1 ? "file" : "files"}
                      {totalFolderCount > 0
                        ? ` • ${totalFolderCount} folders`
                        : ""}
                    </span>
                  )}
              </div>

              <div className="zip-modal-actions">
                <a
                  className="download-button modal-download-btn"
                  href={getDownloadUrl(viewingPost.searchTitle)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="modal-download-label">
                    {isSingleFileMode ? "Download File" : "Download ZIP"}
                  </span>
                </a>
                <button
                  type="button"
                  className="zip-close-btn"
                  onClick={closeViewer}
                  title="Close (Esc)"
                  aria-label="Close viewer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {zipLoading && (
              <div className="zip-status-box">
                <div className="zip-loader-ring"></div>
                <strong>Loading Stream...</strong>
                <p>Fetching file from db.yurphagames.net</p>
              </div>
            )}

            {!zipLoading && zipError && (
              <div className="zip-status-box error">
                <div className="zip-error-icon">!</div>
                <strong>Unable to Preview File</strong>
                <p>{zipError}</p>
              </div>
            )}

            {!zipLoading && !zipError && (
              <div
                className={`zip-explorer-body ${isSingleFileMode ? "single-pane" : ""}`}
              >
                {/* Mobile drawer backdrop */}
                {!isSingleFileMode && mobileTreeOpen && (
                  <div
                    className="mobile-tree-backdrop"
                    onClick={() => setMobileTreeOpen(false)}
                  />
                )}

                {/* Directory tree sidebar (sticky left pane on desktop, slide-over drawer on mobile) */}
                {!isSingleFileMode && (
                  <aside
                    className={`zip-tree-sidebar ${mobileTreeOpen ? "mobile-open" : ""}`}
                  >
                    <div className="zip-tree-mobile-header">
                      <span>Archive Contents ({totalFileCount})</span>
                      <button
                        type="button"
                        className="zip-tree-clear"
                        onClick={() => setMobileTreeOpen(false)}
                        aria-label="Close file tree"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="zip-tree-search">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Filter files in archive..."
                        value={treeFilter}
                        onChange={(e) => setTreeFilter(e.target.value)}
                      />
                      {treeFilter && (
                        <button
                          type="button"
                          onClick={() => setTreeFilter("")}
                          className="zip-tree-clear"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="zip-tree-scroll">
                      {treeFilter.trim() ? (
                        filteredZipFiles.length > 0 ? (
                          filteredZipFiles.map((fileObj) => {
                            const meta = getFileMeta(fileObj.path);
                            const isSelected =
                              activeFile?.path === fileObj.path;
                            return (
                              <button
                                key={fileObj.path}
                                type="button"
                                className={`tree-item tree-search-result ${isSelected ? "active" : ""}`}
                                onClick={() => selectZipFile(fileObj)}
                              >
                                <span
                                  className="file-type-pill"
                                  style={{
                                    color: meta.color,
                                    borderColor: `${meta.color}44`,
                                    backgroundColor: `${meta.color}14`,
                                  }}
                                >
                                  {meta.badge}
                                </span>
                                <span className="tree-search-path">
                                  {fileObj.path}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="zip-tree-empty">
                            No matching files
                          </div>
                        )
                      ) : (
                        fileTree.map((node) => (
                          <TreeNode
                            key={node.path}
                            node={node}
                            depth={0}
                            selectedPath={activeFile?.path}
                            expandedDirs={expandedDirs}
                            toggleDir={toggleDir}
                            onSelectFile={selectZipFile}
                          />
                        ))
                      )}
                    </div>
                  </aside>
                )}

                <div className="zip-code-pane">
                  {activeFile ? (
                    <>
                      <div className="zip-file-topbar">
                        <div className="zip-breadcrumbs">
                          {activeFile.path
                            .split("/")
                            .map((segment, idx, arr) => (
                              <span key={idx} className="crumb-segment">
                                {idx > 0 && (
                                  <span className="crumb-sep">/</span>
                                )}
                                <span
                                  className={
                                    idx === arr.length - 1
                                      ? "crumb-file"
                                      : "crumb-dir"
                                  }
                                >
                                  {segment}
                                </span>
                              </span>
                            ))}
                        </div>

                        <div className="zip-file-controls">
                          {/* Rendered vs Raw .md Toggle */}
                          {activeKind === "markdown" && (
                            <div
                              className="md-mode-toggle"
                              role="group"
                              aria-label="Markdown view mode"
                            >
                              <button
                                type="button"
                                className={`md-toggle-btn ${mdViewMode === "preview" ? "active" : ""}`}
                                onClick={() => setMdViewMode("preview")}
                              >
                                Rendered
                              </button>
                              <button
                                type="button"
                                className={`md-toggle-btn ${mdViewMode === "raw" ? "active" : ""}`}
                                onClick={() => setMdViewMode("raw")}
                              >
                                Raw .md
                              </button>
                            </div>
                          )}

                          {activeFileMeta && (
                            <span
                              className="zip-lang-tag"
                              style={{ color: activeFileMeta.color }}
                            >
                              {activeFileMeta.label}
                            </span>
                          )}

                          {isTextLike && (
                            <span className="zip-stat-pill">
                              {highlightedLines.length} lines
                            </span>
                          )}

                          {activeFile.size !== null && (
                            <span className="zip-stat-pill">
                              {formatBytes(activeFile.size)}
                            </span>
                          )}

                          {activeKind === "image" && (
                            <div className="image-zoom-controls">
                              <button
                                type="button"
                                className="zip-copy-btn"
                                onClick={() =>
                                  setImageZoom((z) =>
                                    Math.max(0.25, +(z - 0.25).toFixed(2)),
                                  )
                                }
                                title="Zoom out"
                              >
                                −
                              </button>
                              <span className="zip-stat-pill">
                                {Math.round(imageZoom * 100)}%
                              </span>
                              <button
                                type="button"
                                className="zip-copy-btn"
                                onClick={() =>
                                  setImageZoom((z) =>
                                    Math.min(4, +(z + 0.25).toFixed(2)),
                                  )
                                }
                                title="Zoom in"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                className="zip-copy-btn"
                                onClick={() => setImageCheckerBg((v) => !v)}
                                title="Toggle transparency grid"
                              >
                                Grid
                              </button>
                            </div>
                          )}

                          {isTextLike && (
                            <button
                              type="button"
                              className={`zip-copy-btn ${copied ? "copied" : ""}`}
                              onClick={() => {
                                navigator.clipboard.writeText(fileContent);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1800);
                              }}
                            >
                              {copied ? "Copied!" : "Copy"}
                            </button>
                          )}

                          {!isSingleFileMode && (
                            <button
                              type="button"
                              className="zip-copy-btn"
                              onClick={() => downloadSingleEntry(activeFile)}
                              title="Download only this file"
                            >
                              Save File
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="zip-code-scroll">
                        {fileContentLoading ? (
                          <div className="zip-status-box">
                            <div className="zip-loader-ring small"></div>
                            <p>Rendering preview...</p>
                          </div>
                        ) : activeKind === "image" && mediaPreviewUrl ? (
                          <div
                            className={`zip-image-preview ${imageCheckerBg ? "checkerboard" : ""}`}
                          >
                            <img
                              src={mediaPreviewUrl}
                              alt={activeFile.path}
                              style={{ transform: `scale(${imageZoom})` }}
                            />
                          </div>
                        ) : activeKind === "video" && mediaPreviewUrl ? (
                          <div className="zip-media-stage">
                            <div className="zip-video-frame">
                              <video
                                key={mediaPreviewUrl}
                                src={mediaPreviewUrl}
                                controls
                                playsInline
                                preload="metadata"
                              />
                            </div>
                            <div className="media-caption">
                              {activeFile.path.split("/").pop()} •{" "}
                              {formatBytes(activeFile.size)}
                            </div>
                          </div>
                        ) : activeKind === "audio" && mediaPreviewUrl ? (
                          <div className="zip-media-stage">
                            <div className="zip-audio-card">
                              <div
                                className="audio-visualizer-bars"
                                aria-hidden="true"
                              >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                              <div className="audio-track-info">
                                <strong>
                                  {activeFile.path.split("/").pop()}
                                </strong>
                                <span>
                                  {activeFileMeta?.label} •{" "}
                                  {formatBytes(activeFile.size)}
                                </span>
                              </div>
                              <audio
                                key={mediaPreviewUrl}
                                src={mediaPreviewUrl}
                                controls
                                preload="metadata"
                              />
                            </div>
                          </div>
                        ) : activeKind === "pdf" && mediaPreviewUrl ? (
                          <iframe
                            key={mediaPreviewUrl}
                            src={mediaPreviewUrl}
                            title={activeFile.path}
                            className="zip-pdf-frame"
                          />
                        ) : activeKind === "binary" ? (
                          <div className="zip-binary-card">
                            <div className="binary-badge">
                              .{getExtension(activeFile.path).toUpperCase()}
                            </div>
                            <strong>Compiled / Binary Asset</strong>
                            <p>
                              This file contains raw binary data (
                              {formatBytes(activeFile.size)}) and cannot be
                              previewed directly.
                            </p>
                            <button
                              type="button"
                              className="download-button"
                              onClick={() => downloadSingleEntry(activeFile)}
                            >
                              Download File
                            </button>
                          </div>
                        ) : activeKind === "markdown" &&
                          mdViewMode === "preview" ? (
                          <article
                            className="zip-markdown-body"
                            dangerouslySetInnerHTML={{
                              __html: renderedMarkdownHtml,
                            }}
                          />
                        ) : (
                          <pre className="zip-code-block">
                            <code>
                              {highlightedLines.map((lineHtml, i) => (
                                <div key={i} className="code-line">
                                  <span className="line-number">{i + 1}</span>
                                  <span
                                    className="line-code"
                                    dangerouslySetInnerHTML={{
                                      __html: lineHtml || " ",
                                    }}
                                  />
                                </div>
                              ))}
                            </code>
                          </pre>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="zip-status-box">
                      <strong>No File Selected</strong>
                      <p>
                        Pick any file from the{" "}
                        <button
                          type="button"
                          className="inline-link-btn"
                          onClick={() => setMobileTreeOpen(true)}
                        >
                          archive file list
                        </button>{" "}
                        to inspect or play it.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="footer">
        <span>DB Downloader — Yurpha Games DB</span>

        <div className="footer-links">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
