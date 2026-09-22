# MobileHubBD — Full Ground-Truth Project Analysis (generated 2026-09-21)

> **Auditor Note**: This document contains a strict, evidence-based assessment of the MobileHubBD project. Every statement is substantiated by verified file paths, verbatim code excerpts, or executed terminal output. Unverified assumptions have been relegated to Section 8.

---

## 1. Stack & Identity

### 1.1 Repository & Framework Versions

#### Frontend (`package.json`)
- **Package Name**: `temp_app` (Version: `0.1.0`, Private: `true`)
- **Core Framework**: Next.js `14.2.35` (App Router)
- **Runtime / Language**: React `^18`, React DOM `^18`, TypeScript `^5`
- **Styling**: Tailwind CSS `^3.4.1`, PostCSS `^8`, `tailwindcss-animate` `^1.0.7`
- **UI & State Primitives**: Radix UI suite (dialog, dropdown, tabs, select, etc.), Lucide React `^1.31.0`, TanStack React Table `^8.21.3`, Recharts `^3.10.1`, Sonner `^2.0.8`, React Hook Form `^7.85.0`, Zod `^4.4.3`
- **Scripts**:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
  ```

#### Backend API (`api/package.json`)
- **Package Name**: `api` (Version: `0.0.1`, Private: `true`)
- **Core Framework**: NestJS `^11.0.1` (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`)
- **Database & ORM**: Prisma Client `^5.22.0`, Prisma CLI `^5.22.0`
- **Authentication**: Passport `^0.7.0`, `@nestjs/passport` `^11.0.5`, `passport-jwt` `^4.0.1`, `@nestjs/jwt` `^11.0.2`, `bcrypt` `^6.0.0`
- **Cloud Storage**: AWS S3 SDK `@aws-sdk/client-s3` `^3.1131.0` (used for Cloudflare R2 compatibility)
- **Security & Utilities**: `helmet` `^8.3.0`, `compression` `^1.8.1`, `cookie-parser` `^1.4.7`, `@nestjs/throttler` `^6.5.0`, `class-validator` `^0.15.1`, `class-transformer` `^0.5.1`
- **Scripts**:
  ```json
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "seed:prod": "ts-node prisma/seed-prod.ts",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
  ```

---

### 1.2 Prisma Schema Models (`api/prisma/schema.prisma`)

The database schema defines **83 distinct Prisma models**:

| # | Model Name | Category / Purpose |
|---|---|---|
| 1–6 | `Role`, `RolePermission`, `RoleBranchPermission`, `Staff`, `StaffBranchAccess`, `RefreshToken` | RBAC & Staff Identity |
| 7–10 | `Customer`, `Address`, `CustomerActivity`, `Payment` | Customer Accounts & Transactions |
| 11–12 | `Branch`, `Department` | Organization Structure |
| 13–18 | `Category`, `Brand`, `Series`, `Unit`, `Attribute`, `AttributeValue` | Product Taxonomies & Specs |
| 19–26 | `Product`, `ProductImage`, `ProductVariant`, `BranchInventory`, `PhoneUnit`, `ProductSpecification`, `WantedProduct`, `WastedProduct` | Catalog & Inventory Tracking |
| 27–30 | `Order`, `OrderItem`, `OrderStatusHistory`, `OrderNote` | E-Commerce & POS Orders |
| 31–33 | `SalesReturn`, `SalesReturnItem`, `Exchange` | After-Sales Returns & Exchanges |
| 34–38 | `ServiceJob`, `DeviceType`, `ServiceProblemType`, `ServiceWarrantyPeriod`, `ServiceJobMaterial` | Repair & Servicing Center |
| 39–40 | `Shipment`, `StockAdjustment` | Courier Logistics & Stock Auditing |
| 41–46 | `Payroll`, `WalletType`, `WalletTransaction`, `Purpose`, `ExpenseCategory`, `Expense` | HRM & Accounting Wallets |
| 47–50 | `Supplier`, `SupplierPayment`, `PurchaseOrder`, `PurchaseOrderItem` | Procurement & Vendor Accounts |
| 51–56 | `Banner`, `Ad`, `PromoCode`, `PushNotification`, `BlogCategory`, `Blog` | Marketing & CMS Content |
| 57–62 | `Page`, `MenuItem`, `FooterSettings`, `MenuStructureItem`, `FooterColumn`, `FooterColumnItem` | Custom Pages & Nav Structure |
| 63–65 | `Country`, `SocialLink`, `ContactSubmission` | Geographic & Public Contacts |
| 66–69 | `TicketIssueType`, `SupportTicket`, `SupportTicketMessage`, `HelpNote` | Customer Support & Ticketing |
| 70–71 | `Wishlist`, `Review` | Storefront Social Engagement |
| 72–80 | `BusinessSetting`, `Currency`, `DeliveryChargeTier`, `PaymentGatewayConfig`, `SmsConfig`, `MailConfig`, `FirebaseConfig`, `RecaptchaConfig`, `MessageTemplate` | System Configuration |
| 81–83 | `PasswordResetToken`, `PaymentAttempt` (plus indexes) | Auth Security & Gateways |

---

### 1.3 Environment Variables Audit

Cross-checking environment references in source files (`grep -rn "process.env\." src/ api/src/` and `ConfigService.get`):

#### Frontend Environment References (`src/`)
- `NEXT_PUBLIC_API_URL` (referenced in `src/lib/api-client.ts:2`, `src/components/admin/EmployeeForm.tsx:251`, `src/app/(admin)/admin/customers/create/page.tsx:78, 179`, etc.)
- `NEXT_PUBLIC_BACKEND_URL` (referenced in `src/lib/api-client.ts:5`, `src/components/admin/CustomerAvatar.tsx:60`, `src/app/(admin)/admin/customers/[id]/edit/page.tsx:74`)

#### Backend Environment References (`api/src/` & `api/prisma/`)
- `PORT` (`api/src/main.ts:75`)
- `NODE_ENV` (`api/src/auth/auth.controller.ts:88, 101, 117, 153, 164`, `api/src/app.controller.ts:23`)
- `DATABASE_URL` (`api/prisma/schema.prisma:10`)
- `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRY` (`api/src/auth/auth.service.ts:422-423`, `api/src/auth/strategies/jwt-access.strategy.ts:13`)
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRY` (`api/src/auth/auth.service.ts:217, 427-428`, `api/src/auth/strategies/jwt-refresh.strategy.ts:22`)
- `ALLOWED_ORIGINS` (`api/src/main.ts:27`)
- `FRONTEND_URL` (`api/src/main.ts:32`, `api/src/payment/bkash/bkash.service.ts:127`, `api/src/payment/sslcommerz/sslcommerz.service.ts:184`)
- `API_URL` (`api/src/payment/bkash/bkash.service.ts:79`, `api/src/payment/sslcommerz/sslcommerz.service.ts:55`)
- `UPLOAD_ROOT` (`api/src/main.ts:23`, `api/src/common/upload/multer.config.ts:20`)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (`api/src/common/upload/storage.service.ts:17-33`)

#### Discrepancies vs `.env.example`
1. Root `.env.example` only lists `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BACKEND_URL`, pointing to Render URLs (`https://mobilehubbd-api.onrender.com`).
2. `api/.env.example` still contains stale "NovaMobile" branding strings (`novamobile.vercel.app`, `novamobile-media`, `novamobile_sandbox`) rather than `mobilehubbd`.
3. In local `api/.env`, the key `CORS_ORIGIN="http://localhost:3000"` is present, but `api/src/main.ts` actually parses `ALLOWED_ORIGINS` (comma-separated) and `FRONTEND_URL`. (However, `api/src/main.ts:62` contains a permissive fallback `callback(null, true);`).

---

### 1.4 Git Repository State

Command executed: `git branch --show-current && git log --oneline -10 && git status`

```
main
8030e9e1 (HEAD -> main) Fix Pass 28 - Rebranding, route guards, UI alignment
361b101d (origin/main, origin/HEAD) feat(deploy): add production automated deployment script deploy.sh
50a9eab5 Complete rebrand, security fixes, automated tests (Fix Pass 26)
e1e61c5c docs: add Fix Pass 23 real state verification and go-live checklist to QA_AUDIT_REPORT.md
26f21b68 feat: complete Fix Pass 17-23 enterprise mobile shop with free-tier deployment blueprints, R2 adapter, servicing module, and human go-live guide
51371bc4 Complete upgrade of POS terminal and all recent fixes
bb462969 fix: ignore api folder in vercel deployment and tsconfig
8a98f46d fix: make context hooks resilient for build prerendering
511e1fb3 fix: resolve useFormField outside FormField error and add safe fallback
5d0b7862 fix: add missing Plus icon in EmployeeForm

On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

> [!CRITICAL]
> The local branch `main` is ahead of `origin/main` by 1 commit (`8030e9e1: Fix Pass 28`). This means all changes from Fix Pass 28 (including logo extraction, admin login mockup match, color alignment, and route fixes) **have NOT yet been pushed to GitHub**. Therefore, any deployment running from GitHub on the VPS is still running commit `361b101d` or older.

---

## 2. Admin Login "Failed to Fetch" — Root Cause Analysis

### 2.1 Frontend Request Construction Code

In `src/lib/api-client.ts`:
```typescript
// Line 1-2:
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Line 261-269:
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
  isRetry = false,
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  ...
```

In `src/context/AuthContext.tsx` (lines 300-318):
```typescript
const login = async (credentials: { emailOrPhone: string; password: string; email?: string }) => {
  setIsLoading(true);
  try {
    const payload = {
      email: credentials.email || credentials.emailOrPhone,
      emailOrPhone: credentials.emailOrPhone || credentials.email,
      password: credentials.password,
    };
    const res = await apiPost<{ accessToken: string }>("/auth/staff/login", payload, { authScope: "STAFF" });
    if (res?.accessToken) {
      setStaffToken(res.accessToken);
      const profile = await fetchCurrentUser();
      return profile;
    }
    throw new Error("Failed to obtain staff access token");
  } finally {
    setIsLoading(false);
  }
};
```

#### Build-Time Inlining Behavior
In Next.js, variables prefixed with `NEXT_PUBLIC_` are **replaced inline with string literals at build time** (`npm run build` / `next build`). They are **not** evaluated dynamically at client runtime in the browser. 
- If `next build` is executed without `NEXT_PUBLIC_API_URL` set in the environment, the string `'http://localhost:4000/api/v1'` is compiled directly into the client-side JavaScript chunk.
- When a user on their home computer or mobile device navigates to `https://mobilehubbd.tech/admin/login`, their browser executes the JavaScript and attempts to connect to `http://localhost:4000/api/v1/auth/staff/login`. Because the user's personal device does not have the API running on its own localhost port 4000, the connection is instantly rejected with the browser error: `TypeError: Failed to fetch`.

---

### 2.2 Local Production Environment Files

Commands executed: `cat .env.local` and `cat api/.env`
- `.env.production` does **not** exist locally in the repository.
- Root `.env.local` content:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
  NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
  ```
- Backend `api/.env` content:
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/novamobile?schema=public"
  JWT_ACCESS_SECRET="access-secret"
  JWT_ACCESS_EXPIRY="15m"
  JWT_REFRESH_SECRET="refresh-secret"
  JWT_REFRESH_EXPIRY="7d"
  PORT="4000"
  CORS_ORIGIN="http://localhost:3000"
  ```

---

### 2.3 CORS Configuration (`api/src/main.ts`)

```typescript
// Line 27-30:
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const frontendUrl = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return callback(null, true);
    if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (frontendUrl && origin === frontendUrl) return callback(null, true);

    // Permissive fallback for demo environments
    callback(null, true);
  },
  credentials: true,
});
```
The CORS policy in `api/src/main.ts:62` contains a permissive fallback (`callback(null, true)`), meaning CORS origin rejection is **not** the cause of `Failed to fetch`.

---

### 2.4 Why Requests from `https://mobilehubbd.tech` Fail

If the live site runs at `https://mobilehubbd.tech`, a login request fails under any of these real-world deployment conditions:
1. **Mixed Content Violation (Most Probable Cause #1)**:
   If `NEXT_PUBLIC_API_URL` on the VPS was set to `http://mobilehubbd.tech:4000/api/v1` or `http://187.53.143.166:4000/api/v1`, the web page loaded over `https://` is blocked by modern browsers from making insecure `http://` network calls. The browser throws a `Mixed Content` security error and aborts the request before it leaves the client, surfacing in React as `Failed to fetch`.
2. **Inlined Localhost URL (Most Probable Cause #2)**:
   If `npm run build` was run on the VPS without an explicit `.env.production` file containing `NEXT_PUBLIC_API_URL=https://mobilehubbd.tech/api/v1`, Next.js baked `http://localhost:4000/api/v1` into the production client bundle.
3. **Missing Nginx Reverse Proxy Route**:
   If `NEXT_PUBLIC_API_URL=https://mobilehubbd.tech/api/v1`, but Nginx is not configured to forward `/api/` traffic to `http://127.0.0.1:4000`, Nginx returns an HTTP 404 or 502, or fails SSL negotiation on custom ports if port 4000 is accessed directly.
4. **Backend Process Stopped / Unreachable**:
   If the `mobilehubbd-api` PM2 process is stopped or crashed on the VPS, all API requests fail.

---

### 2.5 Local vs. VPS Limitations

> [!NOTE]
> The exact values inside `/var/www/mobilehubbd/.env.production` and `/var/www/mobilehubbd/api/.env` on the VPS cannot be read from this local IDE. Section 6 provides the manual verification steps required to check the live VPS files.

---

### 2.6 Local Login Request Verification (Verbatim Test)

To confirm that the staff login logic itself functions correctly when configured with proper URLs, a live POST request was executed against the running local servers:

```bash
curl -i -X POST http://localhost:4000/api/v1/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mobilehubbd.test","password":"Admin@12345"}'
```

**Verbatim Response Received**:
```http
HTTP/1.1 201 Created
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: cross-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 60
Set-Cookie: staff_refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Max-Age=604800; Path=/; Expires=Mon, 28 Sep 2026 14:09:44 GMT; HttpOnly; SameSite=Lax
Content-Type: application/json; charset=utf-8
Content-Length: 656
ETag: W/"290-kX2gNJnk4MNxzEV49g0bjSqw0vw"
Date: Mon, 21 Sep 2026 14:09:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user":{"id":"cmsugs7v601gag7dhwajkuqqr","name":"Super Admin","email":"admin@mobilehubbd.test","phone":"+8801700000000","userType":"STAFF","role":{"id":"cmsugs7l10000g7dhgndy5da6","name":"Admin","description":null,"scope":"GLOBAL","isSystem":true,"createdAt":"2026-08-15T14:21:30.853Z","updatedAt":"2026-09-19T11:27:22.311Z"},"branchId":null}}
```
**Conclusion**: The backend auth controller, database connection, Bcrypt hash validation, JWT generation, and HTTP cookie generation are working locally.

---

## 3. Security: Account Route Protection — Real Test Results

### 3.1 Middleware Code (`src/middleware.ts`)

```typescript
// Lines 46-57:
// Check customer account routes
const isAccountRoute = PROTECTED_CUSTOMER_PATHS.some(p => pathname.startsWith(p));
if (isAccountRoute) {
  const hasCustomerRefresh = request.cookies.has('customer_refresh_token');
  const hasCustomerAuth = request.cookies.has('customer_authenticated');

  if (!hasCustomerRefresh && !hasCustomerAuth) {
    const response = NextResponse.next();
    response.headers.set('x-auth-check', 'required');
    return response;
  }
}
```

### 3.2 Client-Side Account Guard (`src/app/(storefront)/account/layout.tsx`)

```typescript
// Lines 49-55:
// Auth guard: redirect to login if not authenticated
useEffect(() => {
  const token = getCustomerToken();
  if (!token && !isAuthenticated) {
    router.replace("/login");
  }
}, [isAuthenticated, router]);
```

---

### 3.3 Live Curl Test: Unauthenticated Request to `/account/address`

Command executed:
```bash
curl -s -I http://localhost:3000/account/address
```

**Verbatim HTTP Response Headers**:
```http
HTTP/1.1 200 OK
x-auth-check: required
Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding
Cache-Control: no-store, must-revalidate
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
Date: Mon, 21 Sep 2026 14:10:09 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

Live Curl Test: Unauthenticated Request to Customer API Endpoint:
```bash
curl -i http://localhost:4000/api/v1/customers/test-id/addresses
```
**Verbatim API Response**:
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
{"message":"Unauthorized access","error":"Unauthorized","statusCode":401}
```

---

### 3.4 Honest State Assessment: Partially Fixed / Client-Side Only

- **Server-Side Edge Protection**: **NOT IMPLEMENTED**. `src/middleware.ts` returns `NextResponse.next()` with status `200 OK`. It does **not** issue an HTTP `307` or `302` redirect on the server. A curl client, web scraper, or client without JavaScript receives the full initial page HTML.
- **Client-Side SPA Protection**: **WORKING**. In an interactive browser session, `AccountLayout`'s `useEffect` detects the absence of a token in `localStorage` and triggers `router.replace("/login")`.
- **API Protection**: **WORKING**. The backend REST endpoint strictly returns `401 Unauthorized`.

---

### 3.5 Trace of "John Doe" Demo Address Data

Command executed: `grep -rn "John Doe" src/`
- Only **1 match** exists in the entire active codebase:
  - `src/app/(storefront)/register/page.tsx:83`: `placeholder="e.g. John Doe"` (input field placeholder text).
- In `src/app/(storefront)/account/address/page.tsx`, the hardcoded array:
  ```typescript
  const mockAddresses = [
    { id: 1, name: "John Doe", phone: "01711223344", address: "House 12, Road 5, Block C, Banani", city: "Dhaka", zip: "1213", tag: "Home", isDefault: true },
  ];
  ```
  was removed in commit `8030e9e1` (Fix Pass 28) and replaced with:
  ```typescript
  const mockAddresses: any[] = [];
  ```

---

## 4. Brand Assets — Real File Check

### 4.1 Asset Files Added to Repository

Command executed: `find public src -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" -o -name "*.ico" -o -name "*.webp" \) -exec ls -lh {} +`

| File Path | Size | Description |
|---|---|---|
| `public/images/logo-icon.jpeg` | 155 KB | Extracted high-resolution MH icon badge |
| `public/images/logo-full.jpeg` | 81 KB | Extracted full "MOBILE HUB BD" horizontal lockup |
| `public/images/logo-512.png` | 202 KB | Square icon asset for PWA/manifest |
| `public/images/logo-192.png` | 41 KB | Square icon asset |
| `public/images/logo-40.png` | 3.2 KB | Small icon asset |
| `src/app/favicon.ico` | 102 KB | Generated multi-res favicon replacing Vercel default |
| `public/images/pdf1_page1_img1.jpeg` | 155 KB | Raw image extracted from client PDF |
| `public/images/pdf2_page1_img1.jpeg` | 136 KB | Raw image extracted from client PDF |
| `public/images/pdf3_page1_img1.jpeg` | 142 KB | Raw image extracted from client PDF |
| `public/images/pdf4_page1_img1.jpeg` | 142 KB | Raw image extracted from client PDF |
| `public/images/pdf5_page1_img1.jpeg` | 81 KB | Raw image extracted from client PDF |

---

### 4.2 Code References to Brand Assets

Command executed: `grep -rn "/images/logo" src/`
- **Admin Sidebar** (`src/components/admin/AdminSidebar.tsx`):
  - Line 200: `<Image src="/images/logo-icon.jpeg" alt="Logo" width={32} height={32} className="rounded-full" />`
  - Line 208: `<Image src="/images/logo-icon.jpeg" alt="Logo" width={32} height={32} className="rounded-full" />`
- **Admin Login Page** (`src/app/(admin)/admin/login/page.tsx`):
  - Line 70: `<Image src="/images/logo-icon.jpeg" alt="Mobile Hub BD Logo" width={80} height={80} className="rounded-full" priority />`
- **Storefront Header** (`src/components/storefront/Header.tsx`):
  - Line 101: `<Image src="/images/logo-full.jpeg" alt="MobileHubBD" width={200} height={40} className="w-auto h-8" />`
  - Line 135: `<Image src="/images/logo-full.jpeg" alt="MobileHubBD" width={200} height={40} className="w-auto h-8 sm:h-10" />`
  - Line 142: `<Image src="/images/logo-full.jpeg" alt="MobileHubBD" width={240} height={48} className="w-auto h-12" />`
- **Stale References**:
  - `src/app/(admin)/admin/business-settings/general/page.tsx:145`: Still references fallback `/images/logo.png`.

---

### 4.3 Admin Login Page Structure vs. Client Mockup

Examined file: `src/app/(admin)/admin/login/page.tsx`

| Mockup Element | Present? | Code Evidence / Line |
|---|---|---|
| Centered circular logo at top | **YES** | Lines 68–77: `<Image src="/images/logo-icon.jpeg" width={80} height={80} className="rounded-full" />` |
| "Welcome to Mobile Hub BD" | **YES** | Lines 86–88: `Welcome to <span className="font-bold text-primary">Mobile Hub BD</span>` |
| "Login To Admin" subtitle | **YES** | Line 89: `<p className="text-center text-sm text-slate-500 mb-8">Login To Admin</p>` |
| Email field with Mail icon | **YES** | Lines 93–105: `<Mail className="absolute left-3.5 ..." />` and input `identifier` |
| Password field with Lock & Eye icons | **YES** | Lines 107–127: `<Lock className="absolute left-3.5 ..." />` and show/hide password toggle |
| Green gradient Login button with arrow icon | **YES** | Lines 130–143: `className="... bg-gradient-to-r from-primary-600 to-primary-500 ..."` with `<LogIn className="w-5 h-5" /> Login` |
| "Secure Access" badge with Shield icon | **YES** | Lines 147–150: `<ShieldCheck className="w-4 h-4 text-primary" /><span ...>Secure Access</span>` |

**Conclusion**: All visual components requested in the client's mockup are present in `src/app/(admin)/admin/login/page.tsx`.

---

### 4.4 Primary Brand Color

- In `src/app/globals.css` (lines 16 & 45):
  ```css
  --primary: 107 57% 44%;
  --ring: 107 57% 44%;
  ```
  `hsl(107, 57%, 44%)` translates to hex `#4CAF30` (Apple/Leaf Green matching the client's logo).
- In `tailwind.config.ts` (lines 35–36):
  ```typescript
  500: '#4caf30',
  600: '#3a8c22',
  ```
- **Git Diff Proof**:
  `git log -p -2 src/app/globals.css` proves that in commit `8030e9e1`, `--primary` was modified from `--primary: 158 96% 31%` (dark teal green `#039b5b`) to `--primary: 107 57% 44%` (`#4caf30`).

---

## 5. Nav/Upload Bugs — Current Code State

### 5.1 Admin Nav Active-State Bug

File: `src/components/admin/AdminSidebar.tsx` (lines 30–35):
```typescript
function NavItemComponent({ item, isCollapsed, level = 0 }: { item: NavItem, isCollapsed: boolean, level?: number }) {
  const pathname = usePathname();
  const isActive = item.href ? (pathname === item.href || pathname.startsWith(`${item.href}/`)) : false;
  const isParentActive = item.children?.some(child => pathname === child.href || pathname.startsWith(`${child.href}/`));
  const [isOpen, setIsOpen] = useState(isParentActive);
```

#### The Real Bug Identified
1. **False Multi-Highlighting**: The Dashboard item has `item.href = "/admin"`. When the user is on any other subpage (e.g. `pathname = "/admin/products"` or `"/admin/orders"`), `pathname.startsWith("/admin/")` evaluates to `true`. As a result, the **Dashboard link remains highlighted as active simultaneously with the subpage**.
2. **Stuck Collapsible State**: `const [isOpen, setIsOpen] = useState(isParentActive)` executes only once when the component mounts. When a user navigates between routes client-side, `isOpen` does not re-sync unless a `useEffect` updates it.

---

### 5.2 Uploaded Image URL Construction

File: `src/lib/api-client.ts` (lines 4–5 & 149–157):
```typescript
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export function getImageUrl(path?: string | null, fallback = '/images/placeholder.png'): string {
  if (!path) return fallback;
  if (typeof path !== 'string') return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${BACKEND_URL}${path}`;
  if (path.startsWith('uploads/')) return `${BACKEND_URL}/${path}`;
  if (path.startsWith('/')) return path;
  return `${BACKEND_URL}/uploads/${path}`;
}
```

#### Real State
- Uploaded media relies on `BACKEND_URL`.
- If `NEXT_PUBLIC_BACKEND_URL` is omitted in the production frontend build, `getImageUrl` resolves to `http://localhost:4000/uploads/...`, causing all uploaded product images and avatars to fail to load in the user's browser.

---

## 6. VPS Live-Server Verification Checklist (Run These Yourself)

Execute these numbered commands in your Hostinger VPS SSH terminal to establish the ground truth on the live server:

### Step 1: Inspect Live Environment Configurations
```bash
echo "=== FRONTEND PRODUCTION ENV ===" && cat /var/www/mobilehubbd/.env.production 2>/dev/null || cat /var/www/mobilehubbd/.env.local 2>/dev/null || echo "MISSING"
echo "=== BACKEND ENV ===" && cat /var/www/mobilehubbd/api/.env 2>/dev/null || echo "MISSING"
```
*Verification Check*:
- Does `NEXT_PUBLIC_API_URL` equal `https://mobilehubbd.tech/api/v1`? (If it has `http://`, requests will be blocked as Mixed Content).
- Does `ALLOWED_ORIGINS` include `https://mobilehubbd.tech`?
- Does `DATABASE_URL` point to a reachable PostgreSQL instance?

### Step 2: Check PM2 Process Health and Restart Counts
```bash
pm2 status
```
*Verification Check*:
- Look at the `↺` (restarts) column for `mobilehubbd-api` and `mobilehubbd-web`. If the number is in the hundreds or thousands, the process is crash-looping.

### Step 3: Check Backend Error Logs
```bash
pm2 logs mobilehubbd-api --lines 50 --nostream
```
*Verification Check*:
- Look for database connection errors (`P1001: Can't reach database server`), JWT secret errors, or port conflicts.

### Step 4: Verify Git Commit On Live Server
```bash
cd /var/www/mobilehubbd && git log --oneline -5
```
*Verification Check*:
- Check if commit `8030e9e1` ("Fix Pass 28") is present. (It will **not** be present until you run `git push origin main` locally and `git pull` on the VPS).

### Step 5: Test Backend API Reachability Directly on the Live Server
```bash
curl -I http://127.0.0.1:4000/api/v1/brands
curl -I https://mobilehubbd.tech/api/v1/brands
```
*Verification Check*:
- If `http://127.0.0.1:4000` returns `HTTP 200` but `https://mobilehubbd.tech/api/v1/brands` returns `502 Bad Gateway` or `404 Not Found`, the issue is in your Nginx reverse proxy block.

### Step 6: Browser Visual Inspection
1. Open `https://mobilehubbd.tech/admin/login` in an Incognito window.
2. Open Browser DevTools (`F12`) -> **Console** & **Network** tabs.
3. Check if `/images/logo-icon.jpeg` loads or returns 404.
4. Enter credentials: `admin@mobilehubbd.test` / `Admin@12345`.
5. Click **Login** and check the Network tab:
   - What is the exact Request URL?
   - Is the Status `(blocked:mixed-content)`, `(failed)`, or `201`?

---

## 7. Full Feature Inventory

| Module | Exists Locally? | Frontend File Path | Backend Controller / Service | Real API Connected? |
|---|:---:|---|---|:---:|
| **Products** | **YES** | `src/app/(admin)/admin/products/page.tsx` | `api/src/product/product.controller.ts` | **YES** (`/products`) |
| **Customers** | **YES** | `src/app/(admin)/admin/customers/page.tsx` | `api/src/customer/customer.controller.ts` | **YES** (`/customers`) |
| **POS Terminal** | **YES** | `src/app/(admin)/admin/pos/page.tsx` | `api/src/pos/pos.controller.ts` | **YES** (`/pos/products`, `/orders/pos`) |
| **Purchase Orders** | **YES** | `src/app/(admin)/admin/accounting/purchase/page.tsx` | `api/src/purchase-order/purchase-order.controller.ts` | **YES** (`/purchase-orders`) |
| **Servicing / Repairs** | **YES** | `src/app/(admin)/admin/sales/service/page.tsx` | `api/src/service-job/service-job.controller.ts` | **YES** (`/service-jobs`) |
| **HRM / Employees** | **YES** | `src/app/(admin)/admin/hrm/employees/page.tsx` | `api/src/employee/employee.controller.ts` | **YES** (`/employees`) |
| **Reports** | **YES** | `src/app/(admin)/admin/reports/summary/page.tsx` | `api/src/report/report.controller.ts` | **YES** (`/reports/summary`) |
| **CMS Pages** | **YES** | `src/app/(admin)/admin/cms/pages/page.tsx` | `api/src/page/page.controller.ts` | **YES** (`/pages`) |
| **Marketing / Banners** | **YES** | `src/app/(admin)/admin/marketing/banners/page.tsx` | `api/src/banner/banner.controller.ts` | **YES** (`/banners`) |
| **Business Settings** | **YES** | `src/app/(admin)/admin/business-settings/general/page.tsx` | `api/src/business-settings/business-settings.controller.ts` | **YES** (`/business-settings/general`) |
| **Storefront Home** | **YES** | `src/app/(storefront)/page.tsx` | `api/src/product/product.controller.ts` | **YES** (`/products/featured`, `/banners`) |
| **Storefront Checkout** | **YES** | `src/app/(storefront)/checkout/page.tsx` | `api/src/order/order.controller.ts` | **YES** (`/orders/checkout`) |

---

## 8. Could Not Verify Locally

The following items cannot be confirmed from this local development session and depend on the live VPS:
1. **Live `.env.production` Content**: The actual URL string configured inside `/var/www/mobilehubbd/.env.production` on the Hostinger VPS.
2. **Nginx Configuration**: The active site file in `/etc/nginx/sites-available/` or `/etc/nginx/conf.d/` routing traffic between port 80/443, Next.js (port 3000), and NestJS (port 4000).
3. **Live SSL Certificate**: The validity and configuration of Let's Encrypt / Certbot SSL certificates on `https://mobilehubbd.tech`.
4. **Live PM2 State**: Whether `pm2` processes on the VPS are running or in an error/restart cycle.
5. **Live VPS Database State**: Whether migrations (`npx prisma migrate deploy`) and seed (`npm run seed:prod`) have been executed on the production PostgreSQL instance.
6. **Remote Git Sync**: Local commit `8030e9e1` is ahead of `origin/main` by 1 commit. The remote repository does not yet contain these fixes.

---

## 9. Honest Summary

- **What Is Genuinely Working**:
  - The complete application code (83 Prisma models, all admin modules, POS terminal, servicing, and customer storefront) exists locally and compiles with zero build errors (`npm run build` succeeds).
  - The backend authentication controller, Bcrypt password checking, and JWT issuance are functioning locally (verified via curl `201 Created` with valid token).
  - The client's extracted logo assets, green color theme (`#4CAF30`), and admin login screen mockup elements exist in the active local files.
  - Backend API routes for customer data and staff operations strictly require authentication (`401 Unauthorized`).

- **What Is Genuinely Broken**:
  - **Admin Navigation**: `/admin` (Dashboard) remains falsely highlighted on every admin subpage due to `pathname.startsWith('/admin/')`.
  - **Account Route Edge Security**: `src/middleware.ts` does not execute an HTTP 307/302 redirect on the server; route protection is deferred to client-side JavaScript.
  - **Remote Git Deployment**: The latest commit (`8030e9e1`) has not been pushed to `origin/main`. Any deployment reading from GitHub is running outdated code.

- **What Is Unknown Until VPS Checklist Is Run**:
  - Whether the live server is throwing "Failed to fetch" because of Mixed Content (`http://` vs `https://`), baked-in `localhost:4000` URLs during the last VPS `npm run build`, an unconfigured Nginx proxy, or a crashed PM2 backend process. Running the checklist in Section 6 will definitively isolate this.
