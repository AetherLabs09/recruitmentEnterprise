const BASE_URL = '/api'

function getToken() {
  return localStorage.getItem('token')
}

export async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('company')
    window.location.href = '/'
  }

  return data
}

export async function login(phone, password) {
  return await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password })
  })
}

export async function register(data) {
  return await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function getCompanyProfile() {
  return await request('/company/profile')
}

export async function updateCompanyProfile(data) {
  return await request('/company/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function verifyCompany(data) {
  return await request('/company/verify', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function getJobs() {
  return await request('/job')
}

export async function createJob(data) {
  return await request('/job', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function getJob(id) {
  return await request(`/job/${id}`)
}

export async function updateJob(id, data) {
  return await request(`/job/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function updateJobStatus(id, status) {
  return await request(`/job/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
}

export async function refreshJob(id) {
  return await request(`/job/${id}/refresh`, {
    method: 'PUT'
  })
}

export async function deleteJob(id) {
  return await request(`/job/${id}`, {
    method: 'DELETE'
  })
}

export async function getResumes(params = {}) {
  const query = new URLSearchParams(params).toString()
  return await request(`/resume?${query}`)
}

export async function getResume(id) {
  return await request(`/resume/${id}`)
}

export async function updateResumeStatus(id, status) {
  return await request(`/resume/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
}

export async function toggleFavorite(id, is_favorite) {
  return await request(`/resume/${id}/favorite`, {
    method: 'PUT',
    body: JSON.stringify({ is_favorite })
  })
}

export async function deleteResume(id) {
  return await request(`/resume/${id}`, {
    method: 'DELETE'
  })
}

export async function getInterviews(params = {}) {
  const query = new URLSearchParams(params).toString()
  return await request(`/interview?${query}`)
}

export async function createInterview(data) {
  return await request('/interview', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateInterview(id, data) {
  return await request(`/interview/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deleteInterview(id) {
  return await request(`/interview/${id}`, {
    method: 'DELETE'
  })
}
