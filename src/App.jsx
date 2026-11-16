import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://db.yurphagames.net/api/v1/posts";

function App() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedPost, setSelectedPost] = useState(null);

    // Collapsible group open/closed states
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

    // Separate filtered posts into current and deprecated groups
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

    // Helper to render file rows
    const renderFileRow = (post, index) => {
        const isCurrent = (post.version || "current").toLowerCase() === "current";

        return (
            <div
                className={`file-row ${
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
                    <div className="file-icon">ZIP</div>

                    <div className="file-name">
                        <strong>
                            {post.postName || "Unnamed file"}
                        </strong>

                        <span>
                            {post.userHandle
                                ? `Uploaded by ${post.userHandle}`
                                : "Repository file"}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                        className={`version-badge ${
                            isCurrent ? "current" : "deprecated"
                        }`}
                    >
                        {isCurrent ? "Current" : "Deprecated"}
                    </span>

                    <a
                        className="download-button"
                        href={getDownloadUrl(post.searchTitle)}
                        onClick={(event) => event.stopPropagation()}
                    >
                        Download
                        <span>↓</span>
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className="app">
            <header className="header">
                <a href="/" className="logo">
                    DB Downloader - Download A Database From Yurpha
                </a>
            </header>

            <main className="main-layout">
                <aside className="repository-panel">
                    <div>
                        <h1>
                            {selectedPost
                                ? selectedPost.postName || "Unnamed file"
                                : "Download A Database From Yurpha"}
                        </h1>

                        <div className="panel-divider"></div>

                        <p>
                            {selectedPost
                                ? selectedPost.description || "No description available for this repository."
                                : "Select a repository to view its description."}
                        </p>
                    </div>

                    <div className="repository-information">
                        <div>
                            <span>TYPE</span>
                            <strong>Software Repository</strong>
                        </div>

                        <div>
                            <span>AVAILABLE FILES</span>
                            <strong>{posts.length}</strong>
                        </div>
                    </div>
                </aside>

                <section className="downloads-section">
                    <div className="downloads-header">
                        <div>
                            <h2>Downloads</h2>
                            <p>Browse and download available files.</p>
                        </div>

                        <button
                            className="refresh-button"
                            onClick={loadPosts}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />

                        {search && (
                            <button onClick={() => setSearch("")}>
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="file-list-header">
                        <span>FILE NAME</span>
                        <span>ACTION</span>
                    </div>

                    <div className="downloads-list">
                        {loading && (
                            <div className="message">
                                Loading files...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="message error">
                                <strong>Unable to load files</strong>
                                <p>{error}</p>
                                <button onClick={loadPosts}>Try again</button>
                            </div>
                        )}

                        {!loading && !error && filteredPosts.length === 0 && (
                            <div className="message">
                                {search
                                    ? "No files match your search."
                                    : "No files are currently available."}
                            </div>
                        )}

                        {!loading && !error && currentPosts.length > 0 && (
                            <div className="version-group">
                                <button
                                    className="group-header"
                                    onClick={() => setCurrentOpen(!currentOpen)}
                                >
                                    <div className="group-header-left">
                                        <span>🟢 Current Releases</span>
                                        <span className="group-count">{currentPosts.length}</span>
                                    </div>
                                    <span className="group-chevron">
                                        {currentOpen ? "▲ Hide" : "▼ Show"}
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
                                        <span>🔴 Deprecated Releases</span>
                                        <span className="group-count">{deprecatedPosts.length}</span>
                                    </div>
                                    <span className="group-chevron">
                                        {deprecatedOpen ? "▲ Hide" : "▼ Show"}
                                    </span>
                                </button>
                                {deprecatedOpen && (
                                    <div className="group-content">
                                        {deprecatedPosts.map((post, idx) => renderFileRow(post, idx))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="downloads-footer">
                        {filteredPosts.length} of {posts.length} files
                    </div>
                </section>
            </main>

            <footer className="footer">
                <span>DB Downloader</span>
            </footer>
        </div>
    );
}

export default App;