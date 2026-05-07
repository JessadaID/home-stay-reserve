using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.IO;
using room_service.models;
using room_service.data;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authorization;

namespace room_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public RoomsController(AppDbContext context, IWebHostEnvironment environment, HttpClient httpClient, IConfiguration configuration)
    {
        _context = context;
        _environment = environment;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms(
        [FromQuery] int limit = 10,
        [FromQuery] int offset = 0,
        [FromQuery] int capacity = 0,
        [FromQuery] DateTime? checkin = null,
        [FromQuery] DateTime? checkout = null)
    {
        // Start building the query, exclude soft-deleted rooms
        var query = _context.Rooms.Where(r => r.Deleted_at == null).AsQueryable();

        // Filter by capacity
        if (capacity > 0)
        {
            query = query.Where(r => r.Capacity >= capacity);
        }

        // Filter by availability if checkin and checkout dates are provided
        if (checkin.HasValue && checkout.HasValue)
        {
            try
            {
                // Call legacy backend to get unavailable room IDs
                var legacyUrl = _configuration["LegacyBackendUrl"] ?? "http://localhost:3000";
                var checkinStr = checkin.Value.ToString("yyyy-MM-dd");
                var checkoutStr = checkout.Value.ToString("yyyy-MM-dd");
                
                var response = await _httpClient.GetAsync($"{legacyUrl}/api/bookings/unavailable-rooms?checkin={checkinStr}&checkout={checkoutStr}");
                
                if (response.IsSuccessStatusCode)
                {
                    var bookedRoomIds = await response.Content.ReadFromJsonAsync<List<int>>();
                    if (bookedRoomIds != null && bookedRoomIds.Count > 0)
                    {
                        query = query.Where(r => !bookedRoomIds.Contains(r.Id));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling legacy backend: {ex.Message}");
            }
        }

        // Apply pagination and execute query
        var rooms = await query
            .Skip(offset)
            .Take(limit)
            .ToListAsync();

        return Ok(rooms);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoom(int id)
    {
        // Find room that is not soft-deleted
        var room = await _context.Rooms
            .Where(r => r.Id == id && r.Deleted_at == null)
            .FirstOrDefaultAsync();
        if (room == null)
        {
            return NotFound(new {
                message = "Room not found"
            });
        }
        return Ok(room);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateRoom([FromForm] RoomDto roomDto)
    {
        List<string> imagePaths;
        try
        {
            imagePaths = await ProcessUploadedImagesAsync(roomDto.Images);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        var newRoom = new Room
        {
            Name = roomDto.Name ?? "",
            Description = roomDto.Description ?? "",
            Price = roomDto.Price,
            Capacity = roomDto.Capacity,
            Size = roomDto.Size,
            Amenities = string.IsNullOrEmpty(roomDto.Amenities) 
                ? new List<string>() 
                : JsonSerializer.Deserialize<List<string>>(roomDto.Amenities) ?? new List<string>(),
            Payment_option = roomDto.Payment_option ?? "",
            Deposit_percentage = roomDto.Deposit_percentage,
            Images = imagePaths
        };

        _context.Rooms.Add(newRoom);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRoom), new { id = newRoom.Id }, newRoom);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateRoom(int id, [FromForm] RoomDto roomDto)
    {
        var existingRoom = await _context.Rooms.FindAsync(id);
        if (existingRoom == null)
        {
            return NotFound(new { message = "Room not found" });
        }

        List<string> imagePaths;
        try
        {
            imagePaths = await ProcessUploadedImagesAsync(roomDto.Images);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        List<string> finalImages;
        if (imagePaths.Count > 0)
        {
            finalImages = imagePaths;
        }
        else if (!string.IsNullOrEmpty(roomDto.ExistingImages))
        {
            finalImages = JsonSerializer.Deserialize<List<string>>(roomDto.ExistingImages) ?? new List<string>();
        }
        else
        {
            finalImages = existingRoom.Images;
        }

        existingRoom.Name = roomDto.Name ?? existingRoom.Name;
        existingRoom.Description = roomDto.Description ?? existingRoom.Description;
        existingRoom.Price = roomDto.Price != 0 ? roomDto.Price : existingRoom.Price;
        existingRoom.Capacity = roomDto.Capacity != 0 ? roomDto.Capacity : existingRoom.Capacity;
        existingRoom.Size = roomDto.Size != 0 ? roomDto.Size : existingRoom.Size;
        existingRoom.Amenities = string.IsNullOrEmpty(roomDto.Amenities) 
            ? existingRoom.Amenities 
            : JsonSerializer.Deserialize<List<string>>(roomDto.Amenities) ?? existingRoom.Amenities;
        existingRoom.Payment_option = roomDto.Payment_option ?? existingRoom.Payment_option;
        existingRoom.Deposit_percentage = roomDto.Deposit_percentage != 0 ? roomDto.Deposit_percentage : existingRoom.Deposit_percentage;
        existingRoom.Images = finalImages;

        _context.Entry(existingRoom).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RoomExists(id))
            {
                return NotFound(new { message = "Room not found" });
            }
            else
            {
                throw;
            }
        }

        return Ok(existingRoom);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        // Find room that is not already soft-deleted
        var room = await _context.Rooms
            .Where(r => r.Id == id && r.Deleted_at == null)
            .FirstOrDefaultAsync();
        if (room == null)
        {
            return NotFound(new {
                message = "Room not found"
            });
        }

        // Soft delete: set deleted_at timestamp instead of removing the record
        room.Deleted_at = DateTime.UtcNow;
        _context.Entry(room).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RoomExists(int id)
    {
        // Check existence excluding soft-deleted rooms
        return _context.Rooms.Any(e => e.Id == id && e.Deleted_at == null);
    }

    private async Task<List<string>> ProcessUploadedImagesAsync(List<IFormFile>? images)
    {
        var imagePaths = new List<string>();

        if (images == null || images.Count == 0)
        {
            return imagePaths;
        }

        if (images.Count > 10)
        {
            throw new ArgumentException("Cannot upload more than 10 images.");
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var maxFileSize = 10 * 1024 * 1024; // 10 MB

        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        foreach (var file in images)
        {
            if (file.Length > maxFileSize)
            {
                throw new ArgumentException($"File {file.FileName} exceeds the maximum allowed size of 5MB.");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"Invalid file extension for {file.FileName}. Only JPG, PNG, and WEBP are allowed.");
            }

            var uniqueFileName = Guid.NewGuid().ToString("N") + extension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }
            imagePaths.Add($"/uploads/{uniqueFileName}");
        }

        return imagePaths;
    }
}