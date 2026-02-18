use marketplace::*;
use multiversx_sc::types::Address;
use multiversx_sc_scenario::{
    managed_address, managed_biguint, managed_token_id, rust_biguint,
    testing_framework::BlockchainStateWrapper,
    imports::ContractObjWrapper,
    DebugApi,
};

// Import the module traits to access their methods
use marketplace::listing::ListingModule;
use marketplace::pausable::PausableModule;

fn setup_contract(
    b_mock: &mut BlockchainStateWrapper,
    owner_address: &Address,
) -> (ContractObjWrapper<marketplace::ContractObj<DebugApi>, fn() -> marketplace::ContractObj<DebugApi>>, Address) {
    let rust_zero = rust_biguint!(0u64);
    let contract_wrapper: ContractObjWrapper<marketplace::ContractObj<DebugApi>, fn() -> marketplace::ContractObj<DebugApi>> = b_mock.create_sc_account(
        &rust_zero,
        Some(owner_address),
        marketplace::contract_obj as fn() -> marketplace::ContractObj<DebugApi>,
        "marketplace.wasm",
    );

    // Get address before moving contract_wrapper
    let contract_address = contract_wrapper.address_ref().clone();

    b_mock
        .execute_tx(owner_address, &contract_wrapper, &rust_zero, |sc: marketplace::ContractObj<DebugApi>| {
            let royalties_address = managed_address!(owner_address);
            sc.init(500u64, royalties_address); // 5% royalties
        })
        .assert_ok();

    (contract_wrapper, contract_address)
}

#[test]
fn test_create_listing() {
    let mut b_mock = BlockchainStateWrapper::new();
    let owner = b_mock.create_user_account(&rust_biguint!(1_000_000_000));
    let seller = b_mock.create_user_account(&rust_biguint!(1_000_000_000));
    
    let nft_token_id = &b"MYTOKEN-123456"[..];
    b_mock.set_nft_balance::<&[u8]>(&seller, nft_token_id, 1, &rust_biguint!(1), &&[][..]);

    let (sc_wrapper, _sc_address) = setup_contract(&mut b_mock, &owner);

    // Create listing
    b_mock
        .execute_esdt_transfer(
            &seller,
            &sc_wrapper,
            nft_token_id,
            1,
            &rust_biguint!(1),
            |sc: marketplace::ContractObj<DebugApi>| {
                let result = sc.create_listing(
                    managed_token_id!(nft_token_id),
                    1,
                    managed_biguint!(1_000_000), // price: 1 EGLD
                );
                assert_eq!(result, 1u64); // First listing ID should be 1
            },
        )
        .assert_ok();

    // Verify listing was created
    b_mock
        .execute_query(&sc_wrapper, |sc: marketplace::ContractObj<DebugApi>| {
            let listing = sc.listings(1u64).get();
            assert_eq!(listing.owner, managed_address!(&seller));
            assert_eq!(listing.nft_nonce, 1u64);
            assert_eq!(listing.price, managed_biguint!(1_000_000));
            assert!(listing.status == marketplace::listing::ListingStatus::Active);
        })
        .assert_ok();
}

#[test]
fn test_buy_listing() {
    let mut b_mock = BlockchainStateWrapper::new();
    let owner = b_mock.create_user_account(&rust_biguint!(1_000_000_000));
    let seller = b_mock.create_user_account(&rust_biguint!(1_000_000_000));
    let buyer = b_mock.create_user_account(&rust_biguint!(10_000_000_000));

    let nft_token_id = &b"MYTOKEN-123456"[..];
    b_mock.set_nft_balance::<&[u8]>(&seller, nft_token_id, 1, &rust_biguint!(1), &&[][..]);

    let (sc_wrapper, _sc_address) = setup_contract(&mut b_mock, &owner);

    // Create listing
    b_mock
        .execute_esdt_transfer(
            &seller,
            &sc_wrapper,
            nft_token_id,
            1,
            &rust_biguint!(1),
            |sc: marketplace::ContractObj<DebugApi>| {
                sc.create_listing(
                    managed_token_id!(nft_token_id),
                    1,
                    managed_biguint!(1_000_000), // 1 EGLD
                );
            },
        )
        .assert_ok();

    // Buy listing
    b_mock
        .execute_tx(
            &buyer,
            &sc_wrapper,
            &rust_biguint!(1_000_000),
            |sc: marketplace::ContractObj<DebugApi>| {
                sc.buy_listing(1u64);
            },
        )
        .assert_ok();

    // Verify listing status changed to Sold
    b_mock
        .execute_query(&sc_wrapper, |sc: marketplace::ContractObj<DebugApi>| {
            let listing = sc.listings(1u64).get();
            assert!(listing.status == marketplace::listing::ListingStatus::Sold);
        })
        .assert_ok();
}

#[test]
fn test_pause_unpause() {
    let mut b_mock = BlockchainStateWrapper::new();
    let owner = b_mock.create_user_account(&rust_biguint!(1_000_000_000));
    
    let (sc_wrapper, _sc_address) = setup_contract(&mut b_mock, &owner);

    // Test pause
    b_mock
        .execute_tx(&owner, &sc_wrapper, &rust_biguint!(0), |sc: marketplace::ContractObj<DebugApi>| {
            sc.pause();
            assert!(sc.is_paused().get());
        })
        .assert_ok();

    // Test unpause
    b_mock
        .execute_tx(&owner, &sc_wrapper, &rust_biguint!(0), |sc: marketplace::ContractObj<DebugApi>| {
            sc.unpause();
            assert!(!sc.is_paused().get());
        })
        .assert_ok();
}
