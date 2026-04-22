package com.billapp.repository;

import com.billapp.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillNumber(String billNumber);
    List<Bill> findByCreatedById(Long userId);
    List<Bill> findByStatus(Bill.BillStatus status);

    @Query("SELECT b FROM Bill b ORDER BY b.createdAt DESC")
    List<Bill> findAllOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(b.billNumber, 5) AS int)), 0) FROM Bill b WHERE b.billNumber LIKE 'BILL%'")
    Integer findMaxBillNumber();
}
