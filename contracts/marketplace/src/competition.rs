// src/competition.rs
multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Competition<M: ManagedTypeApi> {
    pub competition_id: u64,
    pub name: ManagedBuffer<M>,
    pub description: ManagedBuffer<M>,
    pub start_time: u64,
    pub end_time: u64,
    pub status: CompetitionStatus,
    pub scoring_type: ScoringType,
    pub min_volume_threshold: BigUint<M>, // Minimum volume to qualify
    pub prizes: ManagedVec<Prize<M>, M>,
    pub total_participants: u64,
    pub total_volume: BigUint<M>,
    pub total_trades: u64,
    pub created_at: u64,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum CompetitionStatus {
    Upcoming,
    Active,
    Ended,
    Cancelled,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum ScoringType {
    Volume,        // Total buy + sell volume
    BuysOnly,      // Only buy volume
    SellsOnly,     // Only sell volume
    TradeCount,    // Number of trades
    UniqueNfts,    // Unique NFTs bought/sold
    Profit,        // Profit from flips (advanced)
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Prize<M: ManagedTypeApi> {
    pub rank: u32,                    // 1, 2, 3, etc.
    pub prize_type: PrizeType<M>,
    pub description: ManagedBuffer<M>,
    pub claimed: bool,
    pub winner: OptionalValue<ManagedAddress<M>>,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub enum PrizeType<M: ManagedTypeApi> {
    Egld { amount: BigUint<M> },
    Esdt { token: TokenIdentifier<M>, amount: BigUint<M> },
    Nft { collection: TokenIdentifier<M>, nonce: u64 },
    Custom { metadata: ManagedBuffer<M> }, // Physical items, whitelist spots, etc.
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Participant<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub tag: ManagedBuffer<M>,           // Optional username/tag
    pub total_volume: BigUint<M>,
    pub buy_volume: BigUint<M>,
    pub sell_volume: BigUint<M>,
    pub trade_count: u64,
    pub unique_nfts_bought: u64,
    pub unique_nfts_sold: u64,
    pub last_updated: u64,
    pub rank: u32,
}

#[multiversx_sc::module]
pub trait CompetitionModule: crate::events::EventsModule + crate::RoyaltiesModule {
    // ============== CREATE COMPETITION ==============

    #[only_owner]
    #[endpoint(createCompetition)]
    fn create_competition(
        &self,
        name: ManagedBuffer,
        description: ManagedBuffer,
        duration_seconds: u64,
        scoring_type: u8,                  // 0=Volume, 1=BuysOnly, etc.
        min_volume_threshold: BigUint,
        prizes_data: MultiValueEncoded<MultiValue3<u32, u8, ManagedBuffer>>, // (rank, prize_type, description)
    ) -> u64 {
        let current_time = self.blockchain().get_block_timestamp();
        
        require!(duration_seconds >= 86400, "Minimum 1 day duration"); // Min 1 day
        require!(duration_seconds <= 2592000, "Maximum 30 days");      // Max 30 days

        let competition_id = self.last_competition_id().get() + 1;
        self.last_competition_id().set(competition_id);

        // Parse prizes
        let mut prizes = ManagedVec::new();
        for prize_data in prizes_data.iter() {
            let (rank, prize_type_code, description) = prize_data.into_tuple();
            
            let prize_type = match prize_type_code {
                0 => PrizeType::Egld { amount: BigUint::zero() },
                1 => PrizeType::Esdt { 
                    token: TokenIdentifier::from(&b"WEGLD-d7c6bb"[..]), 
                    amount: BigUint::zero() 
                },
                2 => PrizeType::Nft { 
                    collection: TokenIdentifier::from(&b""[..]), 
                    nonce: 0 
                },
                _ => PrizeType::Custom { metadata: ManagedBuffer::new() },
            };

            prizes.push(Prize {
                rank,
                prize_type,
                description,
                claimed: false,
                winner: OptionalValue::None,
            });
        }

        let competition = Competition {
            competition_id,
            name,
            description,
            start_time: current_time,
            end_time: current_time + duration_seconds,
            status: CompetitionStatus::Active,
            scoring_type: match scoring_type {
                0 => ScoringType::Volume,
                1 => ScoringType::BuysOnly,
                2 => ScoringType::SellsOnly,
                3 => ScoringType::TradeCount,
                4 => ScoringType::UniqueNfts,
                5 => ScoringType::Profit,
                _ => ScoringType::Volume,
            },
            min_volume_threshold,
            prizes,
            total_participants: 0,
            total_volume: BigUint::zero(),
            total_trades: 0,
            created_at: current_time,
        };

        self.competitions(competition_id).set(&competition);
        self.active_competition().set(&competition_id);

        self.emit_competition_created(competition_id, &competition.start_time, &competition.end_time);

        competition_id
    }

    // ============== UPDATE PRIZE DETAILS ==============

    #[only_owner]
    #[endpoint(setPrizeDetails)]
    fn set_prize_details(
        &self,
        competition_id: u64,
        rank: u32,
        prize_type: u8,
        amount: BigUint,
        token_identifier: OptionalValue<TokenIdentifier>,
        metadata: OptionalValue<ManagedBuffer>,
    ) {
        require!(!self.competitions(competition_id).is_empty(), "Competition not found");
        let mut competition = self.competitions(competition_id).get();
        
        require!(competition.status == CompetitionStatus::Upcoming, "Can only modify upcoming");

        // Find and update prize
        let mut updated_prizes = ManagedVec::new();
        for prize in competition.prizes.iter() {
            if prize.rank == rank {
                let new_prize_type = match prize_type {
                    0 => PrizeType::Egld { amount: amount.clone() },
                    1 => PrizeType::Esdt { 
                        token: token_identifier.into_option().unwrap_or_else(|| TokenIdentifier::from(&b""[..])),
                        amount: amount.clone(),
                    },
                    2 => PrizeType::Nft {
                        collection: token_identifier.into_option().unwrap_or_else(|| TokenIdentifier::from(&b""[..])),
                        nonce: amount.to_u64().unwrap_or(0),
                    },
                    _ => PrizeType::Custom { 
                        metadata: metadata.into_option().unwrap_or_else(|| ManagedBuffer::new()) 
                    },
                };

                updated_prizes.push(Prize {
                    rank,
                    prize_type: new_prize_type,
                    description: prize.description,
                    claimed: false,
                    winner: OptionalValue::None,
                });
            } else {
                updated_prizes.push(prize);
            }
        }

        competition.prizes = updated_prizes;
        self.competitions(competition_id).set(&competition);

        self.emit_prize_updated(competition_id, rank);
    }

    // ============== RECORD TRADE (Called by marketplace) ==============

    #[endpoint(recordTrade)]
    fn record_trade(
        &self,
        competition_id: u64,
        trader: ManagedAddress,
        is_buy: bool,
        volume: BigUint,
        nft_identifier: TokenIdentifier,
        nft_nonce: u64,
    ) {
        // Only callable by marketplace contract
        require!(
            self.blockchain().get_caller() == self.marketplace_contract().get(),
            "Only marketplace"
        );

        let mut competition = self.competitions(competition_id).get();
        
        require!(competition.status == CompetitionStatus::Active, "Not active");
        
        let current_time = self.blockchain().get_block_timestamp();
        require!(current_time <= competition.end_time, "Ended");

        // Get or create participant
        let mut participant = if self.participants(competition_id, &trader).is_empty() {
            Participant {
                address: trader.clone(),
                tag: self.get_user_tag(&trader),
                total_volume: BigUint::zero(),
                buy_volume: BigUint::zero(),
                sell_volume: BigUint::zero(),
                trade_count: 0,
                unique_nfts_bought: 0,
                unique_nfts_sold: 0,
                last_updated: current_time,
                rank: 0,
            }
        } else {
            self.participants(competition_id, &trader).get()
        };

        // Update stats based on trade type
        participant.total_volume += &volume;
        participant.trade_count += 1;
        participant.last_updated = current_time;

        if is_buy {
            participant.buy_volume += &volume;
            // Track unique NFTs bought
            if !self.has_bought_nft(competition_id, &trader, &nft_identifier, nft_nonce) {
                participant.unique_nfts_bought += 1;
                self.mark_nft_bought(competition_id, &trader, &nft_identifier, nft_nonce);
            }
        } else {
            participant.sell_volume += &volume;
            if !self.has_sold_nft(competition_id, &trader, &nft_identifier, nft_nonce) {
                participant.unique_nfts_sold += 1;
                self.mark_nft_sold(competition_id, &trader, &nft_identifier, nft_nonce);
            }
        }

        // Save participant
        self.participants(competition_id, &trader).set(&participant);
        
        // Update competition totals
        competition.total_volume += &volume;
        competition.total_trades += 1;
        
        // Update unique participant count
        if participant.trade_count == 1 {
            competition.total_participants += 1;
        }
        
        self.competitions(competition_id).set(&competition);

        self.emit_trade_recorded(competition_id, &trader, &volume, is_buy);
    }

    // ============== GET LEADERBOARD ==============

    #[view(getLeaderboard)]
    fn get_leaderboard(
        &self,
        competition_id: u64,
        top_n: u32,
    ) -> MultiValueEncoded<Participant<Self::Api>> {
        require!(!self.competitions(competition_id).is_empty(), "Not found");
        let competition = self.competitions(competition_id).get();

        // Collect all participants
        let mut participants: ManagedVec<Participant<Self::Api>> = ManagedVec::new();
        
        // In production, this would be optimized with indexed storage
        // For now, we iterate (limited by gas for large competitions)
        // Better approach: Off-chain indexing with Merkle proofs
        
        // Return top N by score
        let sorted = self.sort_participants(&participants, &competition.scoring_type);
        
        let mut result = MultiValueEncoded::new();
        for i in 0..top_n.min(sorted.len() as u32) {
            if let Some(p) = sorted.get(i as usize) {
                result.push(p);
            }
        }
        
        result
    }

    // ============== CLAIM PRIZE ==============

    #[endpoint(claimPrize)]
    fn claim_prize(&self, competition_id: u64) {
        let competition = self.competitions(competition_id).get();
        require!(competition.status == CompetitionStatus::Ended, "Not ended");

        let caller = self.blockchain().get_caller();
        let participant = self.participants(competition_id, &caller).get();
        
        require!(participant.rank > 0 && participant.rank <= 10, "Not in top 10");

        // Find prize for this rank
        for prize in competition.prizes.iter() {
            if prize.rank == participant.rank && !prize.claimed {
                // Transfer prize
                self.transfer_prize(&caller, &prize.prize_type);
                
                // Mark as claimed
                // (Would need to update storage - simplified here)
                
                self.emit_prize_claimed(competition_id, participant.rank, &caller);
                return;
            }
        }

        sc_panic!("Prize already claimed or not found");
    }

    // ============== END COMPETITION ==============

    #[only_owner]
    #[endpoint(endCompetition)]
    fn end_competition(&self, competition_id: u64) {
        let current_time = self.blockchain().get_block_timestamp();
        let mut competition = self.competitions(competition_id).get();
        
        require!(current_time >= competition.end_time, "Not yet ended");
        require!(competition.status == CompetitionStatus::Active, "Already ended");

        // Finalize rankings
        self.finalize_rankings(competition_id);

        competition.status = CompetitionStatus::Ended;
        self.competitions(competition_id).set(&competition);
        self.active_competition().clear();

        self.emit_competition_ended(competition_id);
    }

    // ============== HELPER FUNCTIONS ==============

    fn get_user_tag(&self, address: &ManagedAddress) -> ManagedBuffer {
        if self.user_tags(address).is_empty() {
            // Return shortened address as default tag
            let addr_str = address.to_string();
            ManagedBuffer::from(&addr_str.as_bytes()[..10])
        } else {
            self.user_tags(address).get()
        }
    }

    fn sort_participants(
        &self,
        participants: &ManagedVec<Participant<Self::Api>>,
        scoring_type: &ScoringType,
    ) -> ManagedVec<Participant<Self::Api>> {
        // Simplified - in production use proper sorting
        // This would be done off-chain with verification
        participants.clone()
    }

    fn finalize_rankings(&self, competition_id: u64) {
        // Assign final ranks to top participants
        // Update prize winners
    }

    fn transfer_prize(&self, winner: &ManagedAddress, prize_type: &PrizeType<Self::Api>) {
        match prize_type {
            PrizeType::Egld { amount } => {
                self.send().direct_egld(winner, amount);
            },
            PrizeType::Esdt { token, amount } => {
                self.send().direct_esdt(winner, token, 0, amount);
            },
            PrizeType::Nft { collection, nonce } => {
                self.send().direct_esdt(winner, collection, *nonce, &BigUint::from(1u64));
            },
            PrizeType::Custom { .. } => {
                // Custom prizes handled off-chain
            },
        }
    }

    fn has_bought_nft(&self, competition_id: u64, user: &ManagedAddress, collection: &TokenIdentifier, nonce: u64) -> bool {
        !self.nft_bought_tracker(competition_id, user, collection, nonce).is_empty()
    }

    fn mark_nft_bought(&self, competition_id: u64, user: &ManagedAddress, collection: &TokenIdentifier, nonce: u64) {
        self.nft_bought_tracker(competition_id, user, collection, nonce).set(&true);
    }

    fn has_sold_nft(&self, competition_id: u64, user: &ManagedAddress, collection: &TokenIdentifier, nonce: u64) -> bool {
        !self.nft_sold_tracker(competition_id, user, collection, nonce).is_empty()
    }

    fn mark_nft_sold(&self, competition_id: u64, user: &ManagedAddress, collection: &TokenIdentifier, nonce: u64) {
        self.nft_sold_tracker(competition_id, user, collection, nonce).set(&true);
    }

    // ============== VIEWS ==============

    #[view(getActiveCompetition)]
    fn get_active_competition(&self) -> OptionalValue<Competition<Self::Api>> {
        if self.active_competition().is_empty() {
            OptionalValue::None
        } else {
            let id = self.active_competition().get();
            OptionalValue::Some(self.competitions(id).get())
        }
    }

    #[view(getTimeRemaining)]
    fn get_time_remaining(&self, competition_id: u64) -> u64 {
        let competition = self.competitions(competition_id).get();
        let current = self.blockchain().get_block_timestamp();
        
        if current >= competition.end_time {
            0
        } else {
            competition.end_time - current
        }
    }

    #[view(getParticipantStats)]
    fn get_participant_stats(
        &self,
        competition_id: u64,
        address: ManagedAddress,
    ) -> OptionalValue<Participant<Self::Api>> {
        if self.participants(competition_id, &address).is_empty() {
            OptionalValue::None
        } else {
            OptionalValue::Some(self.participants(competition_id, &address).get())
        }
    }

    // ============== STORAGE ==============

    #[storage_mapper("last_competition_id")]
    fn last_competition_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("competitions")]
    fn competitions(&self, id: u64) -> SingleValueMapper<Competition<Self::Api>>;

    #[storage_mapper("active_competition")]
    fn active_competition(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("participants")]
    fn participants(&self, competition_id: u64, address: &ManagedAddress) -> SingleValueMapper<Participant<Self::Api>>;

    #[storage_mapper("user_tags")]
    fn user_tags(&self, address: &ManagedAddress) -> SingleValueMapper<ManagedBuffer>;

    #[storage_mapper("marketplace_contract")]
    fn marketplace_contract(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("nft_bought_tracker")]
    fn nft_bought_tracker(&self, competition_id: u64, user: &ManagedAddress, collection: &TokenIdentifier, nonce: u64) -> SingleValueMapper<bool>;

    #[storage_mapper("nft_sold_tracker")]
    fn nft_sold_tracker(&self, competition_id: u64, user: &ManagedAddress, collection: &TokenIdentifier, nonce: u64) -> SingleValueMapper<bool>;
}
