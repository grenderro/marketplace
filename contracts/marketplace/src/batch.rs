multiversx_sc::imports!();
use multiversx_sc::proxy_imports::heap::Vec;

#[multiversx_sc::module]
pub trait BatchModule:
    crate::listing::ListingModule
    + crate::royalties::RoyaltiesModule
    + crate::pausable::PausableModule
{
    #[endpoint(batchBuy)]
    #[payable("*")]
    fn batch_buy(&self, listing_ids: MultiValueEncoded<u64>) {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();
        let mut total_cost = BigUint::zero();
        
        let ids: Vec<u64> = listing_ids.into_iter().collect();
        require!(!ids.is_empty(), "No listings provided");

        for &listing_id in &ids {
            let listing = self.listings(listing_id).get();
            require!(listing.status == crate::listing::ListingStatus::Active, "Not active");
            require!(listing.owner != caller, "Cannot buy own");
            
            total_cost += &listing.price;
        }

        let payment = self.call_value().egld_or_single_esdt();
        require!(payment.amount >= total_cost, "Insufficient payment");

        for &listing_id in &ids {
            let listing = self.listings(listing_id).get();
            
            self.execute_trade_with_royalties(
                &caller,
                &listing.owner,
                &listing.nft_token_id,
                listing.nft_nonce,
                &payment.token_identifier,
                payment.token_nonce,
                &listing.price,
            );

            let mut updated_listing = listing;
            updated_listing.status = crate::listing::ListingStatus::Sold;
            self.listings(listing_id).set(updated_listing);
        }
    }
}
