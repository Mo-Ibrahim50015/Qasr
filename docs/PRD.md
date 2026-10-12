# Qasr Al Otoor (قصر العطور) — Product Requirements Document

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project Name | Qasr Al Otoor (قصر العطور) |
| Project Type | E-commerce (Web Application, Arabic RTL) |
| Project ID | PRD-001 |
| Version | v1.1 |
| Status | Draft |
| Priority | High |
| Created Date | 2026-10-10 |
| Last Updated | 2026-10-11 |
| Owner | Mohamed Ibrahim (Product Owner) |
| Team Members | Frontend Developer, Backend Developer, Designer, QA Engineer |
| Tech Stack | Next.js + TypeScript + Tailwind CSS (frontend); Node.js + Express + TypeScript + Prisma (backend); PostgreSQL + Redis; Docker Compose on VPS (Ubuntu 24.04 LTS); Cloudflare (CDN, DNS, WAF, R2) |
| Repository | [TBD] |
| Git Branch Prefix | NNN-feature-name |
| PRD File Path | docs/PRD.md |

---

## 2. Problem & Purpose

### Problem Statement
Customers in Egypt who want to buy perfumes currently find products across fragmented channels (Instagram, WhatsApp, physical shops) with no unified catalog, no consistent pricing, and no clear way to verify authenticity. The purchase process lacks a trusted payment and order-tracking experience.

### Project Purpose
Qasr Al Otoor is an online store for the Qasr Al Otoor perfume brand. It provides one trusted channel that displays a full catalog of up to 1,000 products organized into 20 homepage categories, supports checkout with Cash on Delivery (COD) and online payment, and gives the Admin full control over products, product-specific discount codes, and orders.

### Business Value
- Increases direct sales by removing intermediaries.
- Builds customer trust through transparent product information and a consistent purchase experience.
- Extends reach beyond Cairo and Alexandria to all Egyptian governorates.

### Opportunity
Most Egyptian perfume buyers rely on social media and messaging apps to purchase. A structured, branded storefront with COD support, which buyers in Egypt commonly expect, captures this demand directly.

---

## 3. Goals & Objectives

### Primary Goal
Launch a fully functional e-commerce store (browse, cart, checkout, order tracking) that displays up to 1,000 products and records 100 confirmed orders within the first 3 months after launch.

### Objectives
1. Launch the storefront with 20 homepage categories, each with a dedicated category page, by 2026-12-05.
2. Enable the Admin to create, edit, and publish up to 1,000 products without developer involvement.
3. Enable the Admin to create product-specific discount codes with validity dates and usage limits.
4. Support Cash on Delivery and online payment at checkout for all eligible products.
5. Allow customers to verify their account (Email or Phone OTP) and sign in with Google.

### Success Definition
The project is successful when the store is live, the Admin manages the full catalog and discount codes independently, and at least 100 confirmed orders are placed within 90 days of launch.

### Non-Goals
- Building a native mobile application in v1.
- Building a loyalty program in v1.
- Providing AI-based product recommendations in v1.
- Supporting languages other than Arabic in v1.
- Integrating with external marketplaces in v1.

---

## 4. Scope

### In Scope (v1)
- Homepage with 20 category sections, each linking to its own internal category page.
- Category pages with product listing, filtering (price range, gender, scent family, in-stock only), sorting, and pagination.
- Product detail pages (images, description, scent notes, size variants, price, stock status, authenticity statement).
- Search by product name, brand, and scent notes (P1).
- Shopping cart and checkout.
- Payment methods: Cash on Delivery and online payment (cards and mobile wallets via Paymob).
- Discount codes assigned to specific products.
- Customer accounts: registration with Email or Phone OTP verification, sign-in with Email and password, sign-in with Google.
- Order tracking page and order status notifications (Email and SMS; WhatsApp in P1).
- Admin dashboard for product management, category management, discount code management, COD configuration, and order management.
- Wishlist and personal account page (P1).
- Basic sales statistics dashboard for Admin (P1).

### Out of Scope (v1)
- Native mobile application (iOS and Android).
- Loyalty or points program.
- AI-based product recommendations.
- Multi-language support beyond Arabic.
- Integrations with external marketplaces (Amazon, Noon, Talabat).
- Multi-warehouse inventory management.
- Multi-currency support (EGP only).

### Assumptions
- The brand supplies product images, descriptions, and pricing for at least 100 products at launch.
- Delivery to all Egyptian governorates is handled by a third-party courier or the brand's own delivery team.
- The Paymob merchant account is approved before the Beta Launch.
- Admin users are trained on the dashboard before launch.
- Authenticity documentation is available for all brand products.

### Constraints
- Currency is Egyptian Pound (EGP) only.
- Arabic is the only interface language; the layout is right-to-left (RTL).
- The Admin dashboard is accessible to Admin users only.
- The catalog must support up to 1,000 products without degraded page performance.
- Hosting is a single VPS at launch; all public traffic passes through Cloudflare.

### Dependencies
- Cloudflare account (CDN, DNS, WAF, R2 object storage) configured for the storefront and API domains.
- Hosting VPS (Ubuntu 24.04 LTS) provisioned for production and staging.
- Paymob payment gateway: merchant account approval and API credentials.
- Google OAuth: client ID and secret from Google Cloud Console.
- SMS and Email providers for OTP and order notifications.
- WhatsApp Business API for order notifications (P1).
- Product images and content supplied by the brand.
- Courier delivery partner for shipment handoff.

---

## 5. Users & Personas

### Primary Users
Egyptian customers aged 18 to 40, browsing mostly from mobile devices, buying perfume for themselves or as gifts, and looking for authentic products at clear prices.

### Secondary Users
Admin users: the brand owner and staff who manage products, categories, discount codes, COD settings, and orders.

### User Roles & Permissions

| Role | Access Level | Key Permissions |
|---|---|---|
| Admin | Full | Manage products (1,000 maximum), 20 homepage categories, product discount codes, COD settings, orders, customer accounts, and sales statistics |
| Customer | Standard | Browse, search, manage cart, checkout, manage own profile, wishlist, and view own orders |

### Persona 1 — Customer (Primary)
- **Name:** Nour
- **Role:** Customer
- **Goal:** Find the perfume she is looking for quickly and order it safely.
- **Pain Point:** Does not trust the authenticity of perfumes bought online and is unsure how to pay or track the order.
- **Tech Level:** Medium (uses mobile apps and social media daily)
- **Frequency:** Weekly browsing; monthly purchasing
- **Success Definition:** Completes a purchase in under 5 minutes with COD and receives tracking updates until delivery.

### Persona 2 — Gift Buyer (Secondary Customer)
- **Name:** Karim
- **Role:** Customer
- **Goal:** Choose a perfume as a gift within a set budget and have it delivered on time.
- **Pain Point:** Unsure which scent to choose and worried about delivery timing.
- **Tech Level:** Medium
- **Frequency:** A few times per year
- **Success Definition:** Filters by price and category, applies a discount code, and sees the order status before paying.

### Persona 3 — Brand Admin (Internal)
- **Name:** Mohamed Ibrahim
- **Role:** Admin
- **Goal:** Manage the catalog, promotions, and orders without relying on a developer.
- **Pain Point:** Updating products and discounts currently requires manual work across several channels.
- **Tech Level:** Low to Medium
- **Frequency:** Daily
- **Success Definition:** Adds a new product with images, assigns it to a category, creates a product-specific coupon, and enables COD in under 10 minutes.

---

## 6. MoSCoW Feature Prioritization

### Must Have — P0

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P0-F001 | Account Registration and Verification | TODO | Register with Email or Phone and verify via OTP | Backend Dev | Sprint 1 |
| P0-F002 | Google Sign-In | TODO | Sign in and register using Google OAuth | Backend Dev | Sprint 1 |
| P0-F003 | Homepage with 20 Categories | TODO | Homepage with 20 category sections, each linked to its own page | Frontend Dev | Sprint 2 |
| P0-F004 | Category Page and Product Listing | TODO | Category listing with filters, sorting, and pagination | Frontend Dev | Sprint 2 |
| P0-F005 | Product Detail Page | TODO | Images, notes, sizes, price, stock status, authenticity statement | Frontend Dev | Sprint 2 |
| P0-F006 | Shopping Cart | TODO | Add, update, remove items; apply product discount code | Frontend Dev | Sprint 3 |
| P0-F007 | Checkout (COD and Online Payment) | TODO | Shipping details, payment method selection, order creation | Full Stack | Sprint 3 |
| P0-F008 | Order Tracking | TODO | Customer views order status and history | Frontend Dev | Sprint 3 |
| P0-F009 | Admin Product Management | TODO | Create, edit, publish, and archive up to 1,000 products | Backend Dev | Sprint 2 |
| P0-F010 | Admin Discount Codes per Product | TODO | Create codes tied to specific products with limits and dates | Backend Dev | Sprint 2 |
| P0-F011 | Admin COD Configuration | TODO | Enable or disable COD globally and per product | Backend Dev | Sprint 2 |
| P0-F012 | Admin Order Management | TODO | View orders, update status, record COD collection | Backend Dev | Sprint 3 |

### Should Have — P1

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P1-F001 | Product Search | TODO | Search by product name, brand, and scent notes | Full Stack | Sprint 4 |
| P1-F002 | Order Notifications (SMS / WhatsApp) | TODO | Notify customer on order confirmation and status change | Backend Dev | Sprint 4 |
| P1-F003 | Customer Account Page | TODO | Edit profile, view order history, manage addresses | Frontend Dev | Sprint 4 |
| P1-F004 | Wishlist | TODO | Save products for later | Full Stack | Sprint 4 |
| P1-F005 | Admin Sales Statistics | TODO | Dashboard with revenue, order count, and top products | Full Stack | Sprint 5 |

### Could Have — P2

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P2-F001 | Dark Mode | TODO | Theme toggle for the storefront | Frontend Dev | Backlog |
| P2-F002 | Product Reviews | TODO | Customers rate and review purchased products | Full Stack | Backlog |
| P2-F003 | Bulk Product Actions | TODO | Bulk publish, archive, or price update in Admin | Backend Dev | Backlog |

### Won't Have — P3

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P3-F001 | Native Mobile App | TODO | iOS and Android apps | N/A | v2 |
| P3-F002 | Loyalty Program | TODO | Points and rewards system | N/A | v2 |
| P3-F003 | AI Recommendations | TODO | Personalized product suggestions | N/A | v2 |
| P3-F004 | Multi-language Support | TODO | English and other languages | N/A | v2 |
| P3-F005 | Marketplace Integrations | TODO | Sync with external platforms | N/A | v2 |

---

## 7. Functional Requirements

### P0-F001 — Account Registration and Verification

**User Story:** As a Customer, I want to register with my Email or Phone number and verify my account, so that I can place orders securely.

**Trigger:** Customer selects "Create Account."

**Pre-conditions:**
- The customer is not signed in.
- The Email or Phone number is not already registered.

**Post-conditions:**
- A verified Customer account exists.
- The customer is signed in and redirected to the previous page or the homepage.

**Main Flow:**
1. Customer enters full name, Email or Phone, and password.
2. System validates the input format (see Alternate Flow A1).
3. System sends a 6-digit OTP to the Email or Phone.
4. Customer enters the OTP within 5 minutes.
5. System verifies the OTP and marks the account as verified.
6. System creates a session and redirects the customer.

**Alternate Flows:**
- **A1 — Invalid input:** If the Email format is invalid or the phone number is not a valid Egyptian mobile number (01X XXXXXXXX), the system shows an inline error and does not submit.
- **A2 — OTP expired or incorrect:** The system shows "Code expired or incorrect" and offers "Resend code," limited to 3 resends per 15 minutes.
- **A3 — Duplicate account:** If the Email or Phone is already registered, the system shows "An account already exists with this information" and offers sign-in.

**Acceptance Criteria:**
- [ ] A valid Egyptian mobile number (01X followed by 8 digits) is accepted; any other format shows an inline error.
- [ ] OTP is 6 digits and expires after 5 minutes.
- [ ] After 3 failed OTP attempts, the account is locked for 15 minutes.
- [ ] Resend is limited to 3 requests per 15 minutes.
- [ ] A duplicate Email or Phone returns HTTP 409 and the UI shows the duplicate message.
- [ ] Verified accounts sign in without repeating verification.

---

### P0-F002 — Google Sign-In

**User Story:** As a Customer, I want to sign in with my Google account, so that I can access the store without creating a new password.

**Trigger:** Customer selects "Continue with Google."

**Pre-conditions:**
- Google OAuth client is configured for the production and staging domains.
- The customer has a Google account.

**Post-conditions:**
- A session is created and linked to the Google identity.
- On first sign-in, a verified Customer account is created.

**Main Flow:**
1. Customer selects "Continue with Google."
2. System redirects to the Google consent screen.
3. Customer approves access.
4. System receives the Google profile and checks for an existing account with the same Email.
5. If no account exists, the system creates a Customer account with the Email marked as verified.
6. System creates a session and redirects the customer.

**Alternate Flows:**
- **A1 — Consent denied:** System returns to the sign-in page and shows "Sign-in was cancelled."
- **A2 — Email already registered with password:** System links the Google identity to the existing account, provided the Email is verified.

**Acceptance Criteria:**
- [ ] A first-time Google sign-in creates exactly one Customer account.
- [ ] A repeat Google sign-in does not create a duplicate account.
- [ ] Cancelled consent returns the customer to sign-in within 2 seconds.

---

### P0-F003 — Homepage with 20 Categories

**User Story:** As a Customer, I want to browse 20 perfume categories from the homepage, so that I can find a relevant scent quickly.

**Trigger:** Customer opens the homepage.

**Pre-conditions:**
- At least one category is published by the Admin.

**Post-conditions:**
- The customer sees published categories in the Admin-defined display order.

**Main Flow:**
1. System loads published categories ordered by display position.
2. System renders each category as a section with a title, image, and "View All" link.
3. Customer selects a category section.
4. System navigates to `/categories/{slug}`.

**Alternate Flows:**
- **A1 — Fewer than 20 categories published:** Homepage renders only published categories and does not show empty sections.
- **A2 — No categories published:** Homepage shows "Collections are coming soon" with a link to the full catalog.

**Acceptance Criteria:**
- [ ] The homepage displays exactly the number of published categories, up to 20.
- [ ] Each category section links to its own category page.
- [ ] Homepage First Contentful Paint is under 1.5 seconds on a 4G connection.

---

### P0-F004 — Category Page and Product Listing

**User Story:** As a Customer, I want to filter products within a category, so that I can narrow the choices to what I want.

**Trigger:** Customer opens a category page or changes a filter.

**Pre-conditions:**
- The category exists and is published.

**Post-conditions:**
- The product list reflects the selected filters and sort order.

**Main Flow:**
1. System loads the first 24 published products in the category.
2. Customer applies filters: price range, gender, scent family, and in-stock only.
3. System updates the list without a full page reload.
4. Customer selects sort order (price low to high, price high to low, newest).
5. Customer scrolls to load the next 24 products.

**Alternate Flows:**
- **A1 — No products match filters:** System shows "No products match your filters" and a "Clear filters" button.
- **A2 — Category has no published products:** System shows "No products available in this category yet."

**Acceptance Criteria:**
- [ ] The listing shows 24 products per page.
- [ ] Applying a filter returns results in under 500 ms for catalogs of up to 1,000 products.
- [ ] Out-of-stock products are hidden when "In stock only" is active.

---

### P0-F005 — Product Detail Page

**User Story:** As a Customer, I want to see full product details, so that I can decide whether to buy.

**Trigger:** Customer selects a product from a listing or search result.

**Pre-conditions:**
- The product is published.

**Post-conditions:**
- The customer can add the product to the cart with a selected size.

**Main Flow:**
1. System loads product name, brand, images, description, scent notes, sizes, price, stock status, and authenticity statement.
2. Customer selects a size variant.
3. System updates the price and stock status for that variant.
4. Customer selects quantity and "Add to Cart."

**Alternate Flows:**
- **A1 — Variant out of stock:** "Add to Cart" is disabled and labeled "Out of stock."
- **A2 — Product archived:** System returns HTTP 404 and shows "This product is no longer available."

**Acceptance Criteria:**
- [ ] The product page shows at least one image and the authenticity statement.
- [ ] Price updates within 200 ms of changing the size variant.
- [ ] Quantity cannot exceed available stock.

---

### P0-F006 — Shopping Cart

**User Story:** As a Customer, I want to manage my cart and apply a discount code, so that I can review my order before checkout.

**Trigger:** Customer selects "Add to Cart" or opens the cart.

**Pre-conditions:**
- The product variant is in stock.

**Post-conditions:**
- The cart contains the selected items with updated totals.

**Main Flow:**
1. System adds the item to the cart and displays the subtotal.
2. Customer updates quantity or removes an item.
3. Customer enters a discount code.
4. System validates the code against the products in the cart.
5. System applies the discount to eligible products and updates totals.

**Alternate Flows:**
- **A1 — Invalid code:** System shows "This code is not valid" beneath the input.
- **A2 — Code applies to products not in the cart:** System shows "This code applies to [product name] only."
- **A3 — Code expired or usage limit reached:** System shows "This code has expired" or "This code is no longer available."

**Acceptance Criteria:**
- [ ] Cart totals are recalculated within 300 ms after any change.
- [ ] A code applies only to its linked product(s).
- [ ] Cart persists for 30 days for signed-in customers.

---

### P0-F007 — Checkout (COD and Online Payment)

**User Story:** As a Customer, I want to choose between Cash on Delivery and online payment, so that I can pay in the way I trust.

**Trigger:** Customer selects "Proceed to Checkout."

**Pre-conditions:**
- The cart has at least one item.
- The customer is signed in and verified.

**Post-conditions:**
- An order is created with status "Confirmed" (COD) or "Paid" (online).

**Main Flow:**
1. System displays the shipping form pre-filled from the saved address.
2. Customer enters or confirms the address and mobile number.
3. System displays available payment methods based on cart contents and COD settings.
4. Customer selects Cash on Delivery or online payment.
5. For COD: system creates the order with status "Confirmed" and shows the order number.
6. For online payment: system redirects to Paymob; on webhook success, system creates the order with status "Paid."
7. System sends order confirmation by Email and SMS.

**Alternate Flows:**
- **A1 — COD not available for cart:** If COD is disabled for any product in the cart, the COD option is hidden and "Cash on Delivery is not available for some items in your cart" is shown.
- **A2 — Payment failed:** System returns the customer to checkout with "Payment failed. Please try again or choose Cash on Delivery." The cart is preserved.
- **A3 — Stock changed during checkout:** System shows "Some items are no longer available" and updates the cart before payment.
- **A4 — Network failure during order creation:** System retries once; if it fails, shows "We could not place your order. Your cart is saved. Please try again."

**Acceptance Criteria:**
- [ ] COD is hidden when disabled globally or for any product in the cart.
- [ ] An order cannot be created with a quantity exceeding stock.
- [ ] Payment failure preserves the cart and shows the failure message.
- [ ] Order confirmation is delivered within 60 seconds of order creation.
- [ ] Double-clicking "Place Order" creates only one order.

---

### P0-F008 — Order Tracking

**User Story:** As a Customer, I want to track my order status, so that I know when it will arrive.

**Trigger:** Customer opens "My Orders" or follows the link in a confirmation message.

**Pre-conditions:**
- The customer has at least one order.

**Post-conditions:**
- The customer sees the current status and history.

**Main Flow:**
1. Customer opens the order list.
2. Customer selects an order.
3. System displays the timeline: Confirmed → Preparing → Shipped → Delivered (or Cancelled).
4. When shipped, system displays the delivery address and courier reference.

**Alternate Flows:**
- **A1 — No orders:** System shows "You have not placed any orders yet" with a link to the catalog.
- **A2 — Order belongs to another customer:** System returns HTTP 404.

**Acceptance Criteria:**
- [ ] Status changes appear within 60 seconds of the Admin updating them.
- [ ] A customer cannot view orders belonging to another account.

---

### P0-F009 — Admin Product Management

**User Story:** As an Admin, I want to create and manage products, so that the catalog stays accurate without developer help.

**Trigger:** Admin opens "Products" in the dashboard.

**Pre-conditions:**
- Admin is signed in with the Admin role.

**Post-conditions:**
- The product is saved as Draft or Published.

**Main Flow:**
1. Admin selects "New Product."
2. Admin enters name (Arabic and English), brand, description, scent notes, category, sizes, prices, and stock quantity.
3. Admin uploads up to 8 images; the system resizes them and stores them in R2.
4. Admin selects "Save as Draft" or "Publish."
5. System validates required fields and saves the product.
6. System shows "Product saved" and returns to the product list.

**Alternate Flows:**
- **A1 — Missing required field:** System highlights the field inline and blocks save.
- **A2 — Duplicate SKU:** System shows "A product with this SKU already exists."
- **A3 — Image upload fails:** System shows "Upload failed. Please try again" and keeps the form data.
- **A4 — Catalog limit reached:** System blocks new products at 1,000 and shows "Product limit reached."

**Acceptance Criteria:**
- [ ] Required fields are validated instantly with inline errors.
- [ ] Products are searchable and filterable in the Admin list in under 1 second for 1,000 products.
- [ ] Archived products are hidden from the storefront and retained in the database.
- [ ] Saving shows a success message within 2 seconds.

---

### P0-F010 — Admin Discount Codes per Product

**User Story:** As an Admin, I want to create a discount code for a specific product, so that I can run targeted promotions.

**Trigger:** Admin opens a product and selects "Add Discount Code."

**Pre-conditions:**
- The product exists.

**Post-conditions:**
- The code is active for the linked product(s) within the configured limits.

**Main Flow:**
1. Admin enters the code (uppercase letters and numbers, 4 to 20 characters).
2. Admin selects discount type: percentage or fixed EGP amount.
3. Admin enters the value, start date, end date, and total usage limit.
4. Admin links the code to one or more products.
5. Admin saves; system validates and activates the code.

**Alternate Flows:**
- **A1 — Duplicate code:** System shows "This code already exists."
- **A2 — End date before start date:** System blocks save with an inline error.
- **A3 — Percentage above 100:** System blocks save with "Percentage must be between 1 and 100."

**Acceptance Criteria:**
- [ ] A code applies only to linked products.
- [ ] The usage counter increments once per completed order.
- [ ] Codes become inactive automatically after the end date.

---

### P0-F011 — Admin COD Configuration

**User Story:** As an Admin, I want to enable or disable Cash on Delivery globally or per product, so that I can control where COD is accepted.

**Trigger:** Admin opens "Payment Settings" or a product's payment section.

**Pre-conditions:**
- Admin is signed in.

**Post-conditions:**
- COD availability is updated for new checkouts.

**Main Flow:**
1. Admin toggles COD on or off globally.
2. Admin optionally sets COD per product (inherit global, enable, or disable).
3. Admin optionally sets a maximum order value for COD in EGP.
4. System saves the configuration and applies it to new checkouts.

**Alternate Flows:**
- **A1 — Global COD disabled:** COD is hidden at checkout for all customers.
- **A2 — Order value exceeds COD limit:** COD is hidden with "Cash on Delivery is available for orders up to [limit] EGP."

**Acceptance Criteria:**
- [ ] Changes take effect for new checkouts within 60 seconds.
- [ ] Existing orders are not affected by configuration changes.

---

### P0-F012 — Admin Order Management

**User Story:** As an Admin, I want to view and update orders, so that I can process deliveries and record COD collections.

**Trigger:** Admin opens "Orders" in the dashboard.

**Pre-conditions:**
- Admin is signed in.

**Post-conditions:**
- Order status is updated and the customer is notified.

**Main Flow:**
1. Admin filters orders by status, payment method, or date.
2. Admin opens an order.
3. Admin updates status: Confirmed → Preparing → Shipped → Delivered, or Cancelled.
4. For COD orders, Admin marks the payment as collected on delivery.
5. System saves the change and sends a customer notification.

**Alternate Flows:**
- **A1 — Invalid status transition:** System blocks the change (for example, Delivered → Preparing) and shows "This status change is not allowed."
- **A2 — Notification fails:** System logs the failure and shows a retry option.

**Acceptance Criteria:**
- [ ] Only allowed status transitions can be made.
- [ ] Every status change is recorded with timestamp and Admin user.
- [ ] The orders list loads 50 records per page in under 1 second.

---

## 8. Non-Functional Requirements

### Performance
- Homepage Largest Contentful Paint is under 2.5 seconds on a 4G connection.
- Category and search API responses are under 500 ms at the 95th percentile.
- Product images are served in WebP or AVIF through Cloudflare, with lazy loading below the fold.
- Checkout API responses are under 800 ms at the 95th percentile.

### Security
- All API endpoints require authentication except public catalog reads.
- Passwords are hashed with bcrypt (cost factor 12).
- All inputs are validated server-side.
- Personal data and payment references are encrypted at rest with AES-256.
- All traffic uses TLS 1.3 at the edge; TLS 1.0 and 1.1 are disabled.
- Admin actions require re-authentication after 30 minutes of inactivity.
- Cloudflare WAF and rate limiting protect `/api/v1/auth/*` and `/api/v1/checkout/*`.

### Availability
- Uptime target: 99.9% monthly.
- Planned maintenance is scheduled between 02:00 and 05:00 Cairo time with 48 hours' notice.

### Scalability
- Public-facing traffic at launch: under 1,000 monthly visitors.
- Growth target: architecture supports 10x traffic (10,000 monthly visitors) within the first 12 months without a rewrite.
- Catalog capacity: 1,000 products with up to 8 images each.
- Primary target region: Egypt. Static assets and product images are delivered through the Cloudflare CDN to reduce latency for Egyptian users.

### Accessibility
- WCAG 2.1 AA compliance.
- Full RTL layout with Arabic text and correct reading order.
- All interactive elements are keyboard accessible.

### Compatibility
- Chrome 100+, Safari 15+, Firefox 100+.
- Android 9+ and iOS 15+ mobile browsers.
- Responsive from 360 px width upward.

### Data and Compliance
- Compliance with Egyptian Personal Data Protection Law No. 151 of 2020.
- Customers can request account deletion, completed within 30 days.
- Payment card data is never stored; processing is handled by Paymob.

### Observability
- Structured JSON logging from all containers.
- Error rate above 1% triggers an alert to the engineering channel.
- Uptime monitoring with external probes, alerting on downtime longer than 2 minutes.
- Monitoring dashboard covering uptime, checkout success rate, API latency, and container health.

---

## 9. Technical Architecture

### Frontend Stack
- Next.js (App Router) with TypeScript, running as a container.
- Tailwind CSS with RTL support.
- Server-side rendering for catalog and product pages to support SEO.
- Images delivered from Cloudflare R2 through the Cloudflare CDN.

### Backend Stack
- Node.js with Express and TypeScript, running as a container.
- Prisma ORM.
- REST API versioned under `/api/v1/`.
- Redis for session cache, cart cache, and rate-limit counters.
- Background worker container for notifications, OTP dispatch, and image processing.

### Database Architecture
- PostgreSQL 16 as the primary database.
- Core entities: User, OtpVerification, Category, Product, ProductVariant, ProductImage, Cart, CartItem, Order, OrderItem, OrderStatusHistory, DiscountCode, DiscountCodeProduct, PaymentSettings.
- Indexes on Product (category_id, published, price), Order (user_id, created_at), and DiscountCode (code).

### Auth and Authorization Design
- JWT access tokens (15-minute expiry) with refresh token rotation (7-day expiry).
- Role-based access control with two roles: Admin and Customer.
- Google OAuth 2.0 for sign-in.
- OTP verification for Email or Phone at registration.

### Infrastructure and Deployment
- **Hosting:** Single VPS (Ubuntu 24.04 LTS). Provider: [TBD]. Recommended: a VPS in Europe or with an Egyptian-accessible data center, with at least 4 vCPU, 8 GB RAM, and 100 GB NVMe SSD at launch.
- **Runtime:** Docker and Docker Compose. Each service runs in its own container: Next.js frontend, Express API, PostgreSQL, Redis, and worker.
- **CDN, DNS, and WAF:** Cloudflare, on the Free or Pro plan at launch. All public traffic for the storefront and API domains is proxied through Cloudflare.
- **Cloudflare caching rules:**
  - Cache static assets (JS, CSS, fonts, and images) with long TTLs and content-hash file names.
  - Cache product images served from R2 with a TTL of 30 days, purged on image update.
  - Bypass cache for `/api/*`, `/checkout/*`, `/account/*`, and `/admin/*`.
  - Never cache HTML pages that contain user-specific data.
- **Object storage for product images:** Cloudflare R2, served through a custom domain (e.g., `images.[domain]`). Images are kept off the VPS disk.
- **Reverse proxy and TLS:** Nginx as reverse proxy. SSL/TLS mode on Cloudflare set to Full (strict). Nginx uses a Cloudflare Origin Certificate or a Let's Encrypt certificate. TLS 1.3 only at the origin.
- **Origin protection:** UFW allows ports 80 and 443 only from Cloudflare IP ranges. Direct access to the VPS IP is blocked. Cloudflare Authenticated Origin Pulls is enabled.
- **Firewall and access:** UFW allows only port 22 (SSH key-only, root login disabled) plus the Cloudflare-restricted ports 80 and 443. Redis and PostgreSQL are bound to the internal Docker network and are not exposed publicly.
- **Database:** PostgreSQL 16 in a container, with data stored on a dedicated Docker volume.
- **Backups:** Daily automated PostgreSQL dump (pg_dump) and volume snapshot, encrypted with AES-256, stored off-server with 30-day retention. The R2 bucket is versioned. A full restore test runs once per month.
- **Process management and updates:** Docker restart policies set to `unless-stopped`. OS security updates applied automatically (unattended-upgrades). Container images rebuilt on each release.
- **CI/CD:** GitHub Actions runs tests on every pull request, builds Docker images, and deploys to staging before production. Deployment via SSH with a rollback script that restores the previous image tag. Cloudflare cache is purged for changed assets after each production deploy.
- **Staging environment:** Mirrors production configuration on a separate VPS or an isolated Compose project, with its own Cloudflare subdomain (e.g., `staging.[domain]`).

### External Integrations
- Cloudflare: CDN, DNS, WAF, rate limiting, and R2 object storage.
- Paymob: card and mobile wallet payments, with webhook for payment confirmation.
- Google OAuth: sign-in.
- SMS provider: OTP and order notifications.
- Email provider: order confirmation and account emails.
- WhatsApp Business API: order notifications (P1).

---

## 10. Implementation Phases

### Phase 1 — Foundation
**Goal:** Infrastructure, authentication, product data model, and Admin product management.
**Duration:** 2 weeks (2026-10-12 to 2026-10-23)

Task checklist:
- [ ] Provision production and staging VPS, configure Docker, Nginx, UFW (Cloudflare IP allowlist), Cloudflare DNS, CDN, WAF, TLS, and CI/CD pipeline.
- [ ] Implement database schema and migrations.
- [ ] Configure Cloudflare R2 bucket and custom image domain.
- [ ] Implement Email and Phone OTP registration (P0-F001).
- [ ] Implement Google Sign-In (P0-F002).
- [ ] Implement Admin product management (P0-F009).
- [ ] Implement Admin category management for the 20 homepage categories.
- [ ] Implement Admin COD configuration (P0-F011).

**Validation:** Admin can create 20 test products with images across 20 categories. A test customer can register, verify, and sign in with Google on staging.

---

### Phase 2 — Core Features
**Goal:** Storefront browsing, cart, and discount codes.
**Duration:** 2 weeks (2026-10-26 to 2026-11-06)

Task checklist:
- [ ] Build homepage with 20 category sections (P0-F003).
- [ ] Build category page with filters and pagination (P0-F004).
- [ ] Build product detail page (P0-F005).
- [ ] Build shopping cart (P0-F006).
- [ ] Implement Admin discount codes per product (P0-F010).
- [ ] Configure Cloudflare caching and bypass rules for storefront routes.

**Validation:** A test customer can browse all 20 categories, add a product with a size variant to the cart, and apply a product-specific code that is accepted only for the linked product.

---

### Phase 3 — Checkout and Orders
**Goal:** Complete the purchase flow and order management.
**Duration:** 2 weeks (2026-11-09 to 2026-11-20)

Task checklist:
- [ ] Build checkout with COD and online payment (P0-F007).
- [ ] Integrate Paymob payment and webhook confirmation.
- [ ] Build customer order tracking (P0-F008).
- [ ] Build Admin order management (P0-F012).
- [ ] Implement order confirmation via Email and SMS.
- [ ] Configure Cloudflare WAF rate limits on `/api/v1/auth/*` and `/api/v1/checkout/*`.

**Validation:** A test order placed with COD and another with Paymob both appear in Admin, transition through all statuses, and show correct tracking for the customer.

---

### Phase 4 — Polish, P1 Features, and Launch Hardening
**Goal:** Search, notifications, account page, wishlist, and launch readiness.
**Duration:** 2 weeks (2026-11-23 to 2026-12-04)

Task checklist:
- [ ] Implement product search (P1-F001).
- [ ] Implement WhatsApp and SMS order notifications (P1-F002).
- [ ] Implement customer account page (P1-F003).
- [ ] Implement wishlist (P1-F004).
- [ ] Implement Admin sales statistics (P1-F005).
- [ ] Run load test with 1,000 products and 100 concurrent users.
- [ ] Test a full restore from backup on staging.
- [ ] Complete accessibility and RTL review.
- [ ] Complete security review and penetration test checklist.

**Validation:** Load test passes with p95 under 500 ms for catalog APIs, the restore test succeeds, and all P0 acceptance criteria pass in QA.

---

## 11. Advanced Execution Rules

### 11.1 User Flow (Primary Purchase Path)

1. Customer opens the homepage and sees the 20 category sections.
2. Customer selects the "Oud" category and lands on `/categories/oud`.
3. Customer applies the "In stock only" and "Price: low to high" filters; the list updates without a reload.
4. Customer opens a product detail page and selects the 50 ml size; the price updates within 200 ms.
5. Customer enters a product-specific discount code in the cart; the system applies it and recalculates totals.
6. Customer selects "Proceed to Checkout." If not signed in, the system prompts sign-in or registration with OTP.
7. Customer selects Cash on Delivery and confirms the order; the system shows the order number and sends confirmation by Email and SMS.
8. Admin marks the order as Preparing, then Shipped; the customer sees each status change in "My Orders."
9. Admin marks the order as Delivered and records COD collection; the order is complete.

### 11.2 Edge Cases

| Category | Condition | System Behavior | User Feedback |
|---|---|---|---|
| Invalid input | Phone number is not 01X + 8 digits | Request rejected with validation error; nothing saved | Inline error under the field |
| Invalid input | Discount code contains lowercase or symbols | Code rejected at save (Admin) or entry (customer) | "Use uppercase letters and numbers only" |
| Empty state | Category has no published products | Empty result returned with HTTP 200 | "No products available in this category yet." |
| Empty state | Customer has no orders | Empty list returned | "You have not placed any orders yet." with catalog link |
| System failure | Paymob webhook not received within 10 minutes | Order stays "Pending Payment"; Admin alert raised; customer may retry | "Payment is being confirmed. We will notify you." |
| System failure | Redis unavailable | Cart reads fall back to database; rate limits fail closed on auth routes | "Something went wrong. Please try again." on auth routes |
| System failure | SMS or OTP provider error | Retry once, then fall back to Email if available | "We could not send the code. Try again or use Email." |
| Permission | Customer calls an Admin endpoint | HTTP 403; attempt logged | Generic "Access denied" page |
| Permission | Customer requests another customer's order | HTTP 404 | "Order not found" |
| Duplication | Same Email or Phone registers twice | Second request rejected with HTTP 409 | "An account already exists with this information." |
| Duplication | Double-click on "Place Order" | Idempotency key prevents a second order | Single confirmation shown |
| Conflict | Last unit sold while another customer is at checkout | First committed order wins; second receives stock error | "Some items are no longer available." |
| Conflict | Admin edits a product during checkout | Checkout uses the price locked at cart time for 15 minutes | Price change shown before payment if it differs |

### 11.3 API Design (High Level)

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | /api/v1/auth/register | Create account and send OTP | Public |
| POST | /api/v1/auth/otp/verify | Verify OTP | Public |
| POST | /api/v1/auth/login | Sign in with Email and password | Public |
| GET | /api/v1/auth/google | Start Google sign-in | Public |
| POST | /api/v1/auth/refresh | Rotate refresh token | Customer, Admin |
| GET | /api/v1/categories | List published homepage categories | Public |
| GET | /api/v1/categories/:slug/products | List products with filters and pagination | Public |
| GET | /api/v1/products/:id | Product detail | Public |
| GET | /api/v1/cart | Get current cart | Customer |
| POST | /api/v1/cart/items | Add item to cart | Customer |
| PUT | /api/v1/cart/items/:id | Update quantity | Customer |
| DELETE | /api/v1/cart/items/:id | Remove item | Customer |
| POST | /api/v1/cart/discount | Apply discount code | Customer |
| POST | /api/v1/checkout | Create order (COD or Paymob) | Customer |
| POST | /api/v1/webhooks/paymob | Payment confirmation | Paymob signature |
| GET | /api/v1/orders | List own orders | Customer |
| GET | /api/v1/orders/:id | Order detail and status history | Customer |
| POST | /api/v1/admin/products | Create product | Admin |
| PUT | /api/v1/admin/products/:id | Update product | Admin |
| DELETE | /api/v1/admin/products/:id | Archive product (soft delete) | Admin |
| POST | /api/v1/admin/discount-codes | Create product discount code | Admin |
| PUT | /api/v1/admin/discount-codes/:id | Update discount code | Admin |
| PUT | /api/v1/admin/payment-settings | Update COD configuration | Admin |
| GET | /api/v1/admin/orders | List orders with filters | Admin |
| PUT | /api/v1/admin/orders/:id/status | Update order status | Admin |
| GET | /api/v1/admin/stats | Sales statistics (P1) | Admin |

### 11.4 Data Model

| Entity | Key Fields | Relationships |
|---|---|---|
| User | id, full_name, email, phone, password_hash, google_id, role, verified_at | Has many Orders, one Cart, many Addresses |
| OtpVerification | id, user_id, channel (email / sms), code_hash, expires_at, attempts | Belongs to User |
| Category | id, name_ar, name_en, slug, display_position, published, image_url | Has many Products; one of 20 homepage sections |
| Product | id, sku, name_ar, name_en, brand, description, scent_notes, gender, scent_family, category_id, published, archived_at | Belongs to Category; has many ProductVariants and ProductImages |
| ProductVariant | id, product_id, size_ml, price_egp, stock_quantity | Belongs to Product; referenced by CartItem and OrderItem |
| ProductImage | id, product_id, r2_key, position | Belongs to Product (max 8) |
| Cart | id, user_id, updated_at, expires_at | Has many CartItems |
| CartItem | id, cart_id, variant_id, quantity | Belongs to Cart and ProductVariant |
| DiscountCode | id, code, type (percent / fixed), value, starts_at, ends_at, usage_limit, times_used, active | Linked to Products through DiscountCodeProduct |
| DiscountCodeProduct | discount_code_id, product_id | Join table (many-to-many) |
| Order | id, order_number, user_id, status, payment_method (cod / paymob), subtotal_egp, discount_egp, total_egp, shipping_address, created_at, cod_collected_at | Has many OrderItems and OrderStatusHistory |
| OrderItem | id, order_id, variant_id, product_name_snapshot, unit_price_egp, quantity | Belongs to Order |
| OrderStatusHistory | id, order_id, from_status, to_status, changed_by, changed_at | Belongs to Order |
| PaymentSettings | id, cod_enabled_global, cod_max_order_egp, updated_by, updated_at | Single row; per-product override on Product (cod_mode: inherit / enable / disable) |

### 11.5 Build Order

- **Phase 1 (Foundation):** Infrastructure and CI/CD; authentication (OTP and Google); Admin product management; 20 category management; COD configuration.
- **Phase 2 (Core Storefront):** Homepage with 20 categories; category listing with filters; product detail; cart; product-specific discount codes.
- **Phase 3 (Transactions):** Checkout with COD and Paymob; order tracking; Admin order management; order notifications.
- **Phase 4 (Enhancements):** Search; WhatsApp notifications; account page; wishlist; Admin sales statistics; launch hardening.

### 11.6 UX Rules (Applied to Every Feature)

- **Validation:** All forms validate on blur and again on submit. Errors appear inline beneath the field in Arabic.
- **Loading state:** Every action that calls the API shows a skeleton or spinner within 100 ms and disables its trigger button until the response returns.
- **Error state:** Failed actions show a message beside the triggering element and never clear user input.
- **Success feedback:** Successful saves show a confirmation toast for 3 seconds; order placement shows a dedicated confirmation page.
- **Consistency:** The same validation messages, button labels, and toast styles are used across storefront and Admin.

---

## 12. Success Metrics and KPIs

### Business Metrics
| Metric | Target | Measurement | Review |
|---|---|---|---|
| Confirmed orders in first 90 days | ≥ 100 | Count of orders with status Confirmed or Paid | 30 days post-launch |
| Average order value | ≥ 600 EGP | Total order value ÷ number of orders | 30 days post-launch |
| Repeat purchase rate at 90 days | ≥ 20% | Customers with 2+ orders ÷ total customers | 90 days post-launch |

### Product Metrics
| Metric | Target | Measurement | Review |
|---|---|---|---|
| Account activation rate | > 60% | Verified accounts ÷ registrations | 1 week, 2 weeks, 30 days |
| Checkout completion rate | > 50% | PostHog funnel: checkout_start → order_placed | 1 week, 2 weeks, 30 days |
| Cart abandonment rate | < 70% | Carts with items but no order within 24 hours ÷ carts with items | 2 weeks, 30 days |
| Discount code usage rate | > 10% of orders | Orders with a code ÷ total orders | 30 days |

### Technical Metrics
| Metric | Target | Measurement | Review |
|---|---|---|---|
| API error rate | < 0.1% | Error responses ÷ total responses | Daily |
| Checkout success rate | > 98% | Successful payments and COD orders ÷ attempts | Daily |
| p95 catalog API latency | < 500 ms | APM dashboard | Weekly |
| Uptime | ≥ 99.9% | External uptime monitor | Monthly |
| Cloudflare cache hit ratio (static and images) | ≥ 90% | Cloudflare analytics | Weekly |

### User Satisfaction Metrics
| Metric | Target | Measurement | Review |
|---|---|---|---|
| Post-purchase satisfaction (CSAT) | ≥ 4.2 / 5 | Survey sent 3 days after delivery | 30 days |
| Support tickets per 100 orders | < 5 | Support ticket count ÷ orders × 100 | 30 days |

**Tracking Tool:** PostHog (product analytics), with server-side monitoring and uptime checks.
**Metric Owner:** Mohamed Ibrahim.

---

## 13. Timeline and Milestones

- **Start Date:** 2026-10-10
- **Target Launch:** 2026-12-05
- **Total Duration:** 8 weeks

| Milestone | Description | Due Date | Status | Owner |
|---|---|---|---|---|
| Kickoff | Team onboarded; repository, VPS, and Cloudflare configured | 2026-10-10 | TODO | Mohamed Ibrahim |
| PRD Approved | This PRD signed off by Product Owner and Engineering Lead | 2026-10-11 | TODO | Mohamed Ibrahim |
| Phase 1 Done | Foundation complete and validated | 2026-10-23 | TODO | Backend Dev |
| Phase 2 Done | Storefront and discount codes complete | 2026-11-06 | TODO | Frontend Dev |
| Phase 3 Done | Checkout and order management complete | 2026-11-20 | TODO | Full Stack |
| Phase 4 Done | P1 features and launch hardening complete | 2026-12-04 | TODO | QA Engineer |
| Beta Launch | Limited launch with 20 test customers and a live payment test | 2026-11-27 | TODO | Mohamed Ibrahim |
| Public Launch | Store open to all customers | 2026-12-05 | TODO | Mohamed Ibrahim |

---

## 14. Risk Register

Score = Likelihood × Impact (High = 3, Medium = 2, Low = 1). Priority is determined by the score.

| ID | Description | Likelihood | Impact | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R001 | Paymob merchant approval delayed beyond Phase 3 | Medium (2) | High (3) | 6 | Submit merchant application in Week 1; launch with COD only if approval is pending, and enable online payment once approved | Mohamed Ibrahim |
| R002 | Scope creep from additional requested features | High (3) | High (3) | 9 | Enforce MoSCoW strictly; route new requests into the v2 backlog unless approved by Product Owner | Mohamed Ibrahim |
| R003 | Product content (images, descriptions, authenticity documents) delayed by the brand | High (3) | Medium (2) | 6 | Brand provides content in batches; launch with a minimum of 100 products | Mohamed Ibrahim |
| R004 | COD order volume causes a high rate of undelivered orders | Medium (2) | High (3) | 6 | Set COD maximum order value; confirm COD orders by SMS before dispatch | Mohamed Ibrahim |
| R005 | Catalog performance degrades near 1,000 products | Low (1) | High (3) | 3 | Index product queries; load test with 1,000 products in Phase 4 | Backend Dev |
| R006 | SMS or OTP delivery failures on Egyptian networks | Medium (2) | High (3) | 6 | Offer both Email and Phone verification; use a provider with proven Egyptian delivery rates; monitor OTP delivery rate | Backend Dev |
| R007 | Key person dependency on a single developer | Medium (2) | Medium (2) | 4 | Document architecture and runbooks; pair programming in Phase 1 | Backend Dev |
| R008 | Third-party API availability (Paymob, Google OAuth, SMS) | Low (1) | High (3) | 3 | Retry logic with fallback messaging; status monitoring on all integrations | Backend Dev |
| R009 | Authenticity concerns from customers reduce conversion | Medium (2) | High (3) | 6 | Display authenticity statement, sourcing information, and return policy on every product page | Mohamed Ibrahim |
| R010 | Single VPS is a single point of failure for the storefront and database | Medium (2) | High (3) | 6 | Daily encrypted off-server backups with monthly restore test; documented rebuild runbook; uptime monitoring with alerts; move to a second node or managed database if traffic exceeds the 10x growth target | Backend Dev |
| R011 | Cloudflare outage or misconfigured caching serves stale prices, stock, or user-specific content | Low (1) | High (3) | 3 | Cache rules limited to static assets and images; bypass rules for API, checkout, account, and admin routes; purge runbook; monitor origin health and switch the DNS record to DNS-only mode if needed | Backend Dev |

---

## 15. Stakeholders and Approvals

### Stakeholders

| Name | Role | Involvement | Contact |
|---|---|---|---|
| Mohamed Ibrahim | Owner / Product Owner | Approves scope, content, and launch | [TBD] |
| Engineering Lead | Technical decisions and code review | Approves architecture and releases | [TBD] |
| Frontend Developer | Storefront implementation | Builds P0 storefront features | [TBD] |
| Backend Developer | API, Admin, infrastructure, and integrations | Builds P0 backend features and VPS setup | [TBD] |
| Designer | UI/UX and RTL design | Delivers designs before each phase | [TBD] |
| QA Engineer | Testing and acceptance | Validates each phase | [TBD] |

### Approval Gates

| Gate | Approver | Required By | Status |
|---|---|---|---|
| PRD Approval | Mohamed Ibrahim, Engineering Lead | 2026-10-11 | TODO |
| Design Approval | Mohamed Ibrahim | 2026-10-22 | TODO |
| Phase 2 Demo | Mohamed Ibrahim | 2026-11-06 | TODO |
| Payment Integration Sign-off | Mohamed Ibrahim | 2026-11-20 | TODO |
| Beta Launch Go / No-Go | Mohamed Ibrahim, Engineering Lead | 2026-11-27 | TODO |
| Public Launch Go / No-Go | Mohamed Ibrahim, Engineering Lead | 2026-12-04 | TODO |

---

## 16. References and Links

| Resource | Link |
|---|---|
| Design Files | [TBD] |
| Repository | [TBD] |
| API Documentation | [TBD] |
| Architecture Diagrams | [TBD] |
| Staging Environment | [TBD] |
| Production Environment | [TBD] |
| CI/CD Pipeline | [TBD] |
| Cloudflare Dashboard | [TBD] |
| Monitoring Dashboard | [TBD] |
| Related PRDs | None |
| Slack Channel | [TBD] |
| Meeting Notes | [TBD] |

---

## 17. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-10-10 | Mohamed Ibrahim | Initial PRD created |
| v1.1 | 2026-10-11 | Mohamed Ibrahim | Hosting changed to single VPS with Docker Compose; Cloudflare added as CDN, DNS, WAF, and R2 object storage; Sections 1, 8, 9, 10, and 14 updated; Section 11 (execution rules) added |

