import React from 'react';
import { TOG } from '../../types';
import { Modal } from '../common/Modal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { exportSingleTOGToExcel } from '../../utils/excelExport';
import { FileSpreadsheet, Printer, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TOGDetailModalProps {
  tog: TOG | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TOGDetailModal: React.FC<TOGDetailModalProps> = ({
  tog,
  isOpen,
  onClose,
}) => {
  if (!tog) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalQty = tog.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValuation = tog.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transfer of Goods: ${tog.togNumber}`}
      subtitle={`Dispatched from ${tog.sourceLocation} to ${tog.destinationLocation}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Actions header (hidden when printing) */}
        <div className="flex items-center justify-between no-print bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Badge variant="info" size="md">
              <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
              {tog.status}
            </Badge>
            <span className="text-xs text-slate-500 font-mono">ID: {tog.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleTOGToExcel(tog)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export TOG to Excel (.xlsx)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Gate Pass</span>
            </button>
          </div>
        </div>

        {/* Printable TOG Slip Container */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-2xs space-y-6 print:border-none print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600 print:hidden" />
                TRANSFER OF GOODS (TOG) / GATE PASS
              </h2>
              <p className="text-xs text-slate-500 mt-1">Authorized Outward Material Transfer Document</p>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold text-blue-700 font-mono">{tog.togNumber}</div>
              <div className="text-xs text-slate-500 mt-0.5">Date: {formatDate(tog.date)}</div>
            </div>
          </div>

          {/* Locations and Signoffs Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Source Location:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{tog.sourceLocation}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Destination Dept / Project:</span>
              <span className="font-bold text-blue-800 text-sm mt-0.5 block">{tog.destinationLocation}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Requested By:</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{tog.requestedBy}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Approved By:</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{tog.approvedBy}</span>
            </div>
          </div>

          {/* Purpose & Remarks if any */}
          {(tog.purpose || tog.remarks) && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1">
              {tog.purpose && (
                <div>
                  <span className="font-semibold text-slate-700">Purpose / Job Order: </span>
                  <span className="text-slate-600">{tog.purpose}</span>
                </div>
              )}
              {tog.remarks && (
                <div>
                  <span className="font-semibold text-slate-700">Special Remarks: </span>
                  <span className="text-slate-600">{tog.remarks}</span>
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item SKU</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">From Bin</th>
                  <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Value</th>
                  <th className="py-2.5 px-3 text-right">Total Value</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tog.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{item.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{item.binLocation}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(item.unitCost)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(item.quantity * item.unitCost)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs text-slate-800">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right uppercase">Total:</td>
                  <td className="py-3 px-3 text-right">{totalQty} units</td>
                  <td></td>
                  <td className="py-3 px-3 text-right text-sm text-blue-700">{formatCurrency(totalValuation)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Authorization Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-800">Prepared / Dispatched By</p>
              <p className="text-[10px] text-slate-400">{tog.dispatchedBy || 'Store In-charge'}</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-800">Approved By</p>
              <p className="text-[10px] text-slate-400">{tog.approvedBy}</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-800">Acknowledged & Received By</p>
              <p className="text-[10px] text-slate-400">{tog.requestedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
