multiversx_sc::imports!();

#[multiversx_sc::module]
pub trait RoyaltiesModule {
    #[storage_mapper("royalties_percentage")]
    fn royalties_percentage(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("royalties_claim_address")]
    fn royalties_claim_address(&self) -> SingleValueMapper<ManagedAddress>;

    fn calculate_royalties(&self, amount: &BigUint) -> BigUint {
        let percentage = self.royalties_percentage().get();
        amount * percentage / 10_000u64
    }

    #[endpoint(setRoyaltiesPercentage)]
    fn set_royalties_percentage(&self, percentage: u64) {
        require!(percentage <= 10_000, "Invalid percentage");
        self.royalties_percentage().set(percentage);
    }

    #[endpoint(setRoyaltiesClaimAddress)]
    fn set_royalties_claim_address(&self, address: ManagedAddress) {
        self.royalties_claim_address().set(address);
    }

    fn execute_trade_with_royalties(
        &self,
        buyer: &ManagedAddress,
        seller: &ManagedAddress,
        nft_token_id: &TokenIdentifier,
        nft_nonce: u64,
        payment_token: &EgldOrEsdtTokenIdentifier,
        payment_nonce: u64,
        payment_amount: &BigUint,
    ) {
        let royalty_amount = self.calculate_royalties(payment_amount);
        let seller_amount = payment_amount - &royalty_amount;
        let royalty_address = self.royalties_claim_address().get();

        self.send().direct_esdt(
            buyer,
            nft_token_id,
            nft_nonce,
            &BigUint::from(1u64),
        );

        if seller_amount > 0 {
            self.send().direct(
                seller,
                payment_token,
                payment_nonce,
                &seller_amount,
            );
        }

        if royalty_amount > 0 {
            self.send().direct(
                &royalty_address,
                payment_token,
                payment_nonce,
                &royalty_amount,
            );
        }
    }
}
