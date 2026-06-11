'use client';

import React, { useState } from 'react';
import {
  Package, Plus, Search, Filter, MoreHorizontal, Upload, X,
  CheckCircle, AlertCircle, TrendingUp, Settings, Eye, Edit3, Trash2
} from 'lucide-react';

type ProductStatus = 'Active' | 'Draft' | 'Inactive';
type ProductCategory = 'Investment' | 'Loan' | 'Savings' | 'Insurance';

interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  minAmount: string;
  maxAmount: string;
  rate: string;
  tenor: string;
  status: ProductStatus;
  configuredBy: string;
  createdAt: string;
  subscribers: number;
}

const products: Product[] = [
  { id: 1, name: 'Apple Stock Investment', category: 'Investment', minAmount: '₦ 10,000', maxAmount: '₦ 50,000,000', rate: '12% p.a.', tenor: 'Flexible', status: 'Active', configuredBy: 'Alexis', createdAt: '14 Jan 2025', subscribers: 342 },
  { id: 2, name: 'Fixed Deposit Plan', category: 'Savings', minAmount: '₦ 50,000', maxAmount: '₦ 100,000,000', rate: '9% p.a.', tenor: '90 Days', status: 'Active', configuredBy: 'Alexis', createdAt: '20 Jan 2025', subscribers: 218 },
  { id: 3, name: 'SME Growth Loan', category: 'Loan', minAmount: '₦ 100,000', maxAmount: '₦ 20,000,000', rate: '18% p.a.', tenor: '12 Months', status: 'Active', configuredBy: 'Admin', createdAt: '03 Feb 2025', subscribers: 89 },
  { id: 4, name: 'Treasury Bills Access', category: 'Investment', minAmount: '₦ 5,000', maxAmount: '₦ 500,000,000', rate: '15.5% p.a.', tenor: '91 / 182 Days', status: 'Active', configuredBy: 'Alexis', createdAt: '10 Feb 2025', subscribers: 506 },
  { id: 5, name: 'Micro Loan Basic', category: 'Loan', minAmount: '₦ 10,000', maxAmount: '₦ 500,000', rate: '24% p.a.', tenor: '3 Months', status: 'Draft', configuredBy: 'Admin', createdAt: '28 Apr 2025', subscribers: 0 },
  { id: 6, name: 'Life Cover Plus', category: 'Insurance', minAmount: '₦ 2,000/mo', maxAmount: '₦ 20,000/mo', rate: 'N/A', tenor: 'Annual', status: 'Inactive', configuredBy: 'Admin', createdAt: '15 Mar 2025', subscribers: 0 },
];

const categoryColors: Record<ProductCategory, string> = {
  Investment: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  Loan: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  Savings: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  Insurance: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
};

const statusColors: Record<ProductStatus, string> = {
  Active: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  Draft: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  Inactive: 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
};

const statusIcons: Record<ProductStatus, React.ReactNode> = {
  Active: <CheckCircle size={12} />,
  Draft: <AlertCircle size={12} />,
  Inactive: <X size={12} />,
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProductCategory>('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories: Array<'All' | ProductCategory> = ['All', 'Investment', 'Loan', 'Savings', 'Insurance'];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Upload, configure, and manage all financial products</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg text-sm transition shadow-sm"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><Package size={16} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Products</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{products.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"><CheckCircle size={16} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{products.filter(p => p.status === 'Active').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"><AlertCircle size={16} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Draft</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{products.filter(p => p.status === 'Draft').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"><TrendingUp size={16} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Subscribers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{products.reduce((a, b) => a + b.subscribers, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${categoryFilter === cat ? 'bg-[#961A1C] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Product Name</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Min Amount</th>
                <th className="px-6 py-3 font-medium">Max Amount</th>
                <th className="px-6 py-3 font-medium">Rate</th>
                <th className="px-6 py-3 font-medium">Tenor</th>
                <th className="px-6 py-3 font-medium">Subscribers</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Configured By</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white shrink-0">
                        <Package size={14} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-400">Added {product.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${categoryColors[product.category]}`}>{product.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">{product.minAmount}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">{product.maxAmount}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.rate}</td>
                  <td className="px-6 py-4 text-gray-500">{product.tenor}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{product.subscribers.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 w-fit px-2.5 py-1 text-xs font-bold rounded-md ${statusColors[product.status]}`}>
                      {statusIcons[product.status]} {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.configuredBy}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedProduct(product)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title="Configure">
                        <Settings size={15} />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title="View">
                        <Eye size={15} />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && <AddProductModal onClose={() => setShowModal(false)} />}

      {/* Configure Product Drawer */}
      {selectedProduct && <ConfigureDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}

function AddProductModal({ onClose }: { onClose: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Product</h2>
            <p className="text-sm text-gray-500 mt-0.5">Configure a new financial product for the platform</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Product Name</label>
              <input type="text" placeholder="e.g. Apple Stock Investment" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
              <select className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]">
                <option>Investment</option>
                <option>Loan</option>
                <option>Savings</option>
                <option>Insurance</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Interest Rate</label>
              <input type="text" placeholder="e.g. 12% p.a." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Min Amount (₦)</label>
              <input type="number" placeholder="10000" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Max Amount (₦)</label>
              <input type="number" placeholder="50000000" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tenor</label>
              <input type="text" placeholder="e.g. 90 Days or Flexible" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Product Document / Prospectus</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragOver ? 'border-[#961A1C] bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Drag & drop a file or <span className="text-[#961A1C] cursor-pointer font-bold">browse</span></p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PNG up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">Save as Draft</button>
          <button className="flex-1 py-2.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-xl transition">Publish Product</button>
        </div>
      </div>
    </div>
  );
}

function ConfigureDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Configure Product</h2>
            <p className="text-sm text-gray-500 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Category', value: product.category },
              { label: 'Status', value: product.status },
              { label: 'Rate', value: product.rate },
              { label: 'Tenor', value: product.tenor },
              { label: 'Min Amount', value: product.minAmount },
              { label: 'Max Amount', value: product.maxAmount },
              { label: 'Configured By', value: product.configuredBy },
              { label: 'Subscribers', value: product.subscribers.toLocaleString() },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status Override</label>
            <select className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]">
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Max Amount Override</label>
            <input type="number" placeholder="Enter new max amount..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Interest Rate Override</label>
            <input type="text" placeholder="e.g. 14% p.a." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
          <button className="flex-1 py-2.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
            <Settings size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
