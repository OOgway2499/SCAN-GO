import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/products/barcode/:barcode — Lookup product by barcode
router.get("/barcode/:barcode", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: { barcode: req.params.barcode, inStock: true },
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
        message: "This barcode is not in our database. Please ask staff for help.",
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to lookup product" });
  }
});

export default router;
