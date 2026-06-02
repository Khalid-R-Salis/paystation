import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cache for bill providers to avoid repeated API calls
const billProvidersCache: Record<string, any[]> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const cacheTimestamp: Record<string, number> = {};

/**
 * Fetch bill providers from Paystack API
 * Supports: electricity, airtime, data, cable, education, insurance
 */
export async function fetchBillProviders(billerType: string): Promise<any[]> {
  // Check if cache exists and is still valid
  if (billProvidersCache[billerType] && cacheTimestamp[billerType]) {
    const age = Date.now() - cacheTimestamp[billerType];
    if (age < CACHE_DURATION) {
      return billProvidersCache[billerType];
    }
  }

  try {
    const PAYSTACK_SECRET = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
    
    if (!PAYSTACK_SECRET) {
      console.warn("PAYSTACK_SECRET_KEY not configured in environment variables");
      return [];
    }

    const response = await fetch(
      `https://api.paystack.co/bill/fetch?id=${billerType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract providers from Paystack response
    const providers = data.data?.biller_code 
      ? [{ 
          id: data.data.id, 
          name: data.data.name,
          code: data.data.biller_code 
        }]
      : [];

    // Cache the results
    billProvidersCache[billerType] = providers;
    cacheTimestamp[billerType] = Date.now();

    return providers;
  } catch (error) {
    console.error(`Failed to fetch ${billerType} providers from Paystack:`, error);
    return [];
  }
}

/**
 * Get electricity providers specifically
 * Falls back to hardcoded list if API fails
 */
export async function fetchElectricityProviders() {
  const HARDCODED_FALLBACK = [
    { id: 'ikedc', name: 'Ikeja Electric (IKEDC)' },
    { id: 'ekedc', name: 'Eko Electric (EKEDC)' },
    { id: 'kaedco', name: 'Kaduna Electric (KAEDCO)' },
    { id: 'jed', name: 'Jos Electric (JED)' },
    { id: 'aed', name: 'Abuja Electric (AED)' },
    { id: 'phed', name: 'Port Harcourt Electric (PHED)' },
  ];

  try {
    // Try to fetch from Paystack
    const providers = await fetchBillProviders('electricity');
    
    // Return Paystack providers if available, otherwise use hardcoded fallback
    return providers && providers.length > 0 ? providers : HARDCODED_FALLBACK;
  } catch (error) {
    console.error("Error fetching electricity providers, using fallback:", error);
    return HARDCODED_FALLBACK;
  }
}
