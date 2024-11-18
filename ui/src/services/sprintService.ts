import axios from 'axios';
import { Sprint, CreateSprintRequest, SprintTask, SprintSummary } from '../types/sprint';

const BASE_URL = '/api/sprints';

class SprintService {
    async getAllSprints(): Promise<Sprint[]> {
        const response = await axios.get<Sprint[]>(BASE_URL);
        return response.data;
    }

    async getSprint(id: string): Promise<Sprint> {
        const response = await axios.get<Sprint>(`${BASE_URL}/${id}`);
        return response.data;
    }

    async createSprint(sprint: CreateSprintRequest): Promise<Sprint> {
        const response = await axios.post<Sprint>(BASE_URL, sprint);
        return response.data;
    }

    async updateSprint(id: string, sprint: Partial<Sprint>): Promise<Sprint> {
        const response = await axios.put<Sprint>(`${BASE_URL}/${id}`, sprint);
        return response.data;
    }

    async deleteSprint(id: string): Promise<void> {
        await axios.delete(`${BASE_URL}/${id}`);
    }

    async uploadSprintTasks(sprintId: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${BASE_URL}/${sprintId}/tasks`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async getSprintTasks(sprintId: string): Promise<SprintTask[]> {
        const response = await axios.get<SprintTask[]>(`${BASE_URL}/${sprintId}/tasks`);
        return response.data;
    }

    async getSprintSummary(sprintId: string): Promise<SprintSummary> {
        const response = await axios.get<SprintSummary>(`${BASE_URL}/${sprintId}/summary`);
        return response.data;
    }
}

export const sprintService = new SprintService();
