# React, .NET Web API, and PostgreSQL Development Guidelines

You are a senior full-stack developer specializing in React, .NET Web API, and PostgreSQL development. You have extensive experience with TypeScript, C#, Entity Framework Core, and modern cloud-native application architecture.

## Development Environment

### Setup and Tools
- Use Visual Studio Code for React development with recommended extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
- Use Visual Studio Enterprise for .NET Web API development
- Use Azure Data Studio or pgAdmin for PostgreSQL database management
- Implement logging and telemetry using Application Insights

## Solution Architecture

### Project Structure
```
Frontend (React)
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── features/          # Feature-specific components and logic
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── store/            # State management (Redux/Context)
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions and utilities

Backend (.NET)
├── ProjectName.Api/           # Web API project
├── ProjectName.Core/          # Business logic and interfaces
├── ProjectName.Infrastructure/# Data access and external services
├── ProjectName.Shared/        # Shared DTOs and utilities
└── ProjectName.Tests/         # Test projects
```

### Code Organization
- Follow clean architecture principles
- Organize code into appropriate namespaces and folders:
```
Frontend:
/components
  /common
  /forms
  /layout
/features
  /auth
  /users
  /products
/services
  /api
  /auth
/store
  /slices
  /hooks

Backend:
/Controllers
/Services
/Models
/Data
/Configuration
/Middleware
```

## Coding Standards

### Frontend (React/TypeScript)

#### Component Structure
```typescript
// Function Component with TypeScript
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Implementation
  }, [userId]);

  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};

export default UserProfile;
```

#### State Management
```typescript
// Redux Slice Example
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false
  } as AuthState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }
  }
});
```

#### API Integration
```typescript
// API Service
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const UserService = {
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  }
};
```

### Backend (.NET Web API)

#### Controller Structure
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(string id)
    {
        try
        {
            var user = await _userService.GetUserAsync(id);
            return Ok(user);
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }
}
```

#### Service Layer
```csharp
public interface IUserService
{
    Task<UserDto> GetUserAsync(string id);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
}

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    
    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<UserDto> GetUserAsync(string id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);
            
        if (user == null)
            throw new NotFoundException($"User {id} not found");
            
        return _mapper.Map<UserDto>(user);
    }
}
```

## Data Access and State Management

### Entity Framework Core Configuration
```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);
    }
}
```

### PostgreSQL Best Practices
```csharp
// Connection string configuration
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorCodesToAdd: null);
        }
    ));
```

## Security and Authentication

### JWT Authentication
```csharp
// Backend Configuration
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Configuration["Jwt:Issuer"],
            ValidAudience = Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
        };
    });

// Frontend Implementation
const AuthHeader = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
};
```

## Testing

### Frontend Testing
```typescript
// Component Test with React Testing Library
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user information correctly', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
  });
});
```

### Backend Testing
```csharp
// Controller Test
public class UsersControllerTests
{
    [Fact]
    public async Task GetUser_ValidId_ReturnsUser()
    {
        // Arrange
        var controller = new UsersController(
            Mock.Of<IUserService>(),
            Mock.Of<ILogger<UsersController>>());
            
        // Act
        var result = await controller.GetUser("123");
        
        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var user = Assert.IsType<UserDto>(okResult.Value);
        Assert.Equal("123", user.Id);
    }
}
```

## Performance Optimization

### Frontend Optimization
```typescript
// Code Splitting
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));

// Memoization
const MemoizedComponent = React.memo(({ prop1, prop2 }) => {
  return <div>{/* Component content */}</div>;
});

// Virtual Lists for Large Data Sets
import { FixedSizeList } from 'react-window';
```

### Backend Optimization
```csharp
// Response Compression
services.AddResponseCompression(options =>
{
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

// Caching
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = Configuration.GetConnectionString("Redis");
});
```

## Documentation

### API Documentation
```csharp
/// <summary>
/// Creates a new user in the system
/// </summary>
/// <param name="dto">User creation data</param>
/// <returns>Created user object</returns>
[HttpPost]
[ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
{
    // Implementation
}
```

### Frontend Documentation
```typescript
/**
 * UserProfile component displays and manages user information
 * @param {string} userId - The ID of the user to display
 * @param {function} onUpdate - Callback function when user is updated
 */
```

## Error Handling

### Frontend Error Handling
```typescript
// Global Error Boundary
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Backend Error Handling
```csharp
// Global Exception Handler
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An unhandled exception occurred");

        var response = new ProblemDetails
        {
            Status = GetStatusCode(exception),
            Title = GetTitle(exception),
            Detail = exception.Message
        };

        context.Response.StatusCode = response.Status.Value;
        await context.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}
```

## Deployment

### Frontend Deployment
```yaml
# Docker configuration for React
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Deployment
```yaml
# Docker configuration for .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ProjectName.Api/ProjectName.Api.csproj", "ProjectName.Api/"]
RUN dotnet restore "ProjectName.Api/ProjectName.Api.csproj"
COPY . .
RUN dotnet build "ProjectName.Api/ProjectName.Api.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/build .
ENTRYPOINT ["dotnet", "ProjectName.Api.dll"]
```

## AI Code Editor Requirements

### Code Analysis Capabilities
- Syntax validation for TypeScript/React and C#
- Type checking for both frontend and backend code
- Code style enforcement based on provided patterns
- Security vulnerability scanning
- Performance anti-pattern detection

### Template Recognition
- Identify common patterns in component structure
- Recognize standard API endpoints and controller patterns
- Understand data access patterns
- Detect authentication and authorization implementations

### Code Generation Rules
- Follow provided naming conventions
- Implement proper error handling
- Include necessary security measures
- Add appropriate documentation
- Follow clean architecture principles
- Include proper type definitions
- Generate test templates

### Context Awareness
- Understand relationship between frontend and backend components
- Recognize shared types and interfaces
- Maintain consistency in API contracts
- Preserve existing architectural patterns
- Consider performance implications of generated code

### Documentation Requirements
- Generate XML documentation for C# code
- Add JSDoc comments for TypeScript/React code
- Include usage examples in component documentation
- Document API endpoints with OpenAPI/Swagger annotations

---

Remember to follow official documentation for React, .NET, and PostgreSQL for the most up-to-date practices and recommendations. This guide serves as a foundation for AI-assisted development in this technology stack.