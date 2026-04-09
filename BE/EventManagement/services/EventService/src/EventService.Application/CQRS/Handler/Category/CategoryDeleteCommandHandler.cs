using EventService.Application.CQRS.Command.Category;
using EventService.Application.DTOs.Response.Category;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Category
{
    public class CategoryDeleteCommandHandler : IRequestHandler<CategoryDeleteCommand, CategoryDeleteResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public CategoryDeleteCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<CategoryDeleteResponse> Handle(CategoryDeleteCommand request, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.Categories.GetAllAsync()
                .Include(x => x.ParentCategory)
                .Include(x => x.SubCategories)
                    .ThenInclude(sc => sc.Events)
                .Include(x => x.Events)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (category == null)
            {
                return new CategoryDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Category is not found"
                };
            }

            if(category.IsDeleted)
            {
                return new CategoryDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Category is deleted"
                };
            }

            //var data = new CategoryDTO
            //{
            //    Id = category.Id.ToString(),
            //    Description = category.Description,
            //    IconUrl = category.IconUrl,
            //    Name = category.Name,
            //    Slug = category.Slug,
            //    Status = category.Status,
            //    ParentCategory = category.ParentCategoryId != null ? new CategoryDTO
            //    {
            //        Id = category.ParentCategory.Id.ToString(),
            //        Description = category.ParentCategory.Description,
            //        IconUrl = category.ParentCategory.IconUrl,
            //        Name = category.ParentCategory.Name,
            //        Slug = category.ParentCategory.Slug,
            //        Status = category.ParentCategory.Status,

            //    } : null,
            //    SubCategories = category.SubCategories.Any() ? category.SubCategories.Select(x => new CategoryDTO
            //    {
            //        Id = x.Id.ToString(),
            //        Slug = x.Slug,
            //        Status = x.Status,
            //        Description = x.Description,
            //        IconUrl = x.IconUrl,
            //        Name = x.Name,
            //    }).ToList() : new List<CategoryDTO>(),
            //};

            //await _unitOfWork.BeginTransactionAsync();
            //try
            //{

            //    if (category.SubCategories != null && category.SubCategories.Any())
            //    {
            //        foreach (var subCategory in category.SubCategories)
            //        {
            //            _unitOfWork.Categories.DeleteAsync(subCategory);

            //            if (subCategory.Events != null && subCategory.Events.Any())
            //            {
            //                foreach (var eventt in subCategory.Events)
            //                {
            //                    _unitOfWork.Events.DeleteAsync(eventt);
            //                }
            //            }
            //        }
            //    }
            //    if (category.Events != null && category.Events.Any())
            //    {
            //        foreach (var eventt in category.Events)
            //        {
            //            _unitOfWork.Events.DeleteAsync(eventt);
            //        }
            //    }
            //    _unitOfWork.Categories.DeleteAsync(category);
            //    await _unitOfWork.CommitTransactionAsync();
            //    return new CategoryDeleteResponse
            //    {
            //        IsSuccess = true,
            //        Message = "Delete Category Successfully",
            //        Data = data
            //    };
            //}
            //catch (Exception ex)
            //{
            //    await _unitOfWork.RollbackTransactionAsync();
            //    return new CategoryDeleteResponse
            //    {
            //        IsSuccess = false,
            //        Message = ex.Message,
            //        Data = null
            //    };
            //}

            // 1. Kiểm tra Event của Category chính
            bool hasActiveEventsInMain = category.Events != null &&
                category.Events.Any(e => e.Status != EventStatusEnum.Cancelled && e.Status != EventStatusEnum.Closed);

            // 2. Kiểm tra Event của các SubCategories
            bool hasActiveEventsInSub = category.SubCategories != null &&
                category.SubCategories.Any(sc => sc.Events != null &&
                    sc.Events.Any(e => e.Status != EventStatusEnum.Cancelled && e.Status != EventStatusEnum.Closed));

            // 3. Nếu có bất kỳ Event nào đang không phải là Cancelled hoặc Closed -> Chặn xóa
            if (hasActiveEventsInMain || hasActiveEventsInSub)
            {
                return new CategoryDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Cannot delete category because it (or its subcategories) contains active events."
                };
            }
            // ==========================================

            var data = new CategoryDTO
            {
                Id = category.Id.ToString(),
                Description = category.Description,
                IconUrl = category.IconUrl,
                Name = category.Name,
                Slug = category.Slug,
                Status = category.Status,
                ParentCategory = category.ParentCategoryId != null ? new CategoryDTO
                {
                    Id = category.ParentCategory.Id.ToString(),
                    Description = category.ParentCategory.Description,
                    IconUrl = category.ParentCategory.IconUrl,
                    Name = category.ParentCategory.Name,
                    Slug = category.ParentCategory.Slug,
                    Status = category.ParentCategory.Status,

                } : null,
                SubCategories = category.SubCategories != null && category.SubCategories.Any() ? category.SubCategories.Select(x => new CategoryDTO
                {
                    Id = x.Id.ToString(),
                    Slug = x.Slug,
                    Status = x.Status,
                    Description = x.Description,
                    IconUrl = x.IconUrl,
                    Name = x.Name,
                }).ToList() : new List<CategoryDTO>(),
            };

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                if (category.SubCategories != null && category.SubCategories.Any())
                {
                    foreach (var subCategory in category.SubCategories)
                    {
                        if (subCategory.Events != null && subCategory.Events.Any())
                        {
                            foreach (var eventt in subCategory.Events)
                            {
                                _unitOfWork.Events.DeleteAsync(eventt);
                            }
                        }
                        // Xóa subCategory sau khi đã xóa các event của nó
                        _unitOfWork.Categories.DeleteAsync(subCategory);
                    }
                }

                if (category.Events != null && category.Events.Any())
                {
                    foreach (var eventt in category.Events)
                    {
                        _unitOfWork.Events.DeleteAsync(eventt);
                    }
                }

                _unitOfWork.Categories.DeleteAsync(category);
                await _unitOfWork.CommitTransactionAsync();

                return new CategoryDeleteResponse
                {
                    IsSuccess = true,
                    Message = "Delete Category Successfully",
                    Data = data
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new CategoryDeleteResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
