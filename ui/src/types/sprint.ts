export enum SprintStatus {
    Planned = 'Planned',
    Active = 'Active',
    Completed = 'Completed'
}

export interface Sprint {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: SprintStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSprintRequest {
    name: string;
    startDate: string;
    endDate: string;
}

export interface SprintTask {
    id: string;
    sprintId: string;
    taskName: string;
    aiToolUsed: string;
    timeSpent: number;
    completedAt: string;
}

export interface SprintSummary {
    totalTasks: number;
    totalTimeSpent: number;
    aiToolUsage: {
        toolName: string;
        taskCount: number;
        totalTimeSpent: number;
    }[];
}
