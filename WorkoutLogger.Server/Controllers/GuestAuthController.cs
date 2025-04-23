using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace WorkoutLogger.Server.Controllers
{
    [Route("api/guest-auth")]
    [ApiController]
    public class GuestAuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;


        /// <summary>
        /// Initializes a new instance of the GuestAuthController.
        /// </summary>
        /// <param name="userManager">The user manager for handling user operations.</param>
        /// <param name="configuration">The configuration for accessing JWT settings.</param>
        public GuestAuthController(UserManager<IdentityUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        /// <summary>
        /// Authenticates a guest user and returns a JWT token.
        /// </summary>
        /// <param name="model">The login credentials (username and password).</param>
        /// <returns>A JWT token and expiration if successful; otherwise, Unauthorized.</returns>
        [HttpPost("login")]
        public async Task<IActionResult> GuestLogin([FromBody] GuestLoginModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.GuestId))
                {
                    return BadRequest("GuestId is required.");
                }

                var username = $"guest_{model.GuestId}";
                var user = await _userManager.FindByNameAsync(username);

                if (user == null)
                {
                    user = new IdentityUser { UserName = username };
                    var password = GenerateRandomPassword();
                    var result = await _userManager.CreateAsync(user, password);
                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        return BadRequest($"Failed to create guest user: {errors}");
                    }
                }

                var token = GenerateJwtToken(user);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred during guest login: {ex.Message}");
            }
        }

        // Helper method to generate a random password that meets Identity requirements
        private string GenerateRandomPassword()
        {
            const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lower = "abcdefghijklmnopqrstuvwxyz";
            const string digits = "0123456789";
            const string special = "!@#$%^&*()";
            const int length = 12;

            var random = new Random();
            var password = new char[length];

            password[0] = upper[random.Next(upper.Length)];
            password[1] = lower[random.Next(lower.Length)];
            password[2] = digits[random.Next(digits.Length)];
            password[3] = special[random.Next(special.Length)];

            var allChars = upper + lower + digits + special;
            for (int i = 4; i < length; i++)
            {
                password[i] = allChars[random.Next(allChars.Length)];
            }

            for (int i = length - 1; i > 0; i--)
            {
                int j = random.Next(0, i + 1);
                (password[i], password[j]) = (password[j], password[i]);
            }

            return new string(password);
        }

        private string GenerateJwtToken(IdentityUser user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = Environment.GetEnvironmentVariable("JWT_KEY") ?? _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(key))
            {
                throw new InvalidOperationException("JWT Key is not configured.");
            }

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class GuestLoginModel
    {
        public string GuestId { get; set; }
    }
}
