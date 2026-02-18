import { useState, useCallback } from 'react';
import { contractService, Listing, DutchAuction } from '../services/contractService';

export const useContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async (listingId: number): Promise<Listing | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await contractService.getListing(listingId);
      return result;
    } catch (err) {
      setError('Failed to fetch listing');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchListingCount = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getListingCount();
    } catch (err) {
      console.error(err);
      return 0;
    }
  }, []);

  const fetchDutchAuction = useCallback(async (auctionId: number): Promise<DutchAuction | null> => {
    setLoading(true);
    try {
      return await contractService.getDutchAuction(auctionId);
    } catch (err) {
      setError('Failed to fetch auction');
      return null;
    } finally {
      setLoading(false);
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

  const fetchAllAuctions = useCallback(async (): Promise<DutchAuction[]> => {
    setLoading(true);
    try {
      const lastId = await contractService.getLastAuctionId();
      const auctions: DutchAuction[] = [];
      
      for (let i = 1; i <= lastId; i++) {
        const auction = await contractService.getDutchAuction(i);
        if (auction && auction.status === 'Active') {
          auctions.push(auction);
        }
      }
      
      return auctions;
    } catch (err) {
      setError('Failed to fetch auctions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchListing,
    fetchListingCount,
    fetchDutchAuction,
    fetchAllListings,
    fetchAllAuctions,
    contractService
  };
};
