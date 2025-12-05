const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface SignupRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  hasAsthma?: string
  asthmaSeverity?: string
  triggerFactors?: string[]
  symptomFrequency?: string
  medicationUsage?: string
  asthmaControl?: string
  zipCode?: string
  selectedHospital?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UserResponse {
  id: number
  name: string
  email: string
  hasAsthma?: string | null
  asthmaSeverity?: string | null
  triggerFactors?: string[] | null
  symptomFrequency?: string | null
  medicationUsage?: string | null
  asthmaControl?: string | null
  zipCode?: string | null
  selectedHospital?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
}

export interface GasDataResponse {
  id: number
  gas_type: string
  region: string
  date: string
  value: number
  unit: string
  source?: string | null
  notes?: string | null
}

export interface HospitalResponse {
  id: number
  name: string
  borough: string
  latitude: number
  longitude: number
  address: string
  zip_code?: string | null
  phone?: string | null
  specialty?: string | null
  description?: string | null
  website?: string | null
  emergency_department?: string | null
  beds?: number | null
  asthma_specialists?: number | null
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON, create a simple error object
          errorData = {
            detail: `HTTP error! status: ${response.status}`,
          };
        }
        
        // Create error object with detail message
        const error = new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
        (error as any).detail = errorData.detail || errorData.message;
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('API request failed:', error)
      console.error('Request URL:', url)
      console.error('Error type:', error?.constructor?.name)
      
      // Handle network errors (fetch failed completely - connection refused, CORS, etc.)
      if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('fetch') || error.message.includes('NetworkError'))) {
        const networkError = new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:8000');
        (networkError as any).detail = 'Backend server connection failed. Please check if the server is running.';
        (networkError as any).isNetworkError = true;
        throw networkError;
      }
      
      // Re-throw to allow caller to handle
      throw error
    }
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<UserResponse> {
    return this.request<UserResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginRequest): Promise<UserResponse> {
    return this.request<UserResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // User endpoints
  async getUser(userId: number): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/users/${userId}`)
  }

  async getUserByEmail(email: string): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/users/by-email/${email}`)
  }

  async updateUserProfile(userId: number, data: {
    name?: string
    email?: string
    hasAsthma?: string
    asthmaSeverity?: string
    triggerFactors?: string[]
    symptomFrequency?: string
    medicationUsage?: string
    asthmaControl?: string
    zipCode?: string
    selectedHospital?: string
    emergencyContact?: string
    emergencyPhone?: string
  }): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Gas data endpoints
  async getGasData(params?: {
    gas_type?: string
    region?: string
    start_date?: string
    end_date?: string
    skip?: number
    limit?: number
  }): Promise<GasDataResponse[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    const endpoint = `/api/data/gas${query ? `?${query}` : ''}`
    return this.request<GasDataResponse[]>(endpoint)
  }

  async getGasTypes(): Promise<string[]> {
    return this.request<string[]>('/api/data/gas/types/list')
  }

  async getRegions(gas_type?: string): Promise<string[]> {
    const endpoint = gas_type
      ? `/api/data/gas/regions/list?gas_type=${gas_type}`
      : '/api/data/gas/regions/list'
    return this.request<string[]>(endpoint)
  }

  // Hospital endpoints
  async getHospitals(params?: {
    borough?: string
    specialty?: string
    skip?: number
    limit?: number
  }): Promise<HospitalResponse[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    const endpoint = `/api/hospitals${query ? `?${query}` : ''}`
    return this.request<HospitalResponse[]>(endpoint)
  }

  async getHospital(hospitalId: number): Promise<HospitalResponse> {
    return this.request<HospitalResponse>(`/api/hospitals/${hospitalId}`)
  }

  async getBoroughs(): Promise<string[]> {
    return this.request<string[]>('/api/hospitals/boroughs/list')
  }

  async getSpecialties(): Promise<string[]> {
    return this.request<string[]>('/api/hospitals/specialties/list')
  }

  // NYC Climate Data endpoints
  async getNYCClimateData(zipCode: string, startDate?: string, endDate?: string): Promise<NYCClimateDataResponse[]> {
    const params = new URLSearchParams({ zip_code: zipCode })
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return this.request<NYCClimateDataResponse[]>(`/api/nyc/climate?${params.toString()}`)
  }

  async getLatestNYCClimateData(zipCode: string): Promise<NYCClimateDataResponse> {
    return this.request<NYCClimateDataResponse>(`/api/nyc/climate/latest?zip_code=${zipCode}`)
  }

  async getNYCZipcodes(): Promise<string[]> {
    return this.request<string[]>('/api/nyc/climate/zipcodes')
  }

  // Travel Recommendations endpoints
  async getTravelRecommendations(zipCode: string, days?: number, userId?: number): Promise<TravelRecommendationResponse[]> {
    const params = new URLSearchParams({ zip_code: zipCode })
    if (days) params.append('days', days.toString())
    if (userId) params.append('user_id', userId.toString())
    return this.request<TravelRecommendationResponse[]>(`/api/nyc/travel/forecast?${params.toString()}`)
  }

  async getTodayTravelRecommendation(zipCode: string, userId?: number): Promise<TravelRecommendationResponse[]> {
    const params = new URLSearchParams({ zip_code: zipCode })
    if (userId) params.append('user_id', userId.toString())
    return this.request<TravelRecommendationResponse[]>(`/api/nyc/travel/today?${params.toString()}`)
  }
}

// NYC Climate Data types
export interface NYCClimateDataResponse {
  id: number
  zip_code: string
  date: string
  aqi?: number | null
  pm25?: number | null
  pm10?: number | null
  o3?: number | null
  no2?: number | null
  co?: number | null
  temperature?: number | null
  humidity?: number | null
  wind_speed?: number | null
  wind_direction?: number | null
  pressure?: number | null
  visibility?: number | null
  uv_index?: number | null
  pollen_count?: number | null
  asthma_index?: number | null
}

// Travel Recommendation types
export interface TravelRecommendationResponse {
  id: number
  zip_code: string
  date: string
  recommendation_level: string
  risk_score: number
  air_quality_score?: number | null
  weather_score?: number | null
  pollen_score?: number | null
  overall_message?: string | null
  air_quality_message?: string | null
  weather_message?: string | null
  pollen_message?: string | null
  general_advice?: string | null
  best_time_of_day?: string | null
  outdoor_activity_safe: boolean
  exercise_recommendation?: string | null
}

export const apiClient = new ApiClient(API_BASE_URL)





