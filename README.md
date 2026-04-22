# 📄 BillApp — Invoice Management System

A full-stack billing application built with **Spring Boot**, **React.js**, **MySQL**, **Java 17**, and **JPA**.

---

## 🚀 Quick Start

### Prerequisites

| Tool        | Version   |
|-------------|-----------|
| Java        | 17+       |
| Maven       | 3.8+      |
| Node.js     | 18+       |
| npm         | 9+        |
| MySQL       | 8.0+      |

---

## ⚙️ Setup Instructions

### Step 1: MySQL Database

Start MySQL and the database will be **auto-created** on first boot.

Default config (edit `backend/src/main/resources/application.properties` if needed):
```
DB URL:      jdbc:mysql://localhost:3306/billdb
Username:    root
Password:    root
```

If your MySQL credentials differ, update `application.properties`:
```properties
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

---

### Step 2: Start the Backend

```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

✅ A default admin user is created automatically on first run:
- **Username:** `admin`
- **Password:** `admin123`

---

### Step 3: Start the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 📦 One-Command Start (Both Services)

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```

### Windows
```bash
start.bat
```

---

## 🔑 Default Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## 🌟 Features

### Admin Panel
- 🔐 JWT-based authentication (Login / Register)
- 📊 Dashboard with stats (total bills, paid, pending, revenue)
- 📋 Bills list with search and filter by status
- ✏️ Create and Edit bills with live total calculation
- 📄 Download bills as PDF
- 🗑️ Delete bills with confirmation

### Bill Form
- Company information
- Customer details
- Dynamic line items (add/remove rows)
- Discount and tax rate
- Notes section
- Status management (Draft → Pending → Paid → Cancelled)

### PDF Generation
- Professional invoice layout with company branding
- Line items table
- Totals section (subtotal, discount, tax, grand total)
- Customer and company info
- Status badge and bill number

---

## 🏗️ Project Structure

```
bill-app/
├── backend/                        # Spring Boot
│   ├── src/main/java/com/billapp/
│   │   ├── config/                 # Security, CORS, global exception handler
│   │   ├── controller/             # REST controllers (auth, bills)
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── entity/                 # JPA entities (User, Bill, BillItem)
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JWT filter and utility
│   │   └── service/                # Business logic + PDF generation
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/                       # React.js
    └── src/
        ├── api/                    # Axios API layer
        ├── components/             # Layout, PrivateRoute
        ├── context/                # AuthContext (JWT storage)
        ├── pages/
        │   ├── auth/               # Login, Register
        │   ├── bills/              # List, Form (Create/Edit), Detail
        │   └── dashboard/          # Stats dashboard
        └── utils/                  # MUI theme
```

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| POST   | `/api/auth/login`           | Login               |
| POST   | `/api/auth/register`        | Register            |
| GET    | `/api/bills`                | All bills           |
| POST   | `/api/bills`                | Create bill         |
| GET    | `/api/bills/{id}`           | Get bill by ID      |
| PUT    | `/api/bills/{id}`           | Update bill         |
| PATCH  | `/api/bills/{id}/status`    | Update status       |
| DELETE | `/api/bills/{id}`           | Delete bill         |
| GET    | `/api/bills/{id}/pdf`       | Download PDF        |
| GET    | `/api/bills/dashboard`      | Dashboard stats     |

---

## 🛠️ Tech Stack

**Backend**
- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA + Hibernate
- MySQL 8
- iText PDF 5.5
- Maven

**Frontend**
- React 18
- React Router v6
- Material UI (MUI) v5
- Axios
- React Toastify
- date-fns
