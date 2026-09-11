import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { productService, type Product } from '@/services/product.service';

const tabs = ['Products', 'Orders', 'Users'] as const;

type AdminTab = (typeof tabs)[number];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('Products');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'Products') {
      return;
    }

    const loadProducts = async () => {
      try {
        setLoading(true);

        const data = await productService.getProducts({
          limit: 100,
        });

        setProducts(data.products);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [activeTab]);

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);

      await productService.deleteProduct(product.id);

      setProducts((current) => current.filter((item) => item.id !== product.id));

      toast.success('Product deleted successfully');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => `₹${Number(product.price).toFixed(2)}`,
    },
    {
      key: 'stock',
      label: 'Stock',
    },
    {
      key: 'categoryName',
      label: 'Category',
      render: (product) => product.categoryName ?? 'Uncategorized',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/products/${product.id}/edit`}>
            <Button type="button" className="inline-flex items-center gap-1">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>

          <Button
            type="button"
            disabled={deletingId === product.id}
            onClick={() => void handleDelete(product)}
            className="inline-flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            {deletingId === product.id ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

        <p className="mt-2 text-gray-500">Manage products, orders, and users.</p>
      </div>

      <div className="border-b">
        <nav className="flex gap-6" aria-label="Admin navigation">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Products' ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>

              <p className="mt-1 text-sm text-gray-500">Manage your products.</p>
            </div>

            <Link to="/admin/products/new">
              <Button type="button" className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            emptyMessage="No products found."
            getRowKey={(product) => product.id}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">{activeTab}</h2>

          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="h-12 w-full animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
