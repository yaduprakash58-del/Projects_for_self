#!/bin/bash
# =============================================================
#  BillApp - cURL Quick Reference
#  Usage: chmod +x billapp-curl-commands.sh
#         Edit BASE_URL if needed, then run individual commands
# =============================================================

BASE_URL="http://localhost:8080"

# ─── 1. LOGIN & SAVE TOKEN ───────────────────────────────────
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: ${TOKEN:0:40}..."

# ─── 2. DASHBOARD ────────────────────────────────────────────
curl -s -X GET "$BASE_URL/api/bills/dashboard" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── 3. GET ALL BILLS ────────────────────────────────────────
curl -s -X GET "$BASE_URL/api/bills" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── 4. GET BILL BY ID ───────────────────────────────────────
BILL_ID=1
curl -s -X GET "$BASE_URL/api/bills/$BILL_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── 5. CREATE BILL ──────────────────────────────────────────
NEW_BILL=$(curl -s -X POST "$BASE_URL/api/bills" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer Ltd",
    "customerEmail": "test@customer.com",
    "customerPhone": "+91-80-1234-5678",
    "customerAddress": "123 Test Street, Bengaluru",
    "billDate": "2025-01-22",
    "dueDate": "2025-02-22",
    "taxRate": 18,
    "discount": 500,
    "status": "DRAFT",
    "notes": "Test bill created via curl",
    "companyName": "BillApp Solutions Pvt Ltd",
    "companyEmail": "billing@billapp.in",
    "items": [
      {"description": "Consulting Services", "quantity": 10, "unitPrice": 1000, "unit": "hrs"},
      {"description": "Software License",    "quantity": 1,  "unitPrice": 5000, "unit": "license"}
    ]
  }')
echo "$NEW_BILL" | python3 -m json.tool
NEW_ID=$(echo "$NEW_BILL" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "New Bill ID: $NEW_ID"

# ─── 6. UPDATE BILL ──────────────────────────────────────────
curl -s -X PUT "$BASE_URL/api/bills/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer Ltd - Updated",
    "customerEmail": "updated@customer.com",
    "billDate": "2025-01-22",
    "dueDate": "2025-03-01",
    "taxRate": 18,
    "discount": 1000,
    "status": "PENDING",
    "companyName": "BillApp Solutions Pvt Ltd",
    "companyEmail": "billing@billapp.in",
    "items": [
      {"description": "Updated Consulting", "quantity": 15, "unitPrice": 1000, "unit": "hrs"},
      {"description": "Software License",   "quantity": 1,  "unitPrice": 5000, "unit": "license"}
    ]
  }' | python3 -m json.tool

# ─── 7. UPDATE STATUS ────────────────────────────────────────
curl -s -X PATCH "$BASE_URL/api/bills/$NEW_ID/status?status=PAID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── 8. DOWNLOAD PDF ─────────────────────────────────────────
curl -s -X GET "$BASE_URL/api/bills/$NEW_ID/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o "bill-$NEW_ID.pdf"
echo "PDF saved as bill-$NEW_ID.pdf"

# ─── 9. DELETE BILL ──────────────────────────────────────────
curl -s -X DELETE "$BASE_URL/api/bills/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN"
echo "Bill $NEW_ID deleted"

# ─── 10. REGISTER NEW USER ───────────────────────────────────
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@billapp.com",
    "password": "newpass123"
  }' | python3 -m json.tool
