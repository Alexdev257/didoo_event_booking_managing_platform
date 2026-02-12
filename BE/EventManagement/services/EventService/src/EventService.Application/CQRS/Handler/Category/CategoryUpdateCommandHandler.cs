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
    public class CategoryUpdateCommandHandler : IRequestHandler<CategoryUpdateCommand, CategoryUpdateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public CategoryUpdateCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CategoryUpdateResponse> Handle(CategoryUpdateCommand request, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.Categories.GetAllAsync()
                .Include(x => x.ParentCategory)
                .Include(x => x.SubCategories)
                .Include(x => x.Events)
                .FirstOrDefaultAsync(x => x.Id == request.Id);
            if (category == null)
            {
                return new CategoryUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Category is not found"
                };
            }

            if (category.IsDeleted)
            {
                return new CategoryUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Category is deleted"
                };
            }

            category.Slug = request.Slug;
            category.Name = request.Name;
            category.Description = request.Description;
            category.Status = request.Status;
            category.IconUrl = request.IconUrl;
            category.ParentCategoryId = request.ParentCategoryId != null ? Guid.Parse(request.ParentCategoryId) : null;
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                _unitOfWork.Categories.UpdateAsync(category);
                await _unitOfWork.CommitTransactionAsync();
                return new CategoryUpdateResponse
                {
                    IsSuccess = true,
                    Message = "Update Category Successfully",
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
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new CategoryUpdateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
            
        }
    }
}
