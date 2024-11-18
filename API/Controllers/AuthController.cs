using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IConfiguration configuration, IUserService userService, ILogger<AuthController> logger)
        {
            _configuration = configuration;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterRequest request)
        {
            _logger.LogInformation($"Registration attempt for username: {request.Username}");

            if (await _userService.UsernameExists(request.Username))
            {
                _logger.LogWarning($"Registration failed: Username '{request.Username}' already exists");
                return BadRequest("Username is already taken");
            }

            try
            {
                var user = await _userService.CreateUser(request);
                _logger.LogInformation($"User registered successfully: {user.Username}");
                return Ok(new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Role = user.Role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during registration for username: {request.Username}");
                return StatusCode(500, "An error occurred during registration");
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            _logger.LogInformation($"Login attempt for username: {request.Username}");

            try
            {
                var user = await _userService.ValidateUser(request.Username, request.Password);
                if (user == null)
                {
                    _logger.LogWarning($"Login failed: Invalid credentials for username: {request.Username}");
                    return Unauthorized("Invalid username or password");
                }

                var token = GenerateJwtToken(user);
                _logger.LogInformation($"Login successful for username: {request.Username}");

                return Ok(new LoginResponse
                {
                    Token = token,
                    User = new UserDto
                    {
                        UserId = user.UserId,
                        Username = user.Username,
                        Role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during login for username: {request.Username}");
                return StatusCode(500, "An error occurred during login");
            }
        }

        private string GenerateJwtToken(User user)
        {
            try
            {
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found"));
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                        new Claim(ClaimTypes.Name, user.Username),
                        new Claim(ClaimTypes.Role, user.Role)
                    }),
                    Expires = DateTime.UtcNow.AddDays(7),
                    Issuer = _configuration["Jwt:Issuer"],
                    Audience = _configuration["Jwt:Audience"],
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                _logger.LogInformation($"JWT token generated for user: {user.Username}");
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating JWT token for user: {user.Username}");
                throw;
            }
        }

        [Authorize]
        [HttpGet("current")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    _logger.LogWarning("GetCurrentUser: User ID claim not found or invalid");
                    return Unauthorized();
                }

                var user = await _userService.GetUserById(userGuid);
                if (user == null)
                {
                    _logger.LogWarning($"GetCurrentUser: User not found for ID: {userGuid}");
                    return NotFound();
                }

                _logger.LogInformation($"Current user info retrieved for ID: {userGuid}");
                return Ok(new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Role = user.Role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCurrentUser");
                return StatusCode(500, "An error occurred while retrieving user information");
            }
        }
    }
}
