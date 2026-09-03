import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import type {
  CreateProductDto,
  ListProductsDto,
  UpdateProductDto,
} from '../validators/product.validator';

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  const result = await ProductService.list(req.query as unknown as ListProductsDto);

  res.json({
    success: true,
    data: result,
  });
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await ProductService.getById(req.params.id);

  res.json({
    success: true,
    data: { product },
  });
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await ProductService.categories();

  res.json({
    success: true,
    data: { categories },
  });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await ProductService.create(req.body as CreateProductDto);

  res.status(201).json({
    success: true,
    data: { product },
  });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await ProductService.update(
    req.params.id,
    req.body as UpdateProductDto
  );

  res.json({
    success: true,
    data: { product },
  });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  await ProductService.delete(req.params.id);

  res.json({
    success: true,
    data: {
      message: 'Product deleted successfully',
    },
  });
};
