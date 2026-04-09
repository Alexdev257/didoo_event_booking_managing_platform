import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketRequest, ticketTypeRequest, ticketListingRequest } from "@/apiRequest/ticketService";
import { TicketCreateBody, TicketUpdateBody, TicketTypeCreateBody, TicketTypeCreateArrayBody, TicketTypeUpdateBody, TicketListingCreateBody, TicketListingCancelBody, TicketListingMarkSoldBody } from "@/schemas/ticket";
import { TicketGetListQuery, TicketTypeGetListQuery, TicketListingGetListQuery } from "@/types/ticket";
import { KEY, QUERY_KEY } from "@/utils/constant";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/errors";

export const useGetTickets = (params?: TicketGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.tickets.list(params),
  queryFn: () => ticketRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetTicket = (id: string) => useQuery({
  queryKey: QUERY_KEY.tickets.detail(id),
  queryFn: () => ticketRequest.getById(id),
  enabled: !!id,
});
export const useTicket = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: TicketCreateBody) => (await ticketRequest.create(body)).data,
    onSuccess: () => {
      toast.success("Ticket created successfully");
      queryClient.invalidateQueries({ queryKey: KEY.tickets });
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: TicketUpdateBody }) => (await ticketRequest.update(id, body)).data,
    onSuccess: () => {
      toast.success("Ticket updated successfully");
      queryClient.invalidateQueries({ queryKey: KEY.tickets });
    },
  });
  const deleteTicket = useMutation({
    mutationFn: async (id: string) => (await ticketRequest.delete(id)).message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.tickets });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  const restore = useMutation({
    mutationFn: async (id: string) => (await ticketRequest.restore(id)).message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.tickets });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  return { create, update, deleteTicket, restore };
};

export const useGetTicketTypes = (params?: TicketTypeGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.ticketTypes.list(params),
  queryFn: () => ticketTypeRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetTicketType = (id: string) => useQuery({
  queryKey: QUERY_KEY.ticketTypes.detail(id),
  queryFn: () => ticketTypeRequest.getById(id),
  enabled: !!id,
});
export const useTicketType = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: TicketTypeCreateBody) => (await ticketTypeRequest.create(body)).data,
    onSuccess: () => {
      toast.success("Thêm loại vé thành công");
      queryClient.invalidateQueries({ queryKey: KEY.ticketTypes });
    },
  });
  const createArray = useMutation({
    mutationFn: async (body: TicketTypeCreateArrayBody) => (await ticketTypeRequest.createArray(body)).data,
    onSuccess: () => {
      toast.success("Thêm danh sách loại vé thành công");
      queryClient.invalidateQueries({ queryKey: KEY.ticketTypes });
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: TicketTypeUpdateBody }) => (await ticketTypeRequest.update(id, body)).data,
    onSuccess: () => {
      toast.success("Cập nhật loại vé thành công");
      queryClient.invalidateQueries({ queryKey: KEY.ticketTypes });
    },
  });
  const deleteTicketType = useMutation({
    mutationFn: async (id: string) => (await ticketTypeRequest.delete(id)).message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.ticketTypes });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  const restore = useMutation({
    mutationFn: async (id: string) => (await ticketTypeRequest.restore(id)).message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.ticketTypes });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  return { create, createArray, update, deleteTicketType, restore };
};

export const useGetTicketListings = (params?: TicketListingGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: [...KEY.tickets, "listings", params],
  queryFn: () => ticketListingRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetTicketListing = (id: string, options?: { enabled?: boolean }) => useQuery({
  queryKey: [...KEY.tickets, "listing", id],
  queryFn: () => ticketListingRequest.getById(id),
  enabled: (options?.enabled ?? true) && !!id,
});
export const useValidateTicketListing = (id: string, options?: { enabled?: boolean }) => useQuery({
  queryKey: [...KEY.tickets, "listing-validate", id],
  queryFn: () => ticketListingRequest.validate(id),
  enabled: (options?.enabled ?? true) && !!id,
});
// refresh my ticket
export const useTicketListing = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: TicketListingCreateBody) => (await ticketListingRequest.create(body)).data,
    onSuccess: async (_, body) => {
      await queryClient.invalidateQueries({ queryKey: [...KEY.tickets, "listings"] });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEY.tickets.list({ ownerId: body.sellerUserId }),
      });
    },
  });
  const cancel = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: TicketListingCancelBody }) => (await ticketListingRequest.cancel(id, body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...KEY.tickets, "listings"] }),
  });
  const markSold = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: TicketListingMarkSoldBody }) => (await ticketListingRequest.markSold(id, body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...KEY.tickets, "listings"] }),
  });
  return { create, cancel, markSold };
};
