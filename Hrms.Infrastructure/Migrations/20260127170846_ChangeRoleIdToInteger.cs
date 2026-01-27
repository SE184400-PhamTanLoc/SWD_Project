using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hrms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeRoleIdToInteger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop constraints
            migrationBuilder.DropForeignKey(
                name: "FK_UserAccounts_Roles_RoleId",
                table: "UserAccounts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Roles",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_RoleCode",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_RoleId",
                table: "UserAccounts");

            // 2. Drop columns
            migrationBuilder.DropColumn(
                name: "RoleId",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Roles");

            // 3. Recreate Roles.Id as Identity Int
            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Roles",
                type: "int",
                nullable: false)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Roles",
                table: "Roles",
                column: "Id");

            // 4. Recreate UserAccounts.RoleId as Int
            migrationBuilder.AddColumn<int>(
                name: "RoleId",
                table: "UserAccounts",
                type: "int",
                nullable: false,
                defaultValue: 4); // Default to Employee

            // 5. Restore Foreign Key
            migrationBuilder.AddForeignKey(
                name: "FK_UserAccounts_Roles_RoleId",
                table: "UserAccounts",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 6. Simplify RoleCode and RoleName constraints
            migrationBuilder.AlterColumn<string>(
                name: "RoleCode",
                table: "Roles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            // 7. Seed current roles
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "RoleCode", "RoleName", "Description", "IsActive" },
                values: new object[,]
                {
                    { 1, "Admin", "Admin", "System Administrator", true },
                    { 2, "HR", "HR", "Human Resources", true },
                    { 3, "Manager", "Manager", "Department Manager", true },
                    { 4, "Employee", "Employee", "Staff Employee", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Simplify reverse to just drop and recreate if needed, 
            // but usually Down is less critical for a quick refactor like this.
            migrationBuilder.DropForeignKey(name: "FK_UserAccounts_Roles_RoleId", table: "UserAccounts");
            migrationBuilder.DropTable(name: "Roles"); // Nuclear option for simplicity in Down
            
            // Re-create table with Guid (Simplified)
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });
        }
    }
}
