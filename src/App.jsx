import { useEffect, useState } from "react";
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

function SocialIcon({ type }) {
    if (type === "youtube") {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        );
    }

    if (type === "github") {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
    );
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

function App() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedPost, setSelectedPost] = useState(null);

    const [currentOpen, setCurrentOpen] = useState(true);
    const [deprecatedOpen, setDeprecatedOpen] = useState(false);

    async function loadPosts() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            const loadedPosts = (Array.isArray(data) ? data : []).sort(
                (a, b) => {
                    const dateA = new Date(a.postDate || 0).getTime();
                    const dateB = new Date(b.postDate || 0).getTime();

                    return dateB - dateA;
                }
            );

            setPosts(loadedPosts);

            if (selectedPost) {
                const updatedSelectedPost = loadedPosts.find(
                    (post) => post.searchTitle === selectedPost.searchTitle
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

    const filteredPosts = posts.filter((post) =>
        (post.postName || "Unnamed file")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const totalCurrentCount = posts.filter(
        (post) => (post.version || "current").toLowerCase() === "current"
    ).length;

    const totalDeprecatedCount = posts.filter(
        (post) => (post.version || "").toLowerCase() === "deprecated"
    ).length;

    const currentPosts = filteredPosts.filter(
        (post) => (post.version || "current").toLowerCase() === "current"
    );

    const deprecatedPosts = filteredPosts.filter(
        (post) => (post.version || "").toLowerCase() === "deprecated"
    );

    function getDownloadUrl(searchTitle) {
        return `${API_URL}/search/${encodeURIComponent(searchTitle)}/post`;
    }

    function selectPost(post) {
        setSelectedPost(post);
    }

    const renderFileRow = (post, index) => {
        const isCurrent = (post.version || "current").toLowerCase() === "current";
        const formattedDate = formatDate(post.postDate);

        return (
            <div
                className={`file-row ${isCurrent ? "" : "deprecated-row"} ${
                    selectedPost?.searchTitle === post.searchTitle
                        ? "selected"
                        : ""
                }`}
                key={post.searchTitle || index}
                onClick={() => selectPost(post)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectPost(post);
                    }
                }}
                role="button"
                tabIndex={0}
            >
                <div className="file-details">
                    <div className="file-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                        className={`version-badge ${
                            isCurrent ? "current" : "deprecated"
                        }`}
                    >
                        {isCurrent ? "Current" : "Deprecated"}
                    </span>

                    <a
                        className={`download-button ${isCurrent ? "" : "secondary"}`}
                        href={getDownloadUrl(post.searchTitle)}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

                <nav className="social-links" aria-label="Official links">
                    {SOCIAL_LINKS.map((link) => (
                        <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                        >
                            <SocialIcon type={link.type} />
                            <span>{link.label}</span>
                        </a>
                    ))}
                </nav>
            </header>

            <main className="main-layout">
                <aside
                    className={`repository-panel ${
                        selectedPost ? "has-selection" : ""
                    }`}
                >
                    <div>
                        <div className="panel-eyebrow">
                            <span className="status-dot"></span>
                            <span>
                                {selectedPost ? "Package Inspector" : "Yurpha Infrastructure"}
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
                                            {selectedIsCurrent
                                                ? "Current Release"
                                                : "Deprecated"}
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
                                            <strong>
                                                {formatDate(selectedPost.postDate)}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                <a
                                    className="sidebar-download-cta"
                                    href={getDownloadUrl(selectedPost.searchTitle)}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>Download Selected Archive</span>
                                </a>
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

                        {search && (
                            <button onClick={() => setSearch("")}>Clear</button>
                        )}
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
                                        <span className="group-count">
                                            {currentPosts.length}
                                        </span>
                                    </div>
                                    <span
                                        className={`group-chevron ${
                                            currentOpen ? "open" : ""
                                        }`}
                                    >
                                        <span>
                                            {currentOpen ? "Collapse" : "Expand"}
                                        </span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </button>
                                {currentOpen && (
                                    <div className="group-content">
                                        {currentPosts.map((post, idx) =>
                                            renderFileRow(post, idx)
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && !error && deprecatedPosts.length > 0 && (
                            <div className="version-group">
                                <button
                                    className="group-header"
                                    onClick={() =>
                                        setDeprecatedOpen(!deprecatedOpen)
                                    }
                                >
                                    <div className="group-header-left">
                                        <span className="group-indicator deprecated"></span>
                                        <span>Deprecated Releases</span>
                                        <span className="group-count">
                                            {deprecatedPosts.length}
                                        </span>
                                    </div>
                                    <span
                                        className={`group-chevron ${
                                            deprecatedOpen ? "open" : ""
                                        }`}
                                    >
                                        <span>
                                            {deprecatedOpen
                                                ? "Collapse"
                                                : "Expand"}
                                        </span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </button>
                                {deprecatedOpen && (
                                    <div className="group-content">
                                        {deprecatedPosts.map((post, idx) =>
                                            renderFileRow(post, idx)
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="downloads-footer">
                        <span>
                            Showing {filteredPosts.length} of {posts.length}{" "}
                            archives
                        </span>
                        <span>Endpoint: db.yurphagames.net</span>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <span>DB Downloader — Yurpha Games Infrastructure</span>

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