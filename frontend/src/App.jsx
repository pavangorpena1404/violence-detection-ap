import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Violence Detection</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div style={{ marginTop: "20px" }}>
          <img src={preview} alt="preview" width="300" />
        </div>
      )}

      <br />
      <button
        onClick={handleSubmit}
        style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "pink" }}
      >
        Predict
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Prediction: {result.prediction}</h2>
          <p>Non-violence: {result.probabilities["Non-violence"]}%</p>
          <p>Violence: {result.probabilities["Violence"]}%</p>
        </div>
      )}
    </div>
  );
}

export default App;
