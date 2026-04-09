using EventService.Application.CQRS.Query.Category;
using EventService.Application.DTOs.Response.Category;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace EventService.Application.CQRS.Handler.Category
{
    public class CategoryGetListQueryHandler : IRequestHandler<CategoryGetListQuery, CategoryGetListResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public CategoryGetListQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<CategoryGetListResponse> Handle(CategoryGetListQuery request, CancellationToken cancellationToken)
        {
            var categories = _unitOfWork.Categories.GetAllAsync()
                .Include(x => x.ParentCategory)
                .Include(x => x.SubCategories)
                .Include(x => x.Events)
                .AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    categories = categories.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        categories = categories.Where(x => !x.IsDeleted);
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
                categories = categories.Where(x => x.Name.ToLower().Contains(request.Name.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.Slug))
                categories = categories.Where(x => x.Slug.ToLower().Contains(request.Slug.ToLower()));

            if (request.Status.HasValue)
                categories = categories.Where(x => x.Status == request.Status);

            if (request.ParentCategoryId.HasValue)
                categories = categories.Where(x => x.ParentCategoryId == request.ParentCategoryId);

            categories = request.IsDescending == true
               ? categories.OrderByDescending(x => x.CreatedAt)
               : categories.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                            categories,
                                            request.PageNumber,
                                            request.PageSize,
                                            category => new CategoryDTO
                                            {
                                                Id = category.Id.ToString(),
                                                Description = category.Description,
                                                IconUrl = category.IconUrl,
                                                Name = category.Name,
                                                Slug = category.Slug,
                                                Status = category.Status,
                                                ParentCategory = request.HasParent.Value == true ? category.ParentCategoryId != null ? new CategoryDTO
                                                {
                                                    Id = category.ParentCategory.Id.ToString(),
                                                    Description = category.ParentCategory.Description,
                                                    IconUrl = category.ParentCategory.IconUrl,
                                                    Name = category.ParentCategory.Name,
                                                    Slug = category.ParentCategory.Slug,
                                                    Status = category.ParentCategory.Status,

                                                } : null : null,
                                                SubCategories = request.HasSub.Value == true ? category.SubCategories.Any() ? category.SubCategories.Select(x => new CategoryDTO
                                                {
                                                    Id = x.Id.ToString(),
                                                    Slug = x.Slug,
                                                    Status = x.Status,
                                                    Description = x.Description,
                                                    IconUrl = x.IconUrl,
                                                    Name = x.Name,
                                                }).ToList() : new List<CategoryDTO>() : new List<CategoryDTO>(),
                                            },
                                            request.Fields);
            return new CategoryGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve category successfully",
                Data = pagedList
            };

        }
    }
}
