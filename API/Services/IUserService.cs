using API.Models;

namespace API.Services
{
    public interface IUserService
    {
        Task<User> CreateUser(RegisterRequest request);
        Task<User?> ValidateUser(string username, string password);
        Task<bool> UsernameExists(string username);
        Task<User?> GetUserById(Guid userId);
        Task UpdateLastLogin(Guid userId);
    }
}
