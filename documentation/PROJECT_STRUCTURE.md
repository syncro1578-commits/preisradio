# PrixRadio - Detailed Project Structure

## Project Overview

PrixRadio is a German price comparison platform comparing products from Saturn and MediaMarkt. It uses:
- **Backend**: Django REST API with MongoDB
- **Frontend**: Next.js 13+ with TypeScript and Tailwind CSS
- **Hosting**: serv00 (shared hosting)

---

## Directory Structure

```
preisradio/
│
├── Backend (Django REST API - Python)
│   ├── comparateur_allemand/          # Django project configuration
│   │   ├── settings.py                # Main Django settings (database, CORS, REST framework)
│   │   ├── urls.py                    # Main URL routing
│   │   ├── asgi.py                    # ASGI configuration
│   │   ├── wsgi.py                    # WSGI configuration
│   │   └── __init__.py
│   │
│   ├── products/                      # Products app - core business logic
│   │   ├── models.py                  # MongoDB models: SaturnProduct, MediaMarktProduct
│   │   ├── views.py                   # ProductViewSet, RetailerViewSet (API endpoints)
│   │   ├── serializers.py             # DRF serializers for products
│   │   ├── urls.py                    # Product app URL routing
│   │   ├── health.py                  # Health check and status endpoints
│   │   ├── admin.py                   # Django admin configuration
│   │   ├── apps.py                    # App configuration
│   │   └── migrations/                # Database migrations
│   │
│   ├── public/                        # Static files
│   ├── tmp/                           # Temporary files
│   ├── hooks/                         # Deployment hooks
│   │
│   ├── manage.py                      # Django command-line utility
│   ├── passenger_wsgi.py              # Passenger application server entry point
│   ├── requirements.txt               # Python dependencies
│   ├── env                            # Environment configuration (.env file)
│   │
│   ├── add_test_data.py               # Script to populate test data
│   ├── check_db.py                    # Database verification script
│   └── check_collections.py           # MongoDB collection verification script
│
├── Frontend (Next.js 13+ - TypeScript)
│   ├── preisradio-frontend/
│   │   │
│   │   ├── src/
│   │   │   │
│   │   │   ├── app/                   # Next.js App Router
│   │   │   │   ├── page.tsx           # Home page with search and product sections
│   │   │   │   ├── layout.tsx         # Root layout with Navigation and Footer
│   │   │   │   ├── globals.css        # Global styles (Tailwind directives)
│   │   │   │   │
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx       # Search results page with filters and pagination
│   │   │   │   │
│   │   │   │   ├── product/
│   │   │   │   │   ├── page.tsx       # Product browser page
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx   # Product detail page
│   │   │   │   │
│   │   │   │   ├── marken/            # Brand pages
│   │   │   │   │   ├── page.tsx       # All brands page with pagination
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx   # Brand detail page with products
│   │   │   │   │
│   │   │   │   ├── kategorien/        # Category pages
│   │   │   │   ├── haendler/          # Retailers listing page
│   │   │   │   ├── kontakt/           # Contact page
│   │   │   │   ├── impressum/         # Legal information
│   │   │   │   ├── datenschutz/       # Privacy policy
│   │   │   │   │
│   │   │   │   ├── robots.ts          # SEO robot configuration
│   │   │   │   └── sitemap.ts         # XML sitemap generation
│   │   │   │
│   │   │   ├── lib/                   # Utilities and helpers
│   │   │   │   ├── api.ts             # API client (ApiClient class)
│   │   │   │   └── types.ts           # TypeScript type definitions
│   │   │   │
│   │   │   └── components/            # Reusable React components
│   │   │       ├── Navigation.tsx     # Top navigation bar
│   │   │       ├── Footer.tsx         # Footer component
│   │   │       ├── ProductCard.tsx    # Product display card
│   │   │       ├── ProductSection.tsx # Product section with horizontal scroll
│   │   │       ├── ProductSimilar.tsx # Similar products display
│   │   │       ├── PriceComparison.tsx # Price comparison component
│   │   │       ├── HomeContent.tsx    # Home page content component
│   │   │       ├── Analytics.tsx      # Google Analytics integration
│   │   │       └── ConsentBanner.tsx  # GDPR consent banner
│   │   │
│   │   ├── public/                    # Static assets
│   │   │   └── images/
│   │   │
│   │   ├── .env.local                 # Local environment variables
│   │   ├── .env.production            # Production environment variables
│   │   ├── next.config.js             # Next.js configuration
│   │   ├── tsconfig.json              # TypeScript configuration
│   │   ├── tailwind.config.js         # Tailwind CSS configuration
│   │   ├── package.json               # Node dependencies and scripts
│   │   └── package-lock.json          # Locked dependency versions
│   │
│   └── frontend/                      # Legacy frontend (may be deprecated)
│
├── Root configuration files
│   ├── .git/                          # Git repository
│   ├── .gitignore                     # Git ignore rules
│   ├── switch-env.sh                  # Environment switching script
│   ├── README.md                      # Main project README
│   ├── PROJECT_STRUCTURE.md           # This file - detailed structure
│   ├── DEPLOYMENT.md                  # Deployment instructions
│   └── SERV00_SETUP.md                # serv00 hosting setup guide
```

---

## Backend Architecture (Django)

### Key Files and Responsibilities

#### `comparateur_allemand/settings.py`
- **Purpose**: Central Django configuration
- **Key Settings**:
  - `DEBUG`: False in production, True in development
  - `ALLOWED_HOSTS`: List of allowed domain names
  - `INSTALLED_APPS`: Registered Django apps
  - `DATABASES`: MongoDB connection settings with pooling (maxPoolSize=100)
  - `REST_FRAMEWORK`: DRF configuration (pagination, filters, authentication)
  - `CORS_ALLOWED_ORIGINS`: Frontend URLs allowed to access the API
  - Timeouts: MongoDB timeouts increased to 30 seconds for handling network latency

#### `products/models.py`
- **SaturnProduct**: MongoDB document model for Saturn.de products
  - Fields: id, sku, brand, category, currency, description, discount, gtin, image, old_price, price, scraped_at, title, url
  - Indexes: sku, gtin, category, brand, scraped_at, title (text), brand (text), description (text)
  - Collection: "Db" in Saturn database

- **MediaMarktProduct**: MongoDB document model for MediaMarkt.de products
  - Same fields and indexes as SaturnProduct
  - Collection: "Db" in MediaMarkt database

#### `products/views.py` - Core API Logic
- **RetailerViewSet**: Provides /retailers/ endpoint
  - `list()`: Returns all available retailers (Saturn, MediaMarkt)
  - `retrieve()`: Returns details for a specific retailer

- **ProductViewSet**: Main product API endpoint (/products/)
  - `list()`: Returns products with advanced filtering and pagination
    - **Pagination Strategy**:
      - Single retailer (saturn/mediamarkt): Paginate at MongoDB level using `.skip()` and `.limit()`
      - All retailers: Load 150 products from each retailer, merge, sort by date, then paginate
    - **Filtering**: Search (title, gtin, description, brand), category, brand filters
    - **Performance**: Optimized to avoid loading entire collections

  - `retrieve()`: Get single product details
  - `categories()`: Endpoint to get all unique categories
  - `by_gtin()`: Find products by GTIN code (cross-retailer comparison)
  - `similar()`: Get similar products based on category/brand
  - `price_history()`: Get price tracking for a product

#### `products/serializers.py`
- **SaturnProductSerializer**: Converts MongoDB documents to JSON
- **MediaMarktProductSerializer**: Same structure for MediaMarkt products
- Both return all product fields (id, sku, brand, category, currency, description, discount, gtin, image, old_price, price, scraped_at, title, url)

#### `products/health.py`
- **health_check()**: Basic health status endpoint
- **api_status()**: Returns operational status with product counts and MongoDB connection status
- **health_check_simple()**: Simple endpoint for load balancers

#### `products/urls.py`
- Registers REST routes using DefaultRouter
- Routes: /retailers/, /products/, /products/categories/, /products/{id}/similar/, etc.
- Health check endpoints: /health/, /status/

### Database

**MongoDB Atlas** (Cloud):
- **Saturn Database**: Contains `Db` collection with Saturn products
  - URI: `mongodb+srv://stronglimitless76_db_user:...@cluster0.pzd9gka.mongodb.net/`
- **MediaMarkt Database**: Contains `Db` collection with MediaMarkt products
  - URI: `mongodb+srv://stronglimitless76_db_user:...@mediamarkt.iwjamu6.mongodb.net/`
- **Connection Pooling**: 100 connections max
- **Timeouts**: 30 seconds for operations

---

## Frontend Architecture (Next.js)

### Key Files and Components

#### `app/page.tsx` - Home Page
- **HomeContent Component** (in components/HomeContent.tsx):
  - Loads 6 parallel API requests for different sections:
    - All products (100 items) for discount sorting
    - Smartphones (8 items)
    - Laptops (8 items)
    - TVs/Fernseher (8 items)
    - Accessories (8 items)
    - Gaming (8 items)
  - Displays product sections with horizontal scrolling
  - Shows statistics cards (product count, categories, retailers)
  - Popular categories listing

#### `app/search/page.tsx` - Search and Results Page
- **SearchContent Component**:
  - **State Management**:
    - `searchQuery`: Current search term
    - `selectedCategory`, `selectedBrand`, `selectedRetailer`, `selectedDiscount`: Filters
    - `priceRange`: Min and max price filters
    - `sortBy`: Sorting option (price_asc, price_desc, newest)
    - `currentPage`, `totalCount`: Pagination state

  - **Filtering Logic**:
    - Server-side pagination via API
    - Client-side filtering by:
      - Retailer (Saturn/MediaMarkt)
      - Price range (min/max)
      - Discount minimum (5%, 10%, 15%, 20%, 30%, 50%)
    - Sorting options: Price ascending/descending, newest first

  - **Pagination**:
    - 20 products per page
    - Smart pagination UI (first 3 pages, last 3 pages, current page ±1)
    - Previous/Next buttons

  - **UI Components**:
    - Sidebar with filters and sort options
    - Search form with autocomplete support
    - Product grid (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
    - Error handling with retry button
    - Empty state when no products found

#### `app/product/[id]/page.tsx` - Product Detail Page
- Shows complete product information
- Price comparison between retailers (if available)
- Similar products section
- Price history (currently shows latest price)

#### `app/marken/page.tsx` - Brands Listing Page
- Loads all brands using pagination (500 products per request)
- Groups products by brand
- Displays brand statistics:
  - Product count
  - Available retailers
  - Category distribution
  - Price range (min, max, average)
- Sorted by product count (highest first)

#### `app/marken/[slug]/page.tsx` - Brand Detail Page
- Shows all products for a specific brand
- Same filters as search page
- Product grid with sorting

#### `lib/api.ts` - API Client
```typescript
class ApiClient {
  // Product queries
  getProducts(params?)           // Get products with filters
  getProductsFromBothRetailers() // Get from both retailers and merge
  getCategories()                // Get unique categories
  getProduct(id)                 // Get single product
  getProductsByGtin(gtin)        // Find by GTIN

  // Retailer queries
  getRetailers()                 // Get all retailers
  getRetailer(id)                // Get specific retailer

  // Health/Status
  getHealth()                    // Health check
  getStatus()                    // Detailed status
}
```

**Key API Logic**:
- `getProductsFromBothRetailers()`:
  - Makes 2 parallel API calls (Saturn + MediaMarkt)
  - Each request gets `page_size` products
  - Alternately merges results (Saturn product, MediaMarkt product, Saturn product...)
  - Returns combined count and pagination info

#### `components/` - Reusable Components
- **Navigation.tsx**: Top navigation with search bar and links
- **Footer.tsx**: Footer with links and info
- **ProductCard.tsx**: Individual product display card with:
  - Image, title, price
  - Discount badge (if available)
  - "New" badge (scraped < 7 days ago)
  - Retailer name
  - Links to product details
- **ProductSection.tsx**: Horizontal scrollable product section
- **HomeContent.tsx**: Home page content with multiple sections
- **Analytics.tsx**: Google Analytics integration
- **ConsentBanner.tsx**: GDPR cookie consent banner

### Styling

- **Framework**: Tailwind CSS
- **Approach**: Utility-first CSS
- **Dark Mode**: Built-in support with `dark:` prefixes
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Environment Variables

`.env.local` (Development):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=...
```

`.env.production` (Production):
```
NEXT_PUBLIC_API_URL=https://api.preisradio.de
NEXT_PUBLIC_SITE_URL=https://preisradio.de
(same analytics IDs)
```

---

## API Endpoints

### Products

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products/` | GET | List products with filters, search, pagination |
| `/api/products/?page=1&page_size=20` | GET | Pagination |
| `/api/products/?search=iPhone` | GET | Full-text search |
| `/api/products/?category=Smartphones` | GET | Filter by category |
| `/api/products/?brand=Apple` | GET | Filter by brand |
| `/api/products/?retailer=saturn` | GET | Filter by retailer (saturn/mediamarkt/all) |
| `/api/products/{id}/` | GET | Get product details |
| `/api/products/{id}/similar/` | GET | Get similar products |
| `/api/products/{id}/price_history/` | GET | Get price history |
| `/api/products/by_gtin/?gtin=123456` | GET | Find by GTIN |
| `/api/products/categories/` | GET | Get all categories |

### Retailers

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/retailers/` | GET | List all retailers |
| `/api/retailers/{id}/` | GET | Get retailer details |

### Health

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health/` | GET | Basic health check |
| `/api/status/` | GET | Detailed status with product counts |

---

## Performance Optimizations

### Backend
1. **MongoDB Indexing**: Indexes on frequently searched fields
2. **Connection Pooling**: 100 concurrent connections to MongoDB
3. **Pagination at DB Level**: For single retailers, pagination done at MongoDB level
4. **Limited Chunk Loading**: For "all retailers", load only 150 products per retailer then merge
5. **Timeout Configuration**: 30-second timeouts for slow network connections

### Frontend
1. **Image Optimization**: Lazy loading for product images
2. **Component Memoization**: Prevention of unnecessary re-renders
3. **API Request Batching**: Parallel requests where possible
4. **Pagination**: Numbered pagination with smart button display
5. **Client-side Filtering**: Post-fetch filtering for fast response

### Common Pitfalls Fixed
1. ❌ Loading all 10,000 products → ✅ Pagination with 500-product limit
2. ❌ Duplicate API calls → ✅ Parallel requests with proper parameter passing
3. ❌ No CORS configuration → ✅ .env file loading with proper CORS setup
4. ❌ Slow MongoDB timeouts → ✅ 30-second timeouts with connection pooling
5. ❌ No discount filtering → ✅ Discount filter with preset percentages

---

## Deployment

### Development Environment
- Backend: `python manage.py runserver 0.0.0.0:8000`
- Frontend: `npm run dev` (runs on port 3000)

### Production (serv00)
- **Backend**: Passenger WSGI server
  - Entry point: `passenger_wsgi.py`
  - Django settings: `ALLOWED_HOSTS` includes production domain
  - DEBUG: False

- **Frontend**: Vercel or self-hosted Node.js
  - Built: `npm run build`
  - Served: `npm start` or static deployment

### Environment Files
- Backend: `env` file in root (contains DATABASE URIs, SECRET_KEY, CORS origins)
- Frontend: `.env.local` (development) and `.env.production` (production)

---

## Recent Improvements (Current Session)

1. **Pagination Optimization**
   - Implemented smart pagination for "all retailers" queries
   - Loads limited chunks (150 products) instead of entire collections
   - Added numbered pagination UI with smart visibility

2. **MongoDB Indexes**
   - Added text indexes on title, brand, description
   - Improved search performance

3. **500 Error Fixes**
   - Added MAX_PAGE_SIZE=500 limit to REST framework settings
   - Fixed marken pages to use pagination instead of requesting 10,000 products

4. **Discount Filtering**
   - Added discount filter dropdown to search page
   - Preset discount thresholds: 5%, 10%, 15%, 20%, 30%, 50%
   - Client-side filtering for selected discount minimum

---

## Git Workflow

### Recent Commits
1. `ead6798` - Optimize pagination for multi-retailer queries and add MongoDB indexes
2. `737bda4` - Fix 500 errors from excessive page_size requests and add pagination limits
3. `39dd0ba` - Add discount/sale filtering to search page

### Branch Structure
- `master`: Main production branch

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Errors**:
- Check `MONGODB_SATURN_URI` and `MONGODB_MEDIAMARKT_URI` in `env` file
- Verify network connectivity from serv00 to MongoDB Atlas
- Check firewall rules allow connections

**CORS Errors**:
- Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`
- Confirm `env` file is loaded via `load_dotenv()` in settings.py

**Slow Queries**:
- Check MongoDB indexes exist
- Verify query parameters are being passed to API
- Check server logs for timeout errors

### Frontend Issues

**API Connection Failed**:
- Verify `NEXT_PUBLIC_API_URL` points to correct backend
- Check CORS configuration on backend
- Verify API is running and accessible

**Slow Page Load**:
- Check Network tab in DevTools for slow API calls
- Verify pagination parameters are being passed
- Check if discount filter is removing too many products

---

## Contact & Support

- **Repository**: https://github.com/Gas1212/preisradio
- **Backend API**: https://api.preisradio.de
- **Frontend**: https://preisradio.de

