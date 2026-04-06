import axios from 'axios'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.bookshare.tech',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
})

// Auth
export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)
export const logout = () => api.post('/api/auth/logout')
export const getMe = () => api.get('/api/auth/me')

// Books
export const getBooks = (params) => api.get('/api/books', { params })
export const getBook = (id) => api.get(`/api/books/${id}`)
export const createBook = (data) => api.post('/api/books', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
})
export const updateBook = (id, data) => api.put(`/api/books/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
})
export const deleteBook = (id) => api.delete(`/api/books/${id}`)
export const flagBook = (id) => api.put(`/api/books/${id}/flag`)

// Borrow
export const submitBorrowRequest = (data) => api.post('/api/borrow/request', data)
export const getIncomingRequests = () => api.get('/api/borrow/incoming')
export const getMyRequests = () => api.get('/api/borrow/my')
export const acceptRequest = (id) => api.put(`/api/borrow/${id}/accept`)
export const rejectRequest = (id) => api.put(`/api/borrow/${id}/reject`)
export const suggestAlternative = (id, data) => api.put(`/api/borrow/${id}/suggest`, data)
export const returnBook = (id) => api.put(`/api/borrow/${id}/return`)
export const autoReturn = () => api.post('/api/borrow/auto-return')

// Notifications
export const getNotifications = () => api.get('/api/notifications')
export const markAllRead = () => api.put('/api/notifications/read')
export const markOneRead = (id) => api.put(`/api/notifications/${id}/read`)

// Users
export const updateProfile = (data) => api.put('/api/users/me', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
})
export const changePassword = (data) => api.put('/api/users/me/password', data)
export const getUser = (id) => api.get(`/api/users/${id}`)

// Admin
export const adminGetUsers = () => api.get('/api/admin/users')
export const adminBlockUser = (id) => api.put(`/api/admin/users/${id}/block`)
export const adminPromoteUser = (id) => api.put(`/api/admin/users/${id}/promote`)
export const adminGetBooks = (params) => api.get('/api/admin/books', { params })
export const adminDeleteBook = (id) => api.delete(`/api/admin/books/${id}`)
export const adminGetReports = (period) => api.get('/api/admin/reports', { params: { period } })

export default api