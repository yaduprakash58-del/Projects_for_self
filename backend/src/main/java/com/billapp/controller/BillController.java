package com.billapp.controller;

import com.billapp.dto.Dtos.*;
import com.billapp.entity.Bill;
import com.billapp.service.BillService;
import com.billapp.service.EmailService;
import com.billapp.service.PdfService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired private BillService billService;
    @Autowired private PdfService pdfService;
    @Autowired private EmailService emailService;

    @GetMapping
    public ResponseEntity<List<BillResponse>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillResponse> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<BillResponse> createBill(@Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billService.createBill(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<BillResponse> updateBill(@PathVariable Long id,
                                                    @Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.ok(billService.updateBill(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<BillResponse> updateStatus(@PathVariable Long id,
                                                      @RequestParam Bill.BillStatus status) {
        return ResponseEntity.ok(billService.updateStatus(id, status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        try {
            BillResponse bill = billService.getBillById(id);
            byte[] pdf = pdfService.generateBillPdf(bill);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", bill.getBillNumber() + ".pdf");
            headers.setContentLength(pdf.length);

            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/send-email")
    public ResponseEntity<MessageResponse> sendEmail(@PathVariable Long id,
                                                     @Valid @RequestBody(required = false) SendEmailRequest request) {
        BillResponse bill = billService.getBillById(id);
        String to = (request != null && request.getRecipientEmail() != null && !request.getRecipientEmail().isBlank())
            ? request.getRecipientEmail()
            : bill.getCustomerEmail();

        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest()
                .body(MessageResponse.builder().message("No recipient email available for this bill").build());
        }

        try {
            byte[] pdf = pdfService.generateBillPdf(bill);
            emailService.sendBillEmail(bill, to,
                request != null ? request.getSubject() : null,
                request != null ? request.getMessage() : null,
                pdf);
            return ResponseEntity.ok(MessageResponse.builder().message("Invoice sent to " + to).build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(MessageResponse.builder().message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponse.builder().message("Failed to send email: " + e.getMessage()).build());
        }
    }

    @GetMapping("/{id}/whatsapp-link")
    public ResponseEntity<WhatsAppLinkResponse> whatsappLink(@PathVariable Long id) {
        return ResponseEntity.ok(billService.buildWhatsAppLink(id));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(billService.getDashboardStats());
    }
}
