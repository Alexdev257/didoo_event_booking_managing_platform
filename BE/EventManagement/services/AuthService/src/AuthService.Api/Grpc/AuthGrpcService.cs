using AuthService.Application.Interfaces;
using AuthService.Application.Interfaces.Repositories;
using Grpc.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;

namespace AuthService.Api.Grpc
{
    public class AuthGrpcService : AuthGrpc.AuthGrpcBase
    {
        private readonly IAuthUnitOfWork _unitOfWork;

        public AuthGrpcService(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public override async Task<UserResponse> GetUserProfile(UserRequest request, ServerCallContext context)
        {
            // 1. Check ID hợp lệ
            if (!Guid.TryParse(request.UserId, out var userId))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid User ID format"));
            }

            // 2. Query DB
            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            // 3. Nếu không tìm thấy -> Trả về lỗi NotFound (để bên kia biết là null)
            if (user == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, "User not found"));
            }

            // 4. Nếu có -> Map sang Object Proto
            return new UserResponse
            {
                Id = user.Id.ToString(),
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender.ToString() ?? "", // Proto không chịu null, phải để chuỗi rỗng
                Email = user.Email ?? ""
            };
        }

        public override async Task<GetUsersResponse> GetUsersByIds(GetUsersRequest request, ServerCallContext context)
        {
            var response = new GetUsersResponse();

            // 1. Kiểm tra đầu vào
            if (request.UserIds == null || request.UserIds.Count == 0)
            {
                return response; // Trả về list rỗng
            }

            // 2. Convert list string sang list Guid
            var guidIds = new List<Guid>();
            foreach (var idStr in request.UserIds)
            {
                if (Guid.TryParse(idStr, out var g)) guidIds.Add(g);
            }

            // 3. Query Database (Dùng Contains để lấy nhiều dòng 1 lúc -> WHERE Id IN (...))
            // Lưu ý: Nếu Repo của bạn không hỗ trợ Find custom, bạn có thể cần dùng DBContext trực tiếp hoặc viết thêm hàm trong Repo.
            // Ở đây mình giả sử bạn truy cập được IQueryable hoặc GetAllAsync() trả về Queryable.

            var users = await _unitOfWork.Users.GetAllAsync() // Hoặc hàm nào trả về IQueryable
                .Where(u => guidIds.Contains(u.Id))
                .ToListAsync();

            // 4. Map sang Proto Response
            foreach (var user in users)
            {
                response.Users.Add(new UserResponse
                {
                    Id = user.Id.ToString(),
                    FullName = user.FullName ?? "",
                    AvatarUrl = user.AvatarUrl ?? "",
                    Gender = user.Gender.ToString(), // Chuyển int sang string
                });
            }

            return response;
        }

        public override async Task<GetAdminEmailsResponse> GetAdminEmails(GetAdminEmailsRequest request, ServerCallContext context)
        {
            // Tùy thuộc vào Database của bạn, giả sử Admin có RoleName là "Admin" 
            // Hoặc nếu bạn dùng RoleId cố định (ví dụ RoleId của Admin là "1"), bạn sửa điều kiện Where lại cho đúng nhé.
            var adminEmails = await _unitOfWork.Users.GetAllAsync()
                .Include(u => u.Role) // Nhớ Include bảng Role nếu cần
                .Where(u => u.Role.Name == Domain.Enum.RoleNameEnum.Admin)
                .Select(u => u.Email)
                .ToListAsync();

            var response = new GetAdminEmailsResponse();

            if (adminEmails != null && adminEmails.Any())
            {
                response.Emails.AddRange(adminEmails);
            }

            return response;
        }
        public override async Task<UserCountResponse> GetUserCount(UserCountRequest request, ServerCallContext context)
        {
            var count = await _unitOfWork.Users.GetAllAsync().CountAsync();
            return new UserCountResponse { TotalUsers = count };
        }
    }
}
