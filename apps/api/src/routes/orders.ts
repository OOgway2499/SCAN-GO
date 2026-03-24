import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const router = Router();
const prisma = new PrismaClient();

function generateReceiptId(): string {
  return "SG-" + crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 6);
}

// POST /api/orders/create — Create order from cart
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { sessionId, paymentMethod } = req.body;

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== "active") {
      return res.status(400).json({ error: "Session is not active" });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const subtotal = cartItems.reduce((s, i) => s + i.priceAtScan * i.qty, 0);
    const gstAmount = cartItems.reduce((s, i) => s + i.priceAtScan * i.qty * i.product.gstRate, 0);
    const total = subtotal + gstAmount;
    const receiptId = generateReceiptId();

    // Check risk flags
    const isFirstVisit = !(await prisma.order.findFirst({
      where: { session: { phone: session.phone } },
    }));
    const isHighValue = total > 2000;
    const riskFlag = isFirstVisit || isHighValue ? "red" : "green";

    const order = await prisma.order.create({
      data: {
        sessionId,
        storeId: session.storeId,
        subtotal,
        gstAmount,
        total,
        paymentMethod: paymentMethod || "",
        paymentStatus: paymentMethod === "cash" ? "cash" : "pending",
        receiptId,
        riskFlag,
        orderItems: {
          create: cartItems.map(i => ({
            productId: i.productId,
            nameSnapshot: i.product.name,
            qty: i.qty,
            unitPrice: i.priceAtScan,
            gstRate: i.product.gstRate,
          })),
        },
      },
      include: { orderItems: true },
    });

    res.json({
      orderId: order.id,
      receiptId: order.receiptId,
      subtotal,
      gstAmount,
      total,
      paymentStatus: order.paymentStatus,
      itemCount: cartItems.reduce((s, i) => s + i.qty, 0),
    });
  } catch (err: any) {
    console.error("Order create error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// POST /api/orders/:id/payment — Simulate payment (mock Razorpay)
router.post("/:id/payment", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // In production, this would create a Razorpay order
    // For now, return a mock payment object
    res.json({
      orderId: order.id,
      amount: order.total * 100, // paise
      currency: "INR",
      razorpayOrderId: "order_mock_" + crypto.randomBytes(8).toString("hex"),
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      description: `ScanGo Order ${order.receiptId}`,
      prefill: { contact: "" },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// POST /api/orders/:id/verify-payment — Verify and finalize payment
router.post("/:id/verify-payment", async (req: Request, res: Response) => {
  try {
    const { paymentId, signature } = req.body;
    const orderId = req.params.id;

    // In production: verify Razorpay webhook signature
    // For dev: auto-approve
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        paymentRef: paymentId || "mock_payment_" + Date.now(),
      },
    });

    // Mark session as paid
    await prisma.session.update({
      where: { id: order.sessionId },
      data: { status: "paid" },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { sessionId: order.sessionId } });

    res.json({
      success: true,
      receiptId: order.receiptId,
      total: order.total,
    });
  } catch (err) {
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// GET /api/orders/:receiptId — Get receipt data
router.get("/:receiptId", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { receiptId: req.params.receiptId },
      include: {
        orderItems: { include: { product: true } },
        store: true,
        session: true,
        verification: true,
      },
    });

    if (!order) return res.status(404).json({ error: "Receipt not found" });

    res.json({
      orderId: order.id,
      receiptId: order.receiptId,
      store: { name: order.store.name, branch: order.store.branch, gstin: order.store.gstin },
      phone: order.session.phone,
      items: order.orderItems.map(i => ({
        name: i.nameSnapshot,
        qty: i.qty,
        unitPrice: i.unitPrice,
        gstRate: i.gstRate,
        icon: i.product.icon,
        total: i.unitPrice * i.qty,
      })),
      subtotal: order.subtotal,
      gstAmount: order.gstAmount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      riskFlag: order.riskFlag,
      createdAt: order.createdAt,
      isVerified: !!order.verification,
      itemCount: order.orderItems.reduce((s, i) => s + i.qty, 0),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});


router.get("/history/:phone", async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const orders = await prisma.order.findMany({
      where: {
        session: { phone },
        paymentStatus: "paid",
      },
      include: {
        orderItems: { include: { product: true } },
        store: true,
        session: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      phone,
      totalOrders: orders.length,
      totalSpent: orders.reduce((s, o) => s + o.total, 0),
      orders: orders.map(o => ({
        orderId: o.id,
        receiptId: o.receiptId,
        storeName: o.store.name,
        storeBranch: o.store.branch,
        total: o.total,
        subtotal: o.subtotal,
        gstAmount: o.gstAmount,
        paymentMethod: o.paymentMethod,
        itemCount: o.orderItems.reduce((s, i) => s + i.qty, 0),
        items: o.orderItems.map(i => ({
          name: i.nameSnapshot,
          qty: i.qty,
          unitPrice: i.unitPrice,
          icon: i.product.icon,
          total: i.unitPrice * i.qty,
        })),
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    console.error("Order history error:", err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
});

// GET /api/orders/admin/all — Admin: list all orders with filters
router.get("/admin/all", async (req: Request, res: Response) => {
  try {
    const { storeId, phone, from, to, page = "1", limit = "20" } = req.query as Record<string, string>;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (phone) where.session = { phone: { contains: phone } };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { product: true } },
          session: { select: { phone: true } },
          store: { select: { name: true } },
          verification: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders: orders.map(o => ({
        orderId: o.id,
        receiptId: o.receiptId,
        phone: o.session.phone,
        storeName: o.store.name,
        total: o.total,
        subtotal: o.subtotal,
        gstAmount: o.gstAmount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        riskFlag: o.riskFlag,
        isVerified: !!o.verification,
        itemCount: o.orderItems.reduce((s, i) => s + i.qty, 0),
        items: o.orderItems.map(i => ({
          name: i.nameSnapshot,
          qty: i.qty,
          unitPrice: i.unitPrice,
          icon: i.product.icon,
        })),
        createdAt: o.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Admin orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;

