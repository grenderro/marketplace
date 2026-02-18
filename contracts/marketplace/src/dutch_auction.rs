// src/dutch_auction.rs
multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct DutchAuction<M: ManagedTypeApi> {
    pub auction_id: u64,
    pub seller: ManagedAddress<M>,
    pub token: Payment<M>,
    pub start_price: BigUint<M>,
    pub end_price: BigUint<M>,
    pub start_time: u64,
    pub end_time: u64,
    pub price_drop_interval: u64,
    pub price_drop_amount: BigUint<M>,
    pub payment_token: TokenIdentifier<M>,
    pub status: DutchAuctionStatus,
    pub buyer: Option<ManagedAddress<M>>,
    pub final_price: BigUint<M>,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum DutchAuctionStatus {
    Active,
    Sold,
    Ended,
    Cancelled,
}

#[multiversx_sc::module]
pub trait DutchAuctionModule: 
    crate::events::EventsModule 
    + crate::RoyaltiesModule 
{
    // Create Dutch auction (price decreases over time)
    #[payable("*")]
    #[endpoint(createDutchAuction)]
    fn create_dutch_auction(
        &self,
        payment_token: TokenIdentifier,
        start_price: BigUint,
        end_price: BigUint,
        duration_seconds: u64,
        price_drop_interval: u64,
        num_price_drops: u32,
    ) -> u64 {
        let payment = self.call_value().single_esdt();
        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();
        
        require!(
            !payment_token.is_egld() || self.accepted_payment_tokens().contains(&payment_token),
            "Payment token not accepted"
        );
        require!(start_price > end_price, "Start price must be > end price");
        require!(duration_seconds >= 300, "Duration too short"); // Min 5 minutes
        require!(price_drop_interval >= 60, "Drop interval too short"); // Min 1 minute
        require!(num_price_drops > 0 && num_price_drops <= 100, "Invalid drop count");
        
        // FIX: Integer division check
        let price_diff = &start_price - &end_price;
        let price_drop_amount = &price_diff / num_price_drops;
        
        require!(price_drop_amount > 0, "Price drop too small");
        require!(
            &price_drop_amount * num_price_drops <= price_diff,
            "Math overflow check"
        );
        
        let auction_id = self.last_dutch_auction_id().get() + 1;
        self.last_dutch_auction_id().set(auction_id);
        
        let auction = DutchAuction {
            auction_id,
            seller: caller.clone(),
            token: Payment {
                token_identifier: payment.token_identifier.clone(),
                token_nonce: payment.token_nonce,
                amount: payment.amount.clone(),
            },
            start_price,
            end_price,
            start_time: current_time,
            end_time: current_time + duration_seconds,
            price_drop_interval,
            price_drop_amount,
            payment_token,
            status: DutchAuctionStatus::Active,
            buyer: None,
            final_price: BigUint::zero(),
        };
        
        self.dutch_auctions(auction_id).set(auction);
        self.emit_dutch_auction_created(auction_id, &caller, &payment.token_identifier, &start_price);
        
        auction_id
    }

    // Get current price based on time elapsed
    #[view(getCurrentPrice)]
    fn get_current_price(&self, auction_id: u64) -> BigUint {
        // FIX: Correct logic - check if NOT empty
        require!(!self.dutch_auctions(auction_id).is_empty(), "Auction not found");
        
        let auction = self.dutch_auctions(auction_id).get();
        
        if auction.status != DutchAuctionStatus::Active {
            return auction.final_price.clone();
        }
        
        let current_time = self.blockchain().get_block_timestamp();
        
        if current_time >= auction.end_time {
            return auction.end_price.clone();
        }
        
        let elapsed = current_time - auction.start_time;
        let drops_occurred = elapsed / auction.price_drop_interval;
        
        // Prevent overflow
        if drops_occurred >= 10000 {
            return auction.end_price.clone();
        }
        
        let total_drop = &auction.price_drop_amount * drops_occurred as u32;
        
        if total_drop >= auction.start_price {
            auction.end_price.clone()
        } else {
            &auction.start_price - &total_drop
        }
    }

    // Buy at current price
    #[payable("*")]
    #[endpoint(buyDutchAuction)]
    fn buy_dutch_auction(&self, auction_id: u64) {
        let payment = self.call_value().single_esdt();
        let buyer = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();
        
        // FIX: Correct logic check
        require!(!self.dutch_auctions(auction_id).is_empty(), "Auction not found");
        
        let mut auction = self.dutch_auctions(auction_id).get();
        
        require!(auction.status == DutchAuctionStatus::Active, "Auction not active");
        require!(current_time < auction.end_time, "Auction ended");
        require!(auction.seller != buyer, "Cannot buy own auction");
        require!(
            auction.buyer.is_none(),
            "Already purchased"
        );
        
        let current_price = self.get_current_price(auction_id);
        
        require!(
            payment.token_identifier == auction.payment_token,
            "Wrong payment token"
        );
        require!(payment.amount >= current_price, "Insufficient payment");
        
        // Calculate fees
        let fee_percent = self.fee_percent().get();
        let fee_amount = &current_price * fee_percent / 10000u64;
        let seller_amount = &current_price - &fee_amount;
        
        // Handle royalties
        let collection_id = self.extract_collection_id(&auction.token.token_identifier);
        
        if !self.royalty_configs(&collection_id).is_empty() {
            let config = self.royalty_configs(&collection_id).get();
            let royalty_amount = &current_price * config.royalty_percent / 10000u64;
            let seller_after_royalty = &seller_amount - &royalty_amount;
            
            // Pay seller minus royalty
            if seller_after_royalty > 0 {
                self.send().direct_esdt(
                    &auction.seller,
                    &auction.payment_token,
                    0,
                    &seller_after_royalty,
                );
            }
            
            // Pay royalty
            if royalty_amount > 0 {
                self.send().direct_esdt(
                    &config.creator,
                    &auction.payment_token,
                    0,
                    &royalty_amount,
                );
            }
        } else {
            // No royalty
            if seller_amount > 0 {
                self.send().direct_esdt(
                    &auction.seller,
                    &auction.payment_token,
                    0,
                    &seller_amount,
                );
            }
        }
        
        // Pay platform fee
        if fee_amount > 0 {
            self.send().direct_esdt(
                &self.fee_address().get(),
                &auction.payment_token,
                0,
                &fee_amount,
            );
        }
        
        // Transfer NFT to buyer
        self.send().direct_esdt(
            &buyer,
            &auction.token.token_identifier,
            auction.token.token_nonce,
            &auction.token.amount,
        );
        
        // Refund excess payment
        if payment.amount > current_price {
            let excess = &payment.amount - &current_price;
            self.send().direct_esdt(
                &buyer,
                &payment.token_identifier,
                0,
                &excess,
            );
        }
        
        auction.buyer = Some(buyer.clone());
        auction.final_price = current_price;
        auction.status = DutchAuctionStatus::Sold;
        self.dutch_auctions(auction_id).set(auction);
        
        self.emit_dutch_auction_sold(auction_id, &buyer, &current_price);
    }

    // Cancel auction
    #[endpoint(cancelDutchAuction)]
    fn cancel_dutch_auction(&self, auction_id: u64) {
        let caller = self.blockchain().get_caller();
        
        // FIX: Correct logic check
        require!(!self.dutch_auctions(auction_id).is_empty(), "Auction not found");
        
        let mut auction = self.dutch_auctions(auction_id).get();
        require!(auction.seller == caller, "Not the seller");
        require!(auction.status == DutchAuctionStatus::Active, "Not active");
        require!(auction.buyer.is_none(), "Already purchased");
        
        // Return token to seller
        self.send().direct_esdt(
            &caller,
            &auction.token.token_identifier,
            auction.token.token_nonce,
            &auction.token.amount,
        );
        
        auction.status = DutchAuctionStatus::Cancelled;
        self.dutch_auctions(auction_id).set(auction);
        
        self.emit_dutch_auction_cancelled(auction_id);
    }

    // Storage mappers
    #[view(getLastDutchAuctionId)]
    #[storage_mapper("last_dutch_auction_id")]
    fn last_dutch_auction_id(&self) -> SingleValueMapper<u64>;

    #[view(getDutchAuction)]
    #[storage_mapper("dutch_auctions")]
    fn dutch_auctions(&self, id: u64) -> SingleValueMapper<DutchAuction<Self::Api>>;
    
    // Required dependencies (add these to your main contract)
    #[view(getFeePercent)]
    #[storage_mapper("fee_percent")]
    fn fee_percent(&self) -> SingleValueMapper<u64>;
    
    #[view(getFeeAddress)]
    #[storage_mapper("fee_address")]
    fn fee_address(&self) -> SingleValueMapper<ManagedAddress<Self::Api>>;
    
    #[storage_mapper("accepted_payment_tokens")]
    fn accepted_payment_tokens(&self) -> SetMapper<TokenIdentifier<Self::Api>>;
    
    fn extract_collection_id(&self, token_id: &TokenIdentifier<Self::Api>) -> TokenIdentifier<Self::Api> {
        // Extract collection ID from token identifier (remove nonce if ESDT)
        token_id.clone()
    }
    
    // Events module interface
    fn emit_dutch_auction_created(
        &self,
        auction_id: u64,
        seller: &ManagedAddress<Self::Api>,
        token_id: &TokenIdentifier<Self::Api>,
        start_price: &BigUint<Self::Api>,
    );
    
    fn emit_dutch_auction_sold(
        &self,
        auction_id: u64,
        buyer: &ManagedAddress<Self::Api>,
        price: &BigUint<Self::Api>,
    );
    
    fn emit_dutch_auction_cancelled(&self, auction_id: u64);
}
