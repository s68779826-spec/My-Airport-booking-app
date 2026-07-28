import { z } from "zod";
import { is } from "zod/locales";

export const registerSchema = z.object({
  firstName: z.string().min(2).max(50).describe("First name is required"),
  lastName: z.string().min(2).max(50).describe("Last name is required"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10).max(15).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export const serviceSchema = z.object({
  title: z.string().min(2).max(100),

  description: z.string().min(10).max(500).optional(),

  price: z.number().positive(),

  duration: z.number().int().positive(),

  categoryId: z.number().int().positive(),

  airportId: z.number().int().positive(),

  terminalId: z.number().int().positive(),

  isActive: z.boolean().optional(),
});
export const serviceCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500).optional(),
  isActive: z.boolean().optional(),
});
export const airportSchema = z.object({
  countryId: z.number().int().positive(),
  cityId: z.number().int().positive(),
  name: z.string().min(2, "Airport name must be at least 2 characters"),
  iataCode: z.string().max(3).optional(),
  address: z.string().optional(),
});
export const terminalsSchema = z.object({
  airportId: z.number().int().positive(),
  name: z.string().min(2, "Terminal name must be at least 2 characters"),
  description: z.string().optional(),
});
export const AirlinesSchema = z.object({
  name: z.string().min(2, "Airline name must be at least 2 characters"),
 iataCode: z.string().max(3).optional(),
 icaoCode: z.string().max(4).optional(),
 logo: z.string().optional(),
});
export const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  model: z.string().optional(),
  plateNumber: z.string().min(1, "Plate number is required"),
  color: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum([
    "AVAILABLE",
    "IN_USE",
    "MAINTENANCE",
    "OUT_OF_SERVICE",
  ]).optional(),
});
export const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  discount: z.number().positive("Discount must be greater than 0"),
  expiryDate: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const bookingSchema = z.object({
  userId: z.number().int().positive(),
 airlineId: z.number().int().positive(),
 airportId: z.number().int().positive(),
 terminalId: z.number().int().positive(),
 departureAirportId: z.number().int().positive().optional(),
 vehicleId: z.number().int().positive().optional(),
couponId: z.number().int().positive().optional(),
arrivalTime: z.string().datetime().optional(),
departureTime: z.string().datetime().optional(),
flightNumber: z.string().optional(),
specialRequest: z.string().optional(),
bookingDate: z.string().datetime(),
travelDate: z.string().datetime(),
bookingDirection: z.enum([
    "ARRIVAL",
    "DEPARTURE",
    "TRANSIT",
  ]),
bookingStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "INPROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]).optional(),

  totalAmount: z.number().positive(),
});

export const passengerSchema = z.object({
  bookingId: z.number().int().positive(),

  firstName: z.string().min(2),

  lastName: z.string().min(2),

  age: z.number().int().positive().optional(),

  gender: z.string().optional(),

  phone: z.string().optional(),

  email: z.string().email().optional(),

  travelClass: z.enum(["ECONOMY", "BUSINESS", "FIRST"]),

  dateOfBirth: z.coerce.date().optional(),
});
export const bookingServiceSchema = z.object({
  bookingId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
});

export const paymentSchema = z.object({
  bookingId: z.number().int().positive(),

  currencyId: z.number().int().positive(),

  amount: z.number().positive(),

  paymentMethod: z.enum([
    "CASH",
    "CARD",
    "BANK_TRANSFER",
    "Stripe",
    "Paypal",
    "Bank Transfer"
  ]),

  paymentStatus: z
    .enum([
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ])
    .optional(),

  transactionReference: z.string().optional(),

  paidAt: z.coerce.date().optional(),
});

export const invoiceSchema = z.object({
  bookingId: z
    .number({
      message: "Booking ID must be a number",
    })
    .int()
    .positive(),

  invoiceNumber: z
    .string({
      message: "Invoice number is required",
    })
    .min(3, "Invoice number must be at least 3 characters"),

  subtotal: z
    .number({
      message: "Subtotal must be a number",
    })
    .nonnegative(),

  tax: z
    .number({
      message: "Tax must be a number",
    })
    .nonnegative(),

  discount: z
    .number({
      message: "Discount must be a number",
    })
    .nonnegative(),

  total: z
    .number({
      message: "Total must be a number",
    })
    .nonnegative(),

  pdfUrl: z
    .string()
    .url("Invalid PDF URL")
    .optional()
    .nullable(),

});