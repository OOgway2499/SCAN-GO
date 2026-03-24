import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/guard/receipt/:receiptId — Lookup receipt for guard verification
router.get("/receipt/:receiptId", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { receiptId: req.params.receiptId },
      include: {
        orderItems: { include: { product: true } },
        session: true,
        store: true,
        verification: true,
      },
    });

    if (!order) return res.status(404).json({ error: "Receipt not found" });

    if (order.paymentStatus !== "paid" && order.paymentStatus !== "cash") {
      return res.status(400).json({ error: "Receipt is not paid" });
    }

    // Check if receipt is already verified
    if (order.verification && order.verification.status === "cleared") {
      return res.status(400).json({ error: "Receipt already verified", verification: order.verification });
    }

    // Check if receipt is within 3-hour window
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    if (order.createdAt < threeHoursAgo) {
      return res.status(400).json({ error: "Receipt has expired (older than 3 hours)" });
    }

    const billedCount = order.orderItems.reduce((s, i) => s + i.qty, 0);
    const maskedPhone = order.session.phone.slice(0, 4) + "XXXXXX";

    res.json({
      orderId: order.id,
      receiptId: order.receiptId,
      phone: maskedPhone,
      riskFlag: order.riskFlag,
      items: order.orderItems.map(i => ({
        id: i.id,
        name: i.nameSnapshot,
        qty: i.qty,
        unitPrice: i.unitPrice,
        icon: i.product.icon,
        total: i.unitPrice * i.qty,
      })),
      billedCount,
      billedTotal: order.total,
      storeName: order.store.name,
      createdAt: order.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to lookup receipt" });
  }
});

// POST /api/guard/verify/:orderId — Submit physical count verification
router.post("/verify/:orderId", async (req: Request, res: Response) => {
  try {
    const { physicalCount, guardId } = req.body;
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const billedCount = order.orderItems.reduce((s, i) => s + i.qty, 0);
    const mismatchCount = Math.max(0, physicalCount - billedCount);
    const status = mismatchCount === 0 ? "cleared" : "pending";

    const verification = await prisma.exitVerification.create({
      data: {
        orderId,
        guardId,
        billedCount,
        physicalCount,
        mismatchCount,
        status,
      },
    });

    res.json({
      verificationId: verification.id,
      billedCount,
      physicalCount,
      mismatchCount,
      status,
      message: mismatchCount === 0
        ? "All clear! Customer may exit."
        : `${mismatchCount} unbilled item(s) found. Proceed to mismatch billing.`,
    });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// POST /api/guard/bill-extra/:orderId — Bill additional unbilled items
router.post("/bill-extra/:orderId", async (req: Request, res: Response) => {
  try {
    const { extraItems, guardId } = req.body;
    // extraItems: [{ productId, qty }]
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    let extraSubtotal = 0;
    let extraGst = 0;

    for (const item of extraItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      // Add to order items
      await prisma.orderItem.create({
        data: {
          orderId,
          productId: product.id,
          nameSnapshot: product.name + " (exit scan)",
          qty: item.qty || 1,
          unitPrice: product.price,
          gstRate: product.gstRate,
        },
      });

      extraSubtotal += product.price * (item.qty || 1);
      extraGst += product.price * (item.qty || 1) * product.gstRate;
    }

    const extraTotal = extraSubtotal + extraGst;

    // Update order totals
    await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: order.subtotal + extraSubtotal,
        gstAmount: order.gstAmount + extraGst,
        total: order.total + extraTotal,
      },
    });

    // Update verification
    await prisma.exitVerification.updateMany({
      where: { orderId },
      data: { extraAmount: extraTotal, status: "mismatch_resolved" },
    });

    res.json({
      extraSubtotal,
      extraGst,
      extraTotal,
      newOrderTotal: order.total + extraTotal,
      message: "Extra items billed. Send payment request to customer.",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to bill extra items" });
  }
});

// POST /api/guard/payment-request/:orderId — Send payment request (mock)
router.post("/payment-request/:orderId", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { session: true, verification: true },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // In production: send WhatsApp/SMS via Twilio/MSG91
    // For now: mock success
    console.log(`📱 Payment request sent to ${order.session.phone} for ₹${order.verification?.extraAmount || 0}`);

    res.json({
      success: true,
      phone: order.session.phone,
      amount: order.verification?.extraAmount || 0,
      message: "Payment request sent to customer's phone",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send payment request" });
  }
});

export default router;
