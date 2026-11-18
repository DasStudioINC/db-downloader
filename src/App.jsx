
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

  if (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)
  ) {
    return { isZip: true, ext: "zip", mime: "application/zip" };
  }

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

  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return { isZip: false, ext: "pdf", mime: "application/pdf" };
  }

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

  const [mdViewMode, setMdViewMode] = useState("preview");
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

  function getZipTreeUrl(searchTitle) {
    return `${API_URL}/search/${encodeURIComponent(searchTitle)}/zip/tree`;
  }

  function getZipEntryUrl(searchTitle, path) {
    return `${API_URL}/search/${encodeURIComponent(searchTitle)}/zip/file?path=${encodeURIComponent(path)}`;
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
      let treeResponse;

      try {
        treeResponse = await fetch(getZipTreeUrl(post.searchTitle));
      } catch {
        throw new Error("Unable to connect to the server.");
      }

      if (treeResponse.ok) {
        const treeData = await treeResponse.json();

        if (!Array.isArray(treeData)) {
          throw new Error("The server returned an invalid ZIP file tree.");
        }

        const entries = treeData.map((entry) => ({
          path: entry.path,
          isDir: Boolean(entry.directory),
          size: entry.size ?? null,
          compressedSize: entry.compressedSize ?? null,
          searchTitle: post.searchTitle,
          remoteZipEntry: !entry.directory,
        }));

        const initialExpanded = {};

        for (const entry of entries) {
          const parts = entry.path.split("/").filter(Boolean);

          if (parts.length > 1) {
            initialExpanded[parts[0]] = true;
          }
        }

        setIsSingleFileMode(false);
        setZipFiles(entries);
        setExpandedDirs(initialExpanded);

        const firstPreviewable =
          entries.find(
            (entry) => !entry.isDir && /readme/i.test(entry.path),
          ) ||
          entries.find(
            (entry) =>
              !entry.isDir && getPreviewKind(entry.path) !== "binary",
          ) ||
          entries.find((entry) => !entry.isDir);

        if (firstPreviewable) {
          await selectZipFile(firstPreviewable);
        } else {
          setMobileTreeOpen(true);
        }

        return;
      }

      if (treeResponse.status !== 400 && treeResponse.status !== 404) {
        throw new Error(
          `Failed to load ZIP file tree (HTTP ${treeResponse.status})`,
        );
      }

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

      if (detected.isZip) {
        throw new Error(
          "The ZIP file could not be indexed by the server. Please try again or contact the server administrator.",
        );
      }

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
          }
        }

        setFileContent(decoded);
      }
    } catch (err) {
      setZipError(err.message || "Could not read file contents.");
    } finally {
      setZipLoading(false);
    }
  }

  async function fetchZipEntryBlob(fileObj) {
    if (!fileObj?.remoteZipEntry || !fileObj.searchTitle) {
      throw new Error("This ZIP entry is not available for download.");
    }

    const response = await fetch(
      getZipEntryUrl(fileObj.searchTitle, fileObj.path),
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ZIP entry (HTTP ${response.status})`);
    }

    return response.blob();
  }

  async function selectZipFile(fileObj) {
    if (!fileObj || fileObj.isDir) return;

    setActiveFile(fileObj);
    setCopied(false);
    setImageZoom(1);
    setMdViewMode("preview");
    setMobileTreeOpen(false);
    clearMediaUrl();

    if (!fileObj.remoteZipEntry && !fileObj.entry) return;

    const kind = getPreviewKind(fileObj.path);

    if (kind === "binary") {
      setFileContent("");
      return;
    }

    setFileContentLoading(true);

    try {
      const responseBlob = fileObj.remoteZipEntry
        ? await fetchZipEntryBlob(fileObj)
        : await fileObj.entry.async("blob");

      if (
        kind === "image" ||
        kind === "video" ||
        kind === "audio" ||
        kind === "pdf"
      ) {
        const typedBlob = new Blob([responseBlob], {
          type: getMimeType(fileObj.path),
        });

        setMediaPreviewUrl(URL.createObjectURL(typedBlob));
        return;
      }

      let text = await responseBlob.text();

      if (getExtension(fileObj.path) === "json") {
        try {
          text = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
        }
      }

      setFileContent(text);
    } catch (err) {
      setFileContent("");
      setZipError(err.message || "Unable to load the selected file.");
    } finally {
      setFileContentLoading(false);
    }
  }

  async function downloadSingleEntry(fileObj) {
    if (!fileObj) return;

    const filename = fileObj.path.split("/").pop() || "download";
    let blob;

    if (fileObj.remoteZipEntry) {
      blob = await fetchZipEntryBlob(fileObj);
    } else if (fileObj.entry) {
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
    return zipFiles.filter(
      (file) => !file.isDir && file.path.toLowerCase().includes(q),
    );
  }, [zipFiles, treeFilter]);

  const fileTree = useMemo(() => buildFileTree(filteredZipFiles), [
    filteredZipFiles,
  ]);

  const currentPosts = useMemo(
    () =>
      posts.filter(
        (post) => (post.version || post.status || "").toUpperCase() === "CURRENT",
      ),
    [posts],
  );

  const deprecatedPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          (post.version || post.status || "").toUpperCase() === "DEPRECATED",
      ),
    [posts],
  );

  const filteredCurrentPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currentPosts;

    return currentPosts.filter((post) =>
      `${post.postName || ""} ${post.description || ""} ${post.searchTitle || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [currentPosts, search]);

  const filteredDeprecatedPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return deprecatedPosts;

    return deprecatedPosts.filter((post) =>
      `${post.postName || ""} ${post.description || ""} ${post.searchTitle || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [deprecatedPosts, search]);

  const totalCurrent = currentPosts.length;
  const totalDeprecated = deprecatedPosts.length;

  function selectPost(post) {
    setSelectedPost(post);
  }

  function renderPost(post) {
    const meta = getPostDisplayMeta(post);
    const version = (post.version || post.status || "CURRENT").toUpperCase();
    const isDeprecated = version === "DEPRECATED";

    return (
      <div
        key={post.searchTitle}
        className={`file-row ${selectedPost?.searchTitle === post.searchTitle ? "selected" : ""}`}
        onClick={() => selectPost(post)}
      >
        <div className="file-details">
          <div
            className="file-icon"
            style={{
              color: meta.color,
              borderColor: `${meta.color}44`,
              background: `${meta.color}14`,
            }}
          >
            {meta.badge}
          </div>

          <div className="file-name">
            <strong>{post.postName || post.fileName || "Untitled"}</strong>

            <div className="file-submeta">
              <span>{formatDate(post.postDate)}</span>
              <span className="meta-separator">•</span>
              <span>{meta.label}</span>
            </div>
          </div>
        </div>

        <div className="file-actions">
          <span
            className={`version-badge ${isDeprecated ? "deprecated" : "current"}`}
          >
            {version}
          </span>

          <div className="file-action-buttons">
            <button
              type="button"
              className="view-button"
              onClick={(event) => {
                event.stopPropagation();
                selectPost(post);
                openArchiveViewer(post);
              }}
            >
              {getActionButtonText(meta.kind)}
            </button>

            <a
              className="download-button"
              href={getDownloadUrl(post.searchTitle)}
              onClick={(event) => event.stopPropagation()}
              download
            >
              Download
            </a>
          </div>
        </div>
      </div>
    );
  }

  const activeFileMeta = activeFile ? getFileMeta(activeFile.path) : null;
  const activeFileKind = activeFile ? getPreviewKind(activeFile.path) : null;

  const renderedMarkdown =
    activeFileKind === "markdown"
      ? DOMPurify.sanitize(marked.parse(fileContent || ""))
      : "";

  const renderedCode =
    activeFile && activeFileKind === "text"
      ? Prism.highlight(
          fileContent || "",
          Prism.languages[activeFileMeta?.lang] || Prism.languages.none,
          activeFileMeta?.lang || "none",
        )
      : "";

  const selectedPostMeta = selectedPost
    ? getPostDisplayMeta(selectedPost)
    : null;

  return (
    <div className="app">
      <header className="header">
        <div className="brand-cluster">
          <a className="logo" href="/">
            <span className="logo-mark">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </span>

            <span className="logo-text">
              <span className="logo-title">YURPHA GAMES</span>
              <span className="logo-subtitle">DB DOWNLOADER</span>
            </span>
          </a>
        </div>

        <div className="header-socials">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.type + link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={`social-link ${link.type}`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <main className="main-layout">
        <aside
          className={`repository-panel ${selectedPost ? "has-selection" : ""}`}
        >
          <div>
            <div className="panel-eyebrow">
              <span className="status-dot" />
              PUBLIC REPOSITORY
            </div>

            <h1>Yurpha Games Database</h1>
            <div className="panel-divider" />

            <p>
              Browse and download files shared through the Yurpha Games
              database. Select a post to inspect its contents, preview files,
              and download individual entries.
            </p>

            {selectedPost && (
              <div className="selected-meta-strip">
                <div className="meta-row">
                  <span>Selected</span>
                  <strong>{selectedPost.postName || "Untitled"}</strong>
                </div>

                <div className="meta-row">
                  <span>Type</span>
                  <strong>{selectedPostMeta?.label || "Unknown"}</strong>
                </div>

                <div className="meta-row">
                  <span>Date</span>
                  <strong>
                    {formatDate(selectedPost.postDate) || "Unknown"}
                  </strong>
                </div>
              </div>
            )}

            {selectedPost && (
              <div className="sidebar-cta-stack">
                <button
                  type="button"
                  className="sidebar-view-cta"
                  onClick={() => openArchiveViewer(selectedPost)}
                >
                  View Contents
                </button>

                <a
                  className="sidebar-download-cta"
                  href={getDownloadUrl(selectedPost.searchTitle)}
                  download
                >
                  Download Full File
                </a>
              </div>
            )}
          </div>

          <div className="repository-stats-grid">
            <div className="stat-card">
              <span>Total</span>
              <strong>{posts.length}</strong>
            </div>

            <div className="stat-card stat-current">
              <span>Current</span>
              <strong>{totalCurrent}</strong>
            </div>

            <div className="stat-card stat-deprecated">
              <span>Deprecated</span>
              <strong>{totalDeprecated}</strong>
            </div>
          </div>
        </aside>

        <section className="downloads-section">
          <div className="downloads-header">
            <div>
              <h2>Available Downloads</h2>
              <p>Browse the latest files and archived versions.</p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={loadPosts}
              disabled={loading}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? "spin" : ""}
              >
                <path d="M20 7v5h-5" />
                <path d="M4 17v-5h5" />
                <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12" />
                <path d="M4 12l2.8 5a7 7 0 0 0 11.6-2" />
              </svg>
              Refresh
            </button>
          </div>

          <div className="search-bar">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="text"
              placeholder="Search downloads..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button type="button" onClick={() => setSearch("")}>
                Clear
              </button>
            )}
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div className="skeleton-container">
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <h3>No downloads available</h3>
              <p>There are currently no files in the repository.</p>
            </div>
          ) : (
            <div className="downloads-list">
              <section className="version-group">
                <button
                  type="button"
                  className="group-header"
                  onClick={() => setCurrentOpen((prev) => !prev)}
                >
                  <span className="group-header-left">
                    <span className="group-indicator current" />
                    Current Versions
                    <span className="group-count">
                      {filteredCurrentPosts.length}
                    </span>
                  </span>

                  <span className={`group-chevron ${currentOpen ? "open" : ""}`}>
                    {currentOpen ? "Collapse" : "Expand"}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {currentOpen && (
                  <div className="group-content">
                    {filteredCurrentPosts.length ? (
                      filteredCurrentPosts.map(renderPost)
                    ) : (
                      <div className="empty-state compact">
                        <p>No current versions match your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="version-group">
                <button
                  type="button"
                  className="group-header"
                  onClick={() => setDeprecatedOpen((prev) => !prev)}
                >
                  <span className="group-header-left">
                    <span className="group-indicator deprecated" />
                    Deprecated Versions
                    <span className="group-count">
                      {filteredDeprecatedPosts.length}
                    </span>
                  </span>

                  <span
                    className={`group-chevron ${deprecatedOpen ? "open" : ""}`}
                  >
                    {deprecatedOpen ? "Collapse" : "Expand"}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {deprecatedOpen && (
                  <div className="group-content">
                    {filteredDeprecatedPosts.length ? (
                      filteredDeprecatedPosts.map(renderPost)
                    ) : (
                      <div className="empty-state compact">
                        <p>No deprecated versions match your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </section>
      </main>

      {viewingPost && (
        <div className="viewer-overlay" onClick={closeViewer}>
          <section
            className="viewer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="viewer-header">
              <div className="viewer-heading">
                <span className="viewer-eyebrow">FILE VIEWER</span>
                <h2>{viewingPost.postName || viewingPost.fileName || "File"}</h2>
                <p>
                  {isSingleFileMode ? "Standalone file" : "ZIP archive"} ·{" "}
                  {formatDate(viewingPost.postDate) || "Unknown date"}
                </p>
              </div>

              <div className="viewer-header-actions">
                <a
                  className="download-button"
                  href={getDownloadUrl(viewingPost.searchTitle)}
                  download
                >
                  Download Full File
                </a>

                <button
                  type="button"
                  className="viewer-close"
                  onClick={closeViewer}
                  aria-label="Close viewer"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            {zipError && <div className="error-banner">{zipError}</div>}

            {zipLoading ? (
              <div className="viewer-loading">
                <div className="loading-spinner" />
                <p>Loading file information...</p>
              </div>
            ) : (
              <div className="viewer-body">
                {!isSingleFileMode && (
                  <aside
                    className={`file-tree-panel ${mobileTreeOpen ? "mobile-open" : ""}`}
                  >
                    <div className="file-tree-header">
                      <div>
                        <strong>Explorer</strong>
                        <span>{zipFiles.filter((file) => !file.isDir).length} files</span>
                      </div>

                      <button
                        type="button"
                        className="mobile-tree-close"
                        onClick={() => setMobileTreeOpen(false)}
                        aria-label="Close file explorer"
                      >
                        ×
                      </button>
                    </div>

                    <div className="tree-search">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>

                      <input
                        type="text"
                        placeholder="Filter files..."
                        value={treeFilter}
                        onChange={(event) => setTreeFilter(event.target.value)}
                      />
                    </div>

                    <div className="file-tree">
                      {fileTree.length ? (
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
                      ) : (
                        <div className="tree-empty">
                          No files match your search.
                        </div>
                      )}
                    </div>
                  </aside>
                )}

                <div className="file-preview-panel">
                  <div className="preview-toolbar">
                    <div className="preview-file-info">
                      {!isSingleFileMode && (
                        <button
                          type="button"
                          className="mobile-tree-toggle"
                          onClick={() => setMobileTreeOpen(true)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M3 6h18M3 12h18M3 18h18" />
                          </svg>
                          Files
                        </button>
                      )}

                      {activeFile ? (
                        <>
                          <span
                            className="preview-type-badge"
                            style={{
                              color: activeFileMeta?.color,
                              borderColor: `${activeFileMeta?.color}55`,
                              background: `${activeFileMeta?.color}14`,
                            }}
                          >
                            {activeFileMeta?.badge}
                          </span>

                          <div className="preview-file-name">
                            <strong>{activeFile.path.split("/").pop()}</strong>
                            <span>{activeFile.path}</span>
                          </div>
                        </>
                      ) : (
                        <div className="preview-file-name">
                          <strong>Select a file</strong>
                          <span>Choose an entry from the explorer.</span>
                        </div>
                      )}
                    </div>

                    <div className="preview-actions">
                      {activeFile && (
                        <>
                          {activeFileKind === "markdown" && (
                            <div className="markdown-mode-toggle">
                              <button
                                type="button"
                                className={mdViewMode === "preview" ? "active" : ""}
                                onClick={() => setMdViewMode("preview")}
                              >
                                Preview
                              </button>

                              <button
                                type="button"
                                className={mdViewMode === "raw" ? "active" : ""}
                                onClick={() => setMdViewMode("raw")}
                              >
                                Raw
                              </button>
                            </div>
                          )}

                          {activeFileKind === "image" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setImageZoom((prev) =>
                                    Math.max(0.25, prev - 0.25),
                                  )
                                }
                              >
                                −
                              </button>

                              <span>{Math.round(imageZoom * 100)}%</span>

                              <button
                                type="button"
                                onClick={() =>
                                  setImageZoom((prev) =>
                                    Math.min(4, prev + 0.25),
                                  )
                                }
                              >
                                +
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setImageCheckerBg((prev) => !prev)
                                }
                              >
                                Background
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="download-button secondary"
                            onClick={() => downloadSingleEntry(activeFile)}
                          >
                            Download Entry
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="preview-content">
                    {!activeFile ? (
                      <div className="preview-placeholder">
                        <svg
                          width="46"
                          height="46"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6M8 13h8M8 17h8" />
                        </svg>
                        <h3>No file selected</h3>
                        <p>Select a file from the explorer to preview it.</p>
                      </div>
                    ) : fileContentLoading ? (
                      <div className="viewer-loading">
                        <div className="loading-spinner" />
                        <p>Loading selected file...</p>
                      </div>
                    ) : activeFileKind === "image" ? (
                      <div
                        className={`image-preview ${imageCheckerBg ? "checkerboard" : ""}`}
                      >
                        {mediaPreviewUrl ? (
                          <img
                            src={mediaPreviewUrl}
                            alt={activeFile.path}
                            style={{ transform: `scale(${imageZoom})` }}
                          />
                        ) : (
                          <div className="preview-placeholder">
                            <p>Unable to preview this image.</p>
                          </div>
                        )}
                      </div>
                    ) : activeFileKind === "video" ? (
                      <div className="media-preview">
                        {mediaPreviewUrl ? (
                          <video src={mediaPreviewUrl} controls />
                        ) : (
                          <div className="preview-placeholder">
                            <p>Unable to load this video.</p>
                          </div>
                        )}
                      </div>
                    ) : activeFileKind === "audio" ? (
                      <div className="audio-preview">
                        {mediaPreviewUrl ? (
                          <audio src={mediaPreviewUrl} controls />
                        ) : (
                          <div className="preview-placeholder">
                            <p>Unable to load this audio file.</p>
                          </div>
                        )}
                      </div>
                    ) : activeFileKind === "pdf" ? (
                      <div className="pdf-preview">
                        {mediaPreviewUrl ? (
                          <iframe
                            src={mediaPreviewUrl}
                            title={activeFile.path}
                          />
                        ) : (
                          <div className="preview-placeholder">
                            <p>Unable to load this PDF.</p>
                          </div>
                        )}
                      </div>
                    ) : activeFileKind === "binary" ? (
                      <div className="preview-placeholder">
                        <svg
                          width="46"
                          height="46"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        >
                          <path d="M12 2 3 7v10l9 5 9-5V7z" />
                          <path d="m3 7 9 5 9-5M12 22V12" />
                        </svg>
                        <h3>Binary file</h3>
                        <p>
                          This file cannot be previewed as text. You can
                          download the original entry.
                        </p>
                      </div>
                    ) : activeFileKind === "markdown" &&
                      mdViewMode === "preview" ? (
                      <article
                        className="markdown-preview"
                        dangerouslySetInnerHTML={{
                          __html: renderedMarkdown,
                        }}
                      />
                    ) : activeFileKind === "text" ||
                      activeFileKind === "markdown" ? (
                      <pre className="code-preview">
                        <code
                          dangerouslySetInnerHTML={{
                            __html:
                              activeFileKind === "markdown"
                                ? Prism.highlight(
                                    fileContent || "",
                                    Prism.languages.markdown ||
                                      Prism.languages.none,
                                    "markdown",
                                  )
                                : renderedCode,
                          }}
                        />
                      </pre>
                    ) : (
                      <div className="preview-placeholder">
                        <p>This file type cannot be previewed.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
