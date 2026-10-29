import React, { useState } from 'react';
import { Location, LocationType, Item } from '../../types';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Boxes, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Warehouse
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface LocationsViewProps {
  locations: Location[];
  items: Item[];
  canManage: boolean;
  onAddNewLocation: () => void;
  onEditLocation: (loc: Location) => void;
  onDeleteLocation: (id: string) => Promise<void>;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  items,
  canManage,
  onAddNewLocation,
  onEditLocation,
  onDeleteLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Calculate items count per location
  const getItemCount = (locCode: string) => {
    return items.filter(i => i.binLocation.toUpperCase() === locCode.toUpperCase()).length;
  };

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = 
      loc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.zone && loc.zone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'ALL' || loc.type === selectedType;

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = loc.isActive;
    if (statusFilter === 'INACTIVE') matchesStatus = !loc.isActive;

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = locations.filter(l => l.isActive).length;
  const totalCapacity = locations.reduce((sum, l) => sum + (l.capacity || 0), 0);

  const handleDelete = async (loc: Location) => {
    const assignedCount = getItemCount(loc.code);
    if (assignedCount > 0) {
      if (!window.confirm(`Warning: ${assignedCount} items are currently mapped to bin "${loc.code}". Are you sure you want to delete this location?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete location "${loc.code}"?`)) {
        return;
      }
    }
    await onDeleteLocation(loc.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Warehouse Storage Locations Master</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {locations.length} Locations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage warehouse storage bins, racks, cold storage and loading bays. Used across GRN, TOG and Item Master.
          </p>
        </div>

        {canManage && (
          <button
            onClick={onAddNewLocation}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Location</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Storage Locations</span>
            <span className="text-lg font-bold text-slate-800">{locations.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Active Storage Bins</span>
            <span className="text-lg font-bold text-emerald-700">{activeCount} of {locations.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Storage Capacity</span>
            <span className="text-lg font-bold text-purple-700">{totalCapacity.toLocaleString()} Units</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, title, zone or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="Warehouse Bin">Warehouse Bin</option>
            <option value="Storage Rack">Storage Rack</option>
            <option value="Shelf / Bay">Shelf / Bay</option>
            <option value="Floor Zone">Floor Zone</option>
            <option value="Cold Room">Cold Room</option>
            <option value="Bulk Pallet Area">Bulk Pallet Area</option>
            <option value="Dispatch Bay">Dispatch Bay</option>
          </select>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'INACTIVE' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-600 hover:text-slate-700'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Location Code</th>
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Zone / Area</th>
                <th className="py-3 px-4 text-center">Assigned SKUs</th>
                <th className="py-3 px-4 text-right">Max Capacity</th>
                <th className="py-3 px-4">Status</th>
                {canManage && <th className="py-3 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No storage locations found</p>
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => {
                  const assignedItems = getItemCount(loc.code);

                  return (
                    <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          {loc.code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{loc.name}</div>
                        {loc.description && (
                          <div className="text-[10px] text-slate-400 max-w-xs truncate">{loc.description}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap">
                          {loc.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {loc.zone || '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                          assignedItems > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {assignedItems} items
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {loc.capacity ? `${loc.capacity.toLocaleString()} units` : 'Unlimited'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {loc.isActive ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Inactive</Badge>
                        )}
                      </td>

                      {canManage && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onEditLocation(loc)}
                              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                              title="Edit Location"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(loc)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                              title="Delete Location"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
