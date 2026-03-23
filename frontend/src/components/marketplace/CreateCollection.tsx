// components/marketplace/CreateCollection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '../stubs/SdkStubs';
import { useGetAccountInfo, useGetNetworkConfig } from '../../hooks/sdkStubs';
import {
  Transaction,
  Address,
  TokenTransfer
} from '@multiversx/sdk-core';

// Helper to encode strings to hex
const toHex = (str: string) => Buffer.from(str, 'utf-8').toString('hex');
const toHexU64 = (num: number) => num.toString(16).padStart(16, '0');
const toHexBigInt = (value: bigint) => value.toString(16).padStart(16, '0');

// Stub services
const uploadToIPFS = async (file: File): Promise<string> => {
  console.log('Uploading to IPFS:', file.name);
  return 'QmStubHash' + Date.now();
};

const uploadJSONToIPFS = async (json: any): Promise<string> => {
  console.log('Uploading JSON to IPFS:', json);
  return 'QmJsonStubHash' + Date.now();
};

const getNonce = async (address: string): Promise<number> => {
  return 0;
};

const sendTransaction = async (tx: Transaction) => {
  console.log('Sending transaction:', tx);
  return { hash: 'stub-tx-hash-' + Date.now() };
};

interface CollectionFormData {
  name: string;
  ticker: string;
  description: string;
  maxSupply: number;
  mintPrice: string;
  royalties: number;
  isSoulbound: boolean;
  whitelistEnabled: boolean;
  maxPerWallet: number;
  mintStartDate: string;
  mintEndDate: string;
  image: File | null;
  banner: File | null;
}

const STEPS = ['Basic Info', 'Tokenomics', 'Assets', 'Review'];

export const CreateCollection: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    ticker: '',
    description: '',
    maxSupply: 10000,
    mintPrice: '0.1',
    royalties: 2.5,
    isSoulbound: false,
    whitelistEnabled: false,
    maxPerWallet: 0,
    mintStartDate: '',
    mintEndDate: '',
    image: null,
    banner: null,
  });

  const handleCreate = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsCreating(true);

    try {
      const imageHash = formData.image ? await uploadToIPFS(formData.image) : '';
      const bannerHash = formData.banner ? await uploadToIPFS(formData.banner) : '';

      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageHash ? `ipfs://${imageHash}` : '',
        banner: bannerHash ? `ipfs://${bannerHash}` : '',
      };
      const metadataHash = await uploadJSONToIPFS(metadata);

      // Build transaction data manually: functionName@arg1@arg2...
      // createCollection@name@ticker@maxSupply@mintPrice@royalties@metadataUri
      const mintPriceAtomic = BigInt(Math.floor(parseFloat(formData.mintPrice) * 1e18));
      const royaltiesBasis = BigInt(Math.floor(formData.royalties * 100));
      
      const dataString = `createCollection@${toHex(formData.name)}@${toHex(formData.ticker)}@${toHexU64(formData.maxSupply)}@${toHexBigInt(mintPriceAtomic)}@${toHexBigInt(royaltiesBasis)}@${toHex(`ipfs://${metadataHash}`)}`;
      const data = new TextEncoder().encode(dataString);

      const nonce = await getNonce(address);

      // SDK v12+ compatible transaction
      const tx = new Transaction({
        nonce: nonce,
        value: TokenTransfer.egldFromAmount(0.05), // 0.05 EGLD
        sender: Address.fromBech32(address),
        receiver: Address.fromBech32(network?.apiAddress || 'erd1qqqqqqqqqqqqqpgqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'),
        gasLimit: 100000000,
        data: data as any,
        chainID: network?.chainId || 'D',
      });

      await sendTransaction(tx);
      alert('Collection creation transaction sent successfully!');

    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Error creating collection: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const ReviewStep: React.FC<any> = ({ formData, onCreate, isCreating }) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Review</h3>
      <div className="bg-[#1a1a25] p-4 rounded-lg space-y-2 text-sm">
        <p><span className="text-gray-400">Name:</span> {formData.name}</p>
        <p><span className="text-gray-400">Ticker:</span> {formData.ticker}</p>
        <p><span className="text-gray-400">Supply:</span> {formData.maxSupply}</p>
        <p><span className="text-gray-400">Price:</span> {formData.mintPrice} EGLD</p>
        <p><span className="text-gray-400">Royalties:</span> {formData.royalties}%</p>
      </div>
      <button
        onClick={onCreate}
        disabled={isCreating}
        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg font-bold text-black hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          'Create Collection'
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              idx <= currentStep
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-gray-800 text-gray-500'
            }`}>
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            <span className={`ml-3 ${idx <= currentStep ? 'text-white' : 'text-gray-500'}`}>
              {step}
            </span>
            {idx < STEPS.length - 1 && (
              <div className={`w-24 h-1 mx-4 ${
                idx < currentStep ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-800'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#12121a] rounded-2xl p-8 border border-gray-800"
        >
          {currentStep === 0 && (
            <BasicInfoStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 1 && (
            <TokenomicsStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 2 && (
            <AssetsStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 3 && (
            <ReviewStep formData={formData} onCreate={handleCreate} isCreating={isCreating} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white disabled:opacity-50"
        >
          Previous
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Spinner />
                Creating...
              </>
            ) : (
              'Deploy Collection'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Step Components
const BasicInfoStep: React.FC<{
  formData: CollectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<CollectionFormData>>;
}> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-gray-400 mb-2">
        Collection Name *
      </label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Cosmic Warriors"
        className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-400 mb-2">
        Token Ticker *
        <span className="text-xs text-gray-500 ml-2">(3-10 uppercase letters)</span>
      </label>
      <input
        type="text"
        value={formData.ticker}
        onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
        placeholder="e.g., WARRIOR"
        maxLength={10}
        className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none font-mono"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-400 mb-2">
        Description
      </label>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
        placeholder="Tell the story of your collection..."
        className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none resize-none"
      />
    </div>
  </div>
);

const TokenomicsStep: React.FC<{
  formData: CollectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<CollectionFormData>>;
}> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Max Supply *
        </label>
        <input
          type="number"
          value={formData.maxSupply}
          onChange={(e) => setFormData({ ...formData, maxSupply: parseInt(e.target.value) || 0 })}
          min={1}
          max={100000}
          className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Mint Price (EGLD)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.mintPrice}
          onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
          placeholder="0.00 for free mint"
          className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-400 mb-2">
        Creator Royalties: {formData.royalties}%
      </label>
      <input
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={formData.royalties}
        onChange={(e) => setFormData({ ...formData, royalties: parseFloat(e.target.value) })}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
      <p className="text-xs text-gray-500 mt-1">
        You receive this % on every secondary market sale
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Mint Start Date
        </label>
        <input
          type="datetime-local"
          value={formData.mintStartDate}
          onChange={(e) => setFormData({ ...formData, mintStartDate: e.target.value })}
          className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Mint End Date
        </label>
        <input
          type="datetime-local"
          value={formData.mintEndDate}
          onChange={(e) => setFormData({ ...formData, mintEndDate: e.target.value })}
          className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
        />
      </div>
    </div>

    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.whitelistEnabled}
          onChange={(e) => setFormData({ ...formData, whitelistEnabled: e.target.checked })}
          className="w-5 h-5 rounded border-gray-600 bg-[#1a1a25] text-cyan-500 focus:ring-cyan-500"
        />
        <span className="text-white">Enable Whitelist</span>
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isSoulbound}
          onChange={(e) => setFormData({ ...formData, isSoulbound: e.target.checked })}
          className="w-5 h-5 rounded border-gray-600 bg-[#1a1a25] text-cyan-500 focus:ring-cyan-500"
        />
        <span className="text-white">Soulbound (Non-transferable)</span>
        <span className="text-xs text-gray-500">Cannot be traded after mint</span>
      </label>
    </div>
  </div>
);

const AssetsStep: React.FC<{
  formData: CollectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<CollectionFormData>>;
}> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-gray-400 mb-2">
        Collection Image *
      </label>
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors">
        {formData.image ? (
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="w-32 h-32 mx-auto rounded-xl object-cover"
            />
            <button
              onClick={() => setFormData({ ...formData, image: null })}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-400">Drop image or click to upload</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-400 mb-2">
        Banner Image
      </label>
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
        {formData.banner ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(formData.banner)}
              alt="Banner"
              className="w-full h-32 mx-auto rounded-xl object-cover"
            />
            <button
              onClick={() => setFormData({ ...formData, banner: null })}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-gray-400">Recommended: 1400x400px</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, banner: e.target.files?.[0] || null })}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  </div>
);

export default CreateCollection;
