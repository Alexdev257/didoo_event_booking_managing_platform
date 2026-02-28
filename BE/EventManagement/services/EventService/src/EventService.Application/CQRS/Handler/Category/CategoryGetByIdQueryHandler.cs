using EventService.Application.CQRS.Query.Category;
using EventService.Application.DTOs.Response.Category;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Category
{
    public class CategoryGetByIdQueryHandler : IRequestHandler<CategoryGetByIdQuery, CategoryGetByIdResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public CategoryGetByIdQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<CategoryGetByIdResponse> Handle(CategoryGetByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var category = await _unitOfWork.Categories.GetAllAsync()
                .Include(x => x.ParentCategory)
                .Include(x => x.SubCategories)
                .Include(x => x.Events)
                .FirstOrDefaultAsync(x => x.Id == request.Id);

                if (category == null)
                {
                    return new CategoryGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "Category is not found"
                    };
                }

                if (category.IsDeleted)
                {
                    return new CategoryGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "Category is deleted"
                    };
                }

                var dto = new CategoryDTO
                {
                    Id = category.Id.ToString(),
                    Description = category.Description,
                    IconUrl = category.IconUrl,
                    Name = category.Name,
                    Slug = category.Slug,
                    Status = category.Status,
                    ParentCategory = (!request.HasParent.HasValue || (request.HasParent.HasValue && request.HasParent.Value == true)) ? category.ParentCategoryId != null ? new CategoryDTO
                    {
                        Id = category.ParentCategory.Id.ToString(),
                        Description = category.ParentCategory.Description,
                        IconUrl = category.ParentCategory.IconUrl,
                        Name = category.ParentCategory.Name,
                        Slug = category.ParentCategory.Slug,
                        Status = category.ParentCategory.Status,

                    } : null : null,
                    SubCategories = (!request.HasSub.HasValue || (request.HasSub.HasValue && request.HasSub.Value == true)) ? category.SubCategories.Any() ? category.SubCategories.Select(x => new CategoryDTO
                    {
                        Id = x.Id.ToString(),
                        Slug = x.Slug,
                        Status = x.Status,
                        Description = x.Description,
                        IconUrl = x.IconUrl,
                        Name = x.Name,
                    }).ToList() : new List<CategoryDTO>() : new List<CategoryDTO>(),
                };

                var shapedData = DataShaper.ShapeData(dto, request.Fields);
                return new CategoryGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "Retrieve category by id successfully",
                    Data = shapedData,
                };
            }
            catch (Exception ex)
            {
                return new CategoryGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
