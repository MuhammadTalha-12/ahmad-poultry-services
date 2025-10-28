# API Documentation

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://ahmad-poultry-backend.onrender.com` (or your deployed URL)

## Authentication

All endpoints (except `/api/auth/login/`) require JWT authentication.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Endpoints

### Authentication

#### Login
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

---

### Customers

#### List Customers
```http
GET /api/customers/?page=1&page_size=25&search=ali&is_active=true
```

**Query Parameters:**
- `page` (int): Page number
- `page_size` (int): Items per page
- `search` (string): Search by name, phone, address
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/customers/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Ali Traders",
      "phone": "0300-1234567",
      "address": "Shop 1, Main Market",
      "opening_balance": "5000.000",
      "running_balance": "12500.500",
      "is_active": true,
      "created_at": "2025-10-01T10:00:00Z",
      "updated_at": "2025-10-28T15:30:00Z"
    }
  ]
}
```

#### Create Customer
```http
POST /api/customers/
```

**Request Body:**
```json
{
  "name": "New Customer",
  "phone": "0321-9876543",
  "address": "Address here",
  "opening_balance": "10000.000"
}
```

#### Get Customer
```http
GET /api/customers/{id}/
```

#### Update Customer
```http
PATCH /api/customers/{id}/
```

#### Customer Statement
```http
GET /api/customers/{id}/statement/?start_date=2025-10-01&end_date=2025-10-31
```

**Response (200 OK):**
```json
{
  "customer": { /* customer object */ },
  "sales": [ /* array of sale objects */ ],
  "payments": [ /* array of payment objects */ ],
  "opening_balance": "5000.000",
  "closing_balance": "12500.500"
}
```

---

### Sales

#### List Sales
```http
GET /api/sales/?date_from=2025-10-01&date_to=2025-10-31&customer=1
```

**Query Parameters:**
- `date`, `date_from`, `date_to`: Filter by date
- `customer`: Filter by customer ID
- `customer_name`: Search by customer name

#### Create Sale
```http
POST /api/sales/
```

**Request Body:**
```json
{
  "date": "2025-10-28",
  "customer": 1,
  "kg": "50.500",
  "sale_rate_per_kg": "220.000",
  "cost_rate_snapshot": "200.000",
  "amount_received": "10000.000",
  "note": "Regular delivery"
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "date": "2025-10-28",
  "customer": 1,
  "customer_name": "Ali Traders",
  "kg": "50.500",
  "sale_rate_per_kg": "220.000",
  "cost_rate_snapshot": "200.000",
  "total_amount": "11110.000",
  "amount_received": "10000.000",
  "borrow_amount": "1110.000",
  "profit": "1010.000",
  "note": "Regular delivery",
  "created_at": "2025-10-28T15:45:00Z",
  "updated_at": "2025-10-28T15:45:00Z"
}
```

---

### Purchases

#### List Purchases
```http
GET /api/purchases/?date_from=2025-10-01&date_to=2025-10-31
```

#### Create Purchase
```http
POST /api/purchases/
```

**Request Body:**
```json
{
  "date": "2025-10-28",
  "supplier": "Poultry Farm A",
  "kg": "200.000",
  "cost_rate_per_kg": "195.000",
  "note": "Morning batch"
}
```

---

### Payments

#### List Payments
```http
GET /api/payments/?customer=1&date_from=2025-10-01
```

#### Create Payment
```http
POST /api/payments/
```

**Request Body:**
```json
{
  "date": "2025-10-28",
  "customer": 1,
  "amount": "5000.000",
  "method": "cash",
  "note": "Partial payment"
}
```

---

### Expenses

#### List Expenses
```http
GET /api/expenses/?category=petrol&date_from=2025-10-01
```

#### Create Expense
```http
POST /api/expenses/
```

**Request Body:**
```json
{
  "date": "2025-10-28",
  "category": "petrol",
  "amount": "2000.000",
  "note": "Van fuel"
}
```

---

### Reports

#### Daily Report
```http
GET /api/reports/daily/?date=2025-10-28
```

**Response (200 OK):**
```json
{
  "date": "2025-10-28",
  "purchases_kg": "350.000",
  "purchases_cost": "68250.000",
  "sales_kg": "425.500",
  "sales_revenue": "93610.000",
  "profit": "8510.000",
  "cash_received": "85000.000",
  "borrow": "8610.000",
  "expenses_total": "12000.000",
  "closing_stock": "124.500"
}
```

#### Period Report
```http
GET /api/reports/period/?start_date=2025-10-01&end_date=2025-10-31
```

**Response (200 OK):**
```json
{
  "start_date": "2025-10-01",
  "end_date": "2025-10-31",
  "purchases_kg": "10500.000",
  "purchases_cost": "2047500.000",
  "sales_kg": "12750.000",
  "sales_revenue": "2805750.000",
  "profit": "255375.000",
  "cash_received": "2600000.000",
  "borrow": "205750.000",
  "expenses_total": "360000.000",
  "expenses_by_category": {
    "van_repair": "45000.000",
    "feed": "120000.000",
    "salary": "150000.000",
    "petrol": "40000.000",
    "other": "5000.000"
  },
  "customer_breakdown": {
    "Ali Traders": {
      "kg": "850.500",
      "revenue": "187110.000",
      "profit": "17010.000"
    }
  }
}
```

#### Expense Report
```http
GET /api/reports/expenses/?start_date=2025-10-01&end_date=2025-10-31&category=petrol
```

#### Customer Report
```http
GET /api/customers/{id}/report/?start_date=2025-10-01&end_date=2025-10-31
```

---

### API Schema & Interactive Docs

#### OpenAPI Schema
```http
GET /api/schema/
```

#### Swagger UI
```http
GET /api/docs/
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"],
  "non_field_errors": ["General error"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "An error occurred. Please try again later."
}
```

