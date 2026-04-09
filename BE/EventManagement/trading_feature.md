# Trading Place Feature — Documentation

> **Date:** March 8, 2026  
> **Services affected:** `TicketService` · `BookingService`  
> **Stack:** .NET 8 · EF Core 8 · MySQL · MediatR (CQRS) · Momo Payment Gateway

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Flow](#architecture--flow)
3. [Database Changes](#database-changes)
4. [TicketService — Listing Management](#ticketservice--listing-management)
   - [New Domain Model](#new-domain-model)
   - [API Endpoints](#api-endpoints-ticketservice)
   - [Request / Response Examples](#request--response-examples-ticketservice)
5. [BookingService — Trade Booking & Payment](#bookingservice--trade-booking--payment)
   - [Domain Changes](#domain-changes)
   - [API Endpoints](#api-endpoints-bookingservice)
   - [Request / Response Examples](#request--response-examples-bookingservice)
6. [Payment Callback Flow](#payment-callback-flow)
7. [Gateway Routing (YARP)](#gateway-routing-yarp)
8. [Files Changed / Created](#files-changed--created)
9. [Business Rules & Validations](#business-rules--validations)

---

## Overview

The **Trading Place** feature allows users who already own a ticket to **list it for resale** at a custom price. Other users can then **browse active listings** and **purchase** a listed ticket through the same Momo payment gateway used for normal bookings.

After a successful payment, two distinct flows are triggered depending on the booking type:

### Normal Booking (non-trade)
- **BookingService** (`GetPaymentStatus`) calls `POST /api/tickets/internal/bulk-create` on TicketService
- TicketService creates `Quantity` individual **Ticket** records, each with `OwnerId = buyerUserId`
- The buyer now owns concrete, query-able `Ticket` rows in the TicketService database
- `BookingDetail.TicketTypeId` is stored at booking-creation time so the callback knows which TicketType to use

### Trade / Resale Booking
- The **TicketListing** is marked `Sold`
- The **Ticket** `OwnerId` is transferred to the buyer via `PATCH /ticketlistings/{id}/mark-sold`
- A **ResaleTransaction** audit record is created in BookingService
- The **Booking** record (with type `TradePurchase`) is marked `Paid`

---

## Architecture & Flow

```
Seller                  TicketService             BookingService           Momo
  │                          │                         │                    │
  │── POST /ticketlistings ──▶│                         │                    │
  │   (create listing)        │ Ticket.Status = Locked  │                    │
  │◀─ 201 listing created ────│                         │                    │
  │                           │                         │                    │
Buyer (Normal)                │                         │                    │
  │── POST /bookings ─────────────────────────────────▶│                    │
  │                           │◀─ PATCH /{type}/decrement                    │
  │                           │── remaining qty ───────▶│                    │
  │                           │              Booking(Normal)                  │
  │                           │        BookingDetail(TicketTypeId)            │
  │◀─ 201 { paymentUrl } ─────────────────────────────│                    │
  │── redirect ──────────────────────────────────────────────────────────▶│
  │◀─ callback ────────────────────────────────────────│                    │
  │                           │◀─ POST /internal/bulk-create                  │
  │                           │  N Ticket rows, OwnerId=buyer                 │
  │                           │                  Booking.Status=Paid          │
  │◀─ redirect /events/{eventId}/booking/confirm ──────│                    │
  │                           │                         │                    │
Buyer (Trade)                 │                         │                    │
  │── POST /trade-bookings ───────────────────────────▶│                    │
  │                           │◀─ GET /{id}/validate ───│                    │
  │                           │── listing data ────────▶│                    │
  │                           │              Booking(TradePurchase)           │
  │                           │           BookingDetail(ResaleId)             │
  │◀─ 201 { paymentUrl } ─────────────────────────────│                    │
  │── redirect ──────────────────────────────────────────────────────────▶│
  │◀─ callback ────────────────────────────────────────│                    │
  │                           │◀─ PATCH /{id}/mark-sold │                    │
  │                           │  Ticket.OwnerId = buyer  │                    │
  │                           │  Listing.Status = Sold   │                    │
  │                           │                  Booking.Status=Paid          │
  │                           │                  ResaleTransaction created     │
  │◀─ redirect /marketplace/confirm?bookingId=&listingId= ─────────────────│
```

---

## Database Changes

### TicketService — New Table: `TicketListing`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | `varchar(255)` | NOT NULL | PK, Guid |
| `ticket_id` | `varchar(255)` | NOT NULL | FK → `Ticket.id` |
| `seller_user_id` | `varchar(255)` | NOT NULL | User who listed the ticket |
| `asking_price` | `decimal(18,2)` | NOT NULL | Resale price in VND |
| `description` | `varchar(2000)` | NULL | Optional description |
| `status` | `varchar(50)` | NOT NULL | `Active` / `Pending` / `Sold` / `Cancelled` |
| `created_at` | `datetime(6)` | NOT NULL | |
| `updated_at` | `datetime(6)` | NULL | |
| `is_deleted` | `tinyint(1)` | NOT NULL | Soft delete |
| `deleted_at` | `datetime(6)` | NULL | |

**Indexes:** `seller_user_id`, `status`, `ticket_id`  
**Migration:** `20260308000001_AddTicketListing`

---

### BookingService — Altered Tables

#### `Booking` — New Column

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `booking_type` | `varchar(50)` | `Normal` | `Normal` or `TradePurchase` |

#### `BookingDetail` — New Columns

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `ticket_type_id` | `varchar(255)` | NULL | TicketType reference for normal bookings — used by payment callback to bulk-create Ticket records in TicketService |
| `resale_id` | `varchar(255)` | NULL | Links to `TicketListing.id` in TicketService — used for trade bookings |

**Migration:** `20260308000001_AddTradingPlaceFields`

---

## TicketService — Listing Management

### New Domain Model

```csharp
// TicketService.Domain/Entities/TicketListing.cs
public class TicketListing : AuditableEntity
{
    public Guid TicketId { get; set; }
    public Guid SellerUserId { get; set; }
    public decimal AskingPrice { get; set; }
    public string? Description { get; set; }
    public TicketListingStatusEnum Status { get; set; } = TicketListingStatusEnum.Active;
    public virtual Ticket Ticket { get; set; }
}

// TicketService.Domain/Enum/TicketListingStatusEnum.cs
public enum TicketListingStatusEnum
{
    Active = 1,
    Pending = 2,
    Sold = 3,
    Cancelled = 4,
}
```

### API Endpoints (TicketService)

**Base URL:** `http://localhost:6201`  
**Gateway:** `http://localhost:5000/api/ticketlistings/*` → `ticket-cluster`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/ticketlistings` | Get paginated list of listings | Optional |
| `GET` | `/api/ticketlistings/{id}` | Get listing by ID | Optional |
| `GET` | `/api/ticketlistings/{id}/validate` | Validate listing is active (used by BookingService) | Internal |
| `POST` | `/api/ticketlistings` | Create a new ticket listing | Required |
| `PATCH` | `/api/ticketlistings/{id}/cancel` | Cancel an active listing | Required |
| `PATCH` | `/api/ticketlistings/{id}/mark-sold` | Mark listing sold + transfer ownership | Internal |
| `POST` | `/api/tickets/internal/bulk-create` | **[New]** Bulk-create Ticket records after normal payment | Internal |

### Request / Response Examples (TicketService)

#### `POST /api/ticketlistings` — Create Listing

**Request:**
```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "sellerUserId": "a1b2c3d4-0000-0000-0000-000000000001",
  "askingPrice": 250000,
  "description": "Selling my VIP ticket, unable to attend."
}
```

**Response `201`:**
```json
{
  "isSuccess": true,
  "message": "Ticket listing created successfully.",
  "data": {
    "id": "7f1b3e20-0000-0000-0000-000000000099",
    "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "sellerUserId": "a1b2c3d4-0000-0000-0000-000000000001",
    "askingPrice": 250000,
    "description": "Selling my VIP ticket, unable to attend.",
    "status": "Active",
    "createdAt": "2026-03-08T10:00:00Z"
  }
}
```

#### `GET /api/ticketlistings` — List Active Listings

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `TicketListingStatusEnum` | Filter by status (e.g. `Active`) |
| `sellerUserId` | `Guid` | Filter by seller |
| `ticketId` | `Guid` | Filter by ticket |
| `fromPrice` | `decimal` | Min asking price |
| `toPrice` | `decimal` | Max asking price |
| `pageNumber` | `int` | Page number (default: 1) |
| `pageSize` | `int` | Page size (default: 10) |
| `isDescending` | `bool` | Sort order |

**Response `200`:**
```json
{
  "isSuccess": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "7f1b3e20-0000-0000-0000-000000000099",
        "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "sellerUserId": "a1b2c3d4-0000-0000-0000-000000000001",
        "askingPrice": 250000,
        "description": "Selling my VIP ticket",
        "status": "Active",
        "createdAt": "2026-03-08T10:00:00Z"
      }
    ],
    "totalCount": 1,
    "pageNumber": 1,
    "pageSize": 10
  }
}
```

#### `PATCH /api/ticketlistings/{id}/cancel` — Cancel Listing

**Request:**
```json
{
  "sellerUserId": "a1b2c3d4-0000-0000-0000-000000000001"
}
```

**Response `200`:**
```json
{
  "isSuccess": true,
  "message": "Listing cancelled successfully.",
  "data": {
    "id": "7f1b3e20-0000-0000-0000-000000000099",
    "status": "Cancelled"
  }
}
```

#### `GET /api/ticketlistings/{id}/validate` — Validate Listing (Internal)

**Response `200`:**
```json
{
  "isSuccess": true,
  "message": "Listing is available.",
  "data": {
    "isAvailable": true,
    "message": "Listing is active and available for purchase.",
    "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "eventId": "eeeeeeee-0000-0000-0000-000000000001",
    "askingPrice": 250000
  }
}
```

#### `PATCH /api/ticketlistings/{id}/mark-sold` — Mark Sold (Internal)

**Request:**
```json
{
  "newOwnerUserId": "bbbbbbbb-0000-0000-0000-000000000002"
}
```

**Response `200`:**
```json
{
  "isSuccess": true,
  "message": "Ticket ownership transferred and listing marked as sold.",
  "data": {
    "id": "7f1b3e20-0000-0000-0000-000000000099",
    "status": "Sold"
  }
}
```

#### `POST /api/tickets/internal/bulk-create` — Bulk Create Tickets *(New — Normal Booking)*

Called by BookingService's `GetPaymentStatus` after a successful **normal** payment to materialise individual Ticket records for the buyer.

**Request:**
```json
{
  "ticketTypeId": "tttttttt-0000-0000-0000-000000000001",
  "eventId": "eeeeeeee-0000-0000-0000-000000000001",
  "ownerId": "bbbbbbbb-0000-0000-0000-000000000002",
  "quantity": 2,
  "zone": "VIP"
}
```

**Response `201`:**
```json
{
  "isSuccess": true,
  "message": "2 ticket(s) created successfully.",
  "data": [
    "aaaaaaaa-1111-0000-0000-000000000001",
    "aaaaaaaa-2222-0000-0000-000000000002"
  ]
}
```

---

## BookingService — Trade Booking & Payment

### Domain Changes

```csharp
// New enum
public enum BookingTypeEnum
{
    Normal = 1,
    TradePurchase = 2,
}

// Booking entity — added field
public BookingTypeEnum BookingType { get; set; } = BookingTypeEnum.Normal;

// BookingDetail entity — added fields
/// For Normal bookings: references the TicketType purchased.
/// Used by GetPaymentStatus callback to bulk-create Ticket records in TicketService.
public Guid? TicketTypeId { get; set; }

/// For TradePurchase bookings: the TicketListing Id being purchased.
public Guid? ResaleId { get; set; }
```

### API Endpoints (BookingService)

**Base URL:** `http://localhost:6301`  
**Gateway:** `http://localhost:5000/api/trade-bookings/*` → `booking-cluster`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/trade-bookings` | Create a trade booking + get Momo payment URL | Required |
| `GET` | `/api/payments/callback` | Momo payment callback (handles both Normal & Trade) | Public |

### Request / Response Examples (BookingService)

#### `POST /api/trade-bookings` — Create Trade Booking

**Request:**
```json
{
  "listingId": "7f1b3e20-0000-0000-0000-000000000099",
  "buyerUserId": "bbbbbbbb-0000-0000-0000-000000000002",
  "fullname": "Nguyen Van A",
  "email": "buyer@example.com",
  "phone": "0912345678"
}
```

**Response `201`:**
```json
{
  "isSuccess": true,
  "message": "Trade booking created successfully.",
  "data": {
    "id": "cccccccc-0000-0000-0000-000000000003",
    "userId": "bbbbbbbb-0000-0000-0000-000000000002",
    "eventId": "eeeeeeee-0000-0000-0000-000000000001",
    "fullname": "Nguyen Van A",
    "email": "buyer@example.com",
    "phone": "0912345678",
    "amount": 1,
    "totalPrice": 250000,
    "status": "Pending",
    "bookingType": "TradePurchase",
    "paymentUrl": "https://payment.momo.vn/pay/...",
    "bookingDetails": [
      {
        "id": "dddddddd-0000-0000-0000-000000000004",
        "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "resaleId": "7f1b3e20-0000-0000-0000-000000000099",
        "quantity": 1,
        "pricePerTicket": 250000,
        "totalPrice": 250000
      }
    ]
  }
}
```

---

## Payment Callback Flow

The Momo callback hits `GET /api/payments/callback` on BookingService.

### `extraData` Encoding

| Booking Type | `extraData` value | Example |
|---|---|---|
| Normal | `{eventId}` | `eeeeeeee-0000-0000-0000-000000000001` |
| TradePurchase | `{eventId}\|{listingId}` | `eeeeeeee-...\|7f1b3e20-...` |

### Callback Logic (`GetPaymentStatus`)

```
GET /api/payments/callback
  ?orderId={bookingId}&message=success&extraData={extraData}&amount=...&transId=...
```

1. Parse `orderId`, `message`, `extraData` from query string
2. Load `Booking` and `Payment` from DB by `orderId`
3. **If `message != "success"`** → `Booking.Status = Canceled`
4. **If `message == "success"`**:
   - `Booking.Status = Paid`, `Booking.PaidAt = now`
   - **Case A — `BookingType == TradePurchase`** *(resale ticket)*:
     - Parse `listingId` from `extraData` (segment after `|`)
     - Call `PATCH /api/ticketlistings/{listingId}/mark-sold` on TicketService
       - TicketService: `Ticket.OwnerId = buyerUserId`, `Ticket.Status = Available`, `Listing.Status = Sold`
     - Create `ResaleTransaction` audit record in BookingService
   - **Case B — `BookingType == Normal`** *(standard ticket purchase)*:
     - Load `BookingDetail` for this Booking
     - Read `BookingDetail.TicketTypeId` and `BookingDetail.Quantity`
     - Call `POST /api/tickets/internal/bulk-create` on TicketService
       - TicketService creates `Quantity` individual `Ticket` rows, each with `OwnerId = buyerUserId`, `Status = Available`
   - `Payment.PaidAt = now`
5. Save all changes
6. **Redirect**:
   - Normal → `http://localhost:3000/events/{eventId}/booking/confirm?bookingId={bookingId}`
   - Trade → `http://localhost:3000/marketplace/confirm?bookingId={bookingId}&listingId={listingId}`

---

## Gateway Routing (YARP)

Add the following routes to the YARP gateway configuration:

```json
{
  "Routes": {
    "ticketlistings-route": {
      "ClusterId": "ticket-cluster",
      "Match": { "Path": "/api/ticketlistings/{**catch-all}" }
    },
    "trade-bookings-route": {
      "ClusterId": "booking-cluster",
      "Match": { "Path": "/api/trade-bookings/{**catch-all}" }
    }
  }
}
```

| Route Pattern | Cluster | Backend Service | Port |
|---|---|---|---|
| `/api/ticketlistings/*` | `ticket-cluster` | `http://localhost:6201` | 6201 |
| `/api/trade-bookings/*` | `booking-cluster` | `http://localhost:6301` | 6301 |

---

## Files Changed / Created

### TicketService

| Path | Status | Description |
|------|--------|-------------|
| `Domain/Enum/TicketListingStatusEnum.cs` | ✅ New | Listing status enum |
| `Domain/Entities/TicketListing.cs` | ✅ New | TicketListing domain model |
| `Domain/Entities/Ticket.cs` | 🔧 Modified | Added `Listings` navigation property |
| `Application/Interfaces/Repositories/ITicketUnitOfWork.cs` | 🔧 Modified | Added `TicketListings` repository |
| `Application/CQRS/Command/TicketListing/TicketListingCreateCommand.cs` | ✅ New | Create listing command |
| `Application/CQRS/Command/TicketListing/TicketListingCancelCommand.cs` | ✅ New | Cancel listing command |
| `Application/CQRS/Command/TicketListing/TicketListingMarkSoldCommand.cs` | ✅ New | Mark sold + transfer ownership |
| `Application/CQRS/Command/Ticket/TicketBulkCreateCommand.cs` | ✅ **New** | Bulk-create Tickets command (post normal payment) |
| `Application/CQRS/Query/TicketListing/TicketListingGetListQuery.cs` | ✅ New | Paginated list query |
| `Application/CQRS/Query/TicketListing/TicketListingGetByIdQuery.cs` | ✅ New | Get by ID + Validate queries |
| `Application/CQRS/Handler/TicketListing/TicketListingCreateCommandHandler.cs` | ✅ New | Create handler with ownership check |
| `Application/CQRS/Handler/TicketListing/TicketListingCancelCommandHandler.cs` | ✅ New | Cancel handler, unlocks ticket |
| `Application/CQRS/Handler/TicketListing/TicketListingMarkSoldCommandHandler.cs` | ✅ New | Transfers ticket ownership |
| `Application/CQRS/Handler/TicketListing/TicketListingGetListQueryHandler.cs` | ✅ New | Paginated list handler |
| `Application/CQRS/Handler/TicketListing/TicketListingGetByIdQueryHandler.cs` | ✅ New | GetById + Validate handlers |
| `Application/CQRS/Handler/Ticket/TicketBulkCreateCommandHandler.cs` | ✅ **New** | Creates N `Ticket` rows with `OwnerId = buyer` |
| `Application/DTOs/Response/TicketListing/TicketListingDTO.cs` | ✅ New | DTO |
| `Application/DTOs/Response/TicketListing/TicketListingResponses.cs` | ✅ New | Typed response wrappers |
| `Infrastructure/Persistence/Configurations/TicketListingConfiguration.cs` | ✅ New | EF Core entity config |
| `Infrastructure/Persistence/ApplicationDbContext.cs` | 🔧 Modified | Added `DbSet<TicketListing>` |
| `Infrastructure/Implements/Repositories/UnitOfWork.cs` | 🔧 Modified | Added `TicketListings` repo |
| `Infrastructure/Migrations/20260308000001_AddTicketListing.cs` | ✅ New | DB migration |
| `Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs` | 🔧 Modified | Updated snapshot |
| `Api/Controllers/TicketController.cs` | 🔧 **Modified** | Added `POST /api/tickets/internal/bulk-create` |
| `Api/Controllers/TicketListingController.cs` | ✅ New | REST controller |

### BookingService

| Path | Status | Description |
|------|--------|-------------|
| `Domain/Enum/BookingTypeEnum.cs` | ✅ New | `Normal` / `TradePurchase` |
| `Domain/Entities/Booking.cs` | 🔧 Modified | Added `BookingType` field |
| `Domain/Entities/BookingDetail.cs` | 🔧 **Modified** | Added `TicketTypeId` (normal bookings) and `ResaleId` (trade bookings) |
| `Application/Interfaces/Services/ITicketServiceClient.cs` | 🔧 **Modified** | Added `BulkCreateTicketsAsync` + `BulkCreateTicketsRequest/Result` DTOs |
| `Application/DTOs/Request/OrderInfoModel.cs` | 🔧 Modified | Added `ResaleId` |
| `Application/DTOs/Response/Booking/GetAllBookingResponse.cs` | 🔧 Modified | Added `BookingType` to `BookingDTO`, `ResaleId` to `BookingDetailSubDTO` |
| `Application/CQRS/Command/Booking/TradeBookingCreateCommand.cs` | ✅ New | Trade booking command |
| `Application/CQRS/Handler/Booking/TradeBookingCreateCommandHandler.cs` | ✅ New | Validates listing, creates booking, returns pay URL |
| `Application/CQRS/Handler/Booking/BookingCreateCommandHandler.cs` | 🔧 **Modified** | Stores `TicketTypeId` in `BookingDetail` |
| `Infrastructure/Implements/Services/TicketServiceHttpClient.cs` | 🔧 **Modified** | Added `BulkCreateTicketsAsync` + `BulkCreateTicketsHttpResponse` DTO |
| `Infrastructure/Implements/Services/MomoServices.cs` | 🔧 **Modified** | `GetPaymentStatus`: Normal → bulk-create Tickets; Trade → mark-sold + ResaleTransaction |
| `Infrastructure/Persistence/Configurations/BookingConfiguration.cs` | 🔧 Modified | Added `booking_type` column mapping |
| `Infrastructure/Persistence/Configurations/BookingDetailConfiguration.cs` | 🔧 **Modified** | Added `ticket_type_id` and `resale_id` column mappings |
| `Infrastructure/Migrations/20260308000001_AddTradingPlaceFields.cs` | ✅ New | DB migration |
| `Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs` | 🔧 Modified | Updated snapshot |
| `Api/Controllers/TradeBookingController.cs` | ✅ New | `POST /api/trade-bookings` |
| `Api/Controllers/PaymentController.cs` | 🔧 Modified | Callback handles both Normal & Trade redirects |

---

## Business Rules & Validations

### Creating a Listing
- ✅ Ticket must exist and **not be deleted**
- ✅ `Ticket.OwnerId` must match `SellerUserId` (only owner can list)
- ✅ `Ticket.Status` must be `Available` (cannot list a locked/sold ticket)
- ✅ Only **one active listing** allowed per ticket at a time
- ✅ On creation: `Ticket.Status` → `Locked` (prevents double booking)

### Cancelling a Listing
- ✅ Only the original seller can cancel
- ✅ Cannot cancel a `Sold` listing
- ✅ On cancel: `Ticket.Status` → `Available` (unlocked)

### Buying a Normal Ticket (post-payment)
- ✅ `BookingDetail.TicketTypeId` is persisted at booking-creation time
- ✅ After confirmed payment, `Quantity` individual `Ticket` rows are created in TicketService
- ✅ Each created Ticket has `OwnerId = buyerUserId` and `Status = Available`
- ✅ The buyer can later list any of these tickets for trade

### Buying a Listing (Trade)
- ✅ Listing must be `Active` at time of purchase
- ✅ `Booking.BookingType = TradePurchase` distinguishes from normal bookings
- ✅ `BookingDetail.ResaleId` stores the `TicketListing.Id` for traceability
- ✅ Payment URL encodes `extraData = "{eventId}|{listingId}"` for callback routing

### Payment Callback (`GetPaymentStatus`)
- ✅ **Normal success** → `BulkCreateTicketsAsync` called → N `Ticket` rows created with `OwnerId = buyer`
- ✅ **Trade success** → `MarkListingSoldAsync` called → `Ticket.OwnerId = buyer`, `Listing.Status = Sold`, `ResaleTransaction` created
- ✅ **Failure** → `Booking.Status = Canceled` (for trade, listing stays `Active` allowing retry)
- ✅ Frontend redirected to `/events/{eventId}/booking/confirm` (normal) or `/marketplace/confirm` (trade)

### Race Condition Prevention
- ⚠️ Listing status set to `Active` while ticket is `Locked` — two simultaneous buyers will both attempt to pay but only the first successful callback completes the transfer
- 💡 **Recommended:** Set `Listing.Status = Pending` on payment initiation and implement expiry to revert if payment never completes

