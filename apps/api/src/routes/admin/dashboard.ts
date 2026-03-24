import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/dashboard/live — Live dashboard metrics
router.get("/live", async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    const where = storeId ? { storeId: storeId as string } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeCarts, ordersToday, revenueToday, allOrdersToday, topProducts] = await Promise.all([
      prisma.session.count({ where: { ...where, status: "active" } }),
      prisma.order.count({ where: { ...where, createdAt: { gte: today }, paymentStatus: "paid" } }),
      prisma.order.aggregate({
        where: { ...where, createdAt: { gte: today }, paymentStatus: "paid" },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { ...where, createdAt: { gte: today }, paymentStatus: "paid" },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { qty: true },
        orderBy: { _sum: { qty: "desc" } },
        take: 10,
      }),
    ]);

    // Get product details for top products
    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { name: true, icon: true, price: true },
        });
        return {
          productId: tp.productId,
          name: product?.name || "Unknown",
          icon: product?.icon || "📦",
          price: product?.price || 0,
          totalSold: tp._sum.qty || 0,
        };
      })
    );

    // Hourly revenue
    const hourlyRevenue: { hour: number; revenue: number; orders: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const hourStart = new Date(today);
      hourStart.setHours(h);
      const hourEnd = new Date(today);
      hourEnd.setHours(h + 1);

      const ordersInHour = allOrdersToday.filter(
        (o) => o.createdAt >= hourStart && o.createdAt < hourEnd
      );

      hourlyRevenue.push({
        hour: h,
        revenue: ordersInHour.reduce((s, o) => s + o.total, 0),
        orders: ordersInHour.length,
      });
    }

    res.json({
      activeCarts,
      ordersToday,
      revenueToday: revenueToday._sum.total || 0,
      avgCartValue: ordersToday > 0 ? (revenueToday._sum.total || 0) / ordersToday : 0,
      hourlyRevenue,
      topProducts: topProductDetails,
      recentOrders: allOrdersToday.slice(0, 20),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// GET /api/admin/dashboard/reports — Sales report
router.get("/reports", async (req: Request, res: Response) => {
  try {
    const { storeId, from, to } = req.query;
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }
    where.paymentStatus = "paid";

    const orders = await prisma.order.findMany({
      where,
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalGst = orders.reduce((s, o) => s + o.gstAmount, 0);
    const totalOrders = orders.length;

    // Category breakdown
    const categoryMap: Record<string, { revenue: number; qty: number }> = {};
    for (const order of orders) {
      for (const item of order.orderItems) {
        const cat = item.product.category;
        if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, qty: 0 };
        categoryMap[cat].revenue += item.unitPrice * item.qty;
        categoryMap[cat].qty += item.qty;
      }
    }

    res.json({
      totalRevenue,
      totalGst,
      cgst: totalGst / 2,
      sgst: totalGst / 2,
      totalOrders,
      categoryBreakdown: Object.entries(categoryMap).map(([cat, data]) => ({
        category: cat,
        ...data,
      })),
      orders: orders.map((o) => ({
        receiptId: o.receiptId,
        total: o.total,
        gst: o.gstAmount,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        itemCount: o.orderItems.reduce((s, i) => s + i.qty, 0),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate report" });
  }
});

export default router;
