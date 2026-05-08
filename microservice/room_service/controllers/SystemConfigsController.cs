using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using room_service.data;
using room_service.models;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace room_service.Controllers;

[ApiController]
[Route("api/config")]
[Authorize(Roles = "admin")]
public class SystemConfigsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SystemConfigsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetConfig()
    {
        // Get all configs and map to a dictionary like the legacy backend
        var configs = await _context.System_Configs.ToListAsync();
        var configMap = configs.ToDictionary(c => c.Config_key, c => c.Config_value);
        return Ok(configMap);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateConfig([FromBody] Dictionary<string, string> updates)
    {
        if (updates == null || updates.Count == 0)
        {
            return BadRequest(new { message = "No configuration provided" });
        }

        foreach (var entry in updates)
        {
            var config = await _context.System_Configs
                .FirstOrDefaultAsync(c => c.Config_key == entry.Key);

            if (config != null)
            {
                config.Config_value = entry.Value;
                _context.Entry(config).State = EntityState.Modified;
            }
            else
            {
                // Create if doesn't exist
                _context.System_Configs.Add(new System_Config 
                { 
                    Config_key = entry.Key, 
                    Config_value = entry.Value 
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Configuration updated" });
    }
}
