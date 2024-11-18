export interface AIToolUsage {
    toolName: string;
    usageDate: string;
    usageCount: number;
    averageResponseTime: number;
    successfulRequests: number;
    failedRequests: number;
    projectName: string;
    sprintName: string;
    tokensUsed: number;
    estimatedCost: number;
}

export interface AIToolUsageSummary {
    monthlyData: {
        toolName: string;
        totalUsage: number;
        averageResponseTime: number;
        successRate: number;
        totalTokens: number;
        totalCost: number;
    }[];
    totalRequests: number;
    totalCost: number;
    averageSuccessRate: number;
}

export interface ProjectStats {
    projectName: string;
    totalUsage: number;
    totalCost: number;
    toolBreakdown: {
        toolName: string;
        usage: number;
    }[];
}
