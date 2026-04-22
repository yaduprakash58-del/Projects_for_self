package com.billapp.service;

import com.billapp.dto.Dtos.*;
import com.billapp.entity.Bill;
import com.billapp.entity.BillItem;
import com.billapp.entity.User;
import com.billapp.repository.BillRepository;
import com.billapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillService {

    @Autowired private BillRepository billRepository;
    @Autowired private UserRepository userRepository;

    private String generateBillNumber() {
        Integer max = billRepository.findMaxBillNumber();
        int next = (max == null ? 0 : max) + 1;
        return String.format("BILL%04d", next);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @Transactional
    public BillResponse createBill(CreateBillRequest request) {
        User user = getCurrentUser();
        String billNumber = generateBillNumber();

        Bill bill = new Bill();
        bill.setBillNumber(billNumber);
        bill.setCreatedBy(user);
        bill.setStatus(request.getStatus() != null ? request.getStatus() : Bill.BillStatus.DRAFT);

        mapRequestToBill(request, bill);

        List<BillItem> items = request.getItems().stream().map(itemDto -> {
            BillItem item = new BillItem();
            item.setBill(bill);
            item.setDescription(itemDto.getDescription());
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            item.setUnit(itemDto.getUnit());
            item.setTotalPrice(itemDto.getQuantity().multiply(itemDto.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            return item;
        }).collect(Collectors.toList());

        bill.setItems(items);
        calculateTotals(bill);

        return mapToResponse(billRepository.save(bill));
    }

    @Transactional
    public BillResponse updateBill(Long id, CreateBillRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found"));

        mapRequestToBill(request, bill);

        if (request.getStatus() != null) {
            bill.setStatus(request.getStatus());
        }

        bill.getItems().clear();
        List<BillItem> items = request.getItems().stream().map(itemDto -> {
            BillItem item = new BillItem();
            item.setBill(bill);
            item.setDescription(itemDto.getDescription());
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            item.setUnit(itemDto.getUnit());
            item.setTotalPrice(itemDto.getQuantity().multiply(itemDto.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            return item;
        }).collect(Collectors.toList());

        bill.getItems().addAll(items);
        calculateTotals(bill);

        return mapToResponse(billRepository.save(bill));
    }

    private void mapRequestToBill(CreateBillRequest request, Bill bill) {
        bill.setCustomerName(request.getCustomerName());
        bill.setCustomerEmail(request.getCustomerEmail());
        bill.setCustomerPhone(request.getCustomerPhone());
        bill.setCustomerAddress(request.getCustomerAddress());
        bill.setBillDate(request.getBillDate());
        bill.setDueDate(request.getDueDate());
        bill.setTaxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO);
        bill.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        bill.setNotes(request.getNotes());
        bill.setCompanyName(request.getCompanyName());
        bill.setCompanyAddress(request.getCompanyAddress());
        bill.setCompanyPhone(request.getCompanyPhone());
        bill.setCompanyEmail(request.getCompanyEmail());
    }

    private void calculateTotals(Bill bill) {
        BigDecimal subtotal = bill.getItems().stream()
            .map(BillItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        bill.setSubtotal(subtotal);

        BigDecimal discount = bill.getDiscount() != null ? bill.getDiscount() : BigDecimal.ZERO;
        BigDecimal afterDiscount = subtotal.subtract(discount);

        BigDecimal taxRate = bill.getTaxRate() != null ? bill.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxAmount = afterDiscount.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        bill.setTaxAmount(taxAmount);
        bill.setTotalAmount(afterDiscount.add(taxAmount).setScale(2, RoundingMode.HALF_UP));
    }

    public List<BillResponse> getAllBills() {
        return billRepository.findAllOrderByCreatedAtDesc().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public BillResponse getBillById(Long id) {
        return mapToResponse(billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found")));
    }

    @Transactional
    public void deleteBill(Long id) {
        billRepository.deleteById(id);
    }

    @Transactional
    public BillResponse updateStatus(Long id, Bill.BillStatus status) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new RuntimeException("Bill not found"));
        bill.setStatus(status);
        return mapToResponse(billRepository.save(bill));
    }

    public DashboardStats getDashboardStats() {
        List<Bill> allBills = billRepository.findAll();

        BigDecimal totalRevenue = allBills.stream()
            .filter(b -> b.getStatus() == Bill.BillStatus.PAID)
            .map(Bill::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BillResponse> recent = billRepository.findAllOrderByCreatedAtDesc().stream()
            .limit(5)
            .map(this::mapToResponse)
            .collect(Collectors.toList());

        return DashboardStats.builder()
            .totalBills(allBills.size())
            .paidBills(allBills.stream().filter(b -> b.getStatus() == Bill.BillStatus.PAID).count())
            .pendingBills(allBills.stream().filter(b -> b.getStatus() == Bill.BillStatus.PENDING).count())
            .draftBills(allBills.stream().filter(b -> b.getStatus() == Bill.BillStatus.DRAFT).count())
            .totalRevenue(totalRevenue)
            .recentBills(recent)
            .build();
    }

    private BillResponse mapToResponse(Bill bill) {
        List<BillItemDto> itemDtos = bill.getItems() == null ? List.of() :
            bill.getItems().stream().map(item -> {
                BillItemDto dto = new BillItemDto();
                dto.setId(item.getId());
                dto.setDescription(item.getDescription());
                dto.setQuantity(item.getQuantity());
                dto.setUnitPrice(item.getUnitPrice());
                dto.setTotalPrice(item.getTotalPrice());
                dto.setUnit(item.getUnit());
                return dto;
            }).collect(Collectors.toList());

        return BillResponse.builder()
            .id(bill.getId())
            .billNumber(bill.getBillNumber())
            .customerName(bill.getCustomerName())
            .customerEmail(bill.getCustomerEmail())
            .customerPhone(bill.getCustomerPhone())
            .customerAddress(bill.getCustomerAddress())
            .billDate(bill.getBillDate())
            .dueDate(bill.getDueDate())
            .subtotal(bill.getSubtotal())
            .taxRate(bill.getTaxRate())
            .taxAmount(bill.getTaxAmount())
            .discount(bill.getDiscount())
            .totalAmount(bill.getTotalAmount())
            .status(bill.getStatus())
            .notes(bill.getNotes())
            .companyName(bill.getCompanyName())
            .companyAddress(bill.getCompanyAddress())
            .companyPhone(bill.getCompanyPhone())
            .companyEmail(bill.getCompanyEmail())
            .items(itemDtos)
            .createdBy(bill.getCreatedBy() != null ? bill.getCreatedBy().getUsername() : null)
            .createdAt(bill.getCreatedAt())
            .updatedAt(bill.getUpdatedAt())
            .build();
    }
}
