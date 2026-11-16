import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

// Import common languages you want highlighted
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

const EXTENSION_TO_PRISM = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  css: "css",
  html: "markup",
  xml: "markup",
  svg: "markup",
  java: "java",
  cs: "csharp",
  py: "python",
  sql: "sql",
  sh: "bash",
  bat: "bash",
  ps1: "bash",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  properties: "yaml",
  txt: "none",
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
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "ico",
  "bmp",
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

function isBinaryFile(filename) {
  return BINARY_EXTENSIONS.has(getExtension(filename));
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Builds a nested folder/file tree from flat JSZip paths
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
      <div>
        <button
          type="button"
          className="tree-item tree-folder"
          style={{ paddingLeft: `${12 + depth * 14}px` }}
          onClick={() => toggleDir(node.path)}
        >
          <span className="tree-caret">{isOpen ? "▾" : "▸"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            opacity="0.8"
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

  return (
    <button
      type="button"
      className={`tree-item tree-file ${isSelected ? "active" : ""}`}
      style={{ paddingLeft: `${26 + depth * 14}px` }}
      onClick={() => onSelectFile(node.fileData)}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
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
  const [expandedDirs, setExpandedDirs] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
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

  function getDownloadUrl(searchTitle) {
    return `${API_URL}/search/${encodeURIComponent(searchTitle)}/post`;
  }

  async function openArchiveViewer(post) {
    setViewingPost(post);
    setZipLoading(true);
    setZipError("");
    setZipFiles([]);
    setActiveFile(null);
    setFileContent("");
    setExpandedDirs({});

    try {
      const response = await fetch(getDownloadUrl(post.searchTitle));
      if (!response.ok) {
        throw new Error(`Failed to fetch archive (HTTP ${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
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

        // Auto-expand top-level folders
        const parts = relativePath.split("/").filter(Boolean);
        if (parts.length > 1) {
          initialExpanded[parts[0]] = true;
        }
      });

      setZipFiles(entries);
      setExpandedDirs(initialExpanded);

      // Auto-select README or first readable text file
      const firstReadable =
        entries.find((e) => !e.isDir && /readme/i.test(e.path)) ||
        entries.find((e) => !e.isDir && !isBinaryFile(e.path)) ||
        entries.find((e) => !e.isDir);

      if (firstReadable) {
        await selectZipFile(firstReadable);
      }
    } catch (err) {
      setZipError(
        err.message ||
          "Could not read ZIP contents. Check CORS or archive format.",
      );
    } finally {
      setZipLoading(false);
    }
  }

  async function selectZipFile(fileObj) {
    setActiveFile(fileObj);
    setCopied(false);

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
    setViewingPost(null);
    setZipFiles([]);
    setActiveFile(null);
    setFileContent("");
  }

  const fileTree = useMemo(() => buildFileTree(zipFiles), [zipFiles]);

  const highlightedLines = useMemo(() => {
    if (!activeFile || isBinaryFile(activeFile.path) || !fileContent) return [];
    const ext = getExtension(activeFile.path);
    const lang = EXTENSION_TO_PRISM[ext] || "none";
    const grammar = Prism.languages[lang];

    const html = grammar
      ? Prism.highlight(fileContent, grammar, lang)
      : fileContent
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

    return html.split("\n");
  }, [activeFile, fileContent]);

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
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>View</span>
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
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Inspect Archive Contents</span>
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

      {/* GitHub-Style ZIP Explorer Modal */}
      {viewingPost && (
        <div className="zip-modal-backdrop" onClick={closeViewer}>
          <div className="zip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="zip-modal-header">
              <div className="zip-modal-title">
                <span className="zip-badge">ZIP INSPECTOR</span>
                <h3>{viewingPost.postName || "Archive"}</h3>
              </div>

              <div className="zip-modal-actions">
                <a
                  className="download-button"
                  href={getDownloadUrl(viewingPost.searchTitle)}
                >
                  <span>Download ZIP</span>
                </a>
                <button
                  type="button"
                  className="zip-close-btn"
                  onClick={closeViewer}
                  aria-label="Close archive viewer"
                >
                  ✕
                </button>
              </div>
            </div>

            {zipLoading && (
              <div className="zip-status-box">
                <div className="spinner"></div>
                <p>Downloading & extracting archive in browser...</p>
              </div>
            )}

            {!zipLoading && zipError && (
              <div className="zip-status-box error">
                <strong>Failed to inspect archive</strong>
                <p>{zipError}</p>
              </div>
            )}

            {!zipLoading && !zipError && (
              <div className="zip-explorer-body">
                <aside className="zip-tree-sidebar">
                  <div className="zip-tree-header">
                    Files ({zipFiles.filter((f) => !f.isDir).length})
                  </div>
                  <div className="zip-tree-scroll">
                    {fileTree.map((node) => (
                      <TreeNode
                        key={node.path}
                        node={node}
                        depth={0}
                        selectedPath={activeFile?.path}
                        expandedDirs={expandedDirs}
                        toggleDir={toggleDir}
                        onSelectFile={selectZipFile}
                      />
                    ))}
                  </div>
                </aside>

                <div className="zip-code-pane">
                  {activeFile ? (
                    <>
                      <div className="zip-file-topbar">
                        <div className="zip-file-path">
                          <span>{activeFile.path}</span>
                          {activeFile.size !== null && (
                            <span className="zip-file-size">
                              {formatBytes(activeFile.size)}
                            </span>
                          )}
                        </div>

                        {!isBinaryFile(activeFile.path) && (
                          <button
                            type="button"
                            className="zip-copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(fileContent);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1800);
                            }}
                          >
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        )}
                      </div>

                      <div className="zip-code-scroll">
                        {fileContentLoading ? (
                          <div className="zip-status-box">Loading file...</div>
                        ) : isBinaryFile(activeFile.path) ? (
                          <div className="zip-status-box">
                            <strong>Binary File</strong>
                            <p>
                              Preview not available for{" "}
                              <code>.{getExtension(activeFile.path)}</code>{" "}
                              files.
                            </p>
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
                      Select a file from the left tree to view its contents.
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
