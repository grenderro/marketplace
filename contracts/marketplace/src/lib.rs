// src/lib.rs - Full Marketplace Contract
#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Listing<M: ManagedTypeApi> {
    pub listing_id: u64,
    pub seller: ManagedAddress<M>,
    pub token_id: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub amount: BigUint<M>,
    pub price_token: TokenIdentifier<M>,
    pub price_amount: BigUint<M>,
    pub created_at: u64,
    pub active: bool,
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Auction<M: ManagedTypeApi> {
    pub auction_id: u64,
    pub seller: ManagedAddress<M>,
    pub token_id: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub amount: BigUint<M>,
    pub min_bid: BigUint<M>,
    pub highest_bid: BigUint<M>,
    pub highest_bidder: Option<ManagedAddress<M>>,
    pub end_time: u64,
    pub payment_token: TokenIdentifier<M>,
    pub active: bool,
}

#[multiversx_sc::contract]
pub trait Marketplace {
    #[init]
    fn init(
        &self,
        fee_percent: u64,
        fee_address: ManagedAddress,
    ) {
        require!(fee_percent <= 1000, "Max 10% fee");
        self.fee_percent().set(fee_percent);
        self.fee_address().set(fee_address);
        self.listing_id().set(0);
        self.auction_id().set(0);
    }

    #[payable("*")]
    #[endpoint(createListing)]
    fn create_listing(
        &self,
        price_token: TokenIdentifier,
        price_amount: BigUint,
    ) -> u64 {
        let payment = self.call_value().single_esdt();
        let caller = self.blockchain().get_caller();

        let id = self.listing_id().get() + 1;
        self.listing_id().set(id);

        self.listings(id).set(Listing {
            listing_id: id,
            seller: caller,
            token_id: payment.token_identifier.clone(),
            token_nonce: payment.token_nonce,
            amount: payment.amount.clone(),
            price_token,
            price_amount,
            created_at: self.blockchain().get_block_timestamp(),
            active: true,
        });

        id
    }

    #[payable("*")]
    #[endpoint(buyListing)]
    fn buy_listing(&self, listing_id: u64) {
        let payment = self.call_value().single_esdt();
        let buyer = self.blockchain().get_caller();

        let listing = self.listings(listing_id).get();
        require!(listing.active, "Not active");
        require!(listing.seller != buyer, "Can't buy own");
        require!(payment.token_identifier == listing.price_token, "Wrong token");
        require!(payment.amount >= listing.price_amount, "Insufficient");

        let fee = &listing.price_amount * self.fee_percent().get() / 10000u64;
        let seller_amount = &listing.price_amount - &fee;

        self.send().direct_esdt(
            &listing.seller,
            &listing.price_token,
            0,
            &seller_amount,
        );

        if fee > 0 {
            self.send().direct_esdt(
                &self.fee_address().get(),
                &listing.price_token,
                0,
                &fee,
            );
        }

        self.send().direct_esdt(
            &buyer,
            &listing.token_id,
            listing.token_nonce,
            &listing.amount,
        );

        if payment.amount > listing.price_amount {
            let excess = payment.amount.clone() - &listing.price_amount;
            self.send().direct_esdt(&buyer, &payment.token_identifier, 0, &excess);
        }

        self.listings(listing_id).update(|l| l.active = false);
    }

    #[endpoint(cancelListing)]
    fn cancel_listing(&self, listing_id: u64) {
        let caller = self.blockchain().get_caller();
        let listing = self.listings(listing_id).get();

        require!(listing.seller == caller, "Not seller");
        require!(listing.active, "Not active");

        self.send().direct_esdt(
            &caller,
            &listing.token_id,
            listing.token_nonce,
            &listing.amount,
        );

        self.listings(listing_id).update(|l| l.active = false);
    }

    #[payable("*")]
    #[endpoint(createAuction)]
    fn create_auction(
        &self,
        min_bid: BigUint,
        duration_seconds: u64,
        payment_token: TokenIdentifier,
    ) -> u64 {
        let payment = self.call_value().single_esdt();
        let caller = self.blockchain().get_caller();
        let end_time = self.blockchain().get_block_timestamp() + duration_seconds;

        let id = self.auction_id().get() + 1;
        self.auction_id().set(id);

        self.auctions(id).set(Auction {
            auction_id: id,
            seller: caller,
            token_id: payment.token_identifier.clone(),
            token_nonce: payment.token_nonce,
            amount: payment.amount.clone(),
            min_bid,
            highest_bid: BigUint::zero(),
            highest_bidder: None,
            end_time,
            payment_token,
            active: true,
        });

        id
    }

    #[payable("*")]
    #[endpoint(placeBid)]
    fn place_bid(&self, auction_id: u64) {
        let payment = self.call_value().single_esdt();
        let bidder = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();

        let auction = self.auctions(auction_id).get();
        require!(auction.active, "Not active");
        require!(current_time < auction.end_time, "Ended");
        require!(auction.seller != bidder, "Can't bid own");
        require!(payment.token_identifier == auction.payment_token, "Wrong token");

        let min_bid = if auction.highest_bid > 0 {
            &auction.highest_bid + (&auction.highest_bid / 10u64)
        } else {
            auction.min_bid.clone()
        };

        require!(payment.amount >= min_bid, "Bid too low");

        // Refund previous bidder
        if let Some(ref prev_bidder) = auction.highest_bidder {
            self.send().direct_esdt(
                prev_bidder,
                &auction.payment_token,
                0,
                &auction.highest_bid,
            );
        }

        self.auctions(auction_id).update(|a| {
            a.highest_bid = payment.amount.clone();
            a.highest_bidder = Some(bidder);
        });
    }

    #[endpoint(endAuction)]
    fn end_auction(&self, auction_id: u64) {
        let current_time = self.blockchain().get_block_timestamp();
        let auction = self.auctions(auction_id).get();

        require!(auction.active, "Not active");
        require!(current_time >= auction.end_time, "Not ended");

        if let Some(ref winner) = auction.highest_bidder {
            let fee = &auction.highest_bid * self.fee_percent().get() / 10000u64;
            let seller_amount = &auction.highest_bid - &fee;

            self.send().direct_esdt(
                &auction.seller,
                &auction.payment_token,
                0,
                &seller_amount,
            );

            if fee > 0 {
                self.send().direct_esdt(
                    &self.fee_address().get(),
                    &auction.payment_token,
                    0,
                    &fee,
                );
            }

            self.send().direct_esdt(
                winner,
                &auction.token_id,
                auction.token_nonce,
                &auction.amount,
            );
        } else {
            // Return NFT to seller if no bids
            self.send().direct_esdt(
                &auction.seller,
                &auction.token_id,
                auction.token_nonce,
                &auction.amount,
            );
        }

        self.auctions(auction_id).update(|a| a.active = false);
    }

    #[view(getListing)]
    fn get_listing(&self, id: u64) -> Listing<Self::Api> {
        self.listings(id).get()
    }

    #[view(getAuction)]
    fn get_auction(&self, id: u64) -> Auction<Self::Api> {
        self.auctions(id).get()
    }

    #[storage_mapper("fee_percent")]
    fn fee_percent(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("fee_address")]
    fn fee_address(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("listing_id")]
    fn listing_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("listings")]
    fn listings(&self, id: u64) -> SingleValueMapper<Listing<Self::Api>>;

    #[storage_mapper("auction_id")]
    fn auction_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("auctions")]
    fn auctions(&self, id: u64) -> SingleValueMapper<Auction<Self::Api>>;
}
