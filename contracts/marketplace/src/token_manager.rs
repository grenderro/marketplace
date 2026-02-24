// src/token_manager.rs
multiversx_sc::imports!();

#[multiversx_sc::module]
pub trait TokenManagerModule: crate::events::EventsModule {
    // Called by off-chain service to sync discovered tokens
    #[only_owner]
    #[endpoint(batchUpdateAcceptedTokens)]
    fn batch_update_accepted_tokens(
        &self,
        tokens_to_add: MultiValueEncoded<TokenIdentifier>,
        tokens_to_remove: MultiValueEncoded<TokenIdentifier>,
    ) {
        // Add new liquid tokens
        for token in tokens_to_add.iter() {
            if !self.accepted_payment_tokens().contains(&token) {
                self.accepted_payment_tokens().insert(token.clone());
                self.emit_token_added(&token);
            }
        }
        
        // Remove illiquid tokens
        for token in tokens_to_remove.iter() {
            if self.accepted_payment_tokens().contains(&token) {
                self.accepted_payment_tokens().swap_remove(&token);
                self.emit_token_removed(&token);
            }
        }
    }

    // Quick check if token is accepted
    #[view(isTokenAccepted)]
    fn is_token_accepted(&self, token: TokenIdentifier) -> bool {
        token.is_egld() || self.accepted_payment_tokens().contains(&token)
    }

    // Get all accepted tokens with metadata
    #[view(getAcceptedTokens)]
    fn get_accepted_tokens(&self) -> MultiValueEncoded<TokenIdentifier> {
        self.accepted_payment_tokens().iter().collect()
    }

    // Storage
    #[storage_mapper("accepted_payment_tokens")]
    fn accepted_payment_tokens(&self) -> UnorderedSetMapper<TokenIdentifier>;
    
    #[storage_mapper("token_metadata")]
    fn token_metadata(&self, token: &TokenIdentifier) -> SingleValueMapper<TokenMetadata<Self::Api>>;
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct TokenMetadata<M: ManagedTypeApi> {
    pub identifier: TokenIdentifier<M>,
    pub decimals: u32,
    pub price_usd: BigUint<M>,
    pub liquidity_usd: BigUint<M>,
    pub last_updated: u64,
}
