using SharedContracts.Common.Wrappers;

namespace TicketService.Application.DTOs.Response.TicketListing
{
    public class TicketListingCreateResponse : CommonResponse<TicketListingDTO> { }
    public class TicketListingGetByIdResponse : CommonResponse<object> { }
    public class TicketListingGetListResponse : CommonResponse<PaginationResponse<object>> { }
    public class TicketListingCancelResponse : CommonResponse<TicketListingDTO> { }
    public class TicketListingValidateResponse : CommonResponse<TicketListingValidateData> { }

    public class TicketListingValidateData
    {
        public bool IsAvailable { get; set; }
        public string? Message { get; set; }
        public string? TicketId { get; set; }
        public string? EventId { get; set; }
        public decimal AskingPrice { get; set; }
    }
}

