// squad_server_/src/services/analyticsService.ts
import ApiCallLog from '../models/apiCallLogModel';

class AnalyticsService {
  /**
   * Aggregates token usage data, grouping it by agent and provider.
   * @param userId - The ID of the user requesting the data.
   */
  public static async getTokenUsage(userId: string) {
    try {
      // Use the MongoDB Aggregation Pipeline to process the data
      const tokenUsage = await ApiCallLog.aggregate([
        // 1. Match only the logs for the requesting user
        {
          $match: { owner: userId },
        },
        // 2. Group by the UserAgent ID and Provider
        {
          $group: {
            _id: {
              userAgent: '$userAgent',
              provider: '$provider',
            },
            totalPromptTokens: { $sum: '$promptTokens' },
            totalCompletionTokens: { $sum: '$completionTokens' },
            totalTokens: { $sum: '$totalTokens' },
            totalCalls: { $sum: 1 }, // Count the number of calls
          },
        },
        // 3. Join with the useragents collection to get the agent's name
        {
          $lookup: {
            from: 'useragents',
            localField: '_id.userAgent',
            foreignField: '_id',
            as: 'agentDetails',
          },
        },
        // 4. Clean up the output for a clean API response
        {
          $project: {
            _id: 0,
            agentName: { $arrayElemAt: ['$agentDetails.customName', 0] },
            provider: '$_id.provider',
            totalPromptTokens: 1,
            totalCompletionTokens: 1,
            totalTokens: 1,
            totalCalls: 1,
          },
        },
      ]);
      return tokenUsage;
    } catch (error) {
      console.error('Error fetching token usage:', error);
      throw new Error('Could not retrieve token usage data.');
    }
  }
}

export default AnalyticsService;