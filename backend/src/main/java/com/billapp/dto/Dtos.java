package com.billapp.dto;

import com.billapp.entity.Bill;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Dtos {

    // ===== AUTH DTOs =====
    @Data
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank private String username;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String username;
        private String email;
        private String role;
    }

    // ===== BILL ITEM DTOs =====
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillItemDto {
        private Long id;
        @NotBlank private String description;
        @NotNull @Positive private BigDecimal quantity;
        @NotNull @Positive private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String unit;
    }

    // ===== BILL DTOs =====
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBillRequest {
        @NotBlank private String customerName;
        private String customerEmail;
        private String customerPhone;
        private String customerAddress;
        @NotNull private LocalDate billDate;
        private LocalDate dueDate;
        @NotNull @DecimalMin("0") private BigDecimal taxRate;
        @DecimalMin("0") private BigDecimal discount;
        private String notes;
        private String companyName;
        private String companyAddress;
        private String companyPhone;
        private String companyEmail;
        @NotEmpty private List<BillItemDto> items;
        private Bill.BillStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillResponse {
        private Long id;
        private String billNumber;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private String customerAddress;
        private LocalDate billDate;
        private LocalDate dueDate;
        private BigDecimal subtotal;
        private BigDecimal taxRate;
        private BigDecimal taxAmount;
        private BigDecimal discount;
        private BigDecimal totalAmount;
        private Bill.BillStatus status;
        private String notes;
        private String companyName;
        private String companyAddress;
        private String companyPhone;
        private String companyEmail;
        private List<BillItemDto> items;
        private String createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ===== USER DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String role;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateUserRequest {
        @NotBlank private String username;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
        private String role;
    }

    @Data
    public static class UpdateRoleRequest {
        @NotBlank private String role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private long totalBills;
        private long paidBills;
        private long pendingBills;
        private long draftBills;
        private BigDecimal totalRevenue;
        private List<BillResponse> recentBills;
    }
}
