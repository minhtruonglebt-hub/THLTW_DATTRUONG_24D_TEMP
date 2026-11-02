# Runtime Validation Report

**Generated**: 2026-11-02 (rechecked against the running application)  
**Target**: `C:\THLTW_TANDATTRUONG_24D_TEMP`

## Summary

| Step | Status | Exit Code | Details |
|---|---|---:|---|
| Startup | PASS | 0 | Laravel API on port 8000 and Next.js on port 3000 both responded with HTTP 200. |
| Database migrations | PASS | 0 | All five migrations report `Ran`; the existing Sanctum table migration now safely skips an already-imported table. |
| Backend integration tests | PASS | 0 | 7 tests passed: 5 feature-flow tests and 2 existing example tests. |
| Frontend lint | PASS | 0 | `npm run lint` completed without errors. |
| Frontend build | PASS | 0 | `npm run build` compiled and generated all 48 app routes. |
| Browser checks | PASS | 0 | Storefront, product listing/filter, cart add-update-remove, contact/login/reset pages and public page rendered. Protected admin contact screen redirects unauthenticated visitors to admin login. |

**Overall**: PARTIAL — core flows pass. Real MoMo-provider behavior and browser interaction inside authenticated admin screens were not verified.

## Environment

- Docker: UNAVAILABLE — Docker is not installed.
- Node.js: AVAILABLE — v24.21.0.
- Browser: AVAILABLE — Chromium installed; integrated browser checks completed.
- Database: AVAILABLE — configured database used for live requests and transaction-isolated integration tests.
- API route registry: PASS — `php artisan route:list --path=api`.

## Integration Test Evidence

`php artisan test` — exit code 0; **6 passed, 0 failed**.

- [CartApiTest.php](./backend/tests/Feature/CartApiTest.php): guest cart add, update, read-back and remove.
- [CheckoutPromotionTest.php](./backend/tests/Feature/CheckoutPromotionTest.php): promotion calculation, order persistence, stock decrement, cancellation and stock/promotion restoration.
- [AdminWebsiteApiTest.php](./backend/tests/Feature/AdminWebsiteApiTest.php): protected CMS creation/read-back and inventory receipt; rejects an export exceeding available stock.
- [AdminContactApiTest.php](./backend/tests/Feature/AdminContactApiTest.php): rejects unauthenticated access; filters and reads contacts; records a reply; prevents deleting pending contacts and allows deleting handled contacts.
- [AuthAndContactApiTest.php](./backend/tests/Feature/AuthAndContactApiTest.php): invalid login, registration, authenticated profile and contact persistence.

All feature tests use database transactions and roll back their test data.

## Browser Checks

- Product listing and a product detail page rendered.
- Product listing loaded 18 products; category `1` filtered to 10 matching products.
- Added a product to the cart, increased its quantity from 1 to 2, and removed it; the header count and cart contents updated. The corresponding API requests returned HTTP 200.
- Home, cart, checkout, contact, login, forgot-password, and admin login routes rendered; `/admin/contacts` correctly redirected an unauthenticated browser to `/admin/login`.
- The CMS static page rendered successfully.
- Legacy menu links resolve to the frontend routes `/products`, `/contact` and `/pages/{slug}`.
- Legacy banner category links resolve to `/products?category={id}`.
- Missing legacy banner image files return no image URL; the storefront retains its text/gradient fallback instead of making a failed image request.
- Public catalog/menu/banner/page endpoints returned HTTP 200; unauthenticated `/api/admin/lien-he` returned the expected HTTP 401.
- No browser page exceptions were observed during the checked journeys.

## Remaining Verification Limits

- A real MoMo payment cannot be confirmed without valid provider configuration and a provider-side test transaction.
- Admin contact/CMS/inventory API behavior was tested with temporary authenticated admins inside rollback-safe tests; a real browser login session was not provided, so authenticated admin screens were not exercised in-browser.
- Legacy banner image files are absent from this workspace/database storage. Upload replacement images through the admin CMS if the actual banner photography is required.
- The frontend has no `test` script or configured automated test runner; its validation used lint, production build and browser interaction checks.
- These checks cover the implemented core workflows, not every requirement in the original Word document. The Word file was not present in the current workspace for a fresh requirement-by-requirement audit.
