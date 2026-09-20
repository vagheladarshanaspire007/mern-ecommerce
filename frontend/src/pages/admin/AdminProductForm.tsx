import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { productService, type Category } from '@/services/product.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  });

  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch {
        toast.error('Failed to load categories');
      }
    };

    void loadCategories();
  }, []);

  // Load product when editing.
  useEffect(() => {
    if (!id) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);

        const product = await productService.getProduct(id);

        setFormData({
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stock: String(product.stock),
          categoryId: product.categoryId ?? '',
        });

        const existingImage = product.imageUrls[0] ?? '';

        setImageUrl(existingImage);
        setPreviewUrl(existingImage);
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  // Clean up temporary preview URL.
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size must be 5MB or less.');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
    setImageUrl('');
    setUploadProgress(0);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const uploadSelectedImage = async (): Promise<string | null> => {
    if (!selectedFile) {
      return imageUrl || null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadedUrl = await productService.uploadImage(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setImageUrl(uploadedUrl);
      setSelectedFile(null);

      return uploadedUrl;
    } catch {
      toast.error('Image upload failed.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required.';
    }

    const price = Number(formData.price);

    if (!formData.price || Number.isNaN(price) || price < 0) {
      nextErrors.price = 'Enter a valid price.';
    }

    const stock = Number(formData.stock);

    if (!formData.stock || Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
      nextErrors.stock = 'Enter a valid stock quantity.';
    }

    if (!formData.categoryId) {
      nextErrors.categoryId = 'Category is required.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const uploadedUrl = await uploadSelectedImage();

      if (selectedFile && !uploadedUrl) {
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: formData.categoryId || null,
        imageUrls: uploadedUrl ? [uploadedUrl] : imageUrl ? [imageUrl] : [],
      };

      if (id) {
        await productService.updateProduct(id, payload);
        toast.success('Product updated successfully.');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created successfully.');
      }

      navigate('/admin');
    } catch {
      toast.error(isEditMode ? 'Failed to update product.' : 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl('');
    setImageUrl('');
    setUploadProgress(0);
  };

  if (loading && id && !formData.name) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-gray-500">Loading product...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
            error={errors.name}
            required
          />

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              id="description"
              value={formData.description}
              onChange={(event) => updateField('description', event.target.value)}
              rows={5}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              required
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <Input
            label="Price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(event) => updateField('price', event.target.value)}
            error={errors.price}
            required
          />

          <Input
            label="Stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={(event) => updateField('stock', event.target.value)}
            error={errors.stock}
            required
          />

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium">
              Category
            </label>

            <select
              id="category"
              value={formData.categoryId}
              onChange={(event) => updateField('categoryId', event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Product Image</p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
                dragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-300'
              }`}
            >
              <Upload className="mx-auto mb-3 h-8 w-8 text-gray-500" />

              <p className="text-sm font-medium">Drag and drop an image here</p>

              <p className="mt-1 text-xs text-gray-500">JPEG, PNG or WebP · Maximum 5MB</p>

              <Button
                type="button"
                className="mt-4"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Image
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {previewUrl && (
              <div className="relative mt-4 w-fit">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="h-40 w-40 rounded-lg border object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 rounded-full bg-white p-1 shadow"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" onClick={() => navigate('/admin')}>
              Cancel
            </Button>

            <Button type="submit" disabled={loading || uploading}>
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Product'
                  : 'Create Product'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
