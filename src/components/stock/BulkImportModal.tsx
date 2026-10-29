import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Item, Location, UOM } from '../../types';
import { Modal } from '../common/Modal';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  X,
  Boxes
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems: Item[];
  locations: Location[];
  onImportSuccess: (items: Item[]) => Promise<void>;
}

interface ParsedRow {
  sku: string;
  name: string;
  category: string;
  uom: UOM;
  binLocation: string;
  unitCost: number;
  minStockLevel: number;
  currentStock: number;
  supplier: string;
  description: string;
  isUpdate: boolean;
  isValid: boolean;
  errors: string[];
}

const DEFAULT_UOM: UOM = 'Pcs';
const VALID_UOMS: UOM[] = ['Pcs', 'Box', 'Kg', 'Mtr', 'Ltr', 'Rolls', 'Sets', 'Pack', 'Carton'];

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  existingItems,
  locations,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [defaultBin, setDefaultBin] = useState<string>(locations[0]?.code || 'A-01-01');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Item SKU': 'SKU-SAMPLE-001',
        'Item Name': 'Miniature Solenoid Valve 12V',
        'Category': 'Hardware & Mechanical',
        'UOM': 'Pcs',
        'Bin Location': locations[0]?.code || 'A-01-01',
        'Unit Cost': 12.50,
        'Min Stock Level': 20,
        'Current Stock': 75,
        'Supplier': 'Apex Fluid Controls',
        'Description': 'Direct acting 2-way normally closed solenoid valve'
      },
      {
        'Item SKU': 'SKU-SAMPLE-002',
        'Item Name': 'Shielded Twisted Cable 100m',
        'Category': 'Electronics',
        'UOM': 'Rolls',
        'Bin Location': locations[1]?.code || 'A-01-02',
        'Unit Cost': 45.00,
        'Min Stock Level': 10,
        'Current Stock': 30,
        'Supplier': 'National Wire & Cable Ltd.',
        'Description': '2-pair 22AWG industrial communication cable'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 18 }, // SKU
      { wch: 32 }, // Name
      { wch: 22 }, // Category
      { wch: 10 }, // UOM
      { wch: 16 }, // Bin
      { wch: 12 }, // Unit Cost
      { wch: 16 }, // Min Stock
      { wch: 16 }, // Current Stock
      { wch: 26 }, // Supplier
      { wch: 40 }, // Description
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock_Import_Template');
    XLSX.writeFile(workbook, 'StockPulse_Product_Import_Template.xlsx');
  };

  // Handle file upload and parse with SheetJS
  const processFile = async (uploadedFile: File) => {
    setErrorMsg(null);
    setFile(uploadedFile);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        setErrorMsg('The selected spreadsheet contains no data rows.');
        setParsedRows([]);
        return;
      }

      // Map rows with intelligent column detection
      const mapped: ParsedRow[] = rawJson.map((row) => {
        // Find fields case-insensitively
        const getVal = (possibleKeys: string[]): any => {
          for (const key of Object.keys(row)) {
            const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const target of possibleKeys) {
              if (cleanKey.includes(target.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
                return row[key];
              }
            }
          }
          return '';
        };

        const skuRaw = String(getVal(['sku', 'itemsku', 'itemcode', 'code']) || '').trim();
        const nameRaw = String(getVal(['name', 'itemname', 'description', 'title']) || '').trim();
        const categoryRaw = String(getVal(['category', 'cat', 'group']) || 'General').trim();
        const uomRaw = String(getVal(['uom', 'unit', 'unitofmeasure']) || 'Pcs').trim();
        const binRaw = String(getVal(['bin', 'binlocation', 'location', 'rack']) || defaultBin).trim();
        const unitCostRaw = parseFloat(getVal(['unitcost', 'cost', 'price', 'rate'])) || 0;
        const minStockRaw = parseInt(getVal(['minstock', 'minstocklevel', 'threshold', 'reorder'])) || 10;
        const currentStockRaw = parseInt(getVal(['currentstock', 'stock', 'qty', 'quantity', 'onhand'])) || 0;
        const supplierRaw = String(getVal(['supplier', 'vendor', 'manufacturer']) || '').trim();
        const descRaw = String(getVal(['description', 'notes', 'specs']) || '').trim();

        // Check if UOM matches known UOM, else default
        const matchedUom = VALID_UOMS.find(u => u.toLowerCase() === uomRaw.toLowerCase()) || DEFAULT_UOM;

        const errors: string[] = [];
        if (!skuRaw) errors.push('Missing Item SKU / Code');
        if (!nameRaw) errors.push('Missing Item Name');

        const isUpdate = existingItems.some(i => i.sku.toUpperCase() === skuRaw.toUpperCase());

        return {
          sku: skuRaw.toUpperCase(),
          name: nameRaw,
          category: categoryRaw || 'General',
          uom: matchedUom,
          binLocation: binRaw ? binRaw.toUpperCase() : defaultBin,
          unitCost: Math.max(0, unitCostRaw),
          minStockLevel: Math.max(0, minStockRaw),
          currentStock: Math.max(0, currentStockRaw),
          supplier: supplierRaw,
          description: descRaw,
          isUpdate,
          isValid: errors.length === 0,
          errors,
        };
      });

      setParsedRows(mapped);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMsg(`Failed to parse file: ${err.message || 'Invalid format'}`);
      setParsedRows([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('No valid items to import.');
      return;
    }

    setIsProcessing(true);
    try {
      const itemsToSave: Item[] = validRows.map((r, idx) => {
        const existing = existingItems.find(i => i.sku.toUpperCase() === r.sku.toUpperCase());
        return {
          id: existing ? existing.id : `item-import-${Date.now()}-${idx}`,
          sku: r.sku,
          name: r.name,
          category: r.category,
          uom: r.uom,
          binLocation: r.binLocation || defaultBin,
          minStockLevel: r.minStockLevel,
          currentStock: r.currentStock,
          unitCost: r.unitCost,
          supplier: r.supplier,
          description: r.description,
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      await onImportSuccess(itemsToSave);
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Error occurred while saving imported items.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const updateCount = parsedRows.filter(r => r.isValid && r.isUpdate).length;
  const newCount = validCount - updateCount;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Product Import (Excel / CSV)"
      subtitle="Upload bulk item masters, assign storage bins and initial inventory balances"
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Step 1: Template & Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Download Template Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Spreadsheet Template</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Download the standardized Excel template with pre-formatted column headers and sample inventory rows.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="mt-3 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-blue-500 mb-1.5" />
            <p className="text-xs font-bold text-slate-800">
              {file ? file.name : 'Click to select or drag and drop Excel / CSV file'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports .xlsx, .xls, and .csv formats
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 2: Preview & Configuration */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            {/* Summary Stat Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700">
                  Total Parsed: <b className="text-slate-900">{parsedRows.length}</b>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {newCount} New Items
                </span>
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  {updateCount} Updates
                </span>
                {errorCount > 0 && (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorCount} Errors
                  </span>
                )}
              </div>

              {/* Default Location selector for items missing location */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] font-medium">Fallback Location:</span>
                <select
                  value={defaultBin}
                  onChange={(e) => setDefaultBin(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.code}>
                      {loc.code} ({loc.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Item SKU</th>
                    <th className="py-2 px-3">Item Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Bin Location</th>
                    <th className="py-2 px-3 text-right">Cost</th>
                    <th className="py-2 px-3 text-center">Starting Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50/50' : 'bg-rose-50/40'}>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {!row.isValid ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            Error
                          </span>
                        ) : row.isUpdate ? (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            Update
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">
                        {row.sku || <span className="text-rose-500 italic">Required</span>}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-800">{row.name || <span className="text-rose-500 italic">Required</span>}</div>
                        {row.errors.length > 0 && (
                          <div className="text-[10px] text-rose-600">{row.errors.join(', ')}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{row.category}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{row.binLocation}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700">
                        {formatCurrency(row.unitCost)}
                      </td>
                      <td className="py-2 px-3 text-center font-bold font-mono text-slate-800">
                        {row.currentStock} {row.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div>
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={resetState}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Clear / Choose different file
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {isProcessing ? 'Importing Products...' : `Import ${validCount} Items`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
