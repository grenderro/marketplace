#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

pub mod listing;
pub mod royalties;
pub mod auction;
pub mod offers;
pub mod batch;
pub mod pausable;

#[multiversx_sc::contract]
pub trait Marketplace:
    listing::ListingModule
    + royalties::RoyaltiesModule
    + auction::AuctionModule
    + offers::OffersModule
    + batch::BatchModule
    + pausable::PausableModule
{
    #[init]
    fn init(&self, royalties_percentage: u64, royalties_address: ManagedAddress) {
        self.royalties_percentage().set(royalties_percentage);
        self.royalties_claim_address().set(royalties_address);
        self.is_paused().set(false);
    }

    #[upgrade]
    fn upgrade(&self) {}

    // Events defined in the main contract
    #[event("listing_created")]
    fn listing_created_event(
        &self,
        #[indexed] listing_id: u64,
        #[indexed] seller: &ManagedAddress,
        #[indexed] nft_token_id: &TokenIdentifier,
        #[indexed] nft_nonce: u64,
        #[indexed] price: &BigUint,
    );

    #[event("listing_sold")]
    fn listing_sold_event(
        &self,
        #[indexed] listing_id: u64,
        #[indexed] buyer: &ManagedAddress,
        #[indexed] seller: &ManagedAddress,
        #[indexed] price: &BigUint,
    );

    #[event("offer_created")]
    fn offer_created_event(
        &self,
        #[indexed] offer_id: u64,
        #[indexed] creator: &ManagedAddress,
        #[indexed] nft_token_id: &TokenIdentifier,
        #[indexed] nft_nonce: u64,
    );

    #[event("offer_accepted")]
    fn offer_accepted_event(
        &self,
        #[indexed] offer_id: u64,
        #[indexed] acceptor: &ManagedAddress,
    );

    #[event("royalties_paid")]
    fn royalties_paid_event(
        &self,
        #[indexed] recipient: &ManagedAddress,
        #[indexed] amount: &BigUint,
        #[indexed] token_identifier: &EgldOrEsdtTokenIdentifier,
    );

    #[event("auction_created")]
    fn auction_created_event(
        &self,
        #[indexed] auction_id: u64,
        #[indexed] creator: &ManagedAddress,
        #[indexed] nft_token_id: &TokenIdentifier,
        #[indexed] min_bid: &BigUint,
        #[indexed] end_time: u64,
    );
}
