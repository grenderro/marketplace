// src/fiat_escrow.rs
multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum FiatProvider {
    MoonPay,
    Transak,
    RampNetwork,
    BinancePay,
    CryptoDotComPay,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct FiatEscrow<M: ManagedTypeApi> {
    pub escrow_id: u64,
    pub buyer_multiversx_address: ManagedAddress<M>,
    pub buyer_email_hash: ManagedBuffer<M>,      // Hashed email for privacy
    pub provider: FiatProvider,
    pub provider_transaction_id: ManagedBuffer<M>, // MoonPay/Transak tx ID
    pub fiat_amount: BigUint<M>,                  // In cents (USD, EUR, etc.)
    pub fiat_currency: ManagedBuffer<M>,          // "USD", "EUR", "GBP"
    pub crypto_equivalent: BigUint<M>,            // EGLD/ESDT amount
    pub crypto_token: TokenIdentifier<M>,         // Usually EGLD or USDC
    pub expected_nft: TokenIdentifier<M>,
    pub nft_nonce: u64,
    pub seller: ManagedAddress<M>,
    pub status: FiatEscrowStatus,
    pub created_at: u64,
    pub expires_at: u64,
    pub kyc_verified: bool,
    pub provider_fee: BigUint<M>,                 // Fee paid to on-ramp
    pub platform_fee: BigUint<M>,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum FiatEscrowStatus {
    PendingPayment,        // Waiting for user to complete fiat payment
    PaymentProcessing,     // Fiat payment received, crypto being purchased
    CryptoReceived,        // Crypto in escrow
    NftTransferred,        // NFT sent to buyer
    Completed,             // Funds released to seller
    Refunded,              // Fiat refund to user
    Failed,                // Payment failed
}

#[multiversx_sc::module]
pub trait FiatEscrowModule: 
    crate::events::EventsModule + 
    crate::RoyaltiesModule 
{
    // ============== CREATE FIAT ESCROW ==============

    #[endpoint(createFiatEscrow)]
    fn create_fiat_escrow(
        &self,
        provider: u8,                              // 0=MoonPay, 1=Transak, etc.
        fiat_amount: BigUint,                      // Amount in cents
        fiat_currency: ManagedBuffer,              // "USD", "EUR"
        expected_crypto_token: TokenIdentifier,    // EGLD or stablecoin
        expected_nft: TokenIdentifier,
        nft_nonce: u64,
        seller: ManagedAddress,
        buyer_email_hash: ManagedBuffer,
    ) -> u64 {
        let buyer = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();

        // Verify NFT is listed
        require!(
            self.is_nft_listed(&expected_nft, nft_nonce, &seller),
            "NFT not available"
        );

        // Verify provider is supported
        let provider_enum = match provider {
            0 => FiatProvider::MoonPay,
            1 => FiatProvider::Transak,
            2 => FiatProvider::RampNetwork,
            3 => FiatProvider::BinancePay,
            4 => FiatProvider::CryptoDotComPay,
            _ => sc_panic!("Invalid provider"),
        };

        let escrow_id = self.last_fiat_escrow_id().get() + 1;
        self.last_fiat_escrow_id().set(escrow_id);

        // Calculate crypto equivalent (would use oracle in production)
        let crypto_equivalent = self.calculate_crypto_equivalent(
            &fiat_amount,
            &fiat_currency,
            &expected_crypto_token,
        );

        // Calculate fees
        let provider_fee = &crypto_equivalent * self.get_provider_fee_percent(&provider_enum) / 10000u64;
        let platform_fee = &crypto_equivalent * self.fiat_platform_fee_percent().get() / 10000u64;

        let escrow = FiatEscrow {
            escrow_id,
            buyer_multiversx_address: buyer.clone(),
            buyer_email_hash,
            provider: provider_enum,
            provider_transaction_id: ManagedBuffer::new(), // Will be set later
            fiat_amount,
            fiat_currency,
            crypto_equivalent: crypto_equivalent.clone(),
            crypto_token: expected_crypto_token,
            expected_nft: expected_nft.clone(),
            nft_nonce,
            seller: seller.clone(),
            status: FiatEscrowStatus::PendingPayment,
            created_at: current_time,
            expires_at: current_time + 3600, // 1 hour to complete payment
            kyc_verified: false,
            provider_fee,
            platform_fee,
        };

        self.fiat_escrows(escrow_id).set(&escrow);

        self.emit_fiat_escrow_created(
            escrow_id,
            &buyer,
            &provider_enum,
            &fiat_amount,
            &fiat_currency,
        );

        escrow_id
    }

    // ============== CONFIRM FIAT PAYMENT (Called by provider webhook) ==============

    #[endpoint(confirmFiatPayment)]
    fn confirm_fiat_payment(
        &self,
        escrow_id: u64,
        provider_transaction_id: ManagedBuffer,
        crypto_amount_received: BigUint,
        kyc_verified: bool,
    ) {
        // Only authorized oracle can call
        require!(
            self.fiat_provider_oracles().contains(&self.blockchain().get_caller()),
            "Not authorized"
        );

        let mut escrow = self.fiat_escrows(escrow_id).get();
        
        require!(
            escrow.status == FiatEscrowStatus::PendingPayment ||
            escrow.status == FiatEscrowStatus::PaymentProcessing,
            "Invalid status"
        );

        escrow.provider_transaction_id = provider_transaction_id;
        escrow.kyc_verified = kyc_verified;
        
        // Verify crypto amount matches expected (with 5% slippage tolerance)
        let min_expected = &escrow.crypto_equivalent * 95u64 / 100u64;
        require!(
            crypto_amount_received >= min_expected,
            "Insufficient crypto received"
        );

        escrow.status = FiatEscrowStatus::CryptoReceived;
        self.fiat_escrows(escrow_id).set(&escrow);

        // Auto-execute NFT purchase
        self.execute_fiat_nft_purchase(escrow_id);
    }

    // ============== EXECUTE PURCHASE ==============

    fn execute_fiat_nft_purchase(&self, escrow_id: u64) {
        let mut escrow = self.fiat_escrows(escrow_id).get();
        
        require!(
            escrow.status == FiatEscrowStatus::CryptoReceived,
            "Crypto not received"
        );

        // Transfer NFT to buyer
        self.send().direct_esdt(
            &escrow.buyer_multiversx_address,
            &escrow.expected_nft,
            escrow.nft_nonce,
            &BigUint::from(1u64),
        );

        escrow.status = FiatEscrowStatus::NftTransferred;
        self.fiat_escrows(escrow_id).set(&escrow);

        // Release funds to seller
        self.release_fiat_funds_to_seller(escrow_id);
    }

    fn release_fiat_funds_to_seller(&self, escrow_id: u64) {
        let mut escrow = self.fiat_escrows(escrow_id).get();

        let total_fees = &escrow.provider_fee + &escrow.platform_fee;
        let seller_amount = &escrow.crypto_equivalent - &total_fees;

        // Pay seller
        self.send().direct_esdt(
            &escrow.seller,
            &escrow.crypto_token,
            0,
            &seller_amount,
        );

        // Pay platform fee
        if escrow.platform_fee > 0 {
            self.send().direct_esdt(
                &self.fee_address().get(),
                &escrow.crypto_token,
                0,
                &escrow.platform_fee,
            );
        }

        // Provider fee stays in contract for provider to claim
        // (or auto-forwarded based on provider config)

        escrow.status = FiatEscrowStatus::Completed;
        self.fiat_escrows(escrow_id).set(&escrow);

        self.emit_fiat_purchase_completed(
            escrow_id,
            &escrow.buyer_multiversx_address,
            &escrow.seller,
            &escrow.crypto_equivalent,
        );
    }

    // ============== REFUND HANDLING ==============

    #[endpoint(requestFiatRefund)]
    fn request_fiat_refund(&self, escrow_id: u64) {
        let escrow = self.fiat_escrows(escrow_id).get();
        let caller = self.blockchain().get_caller();

        require!(
            caller == escrow.buyer_multiversx_address ||
            self.fiat_provider_oracles().contains(&caller),
            "Not authorized"
        );

        require!(
            escrow.status == FiatEscrowStatus::PendingPayment ||
            escrow.status == FiatEscrowStatus::PaymentProcessing ||
            (escrow.status == FiatEscrowStatus::CryptoReceived && 
             self.blockchain().get_block_timestamp() > escrow.expires_at),
            "Cannot refund"
        );

        // If crypto already received, return to provider
        if escrow.status == FiatEscrowStatus::CryptoReceived {
            // Transfer crypto back to provider for fiat refund
            self.send().direct_esdt(
                &self.blockchain().get_caller(), // Provider oracle
                &escrow.crypto_token,
                0,
                &escrow.crypto_equivalent,
            );
        }

        // Update status
        let mut updated = escrow;
        updated.status = FiatEscrowStatus::Refunded;
        self.fiat_escrows(escrow_id).set(&updated);

        self.emit_fiat_refund(escrow_id, &escrow.buyer_multiversx_address);
    }

    // ============== VIEW FUNCTIONS ==============

    #[view(getFiatEscrow)]
    fn get_fiat_escrow(&self, escrow_id: u64) -> FiatEscrow<Self::Api> {
        self.fiat_escrows(escrow_id).get()
    }

    #[view(getProviderFeeEstimate)]
    fn get_provider_fee_estimate(
        &self,
        provider: u8,
        fiat_amount: BigUint,
    ) -> MultiValue2<BigUint, BigUint> { // (provider_fee, platform_fee)
        let provider_enum = match provider {
            0 => FiatProvider::MoonPay,
            1 => FiatProvider::Transak,
            2 => FiatProvider::RampNetwork,
            3 => FiatProvider::BinancePay,
            4 => FiatProvider::CryptoDotComPay,
            _ => sc_panic!("Invalid provider"),
        };

        let provider_fee_percent = self.get_provider_fee_percent(&provider_enum);
        let platform_fee_percent = self.fiat_platform_fee_percent().get();

        let provider_fee = &fiat_amount * provider_fee_percent / 10000u64;
        let platform_fee = &fiat_amount * platform_fee_percent / 10000u64;

        (provider_fee, platform_fee).into()
    }

    // ============== HELPERS ==============

    fn calculate_crypto_equivalent(
        &self,
        fiat_amount: &BigUint,
        fiat_currency: &ManagedBuffer,
        crypto_token: &TokenIdentifier,
    ) -> BigUint {
        // In production, this MUST query a price oracle.
        // This simplified version uses integer-only arithmetic.
        // Prices are in cents per token atomic unit (1e18).
        
        // Mock prices: EGLD = $40.00, Stablecoins = $1.00
        // Price per atomic unit = ($price * 100 cents) / 1e18
        // crypto_amount = fiat_cents * 1e18 / (price_usd * 100)
        
        let fiat_cents = fiat_amount.clone();
        let is_egld = crypto_token.to_string() == "EGLD";
        
        // EGLD: $40 = 4000 cents. 1 EGLD = 1e18 atomic units.
        // crypto = fiat_cents * 1e18 / 4000
        // Stable: $1 = 100 cents. crypto = fiat_cents * 1e18 / 100
        
        let price_cents_per_token: u64 = if is_egld { 4000 } else { 100 };
        let atomic_units_per_token: BigUint = BigUint::from(10u64).pow(18);
        
        let crypto_amount = (fiat_cents * atomic_units_per_token) / price_cents_per_token;
        crypto_amount
    }

    fn get_provider_fee_percent(&self, provider: &FiatProvider) -> u64 {
        match provider {
            FiatProvider::MoonPay => 499,      // 4.99%
            FiatProvider::Transak => 350,      // 3.50%
            FiatProvider::RampNetwork => 249,  // 2.49%
            FiatProvider::BinancePay => 100,   // 1.00%
            FiatProvider::CryptoDotComPay => 0, // 0% (promotional)
        }
    }

    fn is_nft_listed(
        &self,
        token_id: &TokenIdentifier,
        nonce: u64,
        seller: &ManagedAddress,
    ) -> bool {
        // Check main marketplace listing
        true // Simplified
    }

    // ============== STORAGE ==============

    #[storage_mapper("last_fiat_escrow_id")]
    fn last_fiat_escrow_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("fiat_escrows")]
    fn fiat_escrows(&self, id: u64) -> SingleValueMapper<FiatEscrow<Self::Api>>;

    #[storage_mapper("fiat_provider_oracles")]
    fn fiat_provider_oracles(&self) -> UnorderedSetMapper<ManagedAddress>;

    #[storage_mapper("fiat_platform_fee_percent")]
    fn fiat_platform_fee_percent(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("provider_fee_wallet")]
    fn provider_fee_wallet(&self, provider: &FiatProvider) -> SingleValueMapper<ManagedAddress>;
}
