// src/events.rs
multiversx_sc::imports!();

#[multiversx_sc::module]
pub trait EventsModule {
    // Listing events
    #[event("listing_created")]
    fn emit_listing_created(
        &self,
        #[indexed] listing_id: u64,
        #[indexed] seller: &ManagedAddress,
        #[indexed] token_id: &TokenIdentifier,
        token_nonce: u64,
    );

    #[event("listing_sold")]
    fn emit_listing_sold(
        &self,
        #[indexed] listing_id: u64,
        #[indexed] buyer: &ManagedAddress,
        price: &BigUint,
    );

    #[event("listing_cancelled")]
    fn emit_listing_cancelled(&self, #[indexed] listing_id: u64);

    // Auction events
    #[event("auction_created")]
    fn emit_auction_created(
        &self,
        #[indexed] auction_id: u64,
        #[indexed] seller: &ManagedAddress,
        #[indexed] token_id: &TokenIdentifier,
        end_time: u64,
    );

    #[event("bid_placed")]
    fn emit_bid_placed(
        &self,
        #[indexed] auction_id: u64,
        #[indexed] bidder: &ManagedAddress,
        amount: &BigUint,
    );

    #[event("auction_won")]
    fn emit_auction_won(
        &self,
        #[indexed] auction_id: u64,
        #[indexed] winner: &ManagedAddress,
        final_price: &BigUint,
    );

    #[event("auction_cancelled")]
    fn emit_auction_cancelled(&self, #[indexed] auction_id: u64);
    
    #[event("auction_cancelled_no_bids")]
    fn emit_auction_cancelled_no_bids(&self, #[indexed] auction_id: u64);
}
