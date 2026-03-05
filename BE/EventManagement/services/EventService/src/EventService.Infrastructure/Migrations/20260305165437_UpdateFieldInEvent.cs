using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFieldInEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "banner_url",
                table: "Event",
                newName: "ticket_map_url");

            migrationBuilder.AddColumn<string>(
                name: "TicketMapUrl",
                table: "Event",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TicketMapUrl",
                table: "Event");

            migrationBuilder.RenameColumn(
                name: "ticket_map_url",
                table: "Event",
                newName: "banner_url");
        }
    }
}
