import axios from 'axios'
import { getApiBase } from '../api/client'

const api = axios.create({
  baseURL: getApiBase(),
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
})

export default api
