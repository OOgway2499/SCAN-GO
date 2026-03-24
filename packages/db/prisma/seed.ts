import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

async function main() {
  console.log("🌱 Seeding ScanGo database...\n");

  // ── Store ──
  const store = await prisma.store.create({
    data: {
      id: "store_freshmart_hyd",
      name: "FreshMart",
      branch: "Kondapur, Hyderabad",
      city: "Hyderabad",
      gstin: "36AABCU9603R1ZM",
      address: "Plot 42, Kondapur Main Road, Hyderabad 500084",
      timezone: "Asia/Kolkata",
      isActive: true,
    },
  });
  console.log(`✅ Store: ${store.name} — ${store.branch}`);

  // ── Staff ──
  const admin = await prisma.staff.create({
    data: {
      storeId: store.id,
      name: "Ravi Kumar",
      role: "admin",
      pinHash: hashPin("1234"),
      email: "ravi@freshmart.in",
    },
  });
  const guard = await prisma.staff.create({
    data: {
      storeId: store.id,
      name: "Suresh Babu",
      role: "guard",
      pinHash: hashPin("0000"),
      email: "",
    },
  });
  console.log(`✅ Staff: ${admin.name} (admin), ${guard.name} (guard)`);

  // ── Products (50 items) ──
  const products = [
    // Staples
    { barcode: "8901063010109", name: "Aashirvaad Atta 5kg",        brand: "ITC",           category: "Staples",       price: 280, mrp: 310, icon: "🌾", gstRate: 0.05, unit: "kg", weight: "5kg" },
    { barcode: "8901058851878", name: "Tata Salt 1kg",              brand: "Tata",          category: "Staples",       price: 24,  mrp: 26,  icon: "🧂", gstRate: 0.05, unit: "kg", weight: "1kg" },
    { barcode: "8901725181536", name: "India Gate Basmati 5kg",     brand: "KRBL",          category: "Staples",       price: 480, mrp: 520, icon: "🍚", gstRate: 0.05, unit: "kg", weight: "5kg" },
    { barcode: "8904083600109", name: "Fortune Suji 500g",          brand: "Adani Wilmar",  category: "Staples",       price: 42,  mrp: 45,  icon: "🌾", gstRate: 0.05, unit: "g",  weight: "500g" },
    { barcode: "8901030677205", name: "Rajdhani Chana Dal 1kg",     brand: "Rajdhani",      category: "Staples",       price: 145, mrp: 160, icon: "🫘", gstRate: 0.05, unit: "kg", weight: "1kg" },

    // Dairy
    { barcode: "8901262150545", name: "Amul Butter 500g",           brand: "Amul",          category: "Dairy",         price: 275, mrp: 280, icon: "🧈", gstRate: 0.05, unit: "g",  weight: "500g" },
    { barcode: "8901262011211", name: "Amul Taaza Milk 500ml",      brand: "Amul",          category: "Dairy",         price: 26,  mrp: 28,  icon: "🥛", gstRate: 0.00, unit: "ml", weight: "500ml" },
    { barcode: "8901262031011", name: "Amul Cheese Slice 200g",     brand: "Amul",          category: "Dairy",         price: 120, mrp: 125, icon: "🧀", gstRate: 0.05, unit: "g",  weight: "200g" },
    { barcode: "8906002870011", name: "Mother Dairy Dahi 400g",     brand: "Mother Dairy",  category: "Dairy",         price: 35,  mrp: 38,  icon: "🥣", gstRate: 0.05, unit: "g",  weight: "400g" },
    { barcode: "8901262111119", name: "Amul Paneer 200g",           brand: "Amul",          category: "Dairy",         price: 90,  mrp: 95,  icon: "🧈", gstRate: 0.05, unit: "g",  weight: "200g" },

    // Snacks
    { barcode: "8901233024539", name: "Cadbury Silk 160g",          brand: "Cadbury",       category: "Snacks",        price: 180, mrp: 195, icon: "🍫", gstRate: 0.18, unit: "g",  weight: "160g" },
    { barcode: "8901491101639", name: "Lay's Classic 26g",          brand: "PepsiCo",       category: "Snacks",        price: 20,  mrp: 20,  icon: "🥔", gstRate: 0.12, unit: "g",  weight: "26g" },
    { barcode: "8901063159204", name: "Bingo Mad Angles 72g",       brand: "ITC",           category: "Snacks",        price: 20,  mrp: 20,  icon: "🔺", gstRate: 0.12, unit: "g",  weight: "72g" },
    { barcode: "8901725133498", name: "Britannia Good Day 200g",    brand: "Britannia",     category: "Snacks",        price: 45,  mrp: 48,  icon: "🍪", gstRate: 0.18, unit: "g",  weight: "200g" },
    { barcode: "8901725111111", name: "Parle-G 800g",               brand: "Parle",         category: "Snacks",        price: 90,  mrp: 95,  icon: "🟡", gstRate: 0.18, unit: "g",  weight: "800g" },
    { barcode: "8901072002478", name: "Haldiram Aloo Bhujia 400g",  brand: "Haldiram's",    category: "Snacks",        price: 120, mrp: 130, icon: "🥜", gstRate: 0.12, unit: "g",  weight: "400g" },

    // Beverages
    { barcode: "8901058847857", name: "Red Label Tea 500g",         brand: "Brooke Bond",   category: "Beverages",     price: 240, mrp: 255, icon: "🍵", gstRate: 0.05, unit: "g",  weight: "500g" },
    { barcode: "7613036270748", name: "Nescafé Classic 100g",       brand: "Nestlé",        category: "Beverages",     price: 240, mrp: 260, icon: "☕", gstRate: 0.18, unit: "g",  weight: "100g" },
    { barcode: "8901764012220", name: "Coca-Cola 750ml",            brand: "Coca-Cola",     category: "Beverages",     price: 38,  mrp: 40,  icon: "🥤", gstRate: 0.28, unit: "ml", weight: "750ml" },
    { barcode: "8901396522522", name: "Paper Boat Aamras 200ml",    brand: "Paper Boat",    category: "Beverages",     price: 30,  mrp: 30,  icon: "🧃", gstRate: 0.12, unit: "ml", weight: "200ml" },
    { barcode: "8901058002003", name: "Bournvita 500g",             brand: "Cadbury",       category: "Beverages",     price: 230, mrp: 250, icon: "🥤", gstRate: 0.18, unit: "g",  weight: "500g" },

    // Cooking
    { barcode: "8904083600208", name: "Fortune Oil 1L",             brand: "Adani Wilmar",  category: "Cooking",       price: 135, mrp: 145, icon: "🫙", gstRate: 0.05, unit: "L",  weight: "1L" },
    { barcode: "8901058003703", name: "Saffola Gold Oil 1L",        brand: "Marico",        category: "Cooking",       price: 175, mrp: 189, icon: "🫙", gstRate: 0.05, unit: "L",  weight: "1L" },
    { barcode: "8901063030305", name: "Aashirvaad Spices Turmeric", brand: "ITC",           category: "Cooking",       price: 49,  mrp: 55,  icon: "🟡", gstRate: 0.05, unit: "g",  weight: "100g" },
    { barcode: "8901063030312", name: "Aashirvaad Red Chilli 100g", brand: "ITC",           category: "Cooking",       price: 55,  mrp: 60,  icon: "🌶️", gstRate: 0.05, unit: "g",  weight: "100g" },
    { barcode: "8901078501014", name: "Everest Garam Masala 100g",  brand: "Everest",       category: "Cooking",       price: 95,  mrp: 105, icon: "🧂", gstRate: 0.05, unit: "g",  weight: "100g" },

    // Vegetables
    { barcode: "VEG001", name: "Tomato (Loose) 500g",     brand: "Fresh", category: "Vegetables", price: 35,  mrp: 35,  icon: "🍅", gstRate: 0.00, unit: "g",  weight: "500g" },
    { barcode: "VEG002", name: "Onion (Loose) 1kg",       brand: "Fresh", category: "Vegetables", price: 40,  mrp: 40,  icon: "🧅", gstRate: 0.00, unit: "kg", weight: "1kg" },
    { barcode: "VEG003", name: "Potato (Loose) 1kg",      brand: "Fresh", category: "Vegetables", price: 30,  mrp: 30,  icon: "🥔", gstRate: 0.00, unit: "kg", weight: "1kg" },
    { barcode: "VEG004", name: "Green Chilli 100g",        brand: "Fresh", category: "Vegetables", price: 10,  mrp: 10,  icon: "🌶️", gstRate: 0.00, unit: "g",  weight: "100g" },
    { barcode: "VEG005", name: "Capsicum 250g",            brand: "Fresh", category: "Vegetables", price: 35,  mrp: 40,  icon: "🫑", gstRate: 0.00, unit: "g",  weight: "250g" },

    // Fruits
    { barcode: "FRT001", name: "Banana 1kg",               brand: "Fresh", category: "Fruits", price: 55,  mrp: 55,  icon: "🍌", gstRate: 0.00, unit: "kg", weight: "1kg" },
    { barcode: "FRT002", name: "Apple (Shimla) 500g",      brand: "Fresh", category: "Fruits", price: 120, mrp: 130, icon: "🍎", gstRate: 0.00, unit: "g",  weight: "500g" },
    { barcode: "FRT003", name: "Orange 1kg",               brand: "Fresh", category: "Fruits", price: 80,  mrp: 90,  icon: "🍊", gstRate: 0.00, unit: "kg", weight: "1kg" },
    { barcode: "FRT004", name: "Grapes (Green) 500g",      brand: "Fresh", category: "Fruits", price: 70,  mrp: 75,  icon: "🍇", gstRate: 0.00, unit: "g",  weight: "500g" },

    // Personal Care
    { barcode: "8901314010100", name: "Colgate MaxFresh 150g",      brand: "Colgate",       category: "Personal Care", price: 99,  mrp: 109, icon: "🪥", gstRate: 0.18, unit: "g",  weight: "150g" },
    { barcode: "8901030020124", name: "Dove Soap 100g",             brand: "HUL",           category: "Personal Care", price: 55,  mrp: 62,  icon: "🧼", gstRate: 0.18, unit: "g",  weight: "100g" },
    { barcode: "8901030865534", name: "Clinic Plus Shampoo 175ml",  brand: "HUL",           category: "Personal Care", price: 95,  mrp: 104, icon: "🧴", gstRate: 0.18, unit: "ml", weight: "175ml" },
    { barcode: "8901030605369", name: "Lux Body Wash 240ml",        brand: "HUL",           category: "Personal Care", price: 180, mrp: 199, icon: "🧴", gstRate: 0.18, unit: "ml", weight: "240ml" },
    { barcode: "8901314800107", name: "Closeup Toothpaste 150g",    brand: "HUL",           category: "Personal Care", price: 85,  mrp: 92,  icon: "🪥", gstRate: 0.18, unit: "g",  weight: "150g" },

    // Instant
    { barcode: "8901058811469", name: "Maggi Noodles 70g",          brand: "Nestlé",        category: "Instant", price: 14,  mrp: 14,  icon: "🍜", gstRate: 0.18, unit: "g",  weight: "70g" },
    { barcode: "8901725133505", name: "Yippee Noodles 70g",         brand: "ITC",           category: "Instant", price: 14,  mrp: 14,  icon: "🍜", gstRate: 0.18, unit: "g",  weight: "70g" },
    { barcode: "8901058009217", name: "Knorr Soupy Noodles 75g",    brand: "HUL",           category: "Instant", price: 15,  mrp: 15,  icon: "🍜", gstRate: 0.18, unit: "g",  weight: "75g" },
    { barcode: "8901491502016", name: "MTR Ready Poha 180g",        brand: "MTR",           category: "Instant", price: 50,  mrp: 55,  icon: "🍚", gstRate: 0.12, unit: "g",  weight: "180g" },
    { barcode: "8901491506014", name: "MTR Ready Upma 180g",        brand: "MTR",           category: "Instant", price: 50,  mrp: 55,  icon: "🍚", gstRate: 0.12, unit: "g",  weight: "180g" },

    // Household
    { barcode: "8901030020131", name: "Vim Dish Bar 200g",          brand: "HUL",           category: "Household", price: 25,  mrp: 28,  icon: "🧽", gstRate: 0.18, unit: "g",  weight: "200g" },
    { barcode: "8901030605376", name: "Surf Excel Quick Wash 1kg",  brand: "HUL",           category: "Household", price: 125, mrp: 138, icon: "🫧", gstRate: 0.18, unit: "kg", weight: "1kg" },
    { barcode: "8901030605383", name: "Harpic Power Plus 500ml",    brand: "Reckitt",       category: "Household", price: 99,  mrp: 110, icon: "🧴", gstRate: 0.18, unit: "ml", weight: "500ml" },
    { barcode: "8901030605390", name: "Lizol Floor Cleaner 500ml",  brand: "Reckitt",       category: "Household", price: 115, mrp: 125, icon: "🧹", gstRate: 0.18, unit: "ml", weight: "500ml" },
    { barcode: "8901030605406", name: "Hit Cockroach Spray 200ml",  brand: "Godrej",        category: "Household", price: 195, mrp: 215, icon: "🪲", gstRate: 0.18, unit: "ml", weight: "200ml" },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: { storeId: store.id, ...p },
    });
  }
  console.log(`✅ Products: ${products.length} items seeded`);

  // ── Demo Sessions & Orders ──
  const now = new Date();
  const expiry = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  // Session 1 — completed order
  const s1 = await prisma.session.create({
    data: { storeId: store.id, phone: "9876543210", status: "paid", expiresAt: expiry },
  });
  const allProducts = await prisma.product.findMany({ where: { storeId: store.id } });
  const p1 = allProducts.find(p => p.barcode === "8901063010109")!; // Atta
  const p2 = allProducts.find(p => p.barcode === "8901233024539")!; // Silk
  const p3 = allProducts.find(p => p.barcode === "8901491101639")!; // Lays

  const sub1 = p1.price * 1 + p2.price * 2 + p3.price * 1;
  const gst1 = p1.price * 1 * p1.gstRate + p2.price * 2 * p2.gstRate + p3.price * 1 * p3.gstRate;
  const o1 = await prisma.order.create({
    data: {
      sessionId: s1.id, storeId: store.id,
      subtotal: sub1, gstAmount: gst1, total: sub1 + gst1,
      paymentMethod: "upi", paymentStatus: "paid",
      receiptId: "SG-DEMO01",
    },
  });
  await prisma.orderItem.createMany({
    data: [
      { orderId: o1.id, productId: p1.id, nameSnapshot: p1.name, qty: 1, unitPrice: p1.price, gstRate: p1.gstRate },
      { orderId: o1.id, productId: p2.id, nameSnapshot: p2.name, qty: 2, unitPrice: p2.price, gstRate: p2.gstRate },
      { orderId: o1.id, productId: p3.id, nameSnapshot: p3.name, qty: 1, unitPrice: p3.price, gstRate: p3.gstRate },
    ],
  });
  console.log(`✅ Demo Order 1: ${o1.receiptId} — ${sub1 + gst1} INR`);

  // Session 2 — completed order
  const s2 = await prisma.session.create({
    data: { storeId: store.id, phone: "9123456789", status: "paid", expiresAt: expiry },
  });
  const p4 = allProducts.find(p => p.barcode === "8901262150545")!; // Butter
  const p5 = allProducts.find(p => p.barcode === "8901058811469")!; // Maggi
  const p6 = allProducts.find(p => p.barcode === "8901058847857")!; // Tea

  const sub2 = p4.price * 2 + p5.price * 3 + p6.price * 1;
  const gst2 = p4.price * 2 * p4.gstRate + p5.price * 3 * p5.gstRate + p6.price * 1 * p6.gstRate;
  const o2 = await prisma.order.create({
    data: {
      sessionId: s2.id, storeId: store.id,
      subtotal: sub2, gstAmount: gst2, total: sub2 + gst2,
      paymentMethod: "card", paymentStatus: "paid",
      receiptId: "SG-DEMO02",
    },
  });
  await prisma.orderItem.createMany({
    data: [
      { orderId: o2.id, productId: p4.id, nameSnapshot: p4.name, qty: 2, unitPrice: p4.price, gstRate: p4.gstRate },
      { orderId: o2.id, productId: p5.id, nameSnapshot: p5.name, qty: 3, unitPrice: p5.price, gstRate: p5.gstRate },
      { orderId: o2.id, productId: p6.id, nameSnapshot: p6.name, qty: 1, unitPrice: p6.price, gstRate: p6.gstRate },
    ],
  });
  console.log(`✅ Demo Order 2: ${o2.receiptId} — ${sub2 + gst2} INR`);

  // Session 3 — active session (customer shopping)
  const s3 = await prisma.session.create({
    data: { storeId: store.id, phone: "8888888888", status: "active", expiresAt: expiry },
  });
  const p7 = allProducts.find(p => p.barcode === "VEG001")!; // Tomato
  const p8 = allProducts.find(p => p.barcode === "FRT001")!; // Banana
  await prisma.cartItem.createMany({
    data: [
      { sessionId: s3.id, productId: p7.id, qty: 2, priceAtScan: p7.price },
      { sessionId: s3.id, productId: p8.id, qty: 1, priceAtScan: p8.price },
    ],
  });
  console.log(`✅ Demo Session 3: Active cart with ${2} items`);

  // ── Customer records ──
  await prisma.customer.createMany({
    data: [
      { phone: "9876543210" },
      { phone: "9123456789" },
      { phone: "8888888888" },
    ],
  });
  console.log("✅ Demo customers created");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
