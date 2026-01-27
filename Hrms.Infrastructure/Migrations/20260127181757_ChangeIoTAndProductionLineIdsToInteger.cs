using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hrms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeIoTAndProductionLineIdsToInteger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop Foreign Keys
            migrationBuilder.DropForeignKey(name: "FK_AttendanceDeviceLogs_IoTDevices_DeviceId", table: "AttendanceDeviceLogs");
            migrationBuilder.DropForeignKey(name: "FK_IoTDevices_ProductionLines_LineId", table: "IoTDevices");

            // 1b. Drop Dependent Indexes
            migrationBuilder.DropIndex(name: "IX_AttendanceDeviceLogs_DeviceId", table: "AttendanceDeviceLogs");
            migrationBuilder.DropIndex(name: "IX_IoTDevices_LineId", table: "IoTDevices");

            // 2. Drop Primary Keys
            migrationBuilder.DropPrimaryKey(name: "PK_IoTDevices", table: "IoTDevices");
            migrationBuilder.DropPrimaryKey(name: "PK_ProductionLines", table: "ProductionLines");

            // 3. Drop existing columns
            migrationBuilder.DropColumn(name: "DeviceId", table: "AttendanceDeviceLogs");
            migrationBuilder.DropColumn(name: "LineId", table: "IoTDevices");
            migrationBuilder.DropColumn(name: "Id", table: "IoTDevices");
            migrationBuilder.DropColumn(name: "Id", table: "ProductionLines");

            // 4. Re-add columns as int
            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "ProductionLines",
                type: "int",
                nullable: false)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "IoTDevices",
                type: "int",
                nullable: false)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "LineId",
                table: "IoTDevices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeviceId",
                table: "AttendanceDeviceLogs",
                type: "int",
                nullable: true);

            // 5. Restore Primary Keys
            migrationBuilder.AddPrimaryKey(name: "PK_ProductionLines", table: "ProductionLines", column: "Id");
            migrationBuilder.AddPrimaryKey(name: "PK_IoTDevices", table: "IoTDevices", column: "Id");

            // 6. Restore Foreign Keys
            migrationBuilder.AddForeignKey(
                name: "FK_IoTDevices_ProductionLines_LineId",
                table: "IoTDevices",
                column: "LineId",
                principalTable: "ProductionLines",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceDeviceLogs_IoTDevices_DeviceId",
                table: "AttendanceDeviceLogs",
                column: "DeviceId",
                principalTable: "IoTDevices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // 7. Seed initial data (optional but good for testing)
            migrationBuilder.InsertData(
                table: "ProductionLines",
                columns: new[] { "Id", "LineName", "DepartmentId", "Status" },
                values: new object[,] {
                    { 1, "Line A - IT", 1, "Active" },
                    { 2, "Line B - Production", 3, "Active" }
                });

            migrationBuilder.InsertData(
                table: "IoTDevices",
                columns: new[] { "Id", "DeviceName", "DeviceType", "LineId", "Status" },
                values: new object[,] {
                    { 1, "ESP32-CAM-01", "ESP32-CAM", 1, "Offline" },
                    { 2, "ESP32-CAM-02", "ESP32-CAM", 2, "Offline" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "ProductionLines",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<Guid>(
                name: "LineId",
                table: "IoTDevices",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "IoTDevices",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeviceId",
                table: "AttendanceDeviceLogs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
