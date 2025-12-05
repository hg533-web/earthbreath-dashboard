import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { UserResponse } from '../../api/client';
import './Profile.css';

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hasAsthma: '',
    asthmaSeverity: '',
    triggerFactors: [] as string[],
    symptomFrequency: '',
    medicationUsage: '',
    asthmaControl: '',
    zipCode: '',
    selectedHospital: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    // Load user from localStorage or fetch from API
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const userData = JSON.parse(stored);
          setUser(userData);
          
          // Optionally fetch fresh data from API
          try {
            const freshUser = await apiClient.getUser(userData.id);
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
            initializeFormData(freshUser);
          } catch (err) {
            console.error('Failed to fetch fresh user data:', err);
            // Use stored data as fallback
            initializeFormData(userData);
          }
        } else {
          setError('Please login to view your profile');
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const initializeFormData = (userData: UserResponse) => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      hasAsthma: userData.hasAsthma || '',
      asthmaSeverity: userData.asthmaSeverity || '',
      triggerFactors: userData.triggerFactors || [],
      symptomFrequency: userData.symptomFrequency || '',
      medicationUsage: userData.medicationUsage || '',
      asthmaControl: userData.asthmaControl || '',
      zipCode: userData.zipCode || '',
      selectedHospital: userData.selectedHospital || '',
      emergencyContact: userData.emergencyContact || '',
      emergencyPhone: userData.emergencyPhone || '',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    if (user) {
      initializeFormData(user);
    }
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updatedUser = await apiClient.updateUserProfile(user.id, {
        name: formData.name,
        email: formData.email,
        hasAsthma: formData.hasAsthma || undefined,
        asthmaSeverity: formData.asthmaSeverity || undefined,
        triggerFactors: formData.triggerFactors.length > 0 ? formData.triggerFactors : undefined,
        symptomFrequency: formData.symptomFrequency || undefined,
        medicationUsage: formData.medicationUsage || undefined,
        asthmaControl: formData.asthmaControl || undefined,
        zipCode: formData.zipCode || undefined,
        selectedHospital: formData.selectedHospital || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
      });

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setSaveError(err?.detail || err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTriggerFactorToggle = (factor: string) => {
    setFormData(prev => {
      const current = prev.triggerFactors || [];
      if (current.includes(factor)) {
        return {
          ...prev,
          triggerFactors: current.filter(f => f !== factor)
        };
      } else {
        return {
          ...prev,
          triggerFactors: [...current, factor]
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <p>{error}</p>
          <a href="/auth/login">Go to Login</a>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const triggerOptions = [
    'Pollen', 'Dust', 'Smoke', 'Exercise', 'Cold Air',
    'Stress', 'Allergies', 'Pollution', 'Mold', 'Pet Dander'
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>User Profile</h1>
          <p>Your personal health information and preferences</p>
        </div>
        <div className="profile-header-actions">
          {!isEditing ? (
            <button className="edit-button" onClick={handleEdit}>
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="cancel-button" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
              <button className="save-button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="success-message">
          Profile updated successfully!
        </div>
      )}

      {saveError && (
        <div className="error-message-global">
          {saveError}
        </div>
      )}

      <div className="profile-content">
        {/* Basic Information */}
        <section className="profile-section">
          <h2>Basic Information</h2>
          <div className="profile-card">
            <div className="profile-field">
              <label>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="profile-input"
                />
              ) : (
                <div className="profile-value">{user.name || 'Not provided'}</div>
              )}
            </div>
            <div className="profile-field">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="profile-input"
                />
              ) : (
                <div className="profile-value">{user.email || 'Not provided'}</div>
              )}
            </div>
          </div>
        </section>

        {/* Asthma Information */}
        <section className="profile-section">
          <h2>Asthma Information</h2>
          <div className="profile-card">
            <div className="profile-field">
              <label>Has Asthma</label>
              {isEditing ? (
                <select
                  value={formData.hasAsthma}
                  onChange={(e) => updateFormData('hasAsthma', e.target.value)}
                  className="profile-input"
                >
                  <option value="">Not specified</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              ) : (
                <div className="profile-value">
                  {user.hasAsthma === 'yes' ? 'Yes' : user.hasAsthma === 'no' ? 'No' : 'Not specified'}
                </div>
              )}
            </div>
            
            {(!isEditing && user.hasAsthma === 'yes') || (isEditing && formData.hasAsthma === 'yes') ? (
              <>
                <div className="profile-field">
                  <label>Asthma Severity</label>
                  {isEditing ? (
                    <select
                      value={formData.asthmaSeverity}
                      onChange={(e) => updateFormData('asthmaSeverity', e.target.value)}
                      className="profile-input"
                    >
                      <option value="">Not specified</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  ) : (
                    <div className="profile-value">
                      {user.asthmaSeverity ? user.asthmaSeverity.charAt(0).toUpperCase() + user.asthmaSeverity.slice(1) : 'Not specified'}
                    </div>
                  )}
                </div>
                
                <div className="profile-field">
                  <label>Trigger Factors</label>
                  {isEditing ? (
                    <div className="checkbox-grid">
                      {triggerOptions.map((factor) => (
                        <label key={factor} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.triggerFactors?.includes(factor) || false}
                            onChange={() => handleTriggerFactorToggle(factor)}
                          />
                          <span>{factor}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="profile-value">
                      {user.triggerFactors && user.triggerFactors.length > 0 ? (
                        <div className="tags-list">
                          {user.triggerFactors.map((factor, index) => (
                            <span key={index} className="tag">{factor}</span>
                          ))}
                        </div>
                      ) : (
                        'None specified'
                      )}
                    </div>
                  )}
                </div>
                
                <div className="profile-field">
                  <label>Symptom Frequency</label>
                  {isEditing ? (
                    <select
                      value={formData.symptomFrequency}
                      onChange={(e) => updateFormData('symptomFrequency', e.target.value)}
                      className="profile-input"
                    >
                      <option value="">Not specified</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="rarely">Rarely</option>
                    </select>
                  ) : (
                    <div className="profile-value">
                      {user.symptomFrequency ? user.symptomFrequency.replace(/-/g, ' ').split(' ').map(
                        word => word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ') : 'Not specified'}
                    </div>
                  )}
                </div>
                
                <div className="profile-field">
                  <label>Medication Usage</label>
                  {isEditing ? (
                    <select
                      value={formData.medicationUsage}
                      onChange={(e) => updateFormData('medicationUsage', e.target.value)}
                      className="profile-input"
                    >
                      <option value="">Not specified</option>
                      <option value="daily">Daily</option>
                      <option value="as-needed">As Needed</option>
                      <option value="emergency-only">Emergency Only</option>
                      <option value="none">None</option>
                    </select>
                  ) : (
                    <div className="profile-value">
                      {user.medicationUsage ? user.medicationUsage.replace(/-/g, ' ').split(' ').map(
                        word => word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ') : 'Not specified'}
                    </div>
                  )}
                </div>
                
                <div className="profile-field">
                  <label>Asthma Control Status</label>
                  {isEditing ? (
                    <select
                      value={formData.asthmaControl}
                      onChange={(e) => updateFormData('asthmaControl', e.target.value)}
                      className="profile-input"
                    >
                      <option value="">Not specified</option>
                      <option value="well-controlled">Well Controlled</option>
                      <option value="partially-controlled">Partially Controlled</option>
                      <option value="poorly-controlled">Poorly Controlled</option>
                    </select>
                  ) : (
                    <div className="profile-value">
                      {user.asthmaControl ? user.asthmaControl.replace(/-/g, ' ').split(' ').map(
                        word => word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ') : 'Not specified'}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* Location & Emergency Information */}
        <section className="profile-section">
          <h2>Location & Emergency Information</h2>
          <div className="profile-card">
            <div className="profile-field">
              <label>ZIP Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  className="profile-input"
                  placeholder="e.g., 10001"
                />
              ) : (
                <div className="profile-value">{user.zipCode || 'Not provided'}</div>
              )}
            </div>
            
            <div className="profile-field">
              <label>Selected Hospital</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.selectedHospital}
                  onChange={(e) => updateFormData('selectedHospital', e.target.value)}
                  className="profile-input"
                  placeholder="Hospital name"
                />
              ) : (
                <div className="profile-value">{user.selectedHospital || 'Not provided'}</div>
              )}
            </div>
            
            <div className="profile-field">
              <label>Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                  className="profile-input"
                  placeholder="Contact name"
                />
              ) : (
                <div className="profile-value">{user.emergencyContact || 'Not provided'}</div>
              )}
            </div>
            
            <div className="profile-field">
              <label>Emergency Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                  className="profile-input"
                  placeholder="Phone number"
                />
              ) : (
                <div className="profile-value">{user.emergencyPhone || 'Not provided'}</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
