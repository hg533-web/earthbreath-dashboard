import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import './Signup.css'

interface FormData {
  // Step 1: Basic Information
  name: string
  email: string
  password: string
  confirmPassword: string
  
  // Step 2: Asthma-related Information
  hasAsthma: string
  asthmaSeverity: string
  triggerFactors: string[]
  symptomFrequency: string
  medicationUsage: string
  asthmaControl: string
  
  // Step 3: Address and Hospital
  zipCode: string
  selectedHospital: string
  emergencyContact: string
  emergencyPhone: string
}

const triggerOptions = [
  'Pollen',
  'Smoke',
  'Air Pollution',
  'Cold Air',
  'Exercise',
  'Pet Dander',
  'Dust Mites',
  'Mold',
  'Stress',
  'Other'
]

// Mock NYC Hospital List
const nycHospitals = [
  'Mount Sinai Hospital',
  'NYU Langone Medical Center',
  'NewYork-Presbyterian Hospital',
  'Columbia University Medical Center',
  'Memorial Sloan Kettering Cancer Center',
  'Montefiore Medical Center',
  'NYC Health + Hospitals/Bellevue',
  'Lenox Hill Hospital',
  'Mount Sinai Beth Israel',
  'NYC Health + Hospitals/Harlem',
  'Bronx-Lebanon Hospital Center',
  'Maimonides Medical Center',
]

export function Signup() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hasAsthma: '',
    asthmaSeverity: '',
    triggerFactors: [],
    symptomFrequency: '',
    medicationUsage: '',
    asthmaControl: '',
    zipCode: '',
    selectedHospital: '',
    emergencyContact: '',
    emergencyPhone: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleTriggerChange = (trigger: string) => {
    const current = formData.triggerFactors
    const updated = current.includes(trigger)
      ? current.filter(t => t !== trigger)
      : [...current, trigger]
    updateFormData('triggerFactors', updated)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Please enter your name'
      if (!formData.email.trim()) newErrors.email = 'Please enter your email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!formData.password) newErrors.password = 'Please enter a password'
      else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else if (step === 2) {
      if (!formData.hasAsthma) newErrors.hasAsthma = 'Please select if you have asthma'
      if (formData.hasAsthma === 'yes') {
        if (!formData.asthmaSeverity) newErrors.asthmaSeverity = 'Please select asthma severity'
        if (!formData.symptomFrequency) newErrors.symptomFrequency = 'Please select symptom frequency'
        if (!formData.medicationUsage) newErrors.medicationUsage = 'Please select medication usage'
        if (!formData.asthmaControl) newErrors.asthmaControl = 'Please select asthma control status'
      }
    } else if (step === 3) {
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Please enter zip code'
      else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
        newErrors.zipCode = 'Please enter a valid US zip code (e.g., 10001 or 10001-1234)'
      }
      if (!formData.selectedHospital) newErrors.selectedHospital = 'Please select a hospital'
      if (!formData.emergencyContact.trim()) {
        newErrors.emergencyContact = 'Please enter emergency contact name'
      }
      if (!formData.emergencyPhone.trim()) {
        newErrors.emergencyPhone = 'Please enter emergency contact phone'
      }
      else if (!/^[\d\s\-\+\(\)]+$/.test(formData.emergencyPhone)) {
        newErrors.emergencyPhone = 'Please enter a valid phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!validateStep(3)) {
      return
    }

    setIsSubmitting(true)

    try {
      // Send data to backend API
      await apiClient.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
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
      })

      // Success - navigate to login page
      alert('Registration successful! Please login with your credentials.')
      navigate('/auth/login')
    } catch (error) {
      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      setSubmitError(errorMessage)
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h1>Create Account</h1>
            <p>To provide you with personalized travel recommendations, we need to collect some information</p>
          </div>

          {/* Progress Indicator */}
          <div className="progress-bar">
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Basic Info</span>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Asthma Info</span>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Location</span>
              </div>
            </div>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="form-step">
                <h2>Basic Information</h2>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter your name"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="At least 6 characters"
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            )}

            {/* Step 2: Asthma-related Information */}
            {currentStep === 2 && (
              <div className="form-step">
                <h2>Asthma Information</h2>
                <div className="form-group">
                  <label>Do you have asthma? *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="hasAsthma"
                        value="yes"
                        checked={formData.hasAsthma === 'yes'}
                        onChange={(e) => updateFormData('hasAsthma', e.target.value)}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="hasAsthma"
                        value="no"
                        checked={formData.hasAsthma === 'no'}
                        onChange={(e) => updateFormData('hasAsthma', e.target.value)}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.hasAsthma && <span className="error-message">{errors.hasAsthma}</span>}
                </div>

                {formData.hasAsthma === 'yes' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="asthmaSeverity">Asthma Severity *</label>
                      <select
                        id="asthmaSeverity"
                        value={formData.asthmaSeverity}
                        onChange={(e) => updateFormData('asthmaSeverity', e.target.value)}
                      >
                        <option value="">Please select</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                      {errors.asthmaSeverity && <span className="error-message">{errors.asthmaSeverity}</span>}
                    </div>

                    <div className="form-group">
                      <label>Trigger Factors (multiple selection)</label>
                      <div className="checkbox-grid">
                        {triggerOptions.map((trigger) => (
                          <label key={trigger} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.triggerFactors.includes(trigger)}
                              onChange={() => handleTriggerChange(trigger)}
                            />
                            <span>{trigger}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="symptomFrequency">Symptom Frequency *</label>
                      <select
                        id="symptomFrequency"
                        value={formData.symptomFrequency}
                        onChange={(e) => updateFormData('symptomFrequency', e.target.value)}
                      >
                        <option value="">Please select</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Several times a week</option>
                        <option value="monthly">Several times a month</option>
                        <option value="rarely">Rarely</option>
                      </select>
                      {errors.symptomFrequency && <span className="error-message">{errors.symptomFrequency}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="medicationUsage">Medication Usage *</label>
                      <select
                        id="medicationUsage"
                        value={formData.medicationUsage}
                        onChange={(e) => updateFormData('medicationUsage', e.target.value)}
                      >
                        <option value="">Please select</option>
                        <option value="daily">Daily medication</option>
                        <option value="as-needed">As needed</option>
                        <option value="emergency-only">Emergency only</option>
                        <option value="none">No medication</option>
                      </select>
                      {errors.medicationUsage && <span className="error-message">{errors.medicationUsage}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="asthmaControl">Asthma Control Status *</label>
                      <select
                        id="asthmaControl"
                        value={formData.asthmaControl}
                        onChange={(e) => updateFormData('asthmaControl', e.target.value)}
                      >
                        <option value="">Please select</option>
                        <option value="well-controlled">Well controlled</option>
                        <option value="partially-controlled">Partially controlled</option>
                        <option value="poorly-controlled">Poorly controlled</option>
                      </select>
                      {errors.asthmaControl && <span className="error-message">{errors.asthmaControl}</span>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Address and Hospital */}
            {currentStep === 3 && (
              <div className="form-step">
                <h2>Location & Hospital Information</h2>
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    placeholder="e.g., 10001 or 10001-1234"
                  />
                  <small className="form-hint">Enter your primary residential zip code</small>
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="selectedHospital">Hospital *</label>
                  <select
                    id="selectedHospital"
                    value={formData.selectedHospital}
                    onChange={(e) => updateFormData('selectedHospital', e.target.value)}
                  >
                    <option value="">Please select your hospital</option>
                    {nycHospitals.map((hospital) => (
                      <option key={hospital} value={hospital}>
                        {hospital}
                      </option>
                    ))}
                  </select>
                  {errors.selectedHospital && <span className="error-message">{errors.selectedHospital}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact">Emergency Contact Name *</label>
                  <input
                    type="text"
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                  {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyPhone">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                  {errors.emergencyPhone && <span className="error-message">{errors.emergencyPhone}</span>}
                </div>
              </div>
            )}

            {/* Button Area */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" className="back-button" onClick={handleBack}>
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button type="button" className="next-button" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>
              )}
            </div>
            
            {submitError && (
              <div className="error-message" style={{ marginTop: '1rem', textAlign: 'center' }}>
                {submitError}
              </div>
            )}
          </form>

          <div className="signup-footer">
            <p>
              Already have an account? <a href="/auth/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
