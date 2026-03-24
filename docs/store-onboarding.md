# ScanGo: Store Onboarding Guide

This document outlines the operational process for onboarding a new supermarket or canteen onto the ScanGo Platform.

## 1. Initial Assessment
- Ensure the store has adequate WiFi or cellular coverage near the exit gates (vital for Guard verification).
- Confirm that the store's inventory system can export product data (Barcodes, Names, MRPs, Selling Prices, GST Rates) to CSV.

## 2. Store Registration (Admin Configuration)
1. **Create Store Profile:** Our centralized billing team will create a new Store Profile in the Global Database.
2. **Generate QR Codes:** Store-specific QR codes will be generated. These act as the entry point for customers and must be printed and pasted at the store entrance, shopping carts, and aisles.
   - Example format: `https://scango.in/enter?s=store_123xyz`
3. **Configure Settings:** Update GST details, store timezone, and link the appropriate UPI Merchant ID (VPA) / Payment Gateway Keys to route payouts correctly.

## 3. Inventory Import
1. Navigate to the **Admin Dashboard -> Products**.
2. Click **Import CSV**.
3. Upload the Master Inventory File. Ensure all EAN-13 barcodes are mapped precisely.
4. Set default icons (e.g., 🍞 for bakery items) or configure automatic categorization. 
*(Note: Products missing barcodes from the CSV cannot be processed by the customer camera scanner).*

## 4. Staff Setup
1. Navigate to the **Admin Dashboard -> Staff**.
2. Create **Guard Accounts** for security personnel. They will receive a 4-digit PIN used to access the `/guard` console on their devices.
3. Create **Store Admin** accounts for managers to access live metrics.

## 5. Physical Store Preparation
1. **Signage:** Place "Scan & Go Available" standees prominently.
2. **Dedicated Exit:** Create a "Green Channel" or express lane at the exit specifically for ScanGo customers.
3. **Guard Device:** Mount a tablet or dedicated smartphone on a stand for the Guard, keeping the `/guard/dashboard` open. Ensure it is connected to a stable power source and network to receive real-time Socket.io socket alerts for incoming unverified receipts.

## 6. Training
- **Guards:** Train guards on how to input physical item counts into the dashboard quickly without scanning every item individually. Emphasize how to interpret Risk Flags (e.g., Red flags require manual re-scanning of the customer's bag).
- **Floor Staff:** Instruct floor staff on how to assist customers struggling to focus their camera on shiny or damaged barcodes (instruct them to fallback to the manual Search tab).

## 7. Go-Live Soft Launch
1. Enable ScanGo system for a subset of trusted customers (e.g., store employees).
2. Monitor real-time `Mismatch Billing Events` in the Admin Dashboard to identify potential UI confusions or barcode inaccuracies.
3. Execute full launch.
