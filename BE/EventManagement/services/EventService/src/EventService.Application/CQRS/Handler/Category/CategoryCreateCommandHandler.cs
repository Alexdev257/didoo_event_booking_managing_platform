using EventService.Application.CQRS.Command.Category;
using EventService.Application.DTOs.Response.Category;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Category
{
    public class CategoryCreateCommandHandler : IRequestHandler<CategoryCreateCommand, CategoryCreateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public CategoryCreateCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<CategoryCreateResponse> Handle(CategoryCreateCommand request, CancellationToken cancellationToken)
        {
            var category = new EventService.Domain.Entities.Category
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = request.Slug,
                Description = request.Description,
                IconUrl = request.IconUrl,
                Status = request.Status,
                ParentCategoryId = request.ParentCategoryId != null ? Guid.Parse(request.ParentCategoryId) : null,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                await _unitOfWork.Categories.AddAsync(category);
                await _unitOfWork.CommitTransactionAsync();
                return new CategoryCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Category Successfully", 
                    Data = new CategoryDTO
                    {
                        Id = category.Id.ToString(),
                        Description = category.Description,
                        IconUrl = category.IconUrl,
                        Name = category.Name,
                        Slug = category.Slug,
                        Status = category.Status,
                        ParentCategory = null /*category.ParentCategoryId != null ? new CategoryDTO
                        {
                            Id = category.ParentCategory.Id.ToString(),
                            Description = category.ParentCategory.Description,
                            IconUrl = category.ParentCategory.IconUrl,
                            Name = category.ParentCategory.Name,
                            Slug = category.ParentCategory.Slug,
                            Status = category.ParentCategory.Status,

                        } : null */,
                        SubCategories = null
                        /* category.SubCategories.Any() ? category.SubCategories.Select(x => new CategoryDTO
                        {
                            Id = x.Id.ToString(),
                            Slug = x.Slug,
                            Status = x.Status,
                            Description = x.Description,
                            IconUrl = x.IconUrl,
                            Name = x.Name,
                        }).ToList() : new List<CategoryDTO>() */,
                    }
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new CategoryCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
