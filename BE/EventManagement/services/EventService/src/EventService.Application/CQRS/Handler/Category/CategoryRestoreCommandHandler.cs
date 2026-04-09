using EventService.Application.CQRS.Command.Category;
using EventService.Application.DTOs.Response.Category;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Category
{
    public class CategoryRestoreCommandHandler : IRequestHandler<CategoryRestoreCommand, CategoryRestoreResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public CategoryRestoreCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CategoryRestoreResponse> Handle(CategoryRestoreCommand request, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.Categories.GetAllAsync()
                .Include(x => x.ParentCategory)
                .Include(x => x.SubCategories)
                .Include(x => x.Events)
                .FirstOrDefaultAsync(x => x.Id == request.Id);
            if (category == null)
            {
                return new CategoryRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Category is not found"
                };
            }

            if (!category.IsDeleted)
            {
                return new CategoryRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Category is not deleted"
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                category.IsDeleted = false;
                category.DeletedAt = null;
                _unitOfWork.Categories.UpdateAsync(category);
                if (category.SubCategories != null && category.SubCategories.Any())
                {
                    foreach (var subCategory in category.SubCategories)
                    {
                        subCategory.IsDeleted = false;
                        subCategory.DeletedAt = null;
                        _unitOfWork.Categories.UpdateAsync(subCategory);
                    }
                }
                await _unitOfWork.CommitTransactionAsync();
                return new CategoryRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Restore Category Successfully",
                    Data = new CategoryDTO
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
                        SubCategories = category.SubCategories.Any() ? category.SubCategories.Select(x => new CategoryDTO
                        {
                            Id = x.Id.ToString(),
                            Slug = x.Slug,
                            Status = x.Status,
                            Description = x.Description,
                            IconUrl = x.IconUrl,
                            Name = x.Name,
                        }).ToList() : new List<CategoryDTO>(),
                    }
                };
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new CategoryRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
