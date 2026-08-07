import { useState, useRef } from "react";
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

const LISTING_TYPES = [
    { value: "sell", label: "Sell" },
    { value: "rent", label: "Rent" },
    { value: "exchange", label: "Exchange" },
];

const MAX_IMAGES = 5;

function PostItemPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const createProduct = useCreateProduct();

    const [types, setTypes] = useState(["sell"]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [location, setLocation] = useState("");
    const [images, setImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const [price, setPrice] = useState("");
    const [rentPrice, setRentPrice] = useState("");
    const [deposit, setDeposit] = useState("");
    const [exchangePreferences, setExchangePreferences] = useState("");

    const [error, setError] = useState("");

    const isSelected = (type) => types.includes(type);

    const toggleType = (type) => {
        setError("");
        setTypes((current) => {
            if (!current.includes(type)) {
                return LISTING_TYPES.map((entry) => entry.value).filter(
                    (value) => current.includes(value) || value === type,
                );
            }
            if (current.length === 1) {
                return current;
            }
            return current.filter((value) => value !== type);
        });
    };

    const addFiles = (fileList) => {
        const picked = Array.from(fileList).filter((file) =>
            file.type.startsWith("image/"),
        );

        if (picked.length === 0) {
            return;
        }

        setImages((current) => {
            const room = MAX_IMAGES - current.length;

            if (room <= 0) {
                return current;
            }

            const added = picked.slice(0, room).map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }));

            return [...current, ...added];
        });
    };

    const removeImage = (index) => {
        setImages((current) => {
            const target = current[index];

            if (target) {
                URL.revokeObjectURL(target.url);
            }

            return current.filter((_, position) => position !== index);
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files?.length) {
            addFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files?.length) {
            addFiles(e.target.files);
        }
        e.target.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title || !description || !category || !condition) {
            setError("Title, description, category and condition are required.");
            return;
        }
        if (images.length === 0) {
            setError("Please add at least one image.");
            return;
        }
        if (isSelected("sell") && price === "") {
            setError("Enter a selling price, or turn off the Sell option.");
            return;
        }
        if (isSelected("rent") && rentPrice === "") {
            setError("Enter a rent price, or turn off the Rent option.");
            return;
        }
        if (isSelected("exchange") && !exchangePreferences) {
            setError(
                "Enter what you want in exchange, or turn off the Exchange option.",
            );
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("condition", condition);

        if (location) {
            formData.append("location", location);
        }

        types.forEach((type) => formData.append("types", type));

        if (isSelected("sell")) {
            formData.append("price", Number(price));
        }
        if (isSelected("rent")) {
            formData.append("rentPrice", Number(rentPrice));

            if (deposit !== "") {
                formData.append("deposit", Number(deposit));
            }
        }
        if (isSelected("exchange")) {
            formData.append("exchangePreferences", exchangePreferences);
        }

        images.forEach(({ file }) => formData.append("images", file));

        try {
            const product = await createProduct.mutateAsync(formData);
            navigate(`/item/${product._id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post item.");
        }
    };

    return (
        <div style={{ animation: "fadeInUp 0.4s ease-out" }}>
            <div style={{ marginBottom: "28px", textAlign: "center" }}>
                <h1
                    style={{
                        fontFamily: "Lora, serif",
                        fontSize: "2rem",
                        fontWeight: 700,
                    }}
                >
                    Post an Item
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    Share what you have with other students on campus.
                </p>
            </div>

            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                <form
                    className="glassCard"
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                    {error && (
                        <p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>{error}</p>
                    )}

                    <div className="formGroup" style={{ marginBottom: 0 }}>
                        <label className="formLabel">Title *</label>
                        <input
                            type="text"
                            className="formInput"
                            placeholder="e.g. TI-84 Graphing Calculator"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="formGroup" style={{ marginBottom: 0 }}>
                        <label className="formLabel">Description *</label>
                        <textarea
                            className="formTextarea"
                            rows="4"
                            placeholder="Condition, what is included, pickup spots..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="formGroup" style={{ marginBottom: 0, gap: "6px" }}>
                        <label className="formLabel">Listing Type</label>
                        <span
                            style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                marginBottom: "4px",
                            }}
                        >
                            You can choose multiple options.
                        </span>
                        <div className="typeToggleRow">
                            {LISTING_TYPES.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`typeToggle toggle-${value} ${isSelected(value) ? "active" : ""}`}
                                    onClick={() => toggleType(value)}
                                    aria-pressed={isSelected(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isSelected("sell") && (
                        <div className="typePanel">
                            <span className="typePanelTitle">Sell details</span>
                            <div className="formGroup" style={{ marginBottom: 0 }}>
                                <label className="formLabel">Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    className="formInput"
                                    placeholder="What you want for it"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                    )}

                    {isSelected("rent") && (
                        <div className="typePanel">
                            <span className="typePanelTitle">Rent details</span>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "16px",
                                }}
                            >
                                <div className="formGroup" style={{ marginBottom: 0 }}>
                                    <label className="formLabel">Rent per Week (₹) *</label>
                                    <input
                                        type="number"
                                        className="formInput"
                                        placeholder="Weekly rate"
                                        value={rentPrice}
                                        onChange={(e) => setRentPrice(e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <div className="formGroup" style={{ marginBottom: 0 }}>
                                    <label className="formLabel">Security Deposit (₹)</label>
                                    <input
                                        type="number"
                                        className="formInput"
                                        placeholder="Refundable, optional"
                                        value={deposit}
                                        onChange={(e) => setDeposit(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {isSelected("exchange") && (
                        <div className="typePanel">
                            <span className="typePanelTitle">Exchange details</span>
                            <div className="formGroup" style={{ marginBottom: 0 }}>
                                <label className="formLabel">Preferred Trade Item(s) *</label>
                                <input
                                    type="text"
                                    className="formInput"
                                    placeholder="e.g. Apple Pencil (2nd gen), Mechanical Keyboard"
                                    value={exchangePreferences}
                                    onChange={(e) => setExchangePreferences(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px",
                        }}
                    >
                        <div className="formGroup" style={{ marginBottom: 0 }}>
                            <label className="formLabel">Category *</label>
                            <select
                                className="formSelect"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map((entry) => (
                                    <option key={entry} value={entry}>
                                        {entry}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="formGroup" style={{ marginBottom: 0 }}>
                            <label className="formLabel">Condition *</label>
                            <select
                                className="formSelect"
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                            >
                                <option value="">Select condition</option>
                                {CONDITIONS.map((entry) => (
                                    <option key={entry} value={entry}>
                                        {entry}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="formGroup" style={{ marginBottom: 0 }}>
                        <label className="formLabel">Location</label>
                        <input
                            type="text"
                            className="formInput"
                            placeholder="Optional, defaults to NIT Warangal"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="formGroup" style={{ marginBottom: 0 }}>
                        <label className="formLabel">
                            Photographs * (up to {MAX_IMAGES})
                        </label>

                        {images.length > 0 && (
                            <div className="imagePreviewGrid">
                                {images.map((image, index) => (
                                    <div className="imagePreview" key={image.url}>
                                        <img src={image.url} alt={`Upload ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="imagePreviewRemove"
                                            onClick={() => removeImage(index)}
                                            aria-label={`Remove image ${index + 1}`}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < MAX_IMAGES && (
                            <div
                                className="dragDropZone"
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    borderColor: dragActive
                                        ? "var(--primary)"
                                        : "var(--border-color)",
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                                <p>
                                    Drag and drop photos here, or <strong>browse files</strong>
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    JPG or PNG, {MAX_IMAGES - images.length} remaining
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={createProduct.isPending}
                        style={{ width: "100%" }}
                    >
                        {createProduct.isPending ? "Posting..." : "Post"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PostItemPage;
