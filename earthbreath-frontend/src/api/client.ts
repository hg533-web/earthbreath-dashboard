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
  zipCode?: string | null
  selectedHospital?: string | null
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
        const error = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }))
        throw new Error(error.detail || 'Request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
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
}

export const apiClient = new ApiClient(API_BASE_URL)

