import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/products?storeId=xx — List all products
router.get("/", async (req: Request, res: Response) => {
  try {
    const { storeId, category, search } = req.query;
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (category && category !== "All") where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { brand: { contains: search as string } },
        { barcode: { contains: search as string } },
      ];
    }

    const products = await prisma.product.findMany({ where, orderBy: { name: "asc" } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /api/admin/products — Create product
router.post("/", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Product with this barcode already exists" });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PATCH /api/admin/products/:id — Update product
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/admin/products/:id — Delete product
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// POST /api/admin/products/bulk-import — CSV import
router.post("/bulk-import", async (req: Request, res: Response) => {
  try {
    const { products, storeId } = req.body;
    // products: array of product objects
    let created = 0;
    let skipped = 0;

    for (const p of products) {
      try {
        await prisma.product.create({
          data: { storeId, ...p },
        });
        created++;
      } catch {
        skipped++;
      }
    }

    res.json({ created, skipped, total: products.length });
  } catch (err) {
    res.status(500).json({ error: "Bulk import failed" });
  }
});

export default router;
