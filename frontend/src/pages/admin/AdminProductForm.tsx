import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';
import { productService } from '@/services/product.service';
import type { AdminProductFormValues } from '@/types/auth.types';
import { DEFAULT_IMAGE_PLACEHOLDER, resolveImageUrl } from '@/utils/resolveImageUrl';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function validateImageFile(file: File) {
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, and WebP images are supported.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be 5MB or smaller.';
  }

  return null;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = Boolean(id);
  const [isDragActive, setIsDragActive] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  useEffect(() => {
    document.title = isEditMode
      ? 'Edit Product | MERN E-Commerce'
      : 'Create Product | MERN E-Commerce';
  }, [isEditMode]);

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id ?? ''),
    enabled: isEditMode,
  });

  const { data: categories = [], isLoading: isCategoryLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: productService.getProductCategories,
  });

  const defaultCategoryId = useMemo(() => categories[0]?.id ?? '', [categories]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductFormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      imageUrls: [],
    },
  });

  useEffect(() => {
    if (!product) {
      return;
    }

    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.id ?? defaultCategoryId,
      imageUrls: product.images.map((img) => img.url),
    });
    setUploadedImageUrl(product.images[0]?.url ?? '');
  }, [defaultCategoryId, product, reset]);

  useEffect(() => {
    if (!isEditMode && defaultCategoryId) {
      setValue('categoryId', defaultCategoryId);
    }
  }, [defaultCategoryId, isEditMode, setValue]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => productService.uploadImage(file, setUploadProgress),
    onMutate: () => {
      setImageError(null);
      setUploadProgress(0);
    },
    onSuccess: ({ url }) => {
      const currentImageUrls = getValues('imageUrls') ?? [];

      setUploadedImageUrl(url);
      setValue('imageUrls', [...currentImageUrls, url], {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success('Image uploaded successfully.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Image upload failed.';
      setImageError(message);
      toast.error(message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: AdminProductFormValues) =>
      isEditMode && id
        ? productService.updateProduct(id, values)
        : productService.createProduct(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
        queryClient.invalidateQueries({ queryKey: ['product', id] }),
      ]);
      toast.success(isEditMode ? 'Product updated.' : 'Product created.');
      navigate('/admin');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save product.');
    },
  });

  const handleFile = async (file?: File) => {
    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setImageError(validationError);
      setUploadProgress(0);
      return;
    }

    await uploadMutation.mutateAsync(file);
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    await handleFile(file);
    event.target.value = '';
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    await handleFile(file);
  };

  const onSubmit = async (values: AdminProductFormValues) => {
    await saveMutation.mutateAsync(values);
  };

  if (isEditMode && isProductLoading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl space-y-8 bg-gray-900 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            Admin products
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {isEditMode ? 'Edit product' : 'Create new product'}
          </h1>
        </div>
        <Link
          to="/admin"
          className="inline-flex rounded-full border border-gray-600 px-5 py-2 text-sm font-medium text-gray-100 transition hover:border-indigo-400"
        >
          Back to dashboard
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 rounded-4xl border border-gray-700 bg-gray-800 p-8 shadow-lg"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-300">Product name</span>
            <input
              {...register('name', { required: 'Name is required.' })}
              className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Premium desk lamp"
            />
            {errors.name && <p className="text-sm text-rose-600">{errors.name.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-300">Category</span>
            <select
              {...register('categoryId', { required: 'Category is required.' })}
              className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              disabled={isCategoryLoading}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-rose-600">{errors.categoryId.message}</p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-300">Price</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price', {
                required: 'Price is required.',
                valueAsNumber: true,
                min: { value: 0, message: 'Price must be 0 or greater.' },
              })}
              className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {errors.price && <p className="text-sm text-rose-600">{errors.price.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-300">Stock</span>
            <input
              type="number"
              min="0"
              {...register('stock', {
                required: 'Stock is required.',
                valueAsNumber: true,
                min: { value: 0, message: 'Stock must be 0 or greater.' },
              })}
              className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {errors.stock && <p className="text-sm text-rose-600">{errors.stock.message}</p>}
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-300">Description</span>
          <textarea
            rows={6}
            {...register('description', { required: 'Description is required.' })}
            className="w-full rounded-3xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Describe the product, materials, and standout details."
          />
          {errors.description && (
            <p className="text-sm text-rose-600">{errors.description.message}</p>
          )}
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Product image</h2>
              <p className="text-sm text-gray-400">Drop a JPEG, PNG, or WebP file up to 5MB.</p>
            </div>
            <input type="hidden" {...register('imageUrls')} />
          </div>

          <label
            htmlFor="product-image-upload"
            aria-label="Upload product image"
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            className={`block rounded-[2rem] border-2 border-dashed p-8 text-center transition ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-600 bg-gray-900 hover:border-indigo-500/60 hover:bg-gray-800/80'
            }`}
          >
            <div className="mx-auto flex max-w-md flex-col items-center gap-3">
              <span className="inline-flex rounded-full bg-gray-800 p-4 text-indigo-400 shadow-sm">
                <UploadCloud size={24} />
              </span>
              <div>
                <p className="text-base font-medium text-white">Drag and drop an image here</p>
                <p className="mt-1 text-sm text-gray-400">or click to browse from your computer</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white">
                <ImagePlus size={16} />
                Select image
              </span>
            </div>
          </label>

          <input
            id="product-image-upload"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              void handleInputChange(event);
            }}
          />

          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">Uploading... {uploadProgress}%</p>
            </div>
          )}

          {imageError && <p className="text-sm text-rose-600">{imageError}</p>}

          {uploadedImageUrl && (
            <div className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-900 shadow-sm">
              <img
                src={resolveImageUrl(uploadedImageUrl)}
                alt="Uploaded product preview"
                loading="lazy"
                width={1024}
                height={512}
                className="h-64 w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_IMAGE_PLACEHOLDER;
                }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin"
            className="inline-flex items-center justify-center rounded-full border border-gray-600 px-5 py-3 text-sm font-medium text-gray-100 transition hover:border-indigo-400"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {(isSubmitting || saveMutation.isPending) && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {isEditMode ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  );
}
