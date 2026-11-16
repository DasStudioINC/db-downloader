import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

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
  js: {
    lang: "javascript",
    label: "JavaScript",
    color: "#f7df1e",
    badge: "JS",
  },
  mjs: {
    lang: "javascript",
    label: "JavaScript",
    color: "#f7df1e",
    badge: "JS",
  },
  cjs: {
    lang: "javascript",
    label: "JavaScript",
    color: "#f7df1e",
    badge: "JS",
  },
  jsx: { lang: "jsx", label: "React JSX", color: "#61dafb", badge: "JSX" },
  ts: {
    lang: "typescript",
    label: "TypeScript",
    color: "#3178c6",
    badge: "TS",
  },
  tsx: {
    lang: "typescript",
    label: "React TSX",
    color: "#3178c6",
    badge: "TSX",
  },
  json: { lang: "json", label: "JSON", color: "#cbcb41", badge: "{}" },
  css: { lang: "css", label: "CSS", color: "#563d7c", badge: "#" },
  html: { lang: "markup", label: "HTML", color: "#e34c26", badge: "<>" },
  xml: { lang: "markup", label: "XML", color: "#f16529", badge: "<>" },
  svg: { lang: "markup", label: "SVG", color: "#ffb13b", badge: "SVG" },
  java: { lang: "java", label: "Java", color: "#f89820", badge: "JV" },
  cs: { lang: "csharp", label: "C#", color: "#9b4f96", badge: "C#" },
  py: { lang: "python", label: "Python", color: "#3572a5", badge: "PY" },
  sql: { lang: "sql", label: "SQL", color: "#e38c00", badge: "DB" },
  sh: { lang: "bash", label: "Shell Script", color: "#89e051", badge: "$_" },
  bat: { lang: "bash", label: "Batch Script", color: "#c1f12e", badge: "BAT" },
  ps1: { lang: "bash", label: "PowerShell", color: "#012456", badge: "PS" },
  yml: { lang: "yaml", label: "YAML", color: "#cb171e", badge: "YML" },
  yaml: { lang: "yaml", label: "YAML", color: "#cb171e", badge: "YML" },
  md: { lang: "markdown", label: "Markdown", color: "#58a6ff", badge: "MD" },
  properties: {
    lang: "yaml",
    label: "Properties",
    color: "#8b949e",
    badge: "CFG",
  },
  txt: { lang: "none", label: "Plain Text", color: "#8b949e", badge: "TXT" },
};

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "ico",
]);

const BINARY_EXTENSIONS = new Set([
  "exe",
  "dll",
  "so",
  "dylib",
  "bin",
  "dat",
  "jar",
  "class",
  "mp3",
  "wav",
  "ogg",
  "mp4",
  "webm",
  "avi",
  "zip",
  "7z",
  "rar",
  "tar",
  "gz",
  "pdf",
  "woff",
  "woff2",
  "ttf",
  "eot",
]);

function getExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function isImageFile(filename) {
  return IMAGE_EXTENSIONS.has(getExtension(filename));
}

function isBinaryFile(filename) {
  const ext = getExtension(filename);
  return BINARY_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext);
}

function getFileMeta(filename) {
  const ext = getExtension(filename);
  if (EXTENSION_META[ext]) return EXTENSION_META[ext];
  if (IMAGE_EXTENSIONS.has(ext)) {
    return {
      lang: "none",
      label: `${ext.toUpperCase()} Image`,
      color: "#a371f7",
      badge: "IMG",
    };
  }
  if (BINARY_EXTENSIONS.has(ext)) {
    return {
      lang: "none",
      label: `${ext.toUpperCase()} Binary`,
      color: "#f85149",
      badge: "BIN",
    };
  }
  return {
    lang: "none",
    label: ext ? ext.toUpperCase() : "File",
    color: "#8b949e",
    badge: "DOC",
  };
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

  // ZIP Viewer State
  const [viewingPost, setViewingPost] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [zipFiles, setZipFiles] = useState([]);
  const [treeFilter, setTreeFilter] = useState("");
  const [expandedDirs, setExpandedDirs] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
    function handleKeyDown(e) {
      if (e.key === "Escape" && viewingPost) {
        closeViewer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingPost]);

  function getDownloadUrl(searchTitle) {
    return `${API_URL}/search/${encodeURIComponent(searchTitle)}/post`;
  }

  async function openArchiveViewer(post) {
    setViewingPost(post);
    setZipLoading(true);
    setZipError("");
    setZipFiles([]);
    setTreeFilter("");
    setActiveFile(null);
    setFileContent("");
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setExpandedDirs({});

    try {
      const response = await fetch(getDownloadUrl(post.searchTitle));
      if (!response.ok) {
        throw new Error(`Failed to fetch archive (HTTP ${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const isZip =
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);

      if (!isZip) {
        const hexHeader = Array.from(bytes.slice(0, 8))
          .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
          .join(" ");

        let detectedType = "Unknown / Plain Text";
        if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72)
          detectedType = "RAR Archive (.rar)";
        else if (bytes[0] === 0x37 && bytes[1] === 0x7a)
          detectedType = "7-Zip Archive (.7z)";
        else if (bytes[0] === 0x1f && bytes[1] === 0x8b)
          detectedType = "GZIP / Tarball (.gz / .tgz)";
        else if (bytes[0] === 0x4d && bytes[1] === 0x5a)
          detectedType = "Windows Executable (.exe)";

        if (
          arrayBuffer.byteLength < 10 * 1024 * 1024 &&
          detectedType === "Unknown / Plain Text"
        ) {
          const decodedText = new TextDecoder("utf-8").decode(arrayBuffer);
          const isJson =
            decodedText.trim().startsWith("{") ||
            decodedText.trim().startsWith("[");
          const singleFile = {
            path: `${post.postName || "file"}.${isJson ? "json" : "txt"}`,
            isDir: false,
            size: arrayBuffer.byteLength,
            entry: null,
          };
          setZipFiles([singleFile]);
          setActiveFile(singleFile);
          setFileContent(decodedText);
          return;
        }

        throw new Error(
          `File is not a standard ZIP (${formatBytes(arrayBuffer.byteLength)} received, detected: ${detectedType}, signature: ${hexHeader}).`,
        );
      }

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

      const firstReadable =
        entries.find((e) => !e.isDir && /readme/i.test(e.path)) ||
        entries.find((e) => !e.isDir && !isBinaryFile(e.path)) ||
        entries.find((e) => !e.isDir);

      if (firstReadable) {
        await selectZipFile(firstReadable);
      }
    } catch (err) {
      setZipError(err.message || "Could not read ZIP contents.");
    } finally {
      setZipLoading(false);
    }
  }

  async function selectZipFile(fileObj) {
    setActiveFile(fileObj);
    setCopied(false);

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    if (!fileObj.entry) return;

    if (isImageFile(fileObj.path)) {
      setFileContentLoading(true);
      try {
        const blob = await fileObj.entry.async("blob");
        setImagePreviewUrl(URL.createObjectURL(blob));
      } finally {
        setFileContentLoading(false);
      }
      return;
    }

    if (isBinaryFile(fileObj.path)) {
      setFileContent("");
      return;
    }

    setFileContentLoading(true);
    try {
      const text = await fileObj.entry.async("string");
      setFileContent(text);
    } catch {
      setFileContent("[Unable to decode file as UTF-8 text]");
    } finally {
      setFileContentLoading(false);
    }
  }

  function toggleDir(dirPath) {
    setExpandedDirs((prev) => ({
      ...prev,
      [dirPath]: !prev[dirPath],
    }));
  }

  function closeViewer() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setViewingPost(null);
    setZipFiles([]);
    setActiveFile(null);
    setFileContent("");
  }

  const filteredZipFiles = useMemo(() => {
    if (!treeFilter.trim()) return zipFiles;
    const q = treeFilter.toLowerCase();
    return zipFiles.filter((f) => !f.isDir && f.path.toLowerCase().includes(q));
  }, [zipFiles, treeFilter]);

  const fileTree = useMemo(() => buildFileTree(zipFiles), [zipFiles]);

  const activeFileMeta = useMemo(
    () => (activeFile ? getFileMeta(activeFile.path) : null),
    [activeFile],
  );

  const highlightedLines = useMemo(() => {
    if (!activeFile || isBinaryFile(activeFile.path) || !fileContent) return [];
    const lang = activeFileMeta?.lang || "none";
    const grammar = Prism.languages[lang];

    const html = grammar
      ? Prism.highlight(fileContent, grammar, lang)
      : fileContent
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

    return html.split("\n");
  }, [activeFile, activeFileMeta, fileContent]);

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
          <div className="file-icon">
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
            <span>ZIP</span>
          </div>

          <div className="file-name">
            <strong>{post.postName || "Unnamed file"}</strong>

            <div className="file-submeta">
              <span>
                {post.userHandle
                  ? `Uploaded by ${post.userHandle}`
                  : "Repository Archive"}
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
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Browse Code</span>
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
    );
  };

  const selectedIsCurrent = selectedPost
    ? (selectedPost.version || "current").toLowerCase() === "current"
    : true;

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
                  "No description available for this archive."
                : "Select any archive from the release list to inspect its notes, release status, and direct download link."}
            </p>

            {selectedPost && (
              <>
                <div className="selected-meta-strip">
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
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <span>Browse Archive Files</span>
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
                    <span>Download Selected Archive</span>
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
                    <span>{currentOpen ? "Collapse" : "Expand"}</span>
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
                    <span>{deprecatedOpen ? "Collapse" : "Expand"}</span>
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

      {/* Upgraded GitHub-Style Code & Archive Explorer Modal */}
      {viewingPost && (
        <div className="zip-modal-backdrop" onClick={closeViewer}>
          <div className="zip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="zip-modal-header">
              <div className="zip-modal-title">
                <span className="zip-badge">
                  <span className="zip-badge-dot"></span>
                  ARCHIVE EXPLORER
                </span>
                <h3>{viewingPost.postName || "Archive"}</h3>
                {!zipLoading && !zipError && zipFiles.length > 0 && (
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
                  className="download-button"
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
                  <span>Download Archive</span>
                </a>
                <button
                  type="button"
                  className="zip-close-btn"
                  onClick={closeViewer}
                  title="Close (Esc)"
                  aria-label="Close archive viewer"
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
                <strong>Unpacking Archive Stream...</strong>
                <p>
                  Fetching package from db.yurphagames.net and indexing file
                  tree
                </p>
              </div>
            )}

            {!zipLoading && zipError && (
              <div className="zip-status-box error">
                <div className="zip-error-icon">!</div>
                <strong>Unable to Inspect Archive</strong>
                <p>{zipError}</p>
              </div>
            )}

            {!zipLoading && !zipError && (
              <div className="zip-explorer-body">
                <aside className="zip-tree-sidebar">
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
                      placeholder="Go to file..."
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
                          const isSelected = activeFile?.path === fileObj.path;
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
                        <div className="zip-tree-empty">No matching files</div>
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
                          {activeFileMeta && (
                            <span
                              className="zip-lang-tag"
                              style={{ color: activeFileMeta.color }}
                            >
                              {activeFileMeta.label}
                            </span>
                          )}

                          {!isBinaryFile(activeFile.path) && (
                            <span className="zip-stat-pill">
                              {highlightedLines.length} lines
                            </span>
                          )}

                          {activeFile.size !== null && (
                            <span className="zip-stat-pill">
                              {formatBytes(activeFile.size)}
                            </span>
                          )}

                          {!isBinaryFile(activeFile.path) && (
                            <button
                              type="button"
                              className={`zip-copy-btn ${copied ? "copied" : ""}`}
                              onClick={() => {
                                navigator.clipboard.writeText(fileContent);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1800);
                              }}
                            >
                              {copied ? (
                                <>
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                  >
                                    <rect
                                      x="9"
                                      y="9"
                                      width="13"
                                      height="13"
                                      rx="2"
                                      ry="2"
                                    />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="zip-code-scroll">
                        {fileContentLoading ? (
                          <div className="zip-status-box">
                            <div className="zip-loader-ring small"></div>
                            <p>Rendering file...</p>
                          </div>
                        ) : imagePreviewUrl ? (
                          <div className="zip-image-preview">
                            <img src={imagePreviewUrl} alt={activeFile.path} />
                          </div>
                        ) : isBinaryFile(activeFile.path) ? (
                          <div className="zip-binary-card">
                            <div className="binary-badge">
                              .{getExtension(activeFile.path).toUpperCase()}
                            </div>
                            <strong>Compiled / Binary Asset</strong>
                            <p>
                              This file contains raw binary data (
                              {formatBytes(activeFile.size)}) and cannot be
                              displayed as source code.
                            </p>
                            <a
                              className="download-button"
                              href={getDownloadUrl(viewingPost.searchTitle)}
                            >
                              Download Full Archive
                            </a>
                          </div>
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
                        Pick any file from the left tree to inspect its
                        contents.
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
