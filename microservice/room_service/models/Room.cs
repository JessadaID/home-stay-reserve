using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace room_service.models;

public class Room
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    public int Size { get; set; }
    public List<string> Amenities { get; set; } = new List<string>();
    public List<string> Images { get; set; } = new List<string>();
    public string Payment_option { get; set; } = string.Empty;
    public int Deposit_percentage { get; set; }

    // Soft delete: null = active, datetime = deleted
    public DateTime? Deleted_at { get; set; } = null;
}