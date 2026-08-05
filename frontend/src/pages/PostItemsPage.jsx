import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "../hooks/useProducts";

const CATEGORIES = [
  "Electronics",
  "Books",
  "Furniture",
  "Clothing",
  "Sports",
  "Accessories",
  "Stationery",
  "Others",
];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

function PostItemPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]); // File[]
  const [error, setError] = useState("");

  const handleImages = (e) => {
    setImages(Array.from(e.target.files).slice(0, 5));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !price || !category || !condition) {
      setError(
        "Title, description, price, category and condition are required.",
      );
      return;
    }
    if (images.length === 0) {
      setError("Please add at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", Number(price));
    formData.append("category", category);
    formData.append("condition", condition);
    if (location) formData.append("location", location);
    images.forEach((file) => formData.append("images", file));

    try {
      const product = await createProduct.mutateAsync(formData);
      navigate(`/item/${product._id}`);
    } catch (err) {
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);
      console.log(err.message);

      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div
      className="glassCard"
      style={{ maxWidth: "520px", margin: "0 auto", padding: "32px" }}
    >
      <h1
        style={{
          fontFamily: "Lora, serif",
          fontSize: "1.6rem",
          marginBottom: "20px",
        }}
      >
        Post an item for sale
      </h1>
      {error && (
        <p style={{ color: "#fca5a5", marginBottom: "12px" }}>{error}</p>
      )}

      <form onSubmit={handlePost}>
        <input
          className="formInput"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: "12px", width: "100%" }}
        />

        <textarea
          className="formInput"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ marginBottom: "12px", width: "100%" }}
        />

        <input
          className="formInput"
          type="number"
          min="0"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginBottom: "12px", width: "100%" }}
        />

        <select
          className="formSelect"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginBottom: "12px", width: "100%" }}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="formSelect"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={{ marginBottom: "12px", width: "100%" }}
        >
          <option value="">Select condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          className="formInput"
          placeholder="Location (optional, defaults to NIT Warangal)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ marginBottom: "12px", width: "100%" }}
        />

        <label style={{ display: "block", marginBottom: "20px" }}>
          <span
            style={{
              display: "block",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Images (up to 5, at least 1)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            style={{ width: "100%" }}
          />
          {images.length > 0 && (
            <span
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "6px",
              }}
            >
              {images.length} image{images.length > 1 ? "s" : ""} selected
            </span>
          )}
        </label>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={createProduct.isPending}
        >
          {createProduct.isPending ? "Posting..." : "Post item"}
        </button>
      </form>
    </div>
  );
}

export default PostItemPage;
