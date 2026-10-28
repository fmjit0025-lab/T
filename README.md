# StockPulse - WMS & Inventory Management System

A warehouse and inventory management web application with **GRN (Goods Received Notes)**, **TOG (Transfer of Goods with Excel Export)**, **Stock Management**, **Stock Adjustments**, **Bincard Stock Ledger**, and **Available Stock & Low Stock Intelligence Reports** powered by **Google Firebase Firestore**.

---

## 🌟 Key Features

### 1. 📥 Goods Received Notes (GRN)
- **Inbound Receipts**: Record items delivered from suppliers against Purchase Orders (PO) and Invoices/Challans.
- **Batch & Bin Assignment**: Specify batch/lot numbers, unit purchase costs, and target storage bin racks.
- **Stock Automation**: Submitting a GRN automatically increments the stock on hand and writes a verified ledger entry to the **Bincard**.
- **Print & Export**: Print GRN vouchers and export individual receipts or full registers to Excel.

### 2. 📤 Transfer of Goods (TOG) with Excel Export
- **Outward Dispatches**: Transfer goods from the central warehouse to production departments, job sites, or branch stores.
- **Live Stock Validation**: Checks current stock on hand in real time to prevent over-transferring.
- **Excel Export**: 
  - **Single TOG Voucher Export**: One-click export to a formatted `.xlsx` spreadsheet complete with Header, Destination, Line Items, and Sign-off signatures.
  - **TOG Register Export**: Export the full filtered list of transfers to Excel.
- **Gate Pass Generation**: Print formal transfer slips / gate passes directly from the browser.

### 3. 📦 Stock Management (Item Master)
- **SKU & Master Data**: Item code (SKU), Name, Category, Unit of Measure (UOM), Bin Location, Minimum Threshold, and Unit Cost.
- **Stock Status Badges**: Real-time badges for **Normal**, **Low Stock**, and **Out of Stock**.
- **Filtering & Search**: Fast search across SKU, Name, Bin, and Category.
- **Excel Export**: Export the entire stock catalog with valuation figures to Excel.

### 4. ⚖️ Stock Adjustment & Audit Trail
- **Discrepancy Corrections**: Reconcile physical cycle count audit differences.
- **Write-Offs**: Record damaged, broken, or expired stock with reason codes.
- **Directional Adjustments**: +INCREASE or -DECREASE with audit trails showing `Previous Stock -> New Stock`, auditor name, and incident notes.
- Automatically generates corresponding Bincard movements.

### 5. 🏷️ Bincard Ledger
- **Item-Specific Perpetual Ledger**: Filter by item SKU or bin location to see the complete history.
- **Chronological Audit Trail**: Tracks Date & Time, Transaction Type (`GRN`, `TOG`, `ADJ_IN`, `ADJ_OUT`, `INITIAL`), Reference #, In (+), Out (-), and Running Balance.
- **Export to Excel**: Download the complete Bincard ledger as an Excel spreadsheet.

### 6. 📊 Reports & Analytics
- **Available Stock Report**:
  - Total SKUs, total units on hand, total inventory valuation, and category breakdown.
  - Export to formatted Excel spreadsheet.
- **Low Stock & Reorder Alert Report**:
  - Identifies items at or below safety stock threshold.
  - Automatically calculates **Stock Deficit**, **Suggested Reorder Quantity** (2x safety buffer), and **Estimated Restock Cost**.
  - One-click shortcut to generate a GRN for the low stock item.
  - Export low stock reorder list to Excel.

---

## 🔥 Firebase Firestore Integration

StockPulse includes built-in support for **Google Firebase Firestore**:
- **Offline / Demo Mode**: Runs immediately out of the box using persistent local storage pre-loaded with realistic warehouse data (no setup required).
- **Live Firebase Mode**: Connect directly to your Firebase Firestore project:
  1. Click **Firebase Settings** in the top navigation or sidebar.
  2. Toggle **Enable Firestore** and enter your Firebase Web SDK config keys (`apiKey`, `projectId`, etc.).
  3. Click **Seed Data to Firebase** to upload the sample inventory, GRNs, TOGs, and Bincards to Firestore.
- Alternatively, you can configure your credentials via `.env` using `.env.example`.
- Security rules are provided in `firestore.rules`.

---

## 🚀 Quick Start

### Development Server
```bash
# Run local Vite development server
npm run dev
```

### Production Build
```bash
# Build optimized bundle
npm run build
```

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Google Firebase (Firestore SDK v11) + Local Fallback
- **Spreadsheets**: SheetJS (`xlsx`) for Excel workbook generation
- **Icons**: Lucide React
