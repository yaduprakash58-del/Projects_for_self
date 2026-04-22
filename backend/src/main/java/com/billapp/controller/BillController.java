package com.billapp.controller;

import com.billapp.dto.Dtos.*;
import com.billapp.entity.Bill;
import com.billapp.service.BillService;
import com.billapp.service.PdfService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired private BillService billService;
    @Autowired private PdfService pdfService;

    @GetMapping
    public ResponseEntity<List<BillResponse>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillResponse> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @PostMapping
    public ResponseEntity<BillResponse> createBill(@Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billService.createBill(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillResponse> updateBill(@PathVariable Long id,
                                                    @Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.ok(billService.updateBill(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BillResponse> updateStatus(@PathVariable Long id,
                                                      @RequestParam Bill.BillStatus status) {
        return ResponseEntity.ok(billService.updateStatus(id, status));
    }

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

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(billService.getDashboardStats());
    }
}
