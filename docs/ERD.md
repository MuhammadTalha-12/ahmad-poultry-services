# Entity Relationship Diagram (ERD)

## Ahmad Poultry Services - Database Schema

### Tables

#### Customer
Stores customer information and opening balances.

| Field | Type | Constraints |
|-------|------|-------------|
| id | Integer | Primary Key, Auto-increment |
| name | String(255) | Unique, Indexed |
| phone | String(20) | Optional |
| address | Text | Optional |
| opening_balance | Decimal(12,3) | Default: 0.000, >= 0 |
| is_active | Boolean | Default: True, Indexed |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

**Computed Field:**
- `running_balance` = opening_balance + sum(sales.total_amount) - sum(payments.amount)

---

#### DailyRate
Stores default cost and sale rates for each business day.

| Field | Type | Constraints |
|-------|------|-------------|
| id | Integer | Primary Key, Auto-increment |
| date | Date | Unique, Indexed |
| default_cost_rate | Decimal(10,3) | >= 0.000 |
| default_sale_rate | Decimal(10,3) | >= 0.000 |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

---

#### Purchase
Tracks daily chicken purchases from poultry farms.

| Field | Type | Constraints |
|-------|------|-------------|
| id | Integer | Primary Key, Auto-increment |
| date | Date | Indexed |
| supplier | String(255) | Optional |
| kg | Decimal(10,3) | > 0.000 |
| cost_rate_per_kg | Decimal(10,3) | >= 0.000 |
| note | Text | Optional |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

**Computed Field:**
- `total_cost` = kg * cost_rate_per_kg

**Indexes:**
- date (DESC)
- (date DESC, created_at DESC)

---

#### Sale
Records sales transactions to customers.

| Field | Type | Constraints |
|-------|------|-------------|
| id | Integer | Primary Key, Auto-increment |
| date | Date | Indexed |
| customer_id | Integer | Foreign Key → Customer, On Delete: PROTECT |
| kg | Decimal(10,3) | > 0.000 |
| sale_rate_per_kg | Decimal(10,3) | >= 0.000 |
| cost_rate_snapshot | Decimal(10,3) | >= 0.000 (for profit calculation) |
| amount_received | Decimal(12,3) | >= 0.000, Default: 0.000 |
| note | Text | Optional |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

**Computed Fields:**
- `total_amount` = kg * sale_rate_per_kg
- `borrow_amount` = total_amount - amount_received
- `profit` = kg * (sale_rate_per_kg - cost_rate_snapshot)

**Indexes:**
- date (DESC)
- (customer_id, date)
- (date DESC, created_at DESC)

---

#### Payment
Tracks customer payments against outstanding balances.

| Field | Type | Constraints |
|-------|------|-------------|
| id | Integer | Primary Key, Auto-increment |
| date | Date | Indexed |
| customer_id | Integer | Foreign Key → Customer, On Delete: PROTECT |
| amount | Decimal(12,3) | > 0.000 |
| method | Enum | 'cash', 'bank', 'other' (Default: 'cash') |
| note | Text | Optional |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

**Indexes:**
- date (DESC)
- (customer_id, date)
- (date DESC, created_at DESC)

---

#### Expense
Tracks business expenses by category.

| Field | Type | Constraints |
|-------|------|-------------|
| id | Integer | Primary Key, Auto-increment |
| date | Date | Indexed |
| category | Enum | 'van_repair', 'feed', 'salary', 'petrol', 'other' |
| amount | Decimal(12,3) | > 0.000 |
| note | Text | Optional |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

**Indexes:**
- date (DESC)
- (category, date)
- (date DESC, created_at DESC)

---

## Relationships

```
Customer (1) ──< (Many) Sale
Customer (1) ──< (Many) Payment
```

---

## Business Logic

### Inventory Calculation
- **Total Stock** = Σ(Purchase.kg) - Σ(Sale.kg)

### Profit Calculation
- **Per Sale** = Sale.kg × (Sale.sale_rate_per_kg - Sale.cost_rate_snapshot)
- **Total Daily Profit** = Σ(Sale.profit for date)

### Customer Balance
- **Running Balance** = Customer.opening_balance + Σ(Sale.total_amount) - Σ(Payment.amount)

### Daily Summary
- **Revenue** = Σ(Sale.total_amount)
- **Cash Received** = Σ(Sale.amount_received) + Σ(Payment.amount)
- **Outstanding** = Revenue - Cash Received
- **Expenses** = Σ(Expense.amount)
- **Net Profit** = Total Profit - Expenses - Purchase Cost

