import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/cart/:sessionId — Get current cart
router.get("/:sessionId", async (req: Request, res: Response) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.sessionId },
    });
    if (!session || session.status === "expired") {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    const items = await prisma.cartItem.findMany({
      where: { sessionId: req.params.sessionId },
      include: { product: true },
      orderBy: { addedAt: "desc" },
    });

    const subtotal = items.reduce((s, i) => s + i.priceAtScan * i.qty, 0);
    const gstAmount = items.reduce((s, i) => s + i.priceAtScan * i.qty * i.product.gstRate, 0);
    const mrpTotal = items.reduce((s, i) => s + i.product.mrp * i.qty, 0);
    const savings = mrpTotal - subtotal;
    const count = items.reduce((s, i) => s + i.qty, 0);

    res.json({
      items: items.map(i => ({
        id: i.id,
        productId: i.productId,
        name: i.product.name,
        brand: i.product.brand,
        icon: i.product.icon,
        price: i.priceAtScan,
        mrp: i.product.mrp,
        gstRate: i.product.gstRate,
        qty: i.qty,
        category: i.product.category,
      })),
      subtotal,
      gstAmount,
      total: subtotal + gstAmount,
      savings,
      count,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST /api/cart/:sessionId/add — Add item to cart
router.post("/:sessionId/add", async (req: Request, res: Response) => {
  try {
    const { productId, qty = 1 } = req.body;
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== "active") {
      return res.status(400).json({ error: "Session is not active" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.inStock) {
      return res.status(404).json({ error: "Product not found or out of stock" });
    }

    // Upsert: if already in cart, increment qty
    const existing = await prisma.cartItem.findUnique({
      where: { sessionId_productId: { sessionId, productId } },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + qty },
        include: { product: true },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { sessionId, productId, qty, priceAtScan: product.price },
        include: { product: true },
      });
    }

    res.json({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      icon: item.product.icon,
      price: item.priceAtScan,
      qty: item.qty,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// PATCH /api/cart/:sessionId/item/:id — Update item qty
router.patch("/:sessionId/item/:id", async (req: Request, res: Response) => {
  try {
    const { qty } = req.body;
    if (qty < 1) return res.status(400).json({ error: "Quantity must be at least 1" });

    const item = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { qty },
      include: { product: true },
    });

    res.json({ id: item.id, qty: item.qty, name: item.product.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// DELETE /api/cart/:sessionId/item/:id — Remove item
router.delete("/:sessionId/item/:id", async (req: Request, res: Response) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

export default router;
