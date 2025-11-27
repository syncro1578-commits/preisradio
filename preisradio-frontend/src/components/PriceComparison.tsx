import { Price } from '@/lib/types';

interface PriceComparisonProps {
  prices: Price[];
}

export default function PriceComparison({ prices }: PriceComparisonProps) {
  // Trier les prix par ordre croissant
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);

  // Trouver le prix le plus bas
  const lowestPrice = sortedPrices[0]?.price;

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            En stock
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Rupture de stock
          </span>
        );
      case 'preorder':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Précommande
          </span>
        );
      case 'discontinued':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Discontinué
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  if (prices.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-zinc-900">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Aucun prix disponible
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Les prix pour ce produit ne sont pas encore disponibles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comparaison des prix ({prices.length} {prices.length > 1 ? 'vendeurs' : 'vendeur'})
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Triés du prix le plus bas au plus élevé
          {sortedPrices.length > 1 && (
            <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
              Économisez {(sortedPrices[sortedPrices.length - 1].price - lowestPrice).toFixed(2)} €
            </span>
          )}
        </p>
      </div>

      {/* Table minimaliste style iDEALO */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800">
        <div className="hidden lg:block">
          {/* Desktop: Tableau */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Vendeur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Prix</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {sortedPrices.map((price, index) => (
                <tr
                  key={`${price.retailer.id}-${index}`}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                    price.price === lowestPrice
                      ? 'bg-green-50 dark:bg-green-950/20'
                      : 'bg-white dark:bg-zinc-900'
                  }`}
                >
                  {/* Vendeur */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-zinc-800">
                        {price.retailer.logo ? (
                          <img
                            src={price.retailer.logo}
                            alt={price.retailer.name}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {price.retailer.name.substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {price.retailer.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(price.last_checked)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">{getStockStatusBadge(price.stock_status)}</td>

                  {/* Prix */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {price.price.toFixed(2)} €
                      </span>
                      {price.price === lowestPrice && (
                        <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                          Meilleur
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-center">
                    {price.stock_status === 'in_stock' ? (
                      <a
                        href={price.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Acheter
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Indisponible
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Cartes minimalistes */}
        <div className="lg:hidden space-y-2">
          {sortedPrices.map((price, index) => (
            <div
              key={`${price.retailer.id}-${index}`}
              className={`border-b border-gray-200 p-4 last:border-b-0 dark:border-zinc-800 ${
                price.price === lowestPrice ? 'bg-green-50 dark:bg-green-950/20' : 'bg-white dark:bg-zinc-900'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-zinc-800">
                    {price.retailer.logo ? (
                      <img
                        src={price.retailer.logo}
                        alt={price.retailer.name}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                        {price.retailer.name.substring(0, 2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {price.retailer.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {price.price.toFixed(2)} €
                  </p>
                  {price.price === lowestPrice && (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      Meilleur prix
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStockStatusBadge(price.stock_status)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(price.last_checked)}
                  </span>
                </div>

                {price.stock_status === 'in_stock' ? (
                  <a
                    href={price.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Acheter
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Indisponible
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
