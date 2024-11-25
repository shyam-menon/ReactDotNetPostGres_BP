import axiosInstance from './api/axiosConfig';
import { AIToolUsage, AIToolUsageSummary, ProjectStats } from '../types/aiToolUsage';

const API_URL = '/api/AIToolUsage';

const handleApiError = (error: any) => {
    console.error('AIToolUsageService Error:', error);
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    } else if (error.response?.data) {
        throw new Error(typeof error.response.data === 'string' ? error.response.data : 'Server error');
    } else if (error.message) {
        throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while processing your request');
};

export const aiToolUsageService = {
    async getUsageData(): Promise<AIToolUsage[]> {
        try {
            console.log('Fetching usage data...');
            const response = await axiosInstance.get<AIToolUsage[]>(`${API_URL}/usage`);
            console.log('Usage data response:', response.data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async getUsageSummary(): Promise<AIToolUsageSummary> {
        try {
            console.log('Fetching usage summary...');
            const response = await axiosInstance.get<AIToolUsageSummary>(`${API_URL}/summary`);
            console.log('Usage summary response:', response.data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async getProjectStats(): Promise<ProjectStats[]> {
        try {
            console.log('Fetching project stats...');
            const response = await axiosInstance.get<ProjectStats[]>(`${API_URL}/projects`);
            console.log('Project stats response:', response.data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async addUsageData(usageData: AIToolUsage): Promise<AIToolUsage> {
        try {
            console.log('Adding usage data:', usageData);
            const response = await axiosInstance.post<AIToolUsage>(`${API_URL}/usage`, usageData);
            console.log('Add usage data response:', response.data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
