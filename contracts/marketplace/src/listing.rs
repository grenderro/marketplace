multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Listing<M: ManagedTypeApi> {
    pub owner: ManagedAddress<M>,
    pub nft_token_id: TokenIdentifier<M>,
    pub nft_nonce: u64,
    pub price: BigUint<M>,
    pub status: ListingStatus,
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, Copy, PartialEq)]
pub enum ListingStatus {
    Active,
    Sold,
    Cancelled,
}

#[multiversx_sc::module]
pub trait ListingModule: 
    crate::pausable::PausableModule 
    + crate::royalties::RoyaltiesModule
{
    #[storage_mapper("listings")]
    fn listings(&self, listing_id: u64) -> SingleValueMapper<Listing<Self::Api>>;

    #[storage_mapper("listing_counter")]
    fn listing_counter(&self) -> SingleValueMapper<u64>;

    // VIEW FUNCTION - Place it here inside the trait
    #[view(getListing)]
    fn get_listing(&self, listing_id: u64) -> Listing<Self::Api> {
        self.listings(listing_id).get()
    }

    #[payable("*")]
    #[endpoint(createListing)]
    fn create_listing(
        &self,
        nft_token_id: TokenIdentifier,
        nft_nonce: u64,
        price: BigUint,
    ) -> u64 {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();
        
        let payment = self.call_value().single_esdt();
        require!(payment.token_identifier == nft_token_id, "Wrong token sent");
        require!(payment.token_nonce == nft_nonce, "Wrong nonce");
        require!(payment.amount == BigUint::from(1u32), "Must send exactly 1 NFT");
        
        let listing_id = self.listing_counter().get() + 1;

        let listing = Listing {
            owner: caller.clone(),
            nft_token_id: nft_token_id.clone(),
            nft_nonce,
            price: price.clone(),
            status: ListingStatus::Active,
        };

        self.listings(listing_id).set(listing);
        self.listing_counter().set(listing_id);
        
        listing_id
    }

    #[payable("*")]
    #[endpoint(buyListing)]
    fn buy_listing(&self, listing_id: u64) {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();
        let listing = self.listings(listing_id).get();
        
        require!(listing.status == ListingStatus::Active, "Listing not active");
        require!(listing.owner != caller, "Cannot buy your own listing");

        let payment = self.call_value().egld_or_single_esdt();
        require!(payment.amount >= listing.price, "Insufficient payment");

        self.execute_trade_with_royalties(
            &caller,
            &listing.owner,
            &listing.nft_token_id,
            listing.nft_nonce,
            &payment.token_identifier,
            payment.token_nonce,
            &listing.price,
        );

        let mut updated_listing = listing.clone();
        updated_listing.status = ListingStatus::Sold;
        self.listings(listing_id).set(updated_listing);
    }

    #[endpoint(cancelListing)]
    fn cancel_listing(&self, listing_id: u64) {
        let caller = self.blockchain().get_caller();
        let listing = self.listings(listing_id).get();
        
        require!(caller == listing.owner, "Not owner");
        require!(listing.status == ListingStatus::Active, "Not active");

        self.send().direct_esdt(
            &caller,
            &listing.nft_token_id,
            listing.nft_nonce,
            &BigUint::from(1u64),
        );

        let mut updated_listing = listing;
        updated_listing.status = ListingStatus::Cancelled;
        self.listings(listing_id).set(updated_listing);
    }
}
