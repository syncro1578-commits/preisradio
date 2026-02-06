interface SearchFiltersProps {
  // Filter values
  sortParam: string;
  categoryParam: string;
  brandParam: string;
  retailerParam: string;
  minPriceParam: string;
  maxPriceParam: string;
  discountParam: string;

  // Available options
  categories: string[];
  brands: string[];

  // Handlers
  onFilterChange: (filterName: string, value: string) => void;
  onReset: () => void;

  // UI customization
  isMobile?: boolean;
  showResetButton?: boolean;
}

export default function SearchFilters({
  sortParam,
  categoryParam,
  brandParam,
  retailerParam,
  minPriceParam,
  maxPriceParam,
  discountParam,
  categories,
  brands,
  onFilterChange,
  onReset,
  isMobile = false,
  showResetButton = true,
}: SearchFiltersProps) {
  const radioName = isMobile ? 'retailer-mobile' : 'retailer';

  return (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Sortieren nach
        </label>
        <select
          value={sortParam}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="newest">Neueste</option>
          <option value="price_asc">Preis aufsteigend</option>
          <option value="price_desc">Preis absteigend</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Kategorie
        </label>
        <select
          value={categoryParam}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">Alle Kategorien</option>
          {categories.slice(0, 20).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Marke
          </label>
          <select
            value={brandParam}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="">Alle Marken</option>
            {brands.slice(0, 20).map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Retailer Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Haendler
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name={radioName}
              value=""
              checked={retailerParam === ''}
              onChange={(e) => onFilterChange('retailer', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Alle</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={radioName}
              value="saturn"
              checked={retailerParam === 'saturn'}
              onChange={(e) => onFilterChange('retailer', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Saturn</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={radioName}
              value="mediamarkt"
              checked={retailerParam === 'mediamarkt'}
              onChange={(e) => onFilterChange('retailer', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">MediaMarkt</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={radioName}
              value="otto"
              checked={retailerParam === 'otto'}
              onChange={(e) => onFilterChange('retailer', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Otto</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={radioName}
              value="kaufland"
              checked={retailerParam === 'kaufland'}
              onChange={(e) => onFilterChange('retailer', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Kaufland</span>
          </label>
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preisspanne (EUR)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceParam}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
            className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPriceParam}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      {/* Discount Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Rabatt mindestens
        </label>
        <select
          value={discountParam}
          onChange={(e) => onFilterChange('discount', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="">Alle Produkte</option>
          <option value="5">5% oder mehr</option>
          <option value="10">10% oder mehr</option>
          <option value="15">15% oder mehr</option>
          <option value="20">20% oder mehr</option>
          <option value="30">30% oder mehr</option>
          <option value="50">50% oder mehr</option>
        </select>
      </div>

      {/* Reset Button (optional) */}
      {showResetButton && !isMobile && (
        <button
          onClick={onReset}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors"
        >
          Zurücksetzen
        </button>
      )}
    </div>
  );
}
