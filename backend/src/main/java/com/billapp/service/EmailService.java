package com.billapp.service;

import com.billapp.dto.Dtos.BillResponse;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.from:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends the invoice as a PDF attachment. Throws IllegalStateException if SMTP
     * credentials have not been configured, so the caller can surface a clear message.
     */
    public void sendBillEmail(BillResponse bill, String to, String subject, String message, byte[] pdf)
            throws Exception {
        if (!StringUtils.hasText(smtpUsername)) {
            throw new IllegalStateException(
                "Email is not configured. Set MAIL_USERNAME and MAIL_PASSWORD environment variables.");
        }

        String from = StringUtils.hasText(fromAddress) ? fromAddress : smtpUsername;
        String finalSubject = StringUtils.hasText(subject)
            ? subject
            : "Invoice " + bill.getBillNumber()
                + (StringUtils.hasText(bill.getCompanyName()) ? " from " + bill.getCompanyName() : "");

        MimeMessage mime = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(finalSubject);
        helper.setText(buildHtmlBody(bill, message), true);
        helper.addAttachment(bill.getBillNumber() + ".pdf", new ByteArrayResource(pdf), "application/pdf");

        mailSender.send(mime);
    }

    private String buildHtmlBody(BillResponse bill, String customMessage) {
        String company = StringUtils.hasText(bill.getCompanyName()) ? bill.getCompanyName() : "Your Company";
        String greeting = "Hello " + escape(bill.getCustomerName()) + ",";
        String intro = StringUtils.hasText(customMessage)
            ? escape(customMessage)
            : "Please find attached your invoice <strong>" + escape(bill.getBillNumber())
                + "</strong> from " + escape(company) + ".";
        String due = bill.getDueDate() != null
            ? "<tr><td style='padding:4px 0;color:#666;'>Due date</td>"
                + "<td style='padding:4px 0;text-align:right;'>" + bill.getDueDate().format(DATE_FMT) + "</td></tr>"
            : "";

        return "<div style=\"font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#222;\">"
            + "<h2 style=\"color:#3f51b5;margin-bottom:4px;\">Invoice " + escape(bill.getBillNumber()) + "</h2>"
            + "<p>" + greeting + "</p>"
            + "<p>" + intro + "</p>"
            + "<table style=\"width:100%;border-collapse:collapse;margin:16px 0;\">"
            + "<tr><td style='padding:4px 0;color:#666;'>Invoice no.</td>"
            + "<td style='padding:4px 0;text-align:right;'>" + escape(bill.getBillNumber()) + "</td></tr>"
            + "<tr><td style='padding:4px 0;color:#666;'>Bill date</td>"
            + "<td style='padding:4px 0;text-align:right;'>"
            + (bill.getBillDate() != null ? bill.getBillDate().format(DATE_FMT) : "-") + "</td></tr>"
            + due
            + "<tr><td style='padding:10px 0 0;font-weight:bold;'>Total due</td>"
            + "<td style='padding:10px 0 0;text-align:right;font-weight:bold;color:#3f51b5;font-size:18px;'>&#8377;"
            + fmt(bill.getTotalAmount()) + "</td></tr>"
            + "</table>"
            + "<p style=\"color:#666;font-size:13px;\">The full invoice is attached as a PDF.</p>"
            + "<p style=\"margin-top:24px;\">Thank you for your business!<br>" + escape(company) + "</p>"
            + "</div>";
    }

    private String fmt(BigDecimal val) {
        return val == null ? "0.00" : String.format("%,.2f", val);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
