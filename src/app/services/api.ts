import axios from 'axios';
import { SearchResponse, Dog, Match } from '../types';

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const authService = {
    login: async (name: string, email: string) => {
        return api.post('/auth/login', { name, email });
    },
    logout: async () => {
        return api.post('/auth/logout');
    },
};

export const dogService = {
    getBreeds: async () => {
        return api.get<string[]>('/dogs/breeds');
    },
    searchDogs: async (params: {
        breeds?: string[];
        zipCodes?: string[];
        ageMin?: number;
        ageMax?: number;
        size?: number;
        from?: string;
        sort?: string;
    }) => {
        return api.get<SearchResponse>('/dogs/search', { params });
    },
    getDogs: async (dogIds: string[]) => {
        return api.post<Dog[]>('/dogs', dogIds);
    },
    getMatch: async (dogIds: string[]) => {
        return api.post<Match>('/dogs/match', dogIds);
    },
};
