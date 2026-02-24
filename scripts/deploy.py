# scripts/deploy.py
import sys
from multiversx_sdk import (
    Address, Transaction, TransactionComputer, UserSigner,
    ProxyNetworkProvider, SmartContractTransactionsFactory
)

def deploy_marketplace():
    proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
    
    # Load wallet
    signer = UserSigner.from_pem_file("wallet.pem")
    address = signer.get_pubkey().to_address(hrp="erd")
    
    # Contract bytecode
    with open("output/marketplace.wasm", "rb") as f:
        bytecode = f.read()
    
    # Deploy transaction
    factory = SmartContractTransactionsFactory(proxy.get_network_config())
    
    args = [
        250,  # 2.5% fee
        Address.from_bech32("erd1..."),  # Fee address
        ["WEGLD-d7c6bb", "USDC-c76f1f"]  # Accepted payment tokens
    ]
    
    tx = factory.create_transaction_for_deploy(
        sender=address,
        bytecode=bytecode,
        gas_limit=60_000_000,
        arguments=args
    )
    
    tx_computer = TransactionComputer()
    tx.signature = signer.sign(tx_computer.compute_bytes_for_signing(tx))
    
    hash = proxy.send_transaction(tx)
    print(f"Deploy transaction hash: {hash}")

if __name__ == "__main__":
    deploy_marketplace()
