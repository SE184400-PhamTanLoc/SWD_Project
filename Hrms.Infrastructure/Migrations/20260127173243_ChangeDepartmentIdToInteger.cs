using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hrms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeDepartmentIdToInteger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop Foreign Keys
            migrationBuilder.DropForeignKey(name: "FK_Employees_Departments_DepartmentId", table: "Employees");
            migrationBuilder.DropForeignKey(name: "FK_ProductionLines_Departments_DepartmentId", table: "ProductionLines");
            migrationBuilder.DropForeignKey(name: "FK_Managements_Departments_DepartmentId", table: "Managements");

            // 2. Drop Indexes
            migrationBuilder.DropIndex(name: "IX_Employees_DepartmentId", table: "Employees");
            migrationBuilder.DropIndex(name: "IX_ProductionLines_DepartmentId", table: "ProductionLines");
            migrationBuilder.DropIndex(name: "IX_Managements_DepartmentId", table: "Managements");
            migrationBuilder.DropIndex(name: "IX_Departments_DepartmentCode", table: "Departments");

            // 3. Drop Primary Key
            migrationBuilder.DropPrimaryKey(name: "PK_Departments", table: "Departments");

            // 4. Drop Columns
            migrationBuilder.DropColumn(name: "DepartmentId", table: "Employees");
            migrationBuilder.DropColumn(name: "DepartmentId", table: "ProductionLines");
            migrationBuilder.DropColumn(name: "DepartmentId", table: "Managements");
            migrationBuilder.DropColumn(name: "Id", table: "Departments");

            // 5. Recreate Departments.Id as Identity Int
            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Departments",
                type: "int",
                nullable: false)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(name: "PK_Departments", table: "Departments", column: "Id");

            // 6. Recreate Foreign Key Columns
            migrationBuilder.AddColumn<int>(name: "DepartmentId", table: "Employees", type: "int", nullable: true);
            migrationBuilder.AddColumn<int>(name: "DepartmentId", table: "ProductionLines", type: "int", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<int>(name: "DepartmentId", table: "Managements", type: "int", nullable: false, defaultValue: 0);

            // 7. Restore Foreign Keys
            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Departments_DepartmentId",
                table: "Employees",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionLines_Departments_DepartmentId",
                table: "ProductionLines",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Managements_Departments_DepartmentId",
                table: "Managements",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 8. Restore Indexes
            migrationBuilder.CreateIndex(name: "IX_Employees_DepartmentId", table: "Employees", column: "DepartmentId");
            migrationBuilder.CreateIndex(name: "IX_ProductionLines_DepartmentId", table: "ProductionLines", column: "DepartmentId");
            migrationBuilder.CreateIndex(name: "IX_Managements_DepartmentId", table: "Managements", column: "DepartmentId");
            migrationBuilder.CreateIndex(name: "IX_Departments_DepartmentCode", table: "Departments", column: "DepartmentCode", unique: true);

            // 9. Seed Departments
            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "DepartmentCode", "Name", "Description" },
                values: new object[,]
                {
                    { 1, "IT", "Information Technology", "IT Department" },
                    { 2, "HR", "Human Resources", "HR Department" },
                    { 3, "PROD", "Production", "Production Department" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Simplified Down by dropping and recreating or just letting it be for now since it's a destructive refactor
            migrationBuilder.DropTable(name: "Managements");
            migrationBuilder.DropTable(name: "ProductionLines");
            migrationBuilder.DropTable(name: "Employees");
            migrationBuilder.DropTable(name: "Departments");
        }
    }
}
