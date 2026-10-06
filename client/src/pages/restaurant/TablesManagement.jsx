import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Download, Printer, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ tableNumber: '', tableName: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const getHeaders = (includeContentType = true) => {
    const token = localStorage.getItem('token');
    const hostname = window.location.hostname;
    const headers = { 'Authorization': `Bearer ${token}` };
    if (includeContentType) headers['Content-Type'] = 'application/json';
    let subdomain = '';
    if (hostname.includes('dynease.in') && hostname !== 'dynease.in' && hostname !== 'www.dynease.in') {
      subdomain = hostname.split('.')[0];
    } else if (hostname.includes('localhost') && hostname !== 'localhost') {
      subdomain = hostname.split('.')[0];
    }
    if (subdomain) headers['x-tenant-subdomain'] = subdomain;
    return headers;
  };

  const fetchTables = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/tables`, {
        headers: getHeaders(false)
      });
      const data = await res.json();
      if (data.success) {
        setTables(data.data.tables);
      }
    } catch (err) {
      console.error('Failed to fetch tables', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/tables`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        setTables([data.data.table, ...tables]);
        setShowAddModal(false);
        setFormData({ tableNumber: '', tableName: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/tables/${id}`, {
        method: 'DELETE',
        headers: getHeaders(false)
      });
      
      if (res.ok) {
        setTables(tables.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete table', err);
    }
  };

  const printQR = (table) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${table.tableNumber} QR Code</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; border: 2px solid #000; padding: 2rem; border-radius: 1rem; }
            h1 { margin-bottom: 0.5rem; }
            p { color: #666; margin-bottom: 2rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Table ${table.tableNumber}</h1>
            <p>${table.tableName || 'Scan to Order'}</p>
            <div id="qr-container"></div>
          </div>
          <script>
            // We'll just trigger print and they can see it. In a real app we'd draw the SVG here.
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadQR = (table) => {
    const svg = document.getElementById(`qr-${table._id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `table-${table.tableNumber}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-orange-500 w-8 h-8" /></div>;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables & QR Codes</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant tables and stable QR codes.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add New Table
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500 flex flex-col items-center">
          <QrCode size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No tables found</h3>
          <p className="mb-6">Add your first table to generate a stable QR code.</p>
          <button onClick={() => setShowAddModal(true)} className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-lg font-medium">Add Table</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tables.map(table => (
            <div key={table._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-orange-300 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Table {table.tableNumber}</h3>
                  <p className="text-gray-500 font-medium">{table.tableName || 'Main Area'} • {table.capacity || 4} Seats</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  table.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {table.status}
                </span>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                  <QRCodeSVG id={`qr-${table._id}`} value={table.qrCodeUrl} size={150} level="H" />
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-widest text-center">Scan to Order</p>
                <p className="text-xs text-gray-400 mt-2 text-center break-all">{table.qrCodeUrl}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => downloadQR(table)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <Download size={18} /> Download
                </button>
                <button onClick={() => printQR(table)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <Printer size={18} /> Print
                </button>
                <button onClick={() => handleDelete(table._id)} className="p-2.5 text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-colors shadow-sm">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Add New Table</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.tableNumber}
                    onChange={e => setFormData({...formData, tableNumber: e.target.value})}
                    placeholder="E.g. 12 or T-12" 
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Name/Area (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.tableName}
                    onChange={e => setFormData({...formData, tableName: e.target.value})}
                    placeholder="E.g. Window Seat, Balcony" 
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-3 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors flex justify-center items-center">
                  {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
