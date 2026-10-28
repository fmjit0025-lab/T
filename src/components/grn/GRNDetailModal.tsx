import React from 'react';
import { GRN } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportSingleGRNToExcel } from '../../utils/excelExport';
import { FileSpreadsheet, Printer, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface GRNDetailModalProps {
  grn: GRN | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GRNDetailModal: React.FC<GRNDetailModalProps> = ({
  grn,
  isOpen,
  onClose,
}) => {
  if (!grn) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalQty = grn.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Goods Received Note: ${grn.grnNumber}`}
      subtitle={`Received from ${grn.supplier} on ${formatDate(grn.date)}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Actions header (hidden when printing) */}
        <div className="flex items-center justify-between no-print bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Badge variant="success" size="md">
              <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
              {grn.status}
            </Badge>
            <span className="text-xs text-slate-500 font-mono">ID: {grn.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleGRNToExcel(grn)}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export to Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print GRN Slip</span>
            </button>
          </div>
        </div>

        {/* Printable GRN Slip Container */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-2xs space-y-6 print:border-none print:p-0">
          {/* Slip Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">GOODS RECEIVED NOTE (GRN)</h2>
              <p className="text-xs text-slate-500 mt-1">Official Warehouse Inward Receipt Document</p>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold text-blue-700 font-mono">{grn.grnNumber}</div>
              <div className="text-xs text-slate-500 mt-0.5">Date: {formatDate(grn.date)}</div>
            </div>
          </div>

          {/* Supplier & Document Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Supplier:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{grn.supplier}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Purchase Order #:</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">{grn.poNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Invoice / DC #:</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">{grn.invoiceNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Received By:</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{grn.receivedBy}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item SKU</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Bin Location</th>
                  <th className="py-2.5 px-3">Batch / Lot</th>
                  <th className="py-2.5 px-3 text-right">Received Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grn.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{item.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{item.binLocation}</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.batchNo || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(item.unitCost)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(item.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs text-slate-800">
                <tr>
                  <td colSpan={5} className="py-3 px-3 text-right uppercase">Total:</td>
                  <td className="py-3 px-3 text-right">{totalQty} units</td>
                  <td></td>
                  <td className="py-3 px-3 text-right text-sm text-blue-700">{formatCurrency(grn.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {grn.notes && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-0.5">Inspection & Delivery Remarks:</span>
              <p className="text-slate-600">{grn.notes}</p>
            </div>
          )}

          {/* Signatures for physical slip / compliance */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-800">Received By</p>
              <p className="text-[10px] text-slate-400">Warehouse Staff</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-800">Quality Verified By</p>
              <p className="text-[10px] text-slate-400">QC Inspector</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-800">Authorized Manager</p>
              <p className="text-[10px] text-slate-400">Store Manager</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
