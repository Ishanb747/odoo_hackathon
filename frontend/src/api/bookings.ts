import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export interface BookingResponse {
  id: number
  resource_name: string
  date: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled' | 'conflict'
  employee_id: number
  employee_name: string
  created_at: string
}

export interface BookingCreate {
  resource_name: string
  date: string
  start_time: string
  end_time: string
}

export interface ConflictDetails {
  id: number
  start_time: string
  end_time: string
  employee_name: string
}

export interface BookingError {
  message: string
  conflicting_booking?: ConflictDetails
}

// Helper to get auth token
const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useGetBookings = (resource_name: string, date: string) => {
  return useQuery<BookingResponse[]>({
    queryKey: ['bookings', resource_name, date],
    queryFn: async () => {
      if (!resource_name || !date) return []
      
      const url = new URL(`${API_BASE}/api/bookings`)
      url.searchParams.append('resource_name', resource_name)
      url.searchParams.append('booking_date', date)
      
      const res = await fetch(url.toString(), {
        headers: getHeaders(),
      })
      
      if (!res.ok) {
        throw new Error('Failed to fetch bookings')
      }
      return res.json()
    },
    enabled: !!resource_name && !!date,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation<BookingResponse, BookingError, BookingCreate>({
    mutationFn: async (data: BookingCreate) => {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        if (res.status === 409) {
          throw errorData.detail
        }
        throw new Error(errorData.detail || 'Failed to create booking')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.resource_name, variables.date] })
    },
  })
}
