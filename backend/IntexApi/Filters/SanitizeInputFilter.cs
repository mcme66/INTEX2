using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc.Filters;

namespace IntexApi.Filters;

/// <summary>
/// Global action filter that strips HTML/script tags from every incoming
/// string property on controller action arguments, preventing stored-XSS.
/// EF parameterisation already handles SQL injection; this covers the XSS gap.
/// </summary>
public sealed partial class SanitizeInputFilter : IActionFilter
{
    [GeneratedRegex(@"<[^>]*>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();

    public void OnActionExecuting(ActionExecutingContext context)
    {
        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg is null) continue;
            SanitizeObject(arg);
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }

    private static void SanitizeObject(object obj)
    {
        var type = obj.GetType();

        if (type == typeof(string) || type.IsPrimitive || type.IsEnum)
            return;

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanRead) continue;

            if (prop.PropertyType == typeof(string) && prop.CanWrite)
            {
                var value = (string?)prop.GetValue(obj);
                if (value is not null)
                {
                    var sanitized = HtmlTagRegex().Replace(value, string.Empty).Trim();
                    prop.SetValue(obj, sanitized);
                }
            }
            else if (!prop.PropertyType.IsPrimitive
                     && prop.PropertyType != typeof(decimal)
                     && prop.PropertyType != typeof(DateTime)
                     && prop.PropertyType != typeof(DateOnly)
                     && prop.PropertyType != typeof(Guid)
                     && !prop.PropertyType.IsEnum
                     && prop.PropertyType != typeof(string))
            {
                var child = prop.GetValue(obj);
                if (child is not null)
                    SanitizeObject(child);
            }
        }
    }
}
