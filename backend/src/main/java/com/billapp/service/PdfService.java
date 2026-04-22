package com.billapp.service;

import com.billapp.dto.Dtos.BillItemDto;
import com.billapp.dto.Dtos.BillResponse;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(30, 30, 60));
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE);
    private static final Font BODY_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, new BaseColor(50, 50, 50));
    private static final Font BOLD_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, new BaseColor(30, 30, 60));
    private static final Font SMALL_FONT = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, new BaseColor(100, 100, 100));
    private static final Font TOTAL_FONT = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, new BaseColor(30, 30, 60));
    private static final BaseColor ACCENT_COLOR = new BaseColor(63, 81, 181);
    private static final BaseColor LIGHT_GRAY = new BaseColor(245, 245, 250);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    public byte[] generateBillPdf(BillResponse bill) throws DocumentException {
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, baos);
        document.open();

        // Header Section
        addHeader(document, bill);
        document.add(Chunk.NEWLINE);

        // Bill Info + Customer Info side by side
        addBillAndCustomerInfo(document, bill);
        document.add(Chunk.NEWLINE);

        // Items Table
        addItemsTable(document, bill);
        document.add(Chunk.NEWLINE);

        // Totals
        addTotals(document, bill);

        // Notes
        if (bill.getNotes() != null && !bill.getNotes().isBlank()) {
            document.add(Chunk.NEWLINE);
            addNotes(document, bill.getNotes());
        }

        // Footer
        addFooter(document, bill);

        document.close();
        return baos.toByteArray();
    }

    private void addHeader(Document document, BillResponse bill) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60, 40});

        // Company info
        String companyName = bill.getCompanyName() != null ? bill.getCompanyName() : "Your Company";
        Paragraph companyPara = new Paragraph();
        companyPara.add(new Chunk(companyName + "\n", TITLE_FONT));
        if (bill.getCompanyAddress() != null)
            companyPara.add(new Chunk(bill.getCompanyAddress() + "\n", SMALL_FONT));
        if (bill.getCompanyPhone() != null)
            companyPara.add(new Chunk("Ph: " + bill.getCompanyPhone() + "\n", SMALL_FONT));
        if (bill.getCompanyEmail() != null)
            companyPara.add(new Chunk(bill.getCompanyEmail(), SMALL_FONT));

        PdfPCell companyCell = new PdfPCell(companyPara);
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.setPadding(5);
        headerTable.addCell(companyCell);

        // INVOICE label
        PdfPTable invoiceLabel = new PdfPTable(1);
        PdfPCell labelCell = new PdfPCell(new Phrase("INVOICE", new Font(Font.FontFamily.HELVETICA, 28, Font.BOLD, ACCENT_COLOR)));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(5);
        invoiceLabel.addCell(labelCell);

        Paragraph billNumPara = new Paragraph();
        billNumPara.add(new Chunk("Bill No: ", BOLD_FONT));
        billNumPara.add(new Chunk(bill.getBillNumber() + "\n", BODY_FONT));
        billNumPara.add(new Chunk("Date: ", BOLD_FONT));
        billNumPara.add(new Chunk(bill.getBillDate() != null ? bill.getBillDate().format(DATE_FMT) : "" + "\n", BODY_FONT));
        if (bill.getDueDate() != null) {
            billNumPara.add(new Chunk("Due: ", BOLD_FONT));
            billNumPara.add(new Chunk(bill.getDueDate().format(DATE_FMT) + "\n", BODY_FONT));
        }

        // Status badge
        String statusText = bill.getStatus() != null ? bill.getStatus().name() : "DRAFT";
        BaseColor statusColor = getStatusColor(statusText);
        Chunk statusChunk = new Chunk("  " + statusText + "  ", new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE));
        billNumPara.add(statusChunk);

        PdfPCell rightCell = new PdfPCell(billNumPara);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightCell.setPadding(5);
        headerTable.addCell(rightCell);

        // Divider line
        PdfPCell divider = new PdfPCell();
        divider.setColspan(2);
        divider.setFixedHeight(3f);
        divider.setBackgroundColor(ACCENT_COLOR);
        divider.setBorder(Rectangle.NO_BORDER);
        headerTable.addCell(divider);

        document.add(headerTable);
    }

    private void addBillAndCustomerInfo(Document document, BillResponse bill) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        // Bill To
        PdfPCell billToCell = new PdfPCell();
        billToCell.setBorder(Rectangle.NO_BORDER);
        billToCell.setBackgroundColor(LIGHT_GRAY);
        billToCell.setPadding(10);

        Paragraph billTo = new Paragraph();
        billTo.add(new Chunk("BILL TO\n", new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, ACCENT_COLOR)));
        billTo.add(new Chunk(bill.getCustomerName() + "\n", BOLD_FONT));
        if (bill.getCustomerAddress() != null)
            billTo.add(new Chunk(bill.getCustomerAddress() + "\n", BODY_FONT));
        if (bill.getCustomerPhone() != null)
            billTo.add(new Chunk("Ph: " + bill.getCustomerPhone() + "\n", BODY_FONT));
        if (bill.getCustomerEmail() != null)
            billTo.add(new Chunk(bill.getCustomerEmail(), BODY_FONT));

        billToCell.addElement(billTo);
        table.addCell(billToCell);

        // Empty right cell
        PdfPCell emptyCell = new PdfPCell();
        emptyCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(emptyCell);

        document.add(table);
    }

    private void addItemsTable(Document document, BillResponse bill) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{40, 15, 15, 15, 15});

        // Headers
        String[] headers = {"Description", "Unit", "Qty", "Unit Price", "Total"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, HEADER_FONT));
            cell.setBackgroundColor(ACCENT_COLOR);
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBorder(Rectangle.NO_BORDER);
            table.addCell(cell);
        }

        boolean alternateRow = false;
        for (BillItemDto item : bill.getItems()) {
            BaseColor rowColor = alternateRow ? LIGHT_GRAY : BaseColor.WHITE;

            addItemCell(table, item.getDescription(), Element.ALIGN_LEFT, rowColor);
            addItemCell(table, item.getUnit() != null ? item.getUnit() : "-", Element.ALIGN_CENTER, rowColor);
            addItemCell(table, item.getQuantity().stripTrailingZeros().toPlainString(), Element.ALIGN_CENTER, rowColor);
            addItemCell(table, "₹" + fmt(item.getUnitPrice()), Element.ALIGN_RIGHT, rowColor);
            addItemCell(table, "₹" + fmt(item.getTotalPrice()), Element.ALIGN_RIGHT, rowColor);

            alternateRow = !alternateRow;
        }

        document.add(table);
    }

    private void addItemCell(PdfPTable table, String text, int align, BaseColor bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, BODY_FONT));
        cell.setBackgroundColor(bg);
        cell.setPadding(7);
        cell.setHorizontalAlignment(align);
        cell.setBorderColor(new BaseColor(220, 220, 230));
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }

    private void addTotals(Document document, BillResponse bill) throws DocumentException {
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(45);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

        addTotalRow(totalsTable, "Subtotal:", "₹" + fmt(bill.getSubtotal()), false);
        if (bill.getDiscount() != null && bill.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(totalsTable, "Discount:", "-₹" + fmt(bill.getDiscount()), false);
        }
        addTotalRow(totalsTable, "Tax (" + fmt(bill.getTaxRate()) + "%):", "₹" + fmt(bill.getTaxAmount()), false);

        // Total row with accent
        PdfPCell labelCell = new PdfPCell(new Phrase("TOTAL:", TOTAL_FONT));
        labelCell.setBackgroundColor(ACCENT_COLOR);
        labelCell.setPadding(8);
        labelCell.setBorder(Rectangle.NO_BORDER);
        PdfPCell valueCell = new PdfPCell(new Phrase("₹" + fmt(bill.getTotalAmount()), new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE)));
        valueCell.setBackgroundColor(ACCENT_COLOR);
        valueCell.setPadding(8);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(labelCell);
        totalsTable.addCell(valueCell);

        document.add(totalsTable);
    }

    private void addTotalRow(PdfPTable table, String label, String value, boolean highlight) {
        PdfPCell l = new PdfPCell(new Phrase(label, BOLD_FONT));
        l.setBorder(Rectangle.BOTTOM);
        l.setBorderColor(new BaseColor(220, 220, 230));
        l.setPadding(6);
        PdfPCell v = new PdfPCell(new Phrase(value, BODY_FONT));
        v.setBorder(Rectangle.BOTTOM);
        v.setBorderColor(new BaseColor(220, 220, 230));
        v.setPadding(6);
        v.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(l);
        table.addCell(v);
    }

    private void addNotes(Document document, String notes) throws DocumentException {
        PdfPTable notesTable = new PdfPTable(1);
        notesTable.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.LEFT);
        cell.setBorderColor(ACCENT_COLOR);
        cell.setBorderWidth(3);
        cell.setPadding(10);
        cell.setBackgroundColor(LIGHT_GRAY);
        Paragraph p = new Paragraph();
        p.add(new Chunk("Notes\n", BOLD_FONT));
        p.add(new Chunk(notes, BODY_FONT));
        cell.addElement(p);
        notesTable.addCell(cell);
        document.add(notesTable);
    }

    private void addFooter(Document document, BillResponse bill) throws DocumentException {
        document.add(Chunk.NEWLINE);
        PdfPTable footerTable = new PdfPTable(1);
        footerTable.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase("Thank you for your business!", new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, ACCENT_COLOR)));
        cell.setBorder(Rectangle.TOP);
        cell.setBorderColor(ACCENT_COLOR);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(10);
        footerTable.addCell(cell);
        document.add(footerTable);
    }

    private String fmt(BigDecimal val) {
        if (val == null) return "0.00";
        return String.format("%,.2f", val);
    }

    private BaseColor getStatusColor(String status) {
        return switch (status) {
            case "PAID" -> new BaseColor(56, 142, 60);
            case "PENDING" -> new BaseColor(230, 119, 0);
            case "CANCELLED" -> new BaseColor(211, 47, 47);
            default -> new BaseColor(96, 125, 139);
        };
    }
}
