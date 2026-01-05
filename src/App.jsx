import React, { useState } from "react";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          cvText,
        }),
      });

      const data = await response.json();
      setResult(data.result || "No response returned from server.");
    } catch (error) {
      setResult("Error contacting server.");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>AI Job Application Assistant</h1>

      <p>Paste a job description and your CV to get optimized suggestions.</p>

      <textarea
        placeholder="Paste job description here"
        rows={6}
        style={{ width: "100%", marginTop: 10 }}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <textarea
        placeholder="Paste your CV here"
        rows={6}
        style={{ width: "100%", marginTop: 10 }}
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 12, padding: "10px 20px", cursor: "pointer" }}
      >
        {loading ? "Analyzing..." : "Tailor CV"}
      </button>

      {result && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            marginTop: 20,
            padding: 12,
            background: "#f4f4f4",
            borderRadius: 4,
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}

export default App;
