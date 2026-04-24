import { Request, Response } from 'express';
import {
  createProductService,
  deleteProductService,
  getCategories,
  getProductById,
  listProducts,
  updateProductService,
} from '../services/product.service';
import {
  type CreateProductDto,
  type ProductListQueryDto,
  type UpdateProductDto,
} from '../validators/product.validator';

type ProductParams = {
  id: string;
};

export async function listProductsController(
  req: Request<unknown, unknown, unknown, ProductListQueryDto>,
  res: Response
): Promise<void> {
  const query = req.query;

  let inStock: boolean | undefined;

  if (query.inStock === 'true') {
    inStock = true;
  } else if (query.inStock === 'false') {
    inStock = false;
  }

  const result = await listProducts({
    search: query.search,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    categoryId: query.categoryId,
    inStock,
    limit: query.limit,
    cursor: query.cursor,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      limit: query.limit,
    },
    cached: result.cached,
  });
}

export async function getProductByIdController(
  req: Request<ProductParams>,
  res: Response
): Promise<void> {
  const product = await getProductById(req.params.id);

  res.json({
    success: true,
    data: product,
  });
}

export async function getCategoriesController(_req: Request, res: Response): Promise<void> {
  const categories = await getCategories();

  res.json({
    success: true,
    data: categories,
  });
}

export async function createProductController(
  req: Request<unknown, unknown, CreateProductDto>,
  res: Response
): Promise<void> {
  const product = await createProductService(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
}

export async function updateProductController(
  req: Request<ProductParams, unknown, UpdateProductDto>,
  res: Response
): Promise<void> {
  const product = await updateProductService(req.params.id, req.body);

  res.json({
    success: true,
    data: product,
  });
}

export async function deleteProductController(
  req: Request<ProductParams>,
  res: Response
): Promise<void> {
  await deleteProductService(req.params.id);

  res.json({
    success: true,
    data: 'Product deleted successfully',
  });
}
