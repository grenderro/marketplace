multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct OfferPayment<M: ManagedTypeApi> {
    pub token_identifier: EgldOrEsdtTokenIdentifier<M>,
    pub token_nonce: u64,
    pub amount: BigUint<M>,
}

impl<M: ManagedTypeApi> OfferPayment<M> {
    pub fn new(
        token_identifier: EgldOrEsdtTokenIdentifier<M>, 
        token_nonce: u64, 
        amount: BigUint<M>
    ) -> Self {
        OfferPayment {
            token_identifier,
            token_nonce,
            amount,
        }
    }
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Offer<M: ManagedTypeApi> {
    pub creator: ManagedAddress<M>,
    pub nft_token_id: TokenIdentifier<M>,
    pub nft_nonce: u64,
    pub token_wanted: OfferPayment<M>,
    pub payment_offered: OfferPayment<M>,
    pub counter_offer: Option<OfferPayment<M>>,
    pub expiry: u64,
}

#[multiversx_sc::module]
pub trait OffersModule: 
    crate::pausable::PausableModule 
    + crate::royalties::RoyaltiesModule
{
    #[storage_mapper("offers")]
    fn offers(&self, offer_id: u64) -> SingleValueMapper<Offer<Self::Api>>;

    #[storage_mapper("offer_counter")]
    fn offer_counter(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("accepted_payment_tokens")]
    fn accepted_payment_tokens(&self) -> UnorderedSetMapper<TokenIdentifier>;

    #[endpoint(createOffer)]
    fn create_offer(
        &self,
        nft_token_id: TokenIdentifier,
        nft_nonce: u64,
        token_wanted: OfferPayment<Self::Api>,
        expiry: u64,
    ) -> u64 {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();
        
        #[allow(deprecated)]
        let current_time: u64 = self.blockchain().get_block_timestamp();
        
        require!(expiry > current_time, "Expiry must be in future");

        let payment = self.call_value().single_esdt();
        require!(payment.token_identifier == nft_token_id, "Wrong NFT");
        require!(payment.token_nonce == nft_nonce, "Wrong nonce");
        require!(payment.amount == 1u64, "Must send 1 NFT");

        if !token_wanted.token_identifier.is_egld() {
            let token_id = token_wanted.token_identifier.clone().unwrap_esdt();
            require!(
                self.accepted_payment_tokens().contains(&token_id),
                "Token not accepted"
            );
        }

        let offer_id = self.offer_counter().get() + 1;

        let offer = Offer {
            creator: caller.clone(),
            nft_token_id: nft_token_id.clone(),
            nft_nonce,
            token_wanted: token_wanted.clone(),
            payment_offered: OfferPayment::new(
                EgldOrEsdtTokenIdentifier::esdt(payment.token_identifier.clone()),
                payment.token_nonce,
                payment.amount.clone(),
            ),
            counter_offer: None,
            expiry,
        };

        self.offers(offer_id).set(offer);
        self.offer_counter().set(offer_id);
        
        // Note: Event would be called from main contract
        
        offer_id
    }

    #[payable("*")]
    #[endpoint(acceptOffer)]
    fn accept_offer(&self, offer_id: u64) {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();
        let offer = self.offers(offer_id).get();
        
        #[allow(deprecated)]
        let current_time: u64 = self.blockchain().get_block_timestamp();
        
        require!(current_time < offer.expiry, "Expired");

        let payment = self.call_value().egld_or_single_esdt();
        
        require!(
            payment.token_identifier == offer.token_wanted.token_identifier,
            "Wrong token"
        );
        require!(payment.amount >= offer.token_wanted.amount, "Insufficient");

        self.send().direct_esdt(
            &caller,
            &offer.nft_token_id,
            offer.nft_nonce,
            &BigUint::from(1u64),
        );

        self.send().direct(
            &offer.creator,
            &payment.token_identifier,
            payment.token_nonce,
            &payment.amount,
        );

        self.offers(offer_id).clear();
    }

    #[endpoint(cancelOffer)]
    fn cancel_offer(&self, offer_id: u64) {
        let caller = self.blockchain().get_caller();
        let offer = self.offers(offer_id).get();
        
        require!(caller == offer.creator, "Not creator");

        self.send().direct_esdt(
            &caller,
            &offer.nft_token_id,
            offer.nft_nonce,
            &BigUint::from(1u64),
        );

        self.offers(offer_id).clear();
    }
}
