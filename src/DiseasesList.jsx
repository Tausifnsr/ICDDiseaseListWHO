import React, { useEffect, useState } from "react";
import axios from "axios";

const DiseasesList = () => {
  const [query, setQuery] = useState("diabetes");
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiseases = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`axios.get("https://your-backend.onrender.com/api/diseases?q=fever")`);
      setDiseases(response.data);
    } catch (err) {
      setError("Failed to fetch diseases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Search ICD Diseases</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchDiseases()}
        placeholder="Type a disease (e.g. diabetes)..."
        style={{ padding: "8px", width: "300px", marginBottom: "1rem" }}
      />
      <button onClick={fetchDiseases} style={{ marginLeft: "8px", padding: "8px" }}>
        Search
      </button>

      {loading && <p>Loading diseases...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {diseases.map((disease, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: disease.title }} />
        ))}
      </ul>
    </div>
  );
};

export default DiseasesList;
