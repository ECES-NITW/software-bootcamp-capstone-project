import { useState } from 'react';
import useUser, { useUpdateUserProfile } from '../hooks/useUser';
import { useUserProducts } from '../hooks/useProducts';
import ItemCard from '../components/ItemCard';

function ProfilePage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const sellerId = user?.user_id;
  const { data: products, isLoading: isProductsLoading } = useUserProducts(sellerId);
  const updateProfileMutation = useUpdateUserProfile();

  const [editMode, setEditMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleEditClick = () => {
    if (user) {
      setUserName(user.userName);
      setPreviewUrl(user.profilePic || '');
    }
    setEditMode(true);
  };

  const clearPreview = () => {
    if (profilePic && previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setProfilePic(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (profilePic && previewUrl) URL.revokeObjectURL(previewUrl);
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    clearPreview();
    setEditMode(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (userName) formData.append('userName', userName);
    if (profilePic) formData.append('profilePic', profilePic);

    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        clearPreview();
        setEditMode(false);
      },
      onError: (err) => {
        alert('Failed to update profile: ' + (err.message || err));
      }
    });
  };

  if (isUserLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glassCard" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '480px', margin: '40px auto' }}>
        <h3>Access Denied</h3>
        <p style={{ color: 'var(--text-muted)' }}>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="glassCard" style={{ marginBottom: '32px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div className="navAvatar" style={{ width: '80px', height: '80px', fontSize: '2.5rem', flexShrink: 0 }}>
            {previewUrl || user.profilePic ? (
              <img src={previewUrl || user.profilePic} alt={user.userName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              user.userName.substring(0, 2).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            {editMode ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="formGroup">
                  <label className="formLabel">Username</label>
                  <input
                    type="text"
                    className="formInput"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label className="formLabel">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h1 style={{ fontFamily: 'Lora, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  {user.userName}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
                  {user.email}
                </p>
                <button className="btn btn-secondary" onClick={handleEditClick}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
          My Listings ({products?.length || 0})
        </h2>
        {isProductsLoading ? (
          <p>Loading listings...</p>
        ) : products && products.length > 0 ? (
          <div className="grid">
            {products.map((product) => (
              <ItemCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>You haven't listed any items yet.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
