import React, { useState } from 'react';
import { QrCode, Plus, Download, Printer, Trash2 } from 'lucide-react';

export default function TablesManagement() {
  const [tables, setTables] = useState([
    { id: 1, number: '1', name: 'Window 1', capacity: 4, status: 'AVAILABLE', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=paradise.dynease.in/t/1' },
    { id: 2, number: '2', name: 'Window 2', capacity: 2, status: 'OCCUPIED', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=paradise.dynease.in/t/2' },
    { id: 3, number: '12', name: 'Family Area', capacity: 8, status: 'AVAILABLE', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=paradise.dynease.in/t/12' },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables & QR Codes</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant tables and generate order QR codes.</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add New Table
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => (
          <div key={table.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Table {table.number}</h3>
                <p className="text-gray-500 font-medium">{table.name} • {table.capacity} Seats</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                table.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {table.status}
              </span>
            </div>

            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
              <img src={table.qr} alt={`QR for Table ${table.number}`} className="w-32 h-32 rounded-lg bg-white p-2 shadow-sm mb-4" />
              <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Scan to Order</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                <Download size={18} /> Save
              </button>
              <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                <Printer size={18} /> Print
              </button>
              <button className="p-2 text-red-500 hover:bg-red-50 border border-transparent rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
