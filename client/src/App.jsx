import { useEffect, useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadLinks = async () => {
    try {
      const res = await fetch("/api/links");
      setLinks(await res.json());
    } catch {
      setError("Can't reach the server. Is the API running?");
    }
  };

  useEffect(() => { loadLinks(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, alias }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setLinks((prev) => [data, ...prev]);
      setUrl("");
      setAlias("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCopy = async (link) => {
    await navigator.clipboard.writeText(link.shortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <main className="page">
      <header>
        <h1>Shorty</h1>
        <p>Paste a long link. Share a short one.</p>
      </header>

      <form className="create" onSubmit={handleCreate}>
        <label htmlFor="url">Long URL</label>
        <input
          id="url"
          type="url"
          placeholder="https://example.com/a/very/long/page"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <label htmlFor="alias">Custom ending (optional)</label>
        <div className="row">
          <input
            id="alias"
            placeholder="my-link"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Shortening…" : "Shorten link"}
          </button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      <section aria-label="Your links">
        <h2>Your links</h2>
        {links.length === 0 ? (
          <p className="empty">No links yet. Paste a URL above to create your first one.</p>
        ) : (
          <ul className="links">
            {links.map((l) => (
              <li key={l.id}>
                <div className="info">
                  <a href={l.shortUrl} target="_blank" rel="noreferrer" className="short">
                    {l.shortUrl.replace(/^https?:\/\//, "")}
                  </a>
                  <span className="orig" title={l.originalUrl}>{l.originalUrl}</span>
                </div>
                <span className="clicks">{l.clicks} {l.clicks === 1 ? "click" : "clicks"}</span>
                <div className="actions">
                  <button className="ghost" onClick={() => handleCopy(l)}>
                    {copiedId === l.id ? "Copied" : "Copy"}
                  </button>
                  <button className="ghost danger" onClick={() => handleDelete(l.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
