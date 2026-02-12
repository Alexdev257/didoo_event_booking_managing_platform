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
                .Include(x => x.Events)
                .FirstOrDefaultAsync(x => x.Id == request.Id);
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
                SubCategories = category.SubCategories.Any() ? category.SubCategories.Select(x => new CategoryDTO
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
                        _unitOfWork.Categories.DeleteAsync(subCategory);

                        if (subCategory.Events != null && subCategory.Events.Any())
                        {
                            foreach (var eventt in subCategory.Events)
                            {
                                _unitOfWork.Events.DeleteAsync(eventt);
                            }
                        }
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
