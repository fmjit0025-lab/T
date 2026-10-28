import * as XLSX from 'xlsx';
import { TOG, GRN, Item, BincardEntry } from '../types';

/**
 * Downloads a worksheet workbook as an .xlsx file in the browser
 */
function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, fileName);
}

/**
 * 1. Export Single TOG (Transfer of Goods) Document to Excel
 */
export function exportSingleTOGToExcel(tog: TOG) {
  const wb = XLSX.utils.book_new();

  // Build document header & metadata rows
  const headerData = [
    ['TRANSFER OF GOODS (TOG) VOUCHER'],
    ['Generated on:', new Date().toLocaleString()],
    [],
    ['Transfer Number:', tog.togNumber, '', 'Date:', tog.date],
    ['Source Location:', tog.sourceLocation, '', 'Destination:', tog.destinationLocation],
    ['Requested By:', tog.requestedBy, '', 'Approved By:', tog.approvedBy],
    ['Dispatched By:', tog.dispatchedBy || 'N/A', '', 'Status:', tog.status],
    ['Purpose / Job:', tog.purpose || 'N/A', '', 'Remarks:', tog.remarks || 'None'],
    [],
    ['S.No', 'Item SKU / Code', 'Item Description', 'Bin Location', 'Quantity Transferred', 'Unit Cost ($)', 'Total Value ($)', 'Line Remarks'],
  ];

  let totalValue = 0;
  let totalQty = 0;

  tog.items.forEach((item, index) => {
    const itemTotal = (item.quantity || 0) * (item.unitCost || 0);
    totalValue += itemTotal;
    totalQty += item.quantity || 0;

    headerData.push([
      (index + 1).toString(),
      item.sku,
      item.name,
      item.binLocation || 'N/A',
      item.quantity.toString(),
      item.unitCost ? item.unitCost.toFixed(2) : '0.00',
      itemTotal.toFixed(2),
      item.notes || '',
    ]);
  });

  // Summary / Footer rows
  headerData.push([]);
  headerData.push(['', '', 'TOTALS:', '', totalQty.toString(), '', totalValue.toFixed(2), '']);
  headerData.push([]);
  headerData.push(['Authorized Signatures:']);
  headerData.push(['Prepared By: __________________', '', 'Approved By: __________________', '', 'Received By: __________________']);

  const ws = XLSX.utils.aoa_to_sheet(headerData);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // S.No
    { wch: 18 }, // SKU
    { wch: 35 }, // Name
    { wch: 14 }, // Bin
    { wch: 20 }, // Qty
    { wch: 14 }, // Unit Cost
    { wch: 16 }, // Total Value
    { wch: 30 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, ws, `TOG-${tog.togNumber}`);
  downloadWorkbook(wb, `TOG_${tog.togNumber}_${tog.date}.xlsx`);
}

/**
 * 2. Export TOG Register / Summary List to Excel
 */
export function exportTOGRegisterToExcel(togs: TOG[]) {
  const wb = XLSX.utils.book_new();

  const rows = togs.map((t, idx) => ({
    '#': idx + 1,
    'TOG Number': t.togNumber,
    'Date': t.date,
    'Source Location': t.sourceLocation,
    'Destination Location / Dept': t.destinationLocation,
    'Items Count': t.items.length,
    'Total Units': t.items.reduce((sum, item) => sum + item.quantity, 0),
    'Requested By': t.requestedBy,
    'Approved By': t.approvedBy,
    'Dispatched By': t.dispatchedBy || '-',
    'Status': t.status,
    'Purpose / Project': t.purpose || '-',
    'Remarks': t.remarks || '-',
    'Created At': new Date(t.createdAt).toLocaleString(),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },  // #
    { wch: 20 }, // TOG No
    { wch: 12 }, // Date
    { wch: 24 }, // Source
    { wch: 28 }, // Destination
    { wch: 12 }, // Items Count
    { wch: 12 }, // Total Units
    { wch: 20 }, // Requested
    { wch: 20 }, // Approved
    { wch: 18 }, // Dispatched
    { wch: 12 }, // Status
    { wch: 30 }, // Purpose
    { wch: 25 }, // Remarks
    { wch: 20 }, // Created
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'TOG Register');
  downloadWorkbook(wb, `TOG_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 3. Export Single GRN (Goods Received Note) to Excel
 */
export function exportSingleGRNToExcel(grn: GRN) {
  const wb = XLSX.utils.book_new();

  const headerData = [
    ['GOODS RECEIVED NOTE (GRN)'],
    ['Generated on:', new Date().toLocaleString()],
    [],
    ['GRN Number:', grn.grnNumber, '', 'Date Received:', grn.date],
    ['Supplier:', grn.supplier, '', 'PO Number:', grn.poNumber || 'N/A'],
    ['Invoice / Challan #:', grn.invoiceNumber || 'N/A', '', 'Received By:', grn.receivedBy],
    ['Status:', grn.status, '', 'Total Amount ($):', grn.totalAmount.toFixed(2)],
    ['Inspection Notes:', grn.notes || 'None'],
    [],
    ['S.No', 'Item SKU', 'Item Description', 'Bin / Rack', 'Batch / Lot #', 'Received Qty', 'Unit Cost ($)', 'Total Cost ($)'],
  ];

  let totalQty = 0;
  grn.items.forEach((item, index) => {
    totalQty += item.quantity;
    headerData.push([
      (index + 1).toString(),
      item.sku,
      item.name,
      item.binLocation || 'N/A',
      item.batchNo || 'N/A',
      item.quantity.toString(),
      item.unitCost.toFixed(2),
      item.totalCost.toFixed(2),
    ]);
  });

  headerData.push([]);
  headerData.push(['', '', '', '', 'TOTALS:', totalQty.toString(), '', grn.totalAmount.toFixed(2)]);
  headerData.push([]);
  headerData.push(['Store In-charge: __________________', '', 'Quality Inspector: __________________', '', 'Supplier Acknowledgment: __________________']);

  const ws = XLSX.utils.aoa_to_sheet(headerData);
  ws['!cols'] = [
    { wch: 8 },  // S.No
    { wch: 18 }, // SKU
    { wch: 35 }, // Name
    { wch: 14 }, // Bin
    { wch: 18 }, // Batch
    { wch: 14 }, // Qty
    { wch: 14 }, // Unit Cost
    { wch: 16 }, // Total Cost
  ];

  XLSX.utils.book_append_sheet(wb, ws, `GRN-${grn.grnNumber}`);
  downloadWorkbook(wb, `GRN_${grn.grnNumber}_${grn.date}.xlsx`);
}

/**
 * 4. Export Bincard (Stock Ledger) to Excel
 */
export function exportBincardToExcel(entries: BincardEntry[], selectedItem?: Item) {
  const wb = XLSX.utils.book_new();

  const title = selectedItem 
    ? `BINCARD STOCK LEDGER: ${selectedItem.sku} - ${selectedItem.name}`
    : 'BINCARD INVENTORY MOVEMENT LEDGER';

  const headerRows = [
    [title],
    ['Exported on:', new Date().toLocaleString()],
    selectedItem ? ['Bin Location:', selectedItem.binLocation, 'Current Stock:', selectedItem.currentStock, 'Min Stock Level:', selectedItem.minStockLevel] : [],
    [],
  ];

  const tableRows = entries.map((e, index) => ({
    '#': index + 1,
    'Date': e.date,
    'Timestamp': new Date(e.timestamp).toLocaleTimeString(),
    'SKU': e.sku,
    'Item Name': e.name,
    'Bin Location': e.location,
    'Transaction Type': e.transType,
    'Reference #': e.refNumber,
    'In (+)': e.qtyIn > 0 ? e.qtyIn : '-',
    'Out (-)': e.qtyOut > 0 ? e.qtyOut : '-',
    'Running Balance': e.balance,
    'Logged By': e.user,
    'Remarks / Details': e.remarks,
  }));

  const ws = XLSX.utils.aoa_to_sheet(headerRows);
  XLSX.utils.sheet_add_json(ws, tableRows, { origin: selectedItem ? 'A5' : 'A4' });

  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 30 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
    { wch: 18 },
    { wch: 35 },
  ];

  const sheetName = selectedItem ? selectedItem.sku.slice(0, 30) : 'Bincard Ledger';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  downloadWorkbook(wb, `Bincard_${selectedItem ? selectedItem.sku : 'Master'}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 5. Export Available Stock Report to Excel
 */
export function exportStockReportToExcel(items: Item[]) {
  const wb = XLSX.utils.book_new();

  const rows = items.map((item, index) => {
    const totalVal = item.currentStock * item.unitCost;
    let stockStatus = 'Normal';
    if (item.currentStock === 0) {
      stockStatus = 'OUT OF STOCK';
    } else if (item.currentStock <= item.minStockLevel) {
      stockStatus = 'LOW STOCK ALERT';
    }

    return {
      'S.No': index + 1,
      'Item Code / SKU': item.sku,
      'Item Name': item.name,
      'Category': item.category,
      'UOM': item.uom,
      'Bin / Rack Location': item.binLocation,
      'Min Stock Level': item.minStockLevel,
      'Available On Hand': item.currentStock,
      'Unit Cost ($)': item.unitCost.toFixed(2),
      'Total Stock Value ($)': totalVal.toFixed(2),
      'Inventory Status': stockStatus,
      'Preferred Supplier': item.supplier || '-',
      'Description': item.description || '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 34 },
    { wch: 20 },
    { wch: 8 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 28 },
    { wch: 35 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Available Stock');
  downloadWorkbook(wb, `Available_Stock_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 6. Export Low Stock / Reorder Report to Excel
 */
export function exportLowStockReportToExcel(lowStockItems: Item[]) {
  const wb = XLSX.utils.book_new();

  const rows = lowStockItems.map((item, index) => {
    const deficit = Math.max(0, item.minStockLevel - item.currentStock);
    const suggestedReorder = deficit * 2; // Recommended buffer
    const estCost = suggestedReorder * item.unitCost;

    return {
      'Priority #': index + 1,
      'Item Code / SKU': item.sku,
      'Item Name': item.name,
      'Category': item.category,
      'Bin Location': item.binLocation,
      'Current Stock': item.currentStock,
      'Min Threshold': item.minStockLevel,
      'Stock Deficit': deficit,
      'Suggested Order Qty': suggestedReorder,
      'UOM': item.uom,
      'Unit Cost ($)': item.unitCost.toFixed(2),
      'Estimated Restock Cost ($)': estCost.toFixed(2),
      'Preferred Supplier': item.supplier || '-',
      'Urgency Level': item.currentStock === 0 ? 'CRITICAL - OUT OF STOCK' : 'HIGH - BELOW MIN LEVEL',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 10 },
    { wch: 18 },
    { wch: 34 },
    { wch: 20 },
    { wch: 15 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 8 },
    { wch: 14 },
    { wch: 24 },
    { wch: 28 },
    { wch: 26 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Low Stock Reorder List');
  downloadWorkbook(wb, `Low_Stock_Alert_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}
