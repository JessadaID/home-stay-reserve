using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace room_service.models;

public class RoomDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    public int Size { get; set; }
    public string? Amenities { get; set; }
    public string? Payment_option { get; set; }
    public int? Deposit_percentage { get; set; }
    
    // For handling multiple image file uploads
    public List<IFormFile>? Images { get; set; }

    // For retaining existing images when updating
    public string? ExistingImages { get; set; }
}
