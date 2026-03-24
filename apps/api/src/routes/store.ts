import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/store/:storeId — Store metadata
router.get("/:storeId", async (req: Request, res: Response) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.storeId },
    });
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch store" });
  }
});

// GET /api/store/:storeId/products — Product list with pagination and filters
router.get("/:storeId/products", async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { category, search, page = "1", limit = "50" } = req.query;

    const where: any = { storeId, inStock: true };
    if (category && category !== "All") where.category = category as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { brand: { contains: search as string } },
        { barcode: { contains: search as string } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
