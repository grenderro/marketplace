import { useState, useCallback } from 'react';
import { contractService, Listing } from '../services/contractService';

export const useContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListingCount = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getListingCount();
    } catch (err) {
      console.error(err);
      return 0;
    }
  }, []);

  const fetchAllListings = useCallback(async (): Promise<Listing[]> => {
    setLoading(true);
    try {
      const count = await contractService.getListingCount();
      const listings: Listing[] = [];
      
      for (let i = 1; i <= count; i++) {
        const listing = await contractService.getListing(i);
        if (listing && listing.status === 'Active') {
          listings.push({ ...listing, id: i });
        }
      }
      
      return listings;
    } catch (err) {
      setError('Failed to fetch listings');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchListingCount,
    fetchAllListings,
    contractService
  };
};
