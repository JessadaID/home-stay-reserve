using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace room_service.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToRooms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Deleted_at",
                table: "Rooms",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Deleted_at",
                table: "Rooms");
        }
    }
}
