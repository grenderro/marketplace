// src/cex_escrow.rs
multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct CexEscrow<M: ManagedTypeApi> {
    pub escrow_id: u64,
    pub buyer: ManagedAddress<M>,           // MultiversX address (NFT receiver)
    pub cex_user_id: ManagedBuffer<M>,      // Binance user ID hash
    pub token_identifier: TokenIdentifier<M>,
    pub amount: BigUint<M>,
    pub expected_nft: TokenIdentifier<M>,
    pub nft_nonce: u64,
    pub seller: ManagedAddress<M>,
    pub status: EscrowStatus,
    pub created_at: u64,
    pub expires_at: u64,
    pub cex_source: CexSource,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum EscrowStatus {
    PendingDeposit,      // Waiting for CEX withdrawal
    FundsReceived,       // Funds in escrow
    NftTransferred,      // NFT sent to buyer
    Completed,           // Funds released to seller
    Expired,             // Timed out
    Refunded,            // Funds returned to CEX
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum CexSource {
    Binance,
    CryptoDotCom,
    Okx,
    Bybit,
    Other,
}

#[multiversx_sc::module]
pub trait CexEscrowModule: crate::events::EventsModule + crate::RoyaltiesModule {
    // ============== INITIATE CEX PURCHASE ==============

    #[endpoint(initiateCexPurchase)]
    fn initiate_cex_purchase(
        &self,
        cex_user_id: ManagedBuffer,         // Hashed Binance user ID
        token_identifier: TokenIdentifier,   // Payment token (EGLD, USDT, etc.)
        amount: BigUint,
        expected_nft: TokenIdentifier,       // NFT they want to buy
        nft_nonce: u64,
        seller: ManagedAddress,
        cex_source: u8,                      // 0=Binance, 1=Crypto.com, etc.
    ) -> u64 {
        let buyer = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();
        
        // Verify NFT is listed (check main marketplace)
        require!(
            self.is_nft_listed(&expected_nft, nft_nonce, &seller),
            "NFT not available"
        );

        let escrow_id = self.last_escrow_id().get() + 1;
        self.last_escrow_id().set(escrow_id);

        let escrow = CexEscrow {
            escrow_id,
            buyer: buyer.clone(),
            cex_user_id,
            token_identifier: token_identifier.clone(),
            amount: amount.clone(),
            expected_nft: expected_nft.clone(),
            nft_nonce,
            seller: seller.clone(),
            status: EscrowStatus::PendingDeposit,
            created_at: current_time,
            expires_at: current_time + 3600, // 1 hour timeout
            cex_source: match cex_source {
                0 => CexSource::Binance,
                1 => CexSource::CryptoDotCom,
                2 => CexSource::Okx,
                3 => CexSource::Bybit,
                _ => CexSource::Other,
            },
        };

        self.escrows(escrow_id).set(escrow);
        
        // Generate unique deposit address for this CEX user
        let deposit_address = self.generate_deposit_address(escrow_id);
        self.escrow_deposit_address(escrow_id).set(&deposit_address);

        self.emit_cex_purchase_initiated(
            escrow_id,
            &buyer,
            &cex_user_id,
            &token_identifier,
            &amount,
        );

        escrow_id
    }

    // ============== CONFIRM CEX DEPOSIT (Called by oracle/relayer) ==============

    #[endpoint(confirmCexDeposit)]
    fn confirm_cex_deposit(&self, escrow_id: u64, tx_proof: ManagedBuffer) {
        // Only oracle can call this
        require!(
            self.oracle_addresses().contains(&self.blockchain().get_caller()),
            "Only oracle"
        );

        let mut escrow = self.escrows(escrow_id).get();
        require!(
            escrow.status == EscrowStatus::PendingDeposit,
            "Invalid status"
        );
        require!(
            self.blockchain().get_block_timestamp() < escrow.expires_at,
            "Expired"
        );

        // Verify tx_proof (contains CEX transaction confirmation)
        require!(
            self.verify_cex_transaction(&escrow, &tx_proof),
            "Invalid proof"
        );

        // Check funds received at deposit address
        let deposit_address = self.escrow_deposit_address(escrow_id).get();
        let balance = self.blockchain().get_balance(&deposit_address);
        
        require!(balance >= escrow.amount, "Insufficient funds received");

        escrow.status = EscrowStatus::FundsReceived;
        self.escrows(escrow_id).set(&escrow);

        // Auto-execute NFT purchase
        self.execute_cex_nft_purchase(escrow_id);
    }

    // ============== EXECUTE PURCHASE ==============

    fn execute_cex_nft_purchase(&self, escrow_id: u64) {
        let mut escrow = self.escrows(escrow_id).get();
        require!(
            escrow.status == EscrowStatus::FundsReceived,
            "Funds not received"
        );

        // Get NFT from seller (must be approved to contract)
        self.send().direct_esdt(
            &self.blockchain().get_sc_address(),
            &escrow.expected_nft,
            escrow.nft_nonce,
            &BigUint::from(1u64),
        );

        // Transfer NFT to buyer
        self.send().direct_esdt(
            &escrow.buyer,
            &escrow.expected_nft,
            escrow.nft_nonce,
            &BigUint::from(1u64),
        );

        escrow.status = EscrowStatus::NftTransferred;
        self.escrows(escrow_id).set(&escrow);

        // Release funds to seller (minus fees)
        self.release_funds_to_seller(escrow_id);
    }

    fn release_funds_to_seller(&self, escrow_id: u64) {
        let mut escrow = self.escrows(escrow_id).get();
        
        // Calculate fees
        let fee = &escrow.amount * self.fee_percent().get() / 10000u64;
        let seller_amount = &escrow.amount - &fee;

        // Pay seller
        self.send().direct_esdt(
            &escrow.seller,
            &escrow.token_identifier,
            0,
            &seller_amount,
        );

        // Pay platform fee
        if fee > 0 {
            self.send().direct_esdt(
                &self.fee_address().get(),
                &escrow.token_identifier,
                0,
                &fee,
            );
        }

        escrow.status = EscrowStatus::Completed;
        self.escrows(escrow_id).set(&escrow);

        self.emit_cex_purchase_completed(escrow_id, &escrow.buyer, &escrow.seller);
    }

    // ============== REFUND (If NFT no longer available) ==============

    #[endpoint(refundCexPurchase)]
    fn refund_cex_purchase(&self, escrow_id: u64) {
        let mut escrow = self.escrows(escrow_id).get();
        
        require!(
            escrow.status == EscrowStatus::PendingDeposit || 
            escrow.status == EscrowStatus::FundsReceived,
            "Cannot refund"
        );

        // Only oracle or after expiry
        let caller = self.blockchain().get_caller();
        require!(
            self.oracle_addresses().contains(&caller) ||
            (caller == escrow.buyer && self.blockchain().get_block_timestamp() > escrow.expires_at),
            "Not authorized"
        );

        // Return funds to CEX (via bridge/relay)
        // This triggers a withdrawal back to user's CEX account
        
        escrow.status = EscrowStatus::Refunded;
        self.escrows(escrow_id).set(&escrow);

        self.emit_cex_refund(escrow_id, &escrow.buyer, &escrow.amount);
    }

    // ============== VIEW FUNCTIONS ==============

    #[view(getEscrow)]
    fn get_escrow(&self, escrow_id: u64) -> CexEscrow<Self::Api> {
        self.escrows(escrow_id).get()
    }

    #[view(getEscrowDepositAddress)]
    fn get_escrow_deposit_address(&self, escrow_id: u64) -> ManagedAddress<Self::Api> {
        self.escrow_deposit_address(escrow_id).get()
    }

    #[view(getActiveEscrowsForUser)]
    fn get_active_escrows_for_user(
        &self,
        user: ManagedAddress,
    ) -> MultiValueEncoded<u64> {
        let mut result = ManagedVec::new();
        
        // Iterate through recent escrows (last 1000)
        let last_id = self.last_escrow_id().get();
        let start = if last_id > 1000 { last_id - 1000 } else { 1 };
        
        for id in start..=last_id {
            if !self.escrows(id).is_empty() {
                let escrow = self.escrows(id).get();
                if escrow.buyer == user && 
                   (escrow.status == EscrowStatus::PendingDeposit || 
                    escrow.status == EscrowStatus::FundsReceived) {
                    result.push(id);
                }
            }
        }
        
        result.into()
    }

    // ============== HELPERS ==============

    fn generate_deposit_address(&self, escrow_id: u64) -> ManagedAddress {
        // Generate deterministic address based on escrow_id
        // In production, this would use a derivation scheme
        let mut bytes = ManagedBuffer::new();
        bytes.append(&ManagedBuffer::from(b"cex_escrow_"));
        bytes.append(&escrow_id.to_be_bytes().as_slice().into());
        
        // Hash to get address
        let hash = self.crypto().sha256(&bytes);
        ManagedAddress::from(hash.as_managed_buffer())
    }

    fn verify_cex_transaction(
        &self,
        escrow: &CexEscrow<Self::Api>,
        proof: &ManagedBuffer,
    ) -> bool {
        // Verify cryptographic proof from CEX oracle
        // Implementation depends on CEX's proof format
        true // Simplified
    }

    fn is_nft_listed(
        &self,
        token_id: &TokenIdentifier,
        nonce: u64,
        seller: &ManagedAddress,
    ) -> bool {
        // Check against main marketplace listings
        // This would integrate with ListingModule
        true // Simplified
    }

    // ============== STORAGE ==============

    #[storage_mapper("last_escrow_id")]
    fn last_escrow_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("escrows")]
    fn escrows(&self, id: u64) -> SingleValueMapper<CexEscrow<Self::Api>>;

    #[storage_mapper("escrow_deposit_address")]
    fn escrow_deposit_address(&self, id: u64) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("oracle_addresses")]
    fn oracle_addresses(&self) -> UnorderedSetMapper<ManagedAddress>;

    #[storage_mapper("fee_percent")]
    fn fee_percent(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("fee_address")]
    fn fee_address(&self) -> SingleValueMapper<ManagedAddress>;
}
