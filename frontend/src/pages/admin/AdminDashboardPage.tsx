import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, ClipboardList, Plus, ShieldCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { adminService, type AdminOrder, type AdminUserRecord } from '@/services/admin.service';
import { fetchProducts, productService, type ProductListItem } from '@/services/product.service';
import type { Order } from '@/types/auth.types';

const adminTabs = [
  {
    id: 'products',
    label: 'Products',
    description: 'Manage inventory, pricing, and featured catalog items.',
    icon: Boxes,
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Track order flow, fulfillment, and recent activity.',
    icon: ClipboardList,
  },
  {
    id: 'users',
    label: 'Users',
    description: 'Review customer accounts, roles, and verification status.',
    icon: Users,
  },
] as const;

type AdminTabId = (typeof adminTabs)[number]['id'];

const statusStyles: Record<Order['status'], string> = {
  cancelled: 'border-red-500/30 bg-red-500/10 text-red-300',
  delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  processing: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  shipped: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
};

const roleStyles: Record<AdminUserRecord['role'], string> = {
  admin: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  manager: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  user: 'border-gray-600 bg-gray-700/60 text-gray-200',
};

const updatableOrderStatuses = ['pending', 'shipped', 'delivered', 'cancelled'] as const;

type UpdatableOrderStatus = (typeof updatableOrderStatuses)[number];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);

function ErrorPanel({ title, message }: Readonly<{ title: string; message: string }>) {
  return (
    <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 shadow-md">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-red-200">{message}</p>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: Readonly<{ label: string; value: string; hint: string }>) {
  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-400">{hint}</p>
    </article>
  );
}

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTabId>('products');
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<string, UpdatableOrderStatus>>(
    {}
  );
  const activeTabConfig = adminTabs.find((tab) => tab.id === activeTab) ?? adminTabs[0];

  const productsQuery = useQuery({
    queryKey: ['admin-dashboard', 'products'],
    queryFn: () => fetchProducts({ limit: 8 }),
    enabled: activeTab === 'products',
  });

  const ordersQuery = useQuery({
    queryKey: ['admin-dashboard', 'orders'],
    queryFn: () => adminService.listOrders(8),
    enabled: activeTab === 'orders',
  });

  const usersQuery = useQuery({
    queryKey: ['admin-dashboard', 'users'],
    queryFn: adminService.listUsers,
    enabled: activeTab === 'users',
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
      ]);
      toast.success('Product deleted.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not delete product.');
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: UpdatableOrderStatus }) =>
      adminService.updateOrderStatus(orderId, status),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'orders'] });
      setOrderStatusDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[variables.orderId];
        return nextDrafts;
      });
      toast.success('Order status updated.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update order status.');
    },
  });

  useEffect(() => {
    document.title = 'Admin Dashboard | MERN E-Commerce';
  }, []);

  const productItems = productsQuery.data?.items ?? [];
  const lowStockProducts = productItems.filter((product) => product.stock <= 5);
  const activeProducts = productItems.filter((product) => product.isActive);
  const productInventoryValue = productItems.reduce(
    (total, product) => total + product.price * product.stock,
    0
  );

  const orderItems = ordersQuery.data ?? [];
  const pendingOrders = orderItems.filter((order) =>
    ['pending', 'processing'].includes(order.status)
  );
  const shippedOrders = orderItems.filter((order) =>
    ['shipped', 'delivered'].includes(order.status)
  );
  const orderRevenue = orderItems.reduce((total, order) => total + order.totalAmount, 0);

  const userItems = usersQuery.data ?? [];
  const adminUsers = userItems.filter((user) => user.role === 'admin');
  const recentUsers = userItems.filter((user) => {
    const thirtyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 30;
    return new Date(user.createdAt).getTime() >= thirtyDaysAgo;
  });

  const getInitialOrderDraft = (order: AdminOrder): UpdatableOrderStatus => {
    if (updatableOrderStatuses.includes(order.status as UpdatableOrderStatus)) {
      return order.status as UpdatableOrderStatus;
    }

    return 'pending';
  };

  const handleDeleteProduct = async (product: ProductListItem) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    await deleteProductMutation.mutateAsync(product.id);
  };

  const handleOrderDraftChange = (orderId: string, status: UpdatableOrderStatus) => {
    setOrderStatusDrafts((currentDrafts) => ({
      ...currentDrafts,
      [orderId]: status,
    }));
  };

  const handleOrderStatusUpdate = async (order: AdminOrder) => {
    const nextStatus = orderStatusDrafts[order.id] ?? getInitialOrderDraft(order);
    await updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: nextStatus });
  };

  const productColumns: Column<ProductListItem>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Product',
        render: (product) => (
          <div>
            <p className="font-medium text-white">{product.name}</p>
            <p className="mt-1 text-xs text-gray-400">
              {product.category?.name ?? 'Uncategorized'}
            </p>
          </div>
        ),
      },
      {
        key: 'price',
        label: 'Price',
        render: (product) => (
          <span className="font-medium text-white">{formatCurrency(product.price)}</span>
        ),
      },
      {
        key: 'stock',
        label: 'Stock',
        render: (product) => (
          <span className={product.stock <= 5 ? 'font-medium text-amber-300' : 'text-gray-200'}>
            {product.stock}
          </span>
        ),
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        render: (product) => <span className="text-gray-300">{formatDate(product.updatedAt)}</span>,
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (product) => (
          <div className="flex items-center gap-4">
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => {
                void handleDeleteProduct(product);
              }}
              disabled={deleteProductMutation.isPending}
              className="text-sm font-medium text-rose-300 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [deleteProductMutation.isPending]
  );

  const orderColumns: Column<AdminOrder>[] = useMemo(
    () => [
      {
        key: 'id',
        label: 'Order ID',
        render: (order) => (
          <span className="font-medium text-white">{order.id.slice(0, 8)}...</span>
        ),
      },
      {
        key: 'userId',
        label: 'Customer',
        render: (order) => <span className="text-gray-300">{order.userId.slice(0, 8)}...</span>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (order) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[order.status]}`}
          >
            {order.status}
          </span>
        ),
      },
      {
        key: 'totalAmount',
        label: 'Total',
        className: 'text-right',
        render: (order) => (
          <span className="font-medium text-white">{formatCurrency(order.totalAmount)}</span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (order) => <span className="text-gray-300">{formatDate(order.createdAt)}</span>,
      },
      {
        key: 'actions',
        label: 'Update Status',
        render: (order) => {
          const selectedStatus = orderStatusDrafts[order.id] ?? getInitialOrderDraft(order);
          const isUpdatingThisOrder =
            updateOrderStatusMutation.isPending &&
            updateOrderStatusMutation.variables?.orderId === order.id;
          const isUnchanged = selectedStatus === order.status;

          return (
            <div className="flex min-w-[220px] items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(event) =>
                  handleOrderDraftChange(order.id, event.target.value as UpdatableOrderStatus)
                }
                disabled={isUpdatingThisOrder}
                className="rounded-xl border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatableOrderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  void handleOrderStatusUpdate(order);
                }}
                disabled={isUpdatingThisOrder || isUnchanged}
                className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingThisOrder ? 'Saving...' : 'Update'}
              </button>
            </div>
          );
        },
      },
    ],
    [orderStatusDrafts, updateOrderStatusMutation.isPending, updateOrderStatusMutation.variables]
  );

  const userColumns: Column<AdminUserRecord>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        render: (user) => (
          <div>
            <p className="font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-1 text-xs text-gray-400">{user.email}</p>
          </div>
        ),
      },
      {
        key: 'role',
        label: 'Role',
        render: (user) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleStyles[user.role]}`}
          >
            {user.role}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Joined',
        render: (user) => <span className="text-gray-300">{formatDate(user.createdAt)}</span>,
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        render: (user) => <span className="text-gray-300">{formatDate(user.updatedAt)}</span>,
      },
    ],
    []
  );

  const productPanel = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Loaded Products"
          value={String(productItems.length)}
          hint="Current product records loaded into this tab."
        />
        <SummaryCard
          label="Low Stock"
          value={String(lowStockProducts.length)}
          hint="Products at or below five units."
        />
        <SummaryCard
          label="Inventory Value"
          value={formatCurrency(productInventoryValue)}
          hint="Based on loaded product stock and price."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">
          {activeProducts.length} active products ready for storefront visibility.
        </p>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-5 py-2.5 text-sm font-medium text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <DataTable
        caption="Admin products"
        columns={productColumns}
        data={productItems}
        emptyMessage="No products found yet."
        isLoading={productsQuery.isLoading}
      />
    </div>
  );

  const ordersPanel = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Recent Orders"
          value={String(orderItems.length)}
          hint="Latest orders returned by the admin feed."
        />
        <SummaryCard
          label="Needs Attention"
          value={String(pendingOrders.length)}
          hint="Pending or processing orders still in flight."
        />
        <SummaryCard
          label="Recent Revenue"
          value={formatCurrency(orderRevenue)}
          hint="Total value of the loaded orders."
        />
      </div>

      <p className="text-sm text-gray-400">
        {shippedOrders.length} shipped or delivered orders are moving cleanly through fulfillment.
      </p>

      <DataTable
        caption="Admin orders"
        columns={orderColumns}
        data={orderItems}
        emptyMessage="No orders found yet."
        isLoading={ordersQuery.isLoading}
      />
    </div>
  );

  const usersPanel = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total Users"
          value={String(userItems.length)}
          hint="All active users returned by the admin endpoint."
        />
        <SummaryCard
          label="Admins"
          value={String(adminUsers.length)}
          hint="Accounts with elevated store access."
        />
        <SummaryCard
          label="Recent Signups"
          value={String(recentUsers.length)}
          hint="Users created in the last 30 days."
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <ShieldCheck className="h-4 w-4 text-indigo-300" />
        User management is now connected to live admin data.
      </div>

      <DataTable
        caption="Admin users"
        columns={userColumns}
        data={userItems}
        emptyMessage="No users found yet."
        isLoading={usersQuery.isLoading}
      />
    </div>
  );

  const tabContent = {
    products: productsQuery.isError ? (
      <ErrorPanel
        title="Could not load products"
        message={
          productsQuery.error instanceof Error
            ? productsQuery.error.message
            : 'Something went wrong while loading products.'
        }
      />
    ) : (
      productPanel
    ),
    orders: ordersQuery.isError ? (
      <ErrorPanel
        title="Could not load orders"
        message={
          ordersQuery.error instanceof Error
            ? ordersQuery.error.message
            : 'Something went wrong while loading orders.'
        }
      />
    ) : (
      ordersPanel
    ),
    users: usersQuery.isError ? (
      <ErrorPanel
        title="Could not load users"
        message={
          usersQuery.error instanceof Error
            ? usersQuery.error.message
            : 'Something went wrong while loading users.'
        }
      />
    ) : (
      usersPanel
    ),
  } satisfies Record<AdminTabId, JSX.Element>;

  return (
    <div className="mx-auto min-h-screen max-w-full space-y-8 bg-gray-900 px-4 py-6">
      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Admin control center
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Admin dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300">
          Switch between products, orders, and users to manage the store from one dark-theme admin
          shell.
        </p>
      </section>

      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-4 shadow-md">
        <div className="grid gap-3 md:grid-cols-3">
          {adminTabs.map(({ id, label, description, icon: Icon }) => {
            const isActive = id === activeTab;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                    : 'border-gray-700 bg-gray-900 hover:border-indigo-500/60 hover:bg-gray-700/70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-lg font-semibold ${
                        isActive ? 'text-white' : 'text-gray-100'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
                  </div>
                  <div
                    className={`rounded-full p-3 ${
                      isActive ? 'bg-indigo-500/15 text-indigo-300' : 'bg-gray-800 text-indigo-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-md">
        <div className="border-b border-gray-700 pb-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">{activeTabConfig.label}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">{activeTabConfig.description}</p>
          </div>
        </div>

        <div className="mt-6">{tabContent[activeTab]}</div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
