import { useState } from "react";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          cvText,
        }),
      });

      const data = await res.json();
      setResult(data.result || "No result returned.");
    } catch (err) {
      setResult("Error contacting server.");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>AI Job Application Assistant</h1>

      <textarea
        placeholder="Paste job description"
        rows={6}
        style={{ width: "100%", marginTop: 10 }}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <textarea
        placeholder="Paste your CV"
        rows={6}
        style={{ width: "100%", marginTop: 10 }}
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 10, padding: "10px 20px" }}
      >
        {loading ? "Analyzing..." : "Tailor CV"}
      </button>

      {result && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
          {result}
        </pre>
      )}
    </div>
  );
}

export default App;
