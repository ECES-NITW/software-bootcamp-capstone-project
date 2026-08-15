import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useUpdateProduct } from "../hooks/useProducts";
import useUser from "../hooks/useUser";

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

const CONDITIONS = [
    "Brand New",
    "New",
    "Slightly Used",
    "Good",
    "Old",
    "Needs Repair",
];

const LISTING_TYPES = [
    { value: "sell", label: "Sell" },
    { value: "rent", label: "Rent" },
    { value: "exchange", label: "Exchange" },
];

const MAX_IMAGES = 5;

function EditItemForm({ item }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const updateProduct = useUpdateProduct();

    const [types, setTypes] = useState(() =>
        (item.types ?? []).filter((t) =>
            LISTING_TYPES.some((entry) => entry.value === t),
        ),
    );
    const [title, setTitle] = useState(item.title ?? "");
    const [description, setDescription] = useState(item.description ?? "");
    const [category, setCategory] = useState(item.category ?? "");
    const [condition, setCondition] = useState(item.condition ?? "");
    const [location, setLocation] = useState(item.location ?? "");
    const [price, setPrice] = useState(item.price ?? "");
    const [rentPrice, setRentPrice] = useState(item.rentPrice ?? "");
    const [deposit, setDeposit] = useState(item.deposit ?? "");
    const [exchangePreferences, setExchangePreferences] = useState(
        item.exchangePreferences ?? "",
    );
    const [newImages, setNewImages] = useState([]);
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
        if (picked.length === 0) return;

        setNewImages((current) => {
            const room = MAX_IMAGES - current.length;
            if (room <= 0) return current;
            const added = picked.slice(0, room).map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }));
            return [...current, ...added];
        });
    };

    const removeNewImage = (index) => {
        setNewImages((current) => {
            const target = current[index];
            if (target) URL.revokeObjectURL(target.url);
            return current.filter((_, position) => position !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title || !description || !category || !condition) {
            setError("Title, description, category and condition are required.");
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
        newImages.forEach(({ file }) => formData.append("images", file));

        try {
            await updateProduct.mutateAsync({ id, formData });
            navigate(`/item/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update item.");
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
                    Edit Listing
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    Update the details of your listing.
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="formGroup" style={{ marginBottom: 0 }}>
                        <label className="formLabel">Description *</label>
                        <textarea
                            className="formTextarea"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="formGroup" style={{ marginBottom: 0, gap: "6px" }}>
                        <label className="formLabel">Listing Type</label>
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
                        <div className="typePanel panel-sell">
                            <span className="typePanelTitle">Sell details</span>
                            <div className="formGroup" style={{ marginBottom: 0 }}>
                                <label className="formLabel">Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    className="formInput"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                    )}

                    {isSelected("rent") && (
                        <div className="typePanel panel-rent">
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
                                        value={deposit}
                                        onChange={(e) => setDeposit(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {isSelected("exchange") && (
                        <div className="typePanel panel-exchange">
                            <span className="typePanelTitle">Exchange details</span>
                            <div className="formGroup" style={{ marginBottom: 0 }}>
                                <label className="formLabel">Preferred Trade Item(s) *</label>
                                <input
                                    type="text"
                                    className="formInput"
                                    value={exchangePreferences}
                                    onChange={(e) =>
                                        setExchangePreferences(e.target.value)
                                    }
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
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="formGroup" style={{ marginBottom: 0 }}>
                        <label className="formLabel">Photographs</label>
                        {(item.images?.length ?? 0) > 0 && newImages.length === 0 && (
                            <div className="imagePreviewGrid">
                                {item.images.map((image) => (
                                    <div className="imagePreview" key={image.public_id}>
                                        <img src={image.url} alt={item.title} />
                                    </div>
                                ))}
                            </div>
                        )}
                        {newImages.length > 0 && (
                            <div className="imagePreviewGrid">
                                {newImages.map((image, index) => (
                                    <div className="imagePreview" key={image.url}>
                                        <img src={image.url} alt={`Upload ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="imagePreviewRemove"
                                            onClick={() => removeNewImage(index)}
                                            aria-label={`Remove image ${index + 1}`}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {newImages.length < MAX_IMAGES && (
                            <div
                                className="dragDropZone"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files?.length) {
                                            addFiles(e.target.files);
                                        }
                                        e.target.value = "";
                                    }}
                                    style={{ display: "none" }}
                                />
                                <p>
                                    Click to choose new photos
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Uploading new photos replaces the current ones. Leave
                                    empty to keep them.
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={updateProduct.isPending}
                            style={{ flex: 1 }}
                        >
                            {updateProduct.isPending ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            style={{
                                flex: 1,
                                background: "var(--bg-secondary)",
                                border: "1.5px solid var(--border-color)",
                                color: "var(--text-muted)",
                            }}
                            onClick={() => navigate(`/item/${id}`)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditItemPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: user } = useUser();
    const { data: item, isLoading } = useProduct(id);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px" }}>
                <div className="statusIndicator">
                    <span className="statusDot statusDot-active"></span>
                    <span>Loading listing...</span>
                </div>
            </div>
        );
    }

    const sellerId = item?.seller?._id ?? item?.seller;
    const isOwner = Boolean(
        user && sellerId && String(sellerId) === String(user.user_id),
    );

    if (!item || !isOwner) {
        return (
            <div
                className="glassCard"
                style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    maxWidth: "480px",
                    margin: "40px auto",
                }}
            >
                <h3>Cannot Edit Listing</h3>
                <p style={{ color: "var(--text-muted)" }}>
                    This listing does not exist or you are not its owner.
                </p>
                <button
                    className="btn"
                    style={{ marginTop: "16px" }}
                    onClick={() => navigate("/feed")}
                >
                    Back to Marketplace
                </button>
            </div>
        );
    }

    return <EditItemForm key={item._id} item={item} />;
}

export default EditItemPage;
