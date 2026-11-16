import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://db.yurphagames.net/api/v1/posts";

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

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                    DB Downloader — Yurpha Games
                </a>
            </header>

            <main className="main-layout">
                <aside className="repository-panel">
                    <div>
                        <h1>
                            {selectedPost
                                ? selectedPost.postName || "Unnamed file"
                                : "Select a Repository"}
                        </h1>

                        <div className="panel-divider"></div>

                        <p>
                            {selectedPost
                                ? selectedPost.description || "No description available for this repository."
                                : "Click on any file row to view its detailed description and metadata right here."}
                        </p>
                    </div>

                    <div className="repository-information">
                        <div>
                            <span>STORAGE TYPE</span>
                            <strong>Software Repository</strong>
                        </div>

                        <div>
                            <span>TOTAL FILES</span>
                            <strong>{posts.length}</strong>
                        </div>
                    </div>
                </aside>

                <section className="downloads-section">
                    <div className="downloads-header">
                        <div>
                            <h2>Downloads</h2>
                            <p>Browse, search, and download active database archives.</p>
                        </div>

                        <button
                            className="refresh-button"
                            onClick={loadPosts}
                            disabled={loading}
                        >
                            {loading ? "Refreshing..." : "Refresh List"}
                        </button>
                    </div>

                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search files by name..."
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
                        <span>ARCHIVE NAME</span>
                        <span>STATUS & ACTION</span>
                    </div>

                    <div className="downloads-list">
                        {loading && (
                            <div className="message">
                                Loading files from backend...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="message error">
                                <strong>Unable to connect to server</strong>
                                <p>{error}</p>
                                <button onClick={loadPosts}>Try again</button>
                            </div>
                        )}

                        {!loading && !error && filteredPosts.length === 0 && (
                            <div className="message">
                                {search
                                    ? "No files match your search criteria."
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
                                        {currentOpen ? "▲ Collapse" : "▼ Expand"}
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
                                        {deprecatedOpen ? "▲ Collapse" : "▼ Expand"}
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
                        Showing {filteredPosts.length} of {posts.length} total files
                    </div>
                </section>
            </main>

            <footer className="footer">
                <span>DB Downloader — Powered by Yurpha Games Infrastructure</span>
            </footer>
        </div>
    );
}

export default App;