# 💰 Customer Balance Explanation

## Understanding Opening Balance vs Closing Balance

---

## 📊 What are these balances?

### Opening Balance (Initial Debt/Credit)
**What it is:** The amount a customer owed you (or you owed them) when you first started using this system.

**When to use it:**
- You're adding an existing customer who has previous transactions
- Customer already owes you money from before
- You owe customer money (advance payment)

**Examples:**

| Scenario | Opening Balance Value |
|----------|---------------------|
| New customer, no previous debt | `0` |
| Customer owes you 10,000 PKR | `10000` |
| You gave customer 5,000 PKR advance | `-5000` (negative) |
| Customer settled all dues before | `0` |

### Closing Balance (Running Balance / Current Balance)
**What it is:** The **current** amount showing how much the customer owes you (or you owe them).

**Formula:**
```
Closing Balance = Opening Balance + Total Sales - Total Payments
```

**What it means:**
- **Positive (Red)** ➜ Customer owes YOU money
- **Negative (Green)** ➜ YOU owe customer money (overpaid)
- **Zero (Black)** ➜ All settled, no debt either way

---

## 🎯 Real-World Examples

### Example 1: New Customer
**Customer:** Ali Traders (New customer)

| Field | Value | Reason |
|-------|-------|--------|
| Opening Balance | 0 | New customer, no previous transactions |
| Total Sales | 50,000 PKR | Made 2 sales: 20,000 + 30,000 |
| Total Payments | 30,000 PKR | Customer paid 30,000 |
| **Closing Balance** | **20,000 PKR (Red)** | Customer still owes 20,000 |

**Calculation:** 0 + 50,000 - 30,000 = **20,000 PKR**

---

### Example 2: Existing Customer with Previous Debt
**Customer:** Bismillah Store (Had previous debt before using this system)

| Field | Value | Reason |
|-------|-------|--------|
| Opening Balance | 15,000 | Customer already owed 15,000 from before |
| Total Sales | 100,000 PKR | New sales in this system |
| Total Payments | 80,000 PKR | Customer paid 80,000 |
| **Closing Balance** | **35,000 PKR (Red)** | Old debt + new sales - payments |

**Calculation:** 15,000 + 100,000 - 80,000 = **35,000 PKR**

---

### Example 3: Customer Who Overpaid
**Customer:** Rahmat Shop (Paid more than they owe)

| Field | Value | Reason |
|-------|-------|--------|
| Opening Balance | 0 | Started fresh |
| Total Sales | 25,000 PKR | Made sales worth 25,000 |
| Total Payments | 30,000 PKR | Customer paid 30,000 (advance) |
| **Closing Balance** | **-5,000 PKR (Green)** | YOU owe customer 5,000 |

**Calculation:** 0 + 25,000 - 30,000 = **-5,000 PKR**

**What this means:** Next time this customer buys something, adjust by reducing 5,000 from their payment.

---

### Example 4: Fully Settled Customer
**Customer:** Kareem Store

| Field | Value | Reason |
|-------|-------|--------|
| Opening Balance | 10,000 | Had old debt of 10,000 |
| Total Sales | 40,000 PKR | Made new sales |
| Total Payments | 50,000 PKR | Paid everything including old debt |
| **Closing Balance** | **0 PKR (Black)** | All settled up! |

**Calculation:** 10,000 + 40,000 - 50,000 = **0 PKR**

---

## 🔢 Visual Guide

### Color Coding in the System

```
🔴 RED (Positive number)     ➜  Customer owes YOU money
   Example: 20,000 PKR       ➜  They need to pay you 20,000

🟢 GREEN (Negative number)   ➜  YOU owe customer money
   Example: -5,000 PKR       ➜  You owe them 5,000 (advance)

⚫ BLACK (Zero)              ➜  All clear, no debt
   Example: 0 PKR            ➜  Everything is settled
```

---

## 📝 How to Set Opening Balance When Adding Customer

### Scenario A: Brand New Customer
```
Name: New Customer
Opening Balance: 0
```
No previous history, start fresh.

---

### Scenario B: Customer with Old Debt
**Customer previously owed you 8,000 PKR (from before system)**

```
Name: Old Customer
Opening Balance: 8000
```

Now when they make purchases:
- Make a sale of 10,000 PKR
- Receive payment of 5,000 PKR
- **Closing Balance:** 8,000 + 10,000 - 5,000 = **13,000 PKR** (They owe you)

---

### Scenario C: Customer with Advance Payment
**You took 3,000 PKR advance from customer before system**

```
Name: Advance Customer
Opening Balance: -3000
```

Now when they make purchases:
- Make a sale of 10,000 PKR
- Receive payment of 5,000 PKR
- **Closing Balance:** -3,000 + 10,000 - 5,000 = **2,000 PKR** (They still owe you)

**Note:** The advance (-3,000) gets adjusted automatically.

---

## 🎯 Common Questions

### Q1: What if I don't remember the exact opening balance?
**Answer:** 
- Check your old records (notebook, Excel, etc.)
- If unsure, start with `0` and note that older debts are not included
- Or estimate based on memory

### Q2: Can I change opening balance later?
**Answer:** 
- Yes! Use the **Edit** button (pencil icon)
- Closing balance will recalculate automatically
- However, be careful as this affects all calculations

### Q3: What if closing balance is negative (green)?
**Answer:** 
- This means YOU owe the customer money (they overpaid)
- Next sale: reduce their payment by this amount
- Or: record a negative payment to settle the advance

### Q4: How do I settle a customer's full balance?
**Answer:** 
1. Check their closing balance (e.g., 20,000 PKR)
2. Go to Payments page
3. Add payment for that customer: 20,000 PKR
4. Their closing balance becomes 0 PKR

### Q5: Customer says they don't owe this much, what to do?
**Answer:**
1. Go to Customers page
2. Click on customer (or use statement report)
3. Review all sales and payments
4. Check if:
   - Opening balance was entered correctly
   - All payments were recorded
   - Any sale was entered twice by mistake
5. Edit or delete incorrect records

---

## 📊 Tracking Example (Full Month)

**Customer:** Ali Traders
**Opening Balance (Jan 1):** 5,000 PKR (owed from December)

| Date | Type | Amount | Running Balance |
|------|------|--------|----------------|
| Jan 1 | Opening | 5,000 | 5,000 |
| Jan 5 | Sale | 20,000 | 25,000 |
| Jan 8 | Payment | -15,000 | 10,000 |
| Jan 15 | Sale | 30,000 | 40,000 |
| Jan 20 | Payment | -25,000 | 15,000 |
| Jan 25 | Sale | 10,000 | 25,000 |
| Jan 30 | Payment | -20,000 | 5,000 |

**End of January:**
- **Closing Balance:** 5,000 PKR (Red - Customer owes)
- **This becomes next month's opening balance if you want to track monthly**

---

## 💡 Best Practices

1. **Enter Opening Balance Carefully**
   - Double-check old records
   - Ask customer if needed
   - Better to underestimate than overestimate

2. **Record Sales Immediately**
   - Don't wait days
   - Enter as soon as sale happens
   - Closing balance stays accurate

3. **Record Payments Immediately**
   - When customer pays, enter it right away
   - Don't accumulate and enter later
   - Avoids confusion

4. **Regular Reconciliation**
   - Weekly: Check closing balances
   - Monthly: Generate reports
   - If any discrepancy, investigate immediately

5. **Customer Communication**
   - Show customers their closing balance when they buy
   - Remind customers with high closing balance
   - Keep good relationship

---

## 🔧 Using the System

### To Add Customer with Opening Balance:
1. Go to **Customers** page
2. Click **"Add Customer"**
3. Enter name, phone, address
4. **Opening Balance:** Enter the amount they currently owe
5. Click **"Add Customer"**

### To Check Closing Balance:
1. Go to **Customers** page
2. Find customer in the grid
3. Look at **"Closing Balance"** column
4. Color tells you: Red = they owe, Green = you owe, Black = settled

### To Update Opening Balance:
1. Find customer in grid
2. Click **Edit** (pencil icon)
3. Change **"Opening Balance"**
4. Click **"Update Customer"**
5. Closing balance recalculates automatically

### To View Detailed Statement:
1. Go to **Reports** page
2. Select customer (if customer report available)
3. Or check sales and payments individually
4. All transactions listed

---

## 📞 Summary

| Term | Meaning | When to Use |
|------|---------|-------------|
| **Opening Balance** | Initial debt at start | When adding existing customer with previous transactions |
| **Closing Balance** | Current debt (calculated) | Always visible, shows current status |
| **Red Color** | Customer owes you | They need to pay you |
| **Green Color** | You owe customer | They overpaid or advance payment |
| **Black Color** | All settled | No pending debt |

---

**Formula to Remember:**
```
Closing Balance = Opening Balance + Total Sales - Total Payments
```

If **positive** ➜ Customer owes you  
If **negative** ➜ You owe customer  
If **zero** ➜ All settled

---

**Generated:** October 29, 2025  
**Project:** Ahmad Poultry Services  
**For:** Understanding customer balances clearly

