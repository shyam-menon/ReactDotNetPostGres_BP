using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public class AIToolUsage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string ToolName { get; set; } = string.Empty;

        public DateTime UsageDate { get; set; } = DateTime.UtcNow;

        public int UsageCount { get; set; }

        public double AverageResponseTime { get; set; } // in seconds

        public int SuccessfulRequests { get; set; }

        public int FailedRequests { get; set; }

        [Required]
        [MaxLength(100)]
        public string ProjectName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string SprintName { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public double TokensUsed { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EstimatedCost { get; set; }
    }

    public class AIToolUsageDTO
    {
        public string ToolName { get; set; } = string.Empty;
        public DateTime UsageDate { get; set; }
        public int UsageCount { get; set; }
        public double AverageResponseTime { get; set; }
        public int SuccessfulRequests { get; set; }
        public int FailedRequests { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string SprintName { get; set; } = string.Empty;
        public double TokensUsed { get; set; }
        public decimal EstimatedCost { get; set; }
    }
}
