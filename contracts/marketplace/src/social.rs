// src/social.rs
multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum ReportReason {
    Spam,
    Scam,
    FakeCollection,
    CopyrightViolation,
    InappropriateContent,
    PriceManipulation,
    WashTrading,
    Other,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct LikeData<M: ManagedTypeApi> {
    pub user: ManagedAddress<M>,
    pub timestamp: u64,
    pub target_type: TargetType,
    pub target_id: ManagedBuffer<M>, // NFT identifier, collection, or user address
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct ReportData<M: ManagedTypeApi> {
    pub report_id: u64,
    pub reporter: ManagedAddress<M>,
    pub reported_item: ManagedBuffer<M>, // NFT, collection, or user
    pub item_type: TargetType,
    pub reason: ReportReason,
    pub description: ManagedBuffer<M>,
    pub evidence_url: OptionalValue<ManagedBuffer<M>>,
    pub timestamp: u64,
    pub status: ReportStatus,
    pub moderator_notes: ManagedBuffer<M>,
    pub resolved_by: OptionalValue<ManagedAddress<M>>,
    pub resolution_time: OptionalValue<u64>,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum TargetType {
    Nft,
    Collection,
    User,
    Listing,
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq)]
pub enum ReportStatus {
    Pending,
    UnderReview,
    ResolvedValid,      // Report was correct, action taken
    ResolvedInvalid,    // Report was false
    Escalated,          // Needs higher level review
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct UserReputation<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub likes_received: u64,
    pub likes_given: u64,
    pub reports_received: u64,
    pub reports_filed: u64,
    pub successful_reports: u64, // Reports that were validated
    pub reputation_score: i64,   // Calculated score
    pub is_verified: bool,
    pub is_banned: bool,
    pub ban_reason: ManagedBuffer<M>,
    pub ban_until: OptionalValue<u64>,
}

#[multiversx_sc::module]
pub trait SocialModule: crate::events::EventsModule {
    // ============== LIKE FUNCTIONS ==============

    #[endpoint(likeItem)]
    fn like_item(
        &self,
        target_type: u8,              // 0=NFT, 1=Collection, 2=User, 3=Listing
        target_id: ManagedBuffer,     // Identifier
    ) {
        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();

        // Check not banned
        require!(!self.is_user_banned(&caller), "User banned");

        let target_type_enum = self.decode_target_type(target_type);

        // Check not already liked
        require!(
            !self.has_liked(&caller, &target_type_enum, &target_id),
            "Already liked"
        );

        // Record like
        let like_data = LikeData {
            user: caller.clone(),
            timestamp: current_time,
            target_type: target_type_enum.clone(),
            target_id: target_id.clone(),
        };

        let like_key = self.generate_like_key(&caller, &target_type_enum, &target_id);
        self.likes(like_key).set(&like_data);

        // Update like counts
        self.item_likes(&target_type_enum, &target_id).update(|count| *count += 1);
        self.user_likes_received(&self.extract_owner(&target_type_enum, &target_id)).update(|count| *count += 1);
        self.user_likes_given(&caller).update(|count| *count += 1);

        // Update reputation
        self.update_reputation(&caller, 1, 0);

        self.emit_like_added(&caller, &target_type_enum, &target_id);
    }

    #[endpoint(unlikeItem)]
    fn unlike_item(
        &self,
        target_type: u8,
        target_id: ManagedBuffer,
    ) {
        let caller = self.blockchain().get_caller();
        let target_type_enum = self.decode_target_type(target_type);

        let like_key = self.generate_like_key(&caller, &target_type_enum, &target_id);
        
        require!(!self.likes(like_key).is_empty(), "Not liked");

        // Remove like
        self.likes(like_key).clear();

        // Update counts
        self.item_likes(&target_type_enum, &target_id).update(|count| *count -= 1);
        self.user_likes_received(&self.extract_owner(&target_type_enum, &target_id)).update(|count| *count -= 1);
        self.user_likes_given(&caller).update(|count| *count -= 1);

        self.emit_like_removed(&caller, &target_type_enum, &target_id);
    }

    // ============== REPORT FUNCTIONS ==============

    #[endpoint(reportItem)]
    fn report_item(
        &self,
        target_type: u8,
        target_id: ManagedBuffer,
        reason: u8,                   // ReportReason as u8
        description: ManagedBuffer,
        evidence_url: OptionalValue<ManagedBuffer>,
    ) -> u64 {
        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();

        // Check not banned
        require!(!self.is_user_banned(&caller), "Reporter banned");

        let target_type_enum = self.decode_target_type(target_type);
        let reason_enum = self.decode_report_reason(reason);

        // Check not already reported by this user
        require!(
            !self.has_reported(&caller, &target_type_enum, &target_id),
            "Already reported"
        );

        // Check not reporting self
        if target_type_enum == TargetType::User {
            let reported_address = ManagedAddress::from(target_id.to_address().unwrap_or_else(|| sc_panic!("Invalid address")));
            require!(reported_address != caller, "Cannot report self");
        }

        let report_id = self.last_report_id().get() + 1;
        self.last_report_id().set(report_id);

        let report = ReportData {
            report_id,
            reporter: caller.clone(),
            reported_item: target_id.clone(),
            item_type: target_type_enum.clone(),
            reason: reason_enum,
            description,
            evidence_url,
            timestamp: current_time,
            status: ReportStatus::Pending,
            moderator_notes: ManagedBuffer::new(),
            resolved_by: OptionalValue::None,
            resolution_time: OptionalValue::None,
        };

        self.reports(report_id).set(&report);
        self.user_reports_filed(&caller).update(|count| *count += 1);
        self.item_reports(&target_type_enum, &target_id).insert(report_id);

        // Auto-flag if threshold reached
        let report_count = self.item_reports(&target_type_enum, &target_id).len();
        if report_count >= 5 {
            self.flagged_items(&target_type_enum, &target_id).set(&true);
            self.emit_item_flagged(&target_type_enum, &target_id, report_count);
        }

        self.emit_report_filed(report_id, &caller, &target_type_enum, &target_id);

        report_id
    }

    // ============== MODERATOR FUNCTIONS ==============

    #[only_owner]
    #[endpoint(resolveReport)]
    fn resolve_report(
        &self,
        report_id: u64,
        is_valid: bool,
        notes: ManagedBuffer,
    ) {
        let mut report = self.reports(report_id).get();
        require!(report.status == ReportStatus::Pending, "Already resolved");

        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();

        report.status = if is_valid {
            ReportStatus::ResolvedValid
        } else {
            ReportStatus::ResolvedInvalid
        };
        report.moderator_notes = notes;
        report.resolved_by = OptionalValue::Some(caller.clone());
        report.resolution_time = OptionalValue::Some(current_time);

        self.reports(report_id).set(&report);

        // Update reporter reputation if valid
        if is_valid {
            self.user_successful_reports(&report.reporter).update(|count| *count += 1);
            self.update_reputation(&report.reporter, 5, 0); // Bonus for valid report
            
            // Update reported user reputation
            let reported_owner = self.extract_owner(&report.item_type, &report.reported_item);
            self.update_reputation(&reported_owner, 0, -10);
            self.user_reports_received(&reported_owner).update(|count| *count += 1);
        }

        self.emit_report_resolved(report_id, is_valid, &caller);
    }

    #[only_owner]
    #[endpoint(banUser)]
    fn ban_user(
        &self,
        user: ManagedAddress,
        reason: ManagedBuffer,
        duration_seconds: OptionalValue<u64>,
    ) {
        let current_time = self.blockchain().get_block_timestamp();
        let ban_until = duration_seconds.into_option().map(|d| current_time + d);

        let mut reputation = self.get_or_create_reputation(&user);
        reputation.is_banned = true;
        reputation.ban_reason = reason;
        reputation.ban_until = ban_until.into();

        self.user_reputation(&user).set(&reputation);

        self.emit_user_banned(&user, ban_until);
    }

    #[only_owner]
    #[endpoint(unbanUser)]
    fn unban_user(&self, user: ManagedAddress) {
        let mut reputation = self.user_reputation(&user).get();
        reputation.is_banned = false;
        reputation.ban_reason = ManagedBuffer::new();
        reputation.ban_until = OptionalValue::None;

        self.user_reputation(&user).set(&reputation);
        self.emit_user_unbanned(&user);
    }

    #[only_owner]
    #[endpoint(verifyUser)]
    fn verify_user(&self, user: ManagedAddress) {
        let mut reputation = self.get_or_create_reputation(&user);
        reputation.is_verified = true;
        self.user_reputation(&user).set(&reputation);
        self.emit_user_verified(&user);
    }

    // ============== REPUTATION SYSTEM ==============

    fn update_reputation(&self, user: &ManagedAddress, likes_delta: i64, reports_delta: i64) {
        let mut reputation = self.get_or_create_reputation(user);
        
        // Calculate score: likes +5, valid reports +10, invalid reports -5, bans -100
        reputation.reputation_score += likes_delta * 5 + reports_delta;
        
        self.user_reputation(user).set(&reputation);
    }

    fn get_or_create_reputation(&self, user: &ManagedAddress) -> UserReputation<Self::Api> {
        if self.user_reputation(user).is_empty() {
            UserReputation {
                address: user.clone(),
                likes_received: 0,
                likes_given: 0,
                reports_received: 0,
                reports_filed: 0,
                successful_reports: 0,
                reputation_score: 0,
                is_verified: false,
                is_banned: false,
                ban_reason: ManagedBuffer::new(),
                ban_until: OptionalValue::None,
            }
        } else {
            self.user_reputation(user).get()
        }
    }

    // ============== VIEW FUNCTIONS ==============

    #[view(getItemLikes)]
    fn get_item_likes(
        &self,
        target_type: u8,
        target_id: ManagedBuffer,
    ) -> u64 {
        let target_type_enum = self.decode_target_type(target_type);
        self.item_likes(&target_type_enum, &target_id).get()
    }

    #[view(hasLiked)]
    fn has_liked_view(
        &self,
        user: ManagedAddress,
        target_type: u8,
        target_id: ManagedBuffer,
    ) -> bool {
        let target_type_enum = self.decode_target_type(target_type);
        self.has_liked(&user, &target_type_enum, &target_id)
    }

    #[view(getUserReputation)]
    fn get_user_reputation(&self, user: ManagedAddress) -> UserReputation<Self::Api> {
        self.get_or_create_reputation(&user)
    }

    #[view(getPendingReports)]
    fn get_pending_reports(&self, offset: u64, limit: u64) -> MultiValueEncoded<ReportData<Self::Api>> {
        let mut result = MultiValueEncoded::new();
        let last_id = self.last_report_id().get();
        
        let start = last_id.saturating_sub(offset);
        let end = start.saturating_sub(limit).max(1);

        for id in (end..=start).rev() {
            if !self.reports(id).is_empty() {
                let report = self.reports(id).get();
                if report.status == ReportStatus::Pending {
                    result.push(report);
                }
            }
        }

        result
    }

    #[view(getFlaggedItems)]
    fn get_flagged_items(&self) -> MultiValueEncoded<MultiValue2<u8, ManagedBuffer>> {
        // Returns list of (target_type, target_id) that are flagged
        // Implementation would iterate storage
        MultiValueEncoded::new()
    }

    // ============== HELPERS ==============

    fn decode_target_type(&self, code: u8) -> TargetType {
        match code {
            0 => TargetType::Nft,
            1 => TargetType::Collection,
            2 => TargetType::User,
            3 => TargetType::Listing,
            _ => sc_panic!("Invalid target type"),
        }
    }

    fn decode_report_reason(&self, code: u8) -> ReportReason {
        match code {
            0 => ReportReason::Spam,
            1 => ReportReason::Scam,
            2 => ReportReason::FakeCollection,
            3 => ReportReason::CopyrightViolation,
            4 => ReportReason::InappropriateContent,
            5 => ReportReason::PriceManipulation,
            6 => ReportReason::WashTrading,
            _ => ReportReason::Other,
        }
    }

    fn generate_like_key(
        &self,
        user: &ManagedAddress,
        target_type: &TargetType,
        target_id: &ManagedBuffer,
    ) -> ManagedBuffer {
        let mut key = ManagedBuffer::new();
        key.append(&user.to_managed_buffer());
        key.append(&target_type.to_managed_buffer());
        key.append(target_id);
        key
    }

    fn has_liked(
        &self,
        user: &ManagedAddress,
        target_type: &TargetType,
        target_id: &ManagedBuffer,
    ) -> bool {
        let key = self.generate_like_key(user, target_type, target_id);
        !self.likes(key).is_empty()
    }

    fn has_reported(
        &self,
        user: &ManagedAddress,
        target_type: &TargetType,
        target_id: &ManagedBuffer,
    ) -> bool {
        // Check in user's reports
        // Simplified - would need proper indexing
        false
    }

    fn is_user_banned(&self, user: &ManagedAddress) -> bool {
        if self.user_reputation(user).is_empty() {
            return false;
        }
        let rep = self.user_reputation(user).get();
        
        if !rep.is_banned {
            return false;
        }

        // Check if ban expired
        if let OptionalValue::Some(ban_until) = rep.ban_until {
            let current = self.blockchain().get_block_timestamp();
            if current > ban_until {
                // Auto-unban
                return false;
            }
        }
        
        true
    }

    fn extract_owner(&self, target_type: &TargetType, target_id: &ManagedBuffer) -> ManagedAddress {
        // Extract owner based on target type
        // For NFT, query token owner
        // For collection, query collection creator
        // For user, it's the user themselves
        match target_type {
            TargetType::User => ManagedAddress::from(target_id.to_address().unwrap_or_default()),
            _ => ManagedAddress::zero(), // Would query appropriate contract
        }
    }

    // ============== STORAGE ==============

    #[storage_mapper("likes")]
    fn likes(&self, key: ManagedBuffer) -> SingleValueMapper<LikeData<Self::Api>>;

    #[storage_mapper("item_likes")]
    fn item_likes(&self, target_type: &TargetType, target_id: &ManagedBuffer) -> SingleValueMapper<u64>;

    #[storage_mapper("user_likes_received")]
    fn user_likes_received(&self, user: &ManagedAddress) -> SingleValueMapper<u64>;

    #[storage_mapper("user_likes_given")]
    fn user_likes_given(&self, user: &ManagedAddress) -> SingleValueMapper<u64>;

    #[storage_mapper("last_report_id")]
    fn last_report_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("reports")]
    fn reports(&self, id: u64) -> SingleValueMapper<ReportData<Self::Api>>;

    #[storage_mapper("item_reports")]
    fn item_reports(&self, target_type: &TargetType, target_id: &ManagedBuffer) -> UnorderedSetMapper<u64>;

    #[storage_mapper("flagged_items")]
    fn flagged_items(&self, target_type: &TargetType, target_id: &ManagedBuffer) -> SingleValueMapper<bool>;

    #[storage_mapper("user_reports_filed")]
    fn user_reports_filed(&self, user: &ManagedAddress) -> SingleValueMapper<u64>;

    #[storage_mapper("user_reports_received")]
    fn user_reports_received(&self, user: &ManagedAddress) -> SingleValueMapper<u64>;

    #[storage_mapper("user_successful_reports")]
    fn user_successful_reports(&self, user: &ManagedAddress) -> SingleValueMapper<u64>;

    #[storage_mapper("user_reputation")]
    fn user_reputation(&self, user: &ManagedAddress) -> SingleValueMapper<UserReputation<Self::Api>>;
}
