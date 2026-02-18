multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Auction<M: ManagedTypeApi> {
    pub creator: ManagedAddress<M>,
    pub nft_token_id: TokenIdentifier<M>,
    pub nft_nonce: u64,
    pub min_bid: BigUint<M>,
    pub highest_bid: BigUint<M>,
    pub highest_bidder: ManagedAddress<M>,
    pub end_time: u64,
    pub status: AuctionStatus,
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, Copy, PartialEq)]
pub enum AuctionStatus {
    Active,
    Ended,
    Cancelled,
}

#[multiversx_sc::module]
pub trait AuctionModule: 
    crate::pausable::PausableModule
{
    #[storage_mapper("auctions")]
    fn auctions(&self, auction_id: u64) -> SingleValueMapper<Auction<Self::Api>>;

    #[storage_mapper("auction_counter")]
    fn auction_counter(&self) -> SingleValueMapper<u64>;

    #[payable("*")]
    #[endpoint(createAuction)]
    fn create_auction(
        &self,
        nft_token_id: TokenIdentifier,
        nft_nonce: u64,
        min_bid: BigUint,
        end_time: u64,
    ) -> u64 {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();
        
        #[allow(deprecated)]
        let current_time: u64 = self.blockchain().get_block_timestamp();
        
        require!(end_time > current_time, "End time must be in the future");
        require!(min_bid > 0, "Min bid must be greater than 0");

        let payment = self.call_value().single_esdt();
        require!(payment.token_identifier == nft_token_id, "Wrong NFT");
        require!(payment.token_nonce == nft_nonce, "Wrong nonce");
        require!(payment.amount == 1u64, "Must send 1 NFT");

        let auction_id = self.auction_counter().get() + 1;

        let auction = Auction {
            creator: caller.clone(),
            nft_token_id: nft_token_id.clone(),
            nft_nonce,
            min_bid: min_bid.clone(),
            highest_bid: BigUint::zero(),
            highest_bidder: ManagedAddress::zero(),
            end_time,
            status: AuctionStatus::Active,
        };

        self.auctions(auction_id).set(auction);
        self.auction_counter().set(auction_id);
        
        // Note: Events are called from main contract, so we skip event here for now
        // or you can add a callback to main contract if needed
        
        auction_id
    }
}
