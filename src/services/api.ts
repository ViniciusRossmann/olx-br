import axios from 'axios';

const GET_TOKEN_URL = 'https://auth.olx.com.br/';
const API_URL = 'https://apps.olx.com.br/';

export const authApi = axios.create({
  baseURL: GET_TOKEN_URL,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});

export const appApi = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});