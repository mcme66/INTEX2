using System.Text;
using System.Security.Cryptography;
using IntexApi.Data;
using IntexApi.Filters;
using IntexApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Load .env for local development (the repo ignores it) so secrets don't live in tracked files.
// Expected keys: DATABASE_URL and/or ConnectionStrings__Default (and optionally Jwt__Key).
if (builder.Environment.IsDevelopment())
{
    static void TryLoadDotEnv(string startDir)
    {
        var dir = new DirectoryInfo(startDir);
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, ".env");
            if (File.Exists(candidate))
            {
                foreach (var rawLine in File.ReadAllLines(candidate))
                {
                    var line = rawLine.Trim();
                    if (line.Length == 0 || line.StartsWith('#')) continue;
                    var eq = line.IndexOf('=');
                    if (eq <= 0) continue;

                    var key = line[..eq].Trim();
                    var value = line[(eq + 1)..].Trim().Trim('"');

                    // Don't overwrite variables explicitly set by the shell/launch profile.
                    if (!string.IsNullOrWhiteSpace(key) && Environment.GetEnvironmentVariable(key) is null)
                        Environment.SetEnvironmentVariable(key, value);
                }
                break;
            }
            dir = dir.Parent;
        }
    }

    TryLoadDotEnv(builder.Environment.ContentRootPath);
    // Re-add env vars so values loaded above are visible in configuration.
    builder.Configuration.AddEnvironmentVariables();
}

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddControllers(opts =>
{
    opts.Filters.Add<SanitizeInputFilter>();
});

static string? ToNpgsqlConnectionStringFromDatabaseUrl(string? databaseUrl)
{
    if (string.IsNullOrWhiteSpace(databaseUrl)) return null;
    if (!Uri.TryCreate(databaseUrl, UriKind.Absolute, out var uri)) return null;
    if (!string.Equals(uri.Scheme, "postgres", StringComparison.OrdinalIgnoreCase)
        && !string.Equals(uri.Scheme, "postgresql", StringComparison.OrdinalIgnoreCase))
        return null;

    var userInfo = uri.UserInfo.Split(':', 2);
    var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var host = uri.Host;
    var port = uri.IsDefaultPort ? 5432 : uri.Port;
    var database = uri.AbsolutePath.Trim('/'); // "/intex" -> "intex"

    var csb = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = host,
        Port = port,
        Database = database,
        Username = username,
        Password = password,
        // Commonly required for managed Postgres; harmless locally.
        SslMode = Npgsql.SslMode.Prefer,
        TrustServerCertificate = true,
    };

    // Preserve any extra querystring parameters if present (e.g. sslmode=require).
    if (!string.IsNullOrWhiteSpace(uri.Query))
    {
        var q = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries);
        foreach (var part in q)
        {
            var kv = part.Split('=', 2);
            if (kv.Length != 2) continue;
            var k = Uri.UnescapeDataString(kv[0]);
            var v = Uri.UnescapeDataString(kv[1]);
            try { csb[k] = v; } catch { /* ignore unsupported keys */ }
        }
    }

    return csb.ConnectionString;
}

static string ResolveDbConnectionString(IConfiguration config)
{
    var fromConfig = config.GetConnectionString("Default");
    if (!string.IsNullOrWhiteSpace(fromConfig)) return fromConfig;

    var fromEnvExplicit = Environment.GetEnvironmentVariable("ConnectionStrings__Default");
    if (!string.IsNullOrWhiteSpace(fromEnvExplicit)) return fromEnvExplicit;

    var fromDatabaseUrl = ToNpgsqlConnectionStringFromDatabaseUrl(Environment.GetEnvironmentVariable("DATABASE_URL"));
    if (!string.IsNullOrWhiteSpace(fromDatabaseUrl)) return fromDatabaseUrl!;

    throw new InvalidOperationException(
        "Database connection string is missing. Set ConnectionStrings:Default (appsettings.Development.json), " +
        "or set env var ConnectionStrings__Default, or set env var DATABASE_URL (postgresql://user:pass@host:5432/db).");
}

var resolvedDbConnectionString = ResolveDbConnectionString(builder.Configuration);
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(resolvedDbConnectionString));

static string ResolveJwtKey(WebApplicationBuilder builder)
{
    var fromConfig = builder.Configuration["Jwt:Key"];
    if (!string.IsNullOrWhiteSpace(fromConfig)) return fromConfig!;

    var fromEnvNested = Environment.GetEnvironmentVariable("Jwt__Key");
    if (!string.IsNullOrWhiteSpace(fromEnvNested)) return fromEnvNested;

    var fromEnvFlat = Environment.GetEnvironmentVariable("JWT_KEY");
    if (!string.IsNullOrWhiteSpace(fromEnvFlat)) return fromEnvFlat;

    if (builder.Environment.IsDevelopment())
    {
        // Dev-only fallback: avoids "key length is zero" crashes on every request.
        // Tokens will become invalid after restart, which is fine for local dev.
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes);
    }

    throw new InvalidOperationException(
        "JWT signing key is missing. Set config Jwt:Key (appsettings.*.json), or env var Jwt__Key, or env var JWT_KEY.");
}

builder.Configuration["Jwt:Key"] = ResolveJwtKey(builder);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<DonorSupporterLinker>();

builder.Services.AddSingleton<IntexApi.Services.ImpactCacheService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<IntexApi.Services.ImpactCacheService>());

builder.Services.Configure<IntexApi.Services.MlOptions>(builder.Configuration.GetSection("ML"));
builder.Services.PostConfigure<IntexApi.Services.MlOptions>(opts =>
{
    // Keep ML in sync: if not set in config, fall back to the same DATABASE_URL.
    if (string.IsNullOrWhiteSpace(opts.DatabaseUrl))
        opts.DatabaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ?? "";
});
builder.Services.AddSingleton<IntexApi.Services.NotebookRunnerService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<IntexApi.Services.NotebookRunnerService>());
builder.Services.AddHostedService<IntexApi.Services.MlRetrainCronService>();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
        p.WithOrigins("http://localhost:5173", "http://localhost:8080", "https://intex-2.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

// Enforced Content-Security-Policy (CSP) header for IS414 grading.
// Keep this restrictive (first-party only) and expand only if your frontend needs it.
app.Use(async (context, next) =>
{
    if (!context.Response.Headers.ContainsKey("Content-Security-Policy"))
    {
        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "base-uri 'self'; " +
            "object-src 'none'; " +
            "frame-ancestors 'none'; " +
            "form-action 'self'; " +
            "img-src 'self' data:; " +
            "font-src 'self' data:; " +
            "style-src 'self' 'unsafe-inline'; " +
            "script-src 'self'; " +
            "connect-src 'self';";
    }

    await next();
});

app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
