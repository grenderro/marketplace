// src/listing.rs
multiversx_sc::imports!();
multiversx_sc::derive_imports!();

use crate::{Payment, TokenType};

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Listing<M: ManagedTypeApi> {
    pub listing_id: u64,
    pub seller: ManagedAddress<M>,
    pub token: Payment<M>,
    pub price: Payment<M>,           // Asking price
    pub listing_type: TokenType,
    pub created_at: u64,
    pub status: ListingStatus,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum ListingStatus {
    Active,
    Sold,
    Cancelled,
}

#[multiversx_sc::module]
pub trait ListingModule: crate::events::EventsModule + crate::Marketplace {
    // Create fixed-price listing
    #[payable("*")]
    #[endpoint(createListing)]
    fn create_listing(
        &self,
        price_token: TokenIdentifier,
        price_amount: BigUint,
        price_nonce: OptionalValue<u64>,
    ) -> u64 {
        let payment = self.call_value().single_esdt();
        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();
        
        require!(
            self.accepted_payment_tokens().contains(&price_token),
            "Payment token not accepted"
        );
        
        let listing_type = if payment.token_nonce == 0 {
            TokenType::Fungible
        } else {
            TokenType::NonFungible
        };
        
        let price_nonce = price_nonce.into_option().unwrap_or(0);
        
        let listing_id = self.last_listing_id().get() + 1;
        self.last_listing_id().set(listing_id);
        
        let listing = Listing {
            listing_id,
            seller: caller.clone(),
            token: Payment {
                token_identifier: payment.token_identifier.clone(),
                token_nonce: payment.token_nonce,
                amount: payment.amount.clone(),
            },
            price: Payment {
                token_identifier: price_token,
                token_nonce: price_nonce,
                amount: price_amount,
            },
            listing_type,
            created_at: current_time,
            status: ListingStatus::Active,
        };
        
        self.listings(listing_id).set(listing);
        self.emit_listing_created(listing_id, &caller, &payment.token_identifier, payment.token_nonce);
        
        listing_id
    }

    // Buy listing at fixed price
    #[payable("*")]
    #[endpoint(buyListing)]
    fn buy_listing(&self, listing_id: u64) {
        let payment = self.call_value().single_esdt();
        let buyer = self.blockchain().get_caller();
        
        require!(self.listings(listing_id).is_empty(), "Listing not found");
        let mut listing = self.listings(listing_id).get();
        
        require!(listing.status == ListingStatus::Active, "Listing not active");
        require!(listing.seller != buyer, "Cannot buy own listing");
        require!(
            payment.token_identifier == listing.price.token_identifier,
            "Wrong payment token"
        );
        require!(
            payment.token_nonce == listing.price.token_nonce,
            "Wrong payment nonce"
        );
        require!(
            payment.amount >= listing.price.amount,
            "Insufficient payment"
        );
        
        // Calculate fees
        let fee_amount = &listing.price.amount * self.fee_percent().get() / 10000u64;
        let seller_amount = &listing.price.amount - &fee_amount;
        
        // Transfer to seller
        self.send().direct_esdt(
            &listing.seller,
            &listing.price.token_identifier,
            listing.price.token_nonce,
            &seller_amount,
        );
        
        // Transfer fee to platform
        if fee_amount > 0 {
            self.send().direct_esdt(
                &self.fee_address().get(),
                &listing.price.token_identifier,
                listing.price.token_nonce,
                &fee_amount,
            );
        }
        
        // Transfer NFT/ESDT to buyer
        self.send().direct_esdt(
            &buyer,
            &listing.token.token_identifier,
            listing.token.token_nonce,
            &listing.token.amount,
        );
        
        // Refund excess payment if any
        if payment.amount > listing.price.amount {
            let excess = payment.amount - &listing.price.amount;
            self.send().direct_esdt(
                &buyer,
                &payment.token_identifier,
                payment.token_nonce,
                &excess,
            );
        }
        
        listing.status = ListingStatus::Sold;
        self.listings(listing_id).set(listing);
        
        self.emit_listing_sold(listing_id, &buyer, &listing.price.amount);
    }

    // Cancel listing (only seller)
    #[endpoint(cancelListing)]
    fn cancel_listing(&self, listing_id: u64) {
        let caller = self.blockchain().get_caller();
        require!(self.listings(listing_id).is_empty(), "Listing not found");
        
        let mut listing = self.listings(listing_id).get();
        require!(listing.seller == caller, "Not the seller");
        require!(listing.status == ListingStatus::Active, "Not active");
        
        // Return tokens to seller
        self.send().direct_esdt(
            &caller,
            &listing.token.token_identifier,
            listing.token.token_nonce,
            &listing.token.amount,
        );
        
        listing.status = ListingStatus::Cancelled;
        self.listings(listing_id).set(listing);
        
        self.emit_listing_cancelled(listing_id);
    }

    // Storage mappers
    #[view(getLastListingId)]
    #[storage_mapper("last_listing_id")]
    fn last_listing_id(&self) -> SingleValueMapper<u64>;

    #[view(getListing)]
    #[storage_mapper("listings")]
    fn listings(&self, id: u64) -> SingleValueMapper<Listing<Self::Api>>;
}
