using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AIToolUsageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AIToolUsageController> _logger;

        public AIToolUsageController(ApplicationDbContext context, ILogger<AIToolUsageController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            _logger.LogInformation($"Claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}"))}");

            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userIdGuid))
            {
                _logger.LogWarning("User ID not found in token or invalid format");
                throw new UnauthorizedAccessException("User ID not found in token");
            }

            return userIdGuid;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AIToolUsageDTO>>> GetUsageData()
        {
            try
            {
                _logger.LogInformation("GetUsageData called");
                var userId = GetUserId();
                _logger.LogInformation($"Fetching usage data for user {userId}");

                var usageData = await _context.AIToolUsages
                    .Where(u => u.UserId == userId)
                    .OrderByDescending(u => u.UsageDate)
                    .Take(100)
                    .Select(u => new AIToolUsageDTO
                    {
                        ToolName = u.ToolName,
                        UsageDate = u.UsageDate,
                        UsageCount = u.UsageCount,
                        AverageResponseTime = u.AverageResponseTime,
                        SuccessfulRequests = u.SuccessfulRequests,
                        FailedRequests = u.FailedRequests,
                        ProjectName = u.ProjectName,
                        SprintName = u.SprintName,
                        TokensUsed = u.TokensUsed,
                        EstimatedCost = u.EstimatedCost
                    })
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {usageData.Count} usage records for user {userId}");
                return Ok(usageData);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access in GetUsageData");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUsageData");
                return StatusCode(500, "An error occurred while retrieving usage data");
            }
        }

        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetUsageSummary()
        {
            try
            {
                _logger.LogInformation("GetUsageSummary called");
                var userId = GetUserId();
                _logger.LogInformation($"Fetching usage summary for user {userId}");

                var today = DateTime.UtcNow.Date;
                var lastMonth = today.AddMonths(-1);

                var monthlyData = await _context.AIToolUsages
                    .Where(u => u.UserId == userId && u.UsageDate >= lastMonth)
                    .GroupBy(u => u.ToolName)
                    .Select(g => new
                    {
                        ToolName = g.Key,
                        TotalUsage = g.Sum(u => u.UsageCount),
                        AverageResponseTime = g.Average(u => u.AverageResponseTime),
                        SuccessRate = g.Sum(u => u.SuccessfulRequests) * 100.0 / (g.Sum(u => u.SuccessfulRequests) + g.Sum(u => u.FailedRequests)),
                        TotalTokens = g.Sum(u => u.TokensUsed),
                        TotalCost = g.Sum(u => u.EstimatedCost)
                    })
                    .ToListAsync();

                _logger.LogInformation($"Retrieved usage summary for user {userId}");
                return Ok(new
                {
                    MonthlyData = monthlyData,
                    TotalRequests = monthlyData.Sum(d => d.TotalUsage),
                    TotalCost = monthlyData.Sum(d => d.TotalCost),
                    AverageSuccessRate = monthlyData.Any()
                        ? monthlyData.Average(d => d.SuccessRate)
                        : 0
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access in GetUsageSummary");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUsageSummary");
                return StatusCode(500, "An error occurred while retrieving usage summary");
            }
        }

        [HttpGet("projects")]
        public async Task<ActionResult<object>> GetProjectStats()
        {
            try
            {
                _logger.LogInformation("GetProjectStats called");
                var userId = GetUserId();
                _logger.LogInformation($"Fetching project stats for user {userId}");

                var projectStats = await _context.AIToolUsages
                    .Where(u => u.UserId == userId)
                    .GroupBy(u => u.ProjectName)
                    .Select(g => new
                    {
                        ProjectName = g.Key,
                        TotalUsage = g.Sum(u => u.UsageCount),
                        TotalCost = g.Sum(u => u.EstimatedCost),
                        ToolBreakdown = g.GroupBy(u => u.ToolName)
                            .Select(t => new
                            {
                                ToolName = t.Key,
                                Usage = t.Sum(u => u.UsageCount)
                            })
                    })
                    .ToListAsync();

                _logger.LogInformation($"Retrieved project stats for user {userId}");
                return Ok(projectStats);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access in GetProjectStats");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProjectStats");
                return StatusCode(500, "An error occurred while retrieving project statistics");
            }
        }

        [HttpPost]
        public async Task<ActionResult<AIToolUsageDTO>> AddUsageData(AIToolUsageDTO usageData)
        {
            try
            {
                _logger.LogInformation("AddUsageData called");
                var userId = GetUserId();
                _logger.LogInformation($"Adding usage data for user {userId}");

                var usage = new AIToolUsage
                {
                    UserId = userId,
                    ToolName = usageData.ToolName,
                    UsageDate = usageData.UsageDate,
                    UsageCount = usageData.UsageCount,
                    AverageResponseTime = usageData.AverageResponseTime,
                    SuccessfulRequests = usageData.SuccessfulRequests,
                    FailedRequests = usageData.FailedRequests,
                    ProjectName = usageData.ProjectName,
                    SprintName = usageData.SprintName,
                    TokensUsed = usageData.TokensUsed,
                    EstimatedCost = usageData.EstimatedCost
                };

                _context.AIToolUsages.Add(usage);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Added usage data for user {userId}");
                return Ok(usageData);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access in AddUsageData");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddUsageData");
                return StatusCode(500, "An error occurred while adding usage data");
            }
        }
    }
}
