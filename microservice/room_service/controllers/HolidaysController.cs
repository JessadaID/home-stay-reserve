using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using room_service.data;
using room_service.models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace room_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HolidaysController : ControllerBase
{
    private readonly AppDbContext _context;

    public HolidaysController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetHolidays()
    {
        // Get all holidays ordered by date
        var holidays = await _context.Holidays
            .OrderBy(h => h.Holiday_date)
            .ToListAsync();
        return Ok(holidays);
    }

    [HttpPost]
    public async Task<IActionResult> AddHoliday([FromBody] Holiday holiday)
    {
        if (holiday.Holiday_date == default)
        {
            return BadRequest(new { message = "holiday_date is required" });
        }

        // Check if holiday already exists for this date
        var existing = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Holiday_date.Date == holiday.Holiday_date.Date);
        
        if (existing != null)
        {
            return BadRequest(new { message = "Holiday already exists for this date" });
        }

        _context.Holidays.Add(holiday);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHolidays), new { id = holiday.Id }, holiday);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHoliday(int id)
    {
        var holiday = await _context.Holidays.FindAsync(id);
        if (holiday == null)
        {
            return NotFound(new { message = "Holiday not found" });
        }

        _context.Holidays.Remove(holiday);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Holiday removed successfully" });
    }
}
