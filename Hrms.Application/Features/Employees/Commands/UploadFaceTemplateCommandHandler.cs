using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using Hrms.Application.Features.Employees.Commands;
using Hrms.Application.Interface;
using Hrms.Domain.Entities;

namespace Hrms.Application.Features.Employees.Commands
{
    /// <summary>
    /// Handler upload face template
    /// - Gửi ảnh đến Python AI Service để lấy embedding vector
    /// - Lưu embedding vector vào database
    /// </summary>
    public class UploadFaceTemplateCommandHandler : IRequestHandler<UploadFaceTemplateCommand, bool>
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IFaceTemplateRepository _faceTemplateRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UploadFaceTemplateCommandHandler> _logger;

        public UploadFaceTemplateCommandHandler(
            IEmployeeRepository employeeRepository,
            IFaceTemplateRepository faceTemplateRepository,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<UploadFaceTemplateCommandHandler> logger)
        {
            _employeeRepository = employeeRepository;
            _faceTemplateRepository = faceTemplateRepository;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> Handle(UploadFaceTemplateCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra employee tồn tại
            var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);

            if (employee == null)
            {
                throw new KeyNotFoundException($"Employee với ID {request.EmployeeId} không tồn tại");
            }

            // Gọi Python AI Service để lấy embedding vector
            var httpClient = _httpClientFactory.CreateClient("PythonAIService");
            
            var requestBody = new
            {
                image_base64 = request.ImageBase64
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await httpClient.PostAsync("/api/face-recognition/encode", content, cancellationToken);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                var result = JsonSerializer.Deserialize<PythonAIServiceResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (result == null || result.Embedding == null)
                {
                    throw new Exception("Python AI Service không trả về embedding vector");
                }

                // Convert embedding từ base64 hoặc array về byte[]
                byte[] embeddingBytes;
                if (result.Embedding is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Array)
                {
                    // Nếu là array, convert sang float array rồi sang byte[]
                    var floatArray = jsonElement.EnumerateArray().Select(x => (float)x.GetDouble()).ToArray();
                    embeddingBytes = new byte[floatArray.Length * sizeof(float)];
                    Buffer.BlockCopy(floatArray, 0, embeddingBytes, 0, embeddingBytes.Length);
                }
                else if (result.Embedding is string base64String)
                {
                    embeddingBytes = Convert.FromBase64String(base64String);
                }
                else
                {
                    throw new Exception("Format embedding không hợp lệ");
                }

                // Lưu hoặc cập nhật FaceTemplate
                var existingTemplate = await _faceTemplateRepository.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);

                if (existingTemplate != null)
                {
                    // Cập nhật template hiện tại
                    existingTemplate.EmbeddingVector = embeddingBytes;
                    existingTemplate.QualityScore = result.QualityScore;
                    existingTemplate.Version++;
                    existingTemplate.IsActive = true;
                    _faceTemplateRepository.Update(existingTemplate);
                }
                else
                {
                    // Tạo template mới (EmployeeId là PK)
                    var faceTemplate = new FaceTemplate
                    {
                        EmployeeId = request.EmployeeId,
                        EmbeddingVector = embeddingBytes,
                        QualityScore = result.QualityScore,
                        RegisteredDate = DateTime.UtcNow,
                        IsActive = true,
                        Version = 1
                    };
                    await _faceTemplateRepository.AddAsync(faceTemplate, cancellationToken);
                }

                await _faceTemplateRepository.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Face template uploaded successfully for employee: {EmployeeId}", request.EmployeeId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading face template for employee: {EmployeeId}", request.EmployeeId);
                throw;
            }
        }

        private class PythonAIServiceResponse
        {
            public object? Embedding { get; set; }
            public float? QualityScore { get; set; }
        }
    }
}
