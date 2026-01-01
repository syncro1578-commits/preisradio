// Utility functions for retailer information

export interface RetailerInfo {
  name: string;
  logo: string;
  color?: string;
  borderColor?: string;
  textColor?: string;
}

/**
 * Get retailer information including logo path
 * @param retailer - The retailer identifier
 * @returns Retailer information object
 */
export function getRetailerInfo(retailer?: string): RetailerInfo {
  if (retailer === 'saturn') {
    return {
      name: 'Saturn',
      logo: '/retailers/saturn.png',
      color: 'bg-red-600',
      borderColor: 'border-red-600',
      textColor: 'text-red-600',
    };
  } else if (retailer === 'mediamarkt') {
    return {
      name: 'MediaMarkt',
      logo: '/retailers/mediamarkt.png',
      color: 'bg-red-700',
      borderColor: 'border-red-700',
      textColor: 'text-red-700',
    };
  } else if (retailer === 'otto') {
    return {
      name: 'Otto',
      logo: '/retailers/otto.png',
      color: 'bg-blue-600',
      borderColor: 'border-blue-600',
      textColor: 'text-blue-600',
    };
  } else if (retailer === 'kaufland') {
    return {
      name: 'Kaufland',
      logo: '/retailers/kaufland.png',
      color: 'bg-green-600',
      borderColor: 'border-green-600',
      textColor: 'text-green-600',
    };
  }
  return {
    name: 'Händler',
    logo: '',
    color: 'bg-gray-600',
    borderColor: 'border-gray-600',
    textColor: 'text-gray-600',
  };
}
