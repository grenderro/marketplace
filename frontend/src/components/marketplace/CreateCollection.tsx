// components/marketplace/CreateCollection.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  Upload,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Wallet,
  Image as ImageIcon,
  Layers,
  Tag,
  Coins,
  Shield,
  Calendar,
  Users,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useGetAccountInfo, useGetNetworkConfig } from '../../hooks/sdkStubs';
import {
  Transaction,
  Address,
  TokenTransfer,
} from '@multiversx/sdk-core';

// ─── Helpers ───────────────────────────────────────────────
const toHex = (str: string) => Buffer.from(str, 'utf-8').toString('hex');
const toHexU64 = (num: number) => num.toString(16).padStart(16, '0');
const toHexBigInt = (value: bigint) => value.toString(16).padStart(16, '0');

const uploadToIPFS = async (file: File): Promise<string> => {
  console.log('Uploading to IPFS:', file.name);
  return 'QmStubHash' + Date.now();
};

const uploadJSONToIPFS = async (json: any): Promise<string> => {
  console.log('Uploading JSON to IPFS:', json);
  return 'QmJsonStubHash' + Date.now();
};

const getNonce = async (_address: string): Promise<number> => 0;

const sendTransaction = async (tx: Transaction) => {
  console.log('Sending transaction:', tx);
  return { hash: 'stub-tx-hash-' + Date.now() };
};

// ─── Types ─────────────────────────────────────────────────
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

interface FormErrors {
  name?: string;
  ticker?: string;
  maxSupply?: string;
  mintPrice?: string;
  image?: string;
  mintEndDate?: string;
}

const STEPS = ['Basic Info', 'Tokenomics', 'Assets', 'Review'];

const INITIAL_DATA: CollectionFormData = {
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
};

// ─── Component ─────────────────────────────────────────────
export const CreateCollection: React.FC = () => {
  const { address, account } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();

  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [formData, setFormData] = useState<CollectionFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dragActive, setDragActive] = useState(false);

  const walletBalance = useMemo(() => {
    if (!account?.balance) return 0;
    return parseInt(account.balance) / 1e18;
  }, [account]);

  const deploymentCost = 0.05;
  const hasEnoughBalance = walletBalance >= deploymentCost;

  // ─── Validation ──────────────────────────────────────
  const validateStep = useCallback(
    (step: number, data = formData): FormErrors => {
      const e: FormErrors = {};
      if (step === 0) {
        if (!data.name.trim()) e.name = 'Collection name is required';
        else if (data.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
        else if (data.name.trim().length > 50) e.name = 'Name must be under 50 characters';

        if (!data.ticker.trim()) e.ticker = 'Ticker is required';
        else if (!/^[A-Z]{3,10}$/.test(data.ticker.trim()))
          e.ticker = 'Ticker must be 3-10 uppercase letters (A-Z)';
      }
      if (step === 1) {
        if (data.maxSupply < 1 || data.maxSupply > 100000)
          e.maxSupply = 'Supply must be between 1 and 100,000';
        const price = parseFloat(data.mintPrice);
        if (isNaN(price) || price < 0) e.mintPrice = 'Price must be 0 or greater';
        if (data.mintEndDate && data.mintStartDate && new Date(data.mintEndDate) <= new Date(data.mintStartDate))
          e.mintEndDate = 'End date must be after start date';
      }
      if (step === 2) {
        if (!data.image) e.image = 'Collection image is required';
      }
      return e;
    },
    [formData]
  );

  const isStepValid = useCallback(
    (step: number) => Object.keys(validateStep(step)).length === 0,
    [validateStep]
  );

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const updateField = <K extends keyof CollectionFormData>(
    field: K,
    value: CollectionFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as keyof FormErrors];
      return next;
    });
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setTouched((prev) => {
        const next = { ...prev };
        Object.keys(stepErrors).forEach((k) => (next[k] = true));
        return next;
      });
      return;
    }
    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const handleCreate = async () => {
    const allErrors = {
      ...validateStep(0),
      ...validateStep(1),
      ...validateStep(2),
    };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    if (!hasEnoughBalance) {
      alert(`Insufficient balance. You need at least ${deploymentCost} EGLD`);
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

      const mintPriceAtomic = BigInt(Math.floor(parseFloat(formData.mintPrice) * 1e18));
      const royaltiesBasis = BigInt(Math.floor(formData.royalties * 100));

      const dataString = `createCollection@${toHex(formData.name)}@${toHex(formData.ticker)}@${toHexU64(formData.maxSupply)}@${toHexBigInt(mintPriceAtomic)}@${toHexBigInt(royaltiesBasis)}@${toHex(`ipfs://${metadataHash}`)}`;
      const data = new TextEncoder().encode(dataString);
      const nonce = await getNonce(address);

      const tx = new Transaction({
        nonce,
        value: TokenTransfer.egldFromAmount(deploymentCost),
        sender: Address.fromBech32(address),
        receiver: Address.fromBech32(
          network?.apiAddress || 'erd1qqqqqqqqqqqqqpgqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'
        ),
        gasLimit: 100_000_000,
        data: data as any,
        chainID: network?.chainId || 'D',
      });

      const result = await sendTransaction(tx);
      setTxHash(result.hash);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Error creating collection: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  // ─── Drag & Drop helpers ─────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent, field: 'image' | 'banner') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      updateField(field, e.dataTransfer.files[0]);
    }
  };

  // ─── Preview image URLs ──────────────────────────────
  const imagePreview = formData.image ? URL.createObjectURL(formData.image) : null;
  const bannerPreview = formData.banner ? URL.createObjectURL(formData.banner) : null;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create NFT Collection</h1>
        <p className="text-gray-400">Launch your own collection on MultiversX</p>
      </div>

      {/* Wallet Balance Bar */}
      <div
        className={`flex items-center justify-between px-6 py-3 rounded-xl mb-8 border ${
          hasEnoughBalance
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <Wallet className={`w-5 h-5 ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`} />
          <span className="text-sm text-gray-300">
            Wallet: <strong className="text-white">{walletBalance.toFixed(4)} EGLD</strong>
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            Deployment cost: <strong className="text-white">{deploymentCost} EGLD</strong>
          </span>
          {!hasEnoughBalance && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Insufficient balance
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form Wizard */}
        <div className="lg:col-span-3">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, idx) => {
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              const stepValid = isStepValid(idx);
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white ring-2 ring-cyan-400/50'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {isComplete ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        isCurrent ? 'text-white' : isComplete ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        isComplete ? 'bg-green-500' : 'bg-gray-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="bg-[#12121a] rounded-2xl p-8 border border-gray-800"
            >
              {currentStep === 0 && (
                <BasicInfoStep
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                  touched={touched}
                  markTouched={markTouched}
                />
              )}
              {currentStep === 1 && (
                <TokenomicsStep
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                  touched={touched}
                  markTouched={markTouched}
                />
              )}
              {currentStep === 2 && (
                <AssetsStep
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                  touched={touched}
                  markTouched={markTouched}
                  dragActive={dragActive}
                  handleDrag={handleDrag}
                  handleDrop={handleDrop}
                />
              )}
              {currentStep === 3 && (
                <ReviewStep
                  formData={formData}
                  onCreate={handleCreate}
                  isCreating={isCreating}
                  hasEnoughBalance={hasEnoughBalance}
                  deploymentCost={deploymentCost}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={isCreating || !hasEnoughBalance}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Deploy Collection
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Live Preview
            </h3>
            <CollectionPreviewCard
              formData={formData}
              imagePreview={imagePreview}
              bannerPreview={bannerPreview}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            txHash={txHash}
            formData={formData}
            onClose={() => {
              setShowSuccess(false);
              setFormData(INITIAL_DATA);
              setCurrentStep(0);
              setErrors({});
              setTouched({});
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tooltip Helper ────────────────────────────────────────
const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({
  children,
  text,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      {children}
      <span
        className="ml-2 text-gray-500 hover:text-cyan-400 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <Info className="w-4 h-4" />
      </span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-56 p-3 bg-[#1a1a25] border border-gray-700 rounded-xl text-xs text-gray-300 shadow-xl z-50"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Input with Error ──────────────────────────────────────
const Field: React.FC<{
  label: React.ReactNode;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}> = ({ label, error, touched, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-400 mb-2">{label}</label>
    {children}
    {touched && error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
      >
        <AlertCircle className="w-3 h-3" /> {error}
      </motion.p>
    )}
  </div>
);

// ─── Step 1: Basic Info ────────────────────────────────────
const BasicInfoStep: React.FC<{
  formData: CollectionFormData;
  updateField: <K extends keyof CollectionFormData>(field: K, value: CollectionFormData[K]) => void;
  errors: FormErrors;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
}> = ({ formData, updateField, errors, touched, markTouched }) => (
  <div className="space-y-6">
    <Field
      label={
        <Tooltip text="The display name of your NFT collection. This will be shown on marketplaces and wallets.">
          Collection Name *
        </Tooltip>
      }
      error={errors.name}
      touched={touched.name}
    >
      <input
        type="text"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        onBlur={() => markTouched('name')}
        placeholder="e.g., Cosmic Warriors"
        maxLength={50}
        className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
          touched.name && errors.name ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-cyan-400'
        }`}
      />
      <p className="text-xs text-gray-500 mt-1 text-right">
        {formData.name.length}/50
      </p>
    </Field>

    <Field
      label={
        <Tooltip text="A short uppercase identifier for your collection (like BAYC, AZUKI). Once set, it cannot be changed.">
          Token Ticker *
        </Tooltip>
      }
      error={errors.ticker}
      touched={touched.ticker}
    >
      <input
        type="text"
        value={formData.ticker}
        onChange={(e) => updateField('ticker', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
        onBlur={() => markTouched('ticker')}
        placeholder="e.g., WARRIOR"
        maxLength={10}
        className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none font-mono transition-colors ${
          touched.ticker && errors.ticker ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-cyan-400'
        }`}
      />
      <p className="text-xs text-gray-500 mt-1">
        3-10 uppercase letters only. Cannot be changed later.
      </p>
    </Field>

    <Field label="Description">
      <textarea
        value={formData.description}
        onChange={(e) => updateField('description', e.target.value)}
        rows={4}
        placeholder="Tell the story of your collection..."
        maxLength={500}
        className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none resize-none"
      />
      <p className="text-xs text-gray-500 mt-1 text-right">
        {formData.description.length}/500
      </p>
    </Field>
  </div>
);

// ─── Step 2: Tokenomics ────────────────────────────────────
const TokenomicsStep: React.FC<{
  formData: CollectionFormData;
  updateField: <K extends keyof CollectionFormData>(field: K, value: CollectionFormData[K]) => void;
  errors: FormErrors;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
}> = ({ formData, updateField, errors, touched, markTouched }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <Field
        label={
          <Tooltip text="The maximum number of NFTs that can ever be minted in this collection.">
            Max Supply *
          </Tooltip>
        }
        error={errors.maxSupply}
        touched={touched.maxSupply}
      >
        <input
          type="number"
          value={formData.maxSupply}
          onChange={(e) => updateField('maxSupply', parseInt(e.target.value) || 0)}
          onBlur={() => markTouched('maxSupply')}
          min={1}
          max={100000}
          className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
            touched.maxSupply && errors.maxSupply ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-cyan-400'
          }`}
        />
      </Field>

      <Field
        label={
          <Tooltip text="The price users pay to mint one NFT. Set to 0 for a free mint.">
            Mint Price (EGLD)
          </Tooltip>
        }
        error={errors.mintPrice}
        touched={touched.mintPrice}
      >
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.mintPrice}
          onChange={(e) => updateField('mintPrice', e.target.value)}
          onBlur={() => markTouched('mintPrice')}
          placeholder="0.00 for free mint"
          className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
            touched.mintPrice && errors.mintPrice ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-cyan-400'
          }`}
        />
      </Field>
    </div>

    <Field
      label={
        <Tooltip text="Percentage you earn on every secondary sale. MultiversX standard is 2.5% - 10%.">
          Creator Royalties: {formData.royalties}%
        </Tooltip>
      }
    >
      <input
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={formData.royalties}
        onChange={(e) => updateField('royalties', parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span>
        <span>2.5%</span>
        <span>5%</span>
        <span>7.5%</span>
        <span>10%</span>
      </div>
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label={<><Calendar className="w-4 h-4 inline mr-1" /> Mint Start Date</>}>
        <input
          type="datetime-local"
          value={formData.mintStartDate}
          onChange={(e) => updateField('mintStartDate', e.target.value)}
          className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
        />
      </Field>

      <Field
        label={<><Calendar className="w-4 h-4 inline mr-1" /> Mint End Date</>}
        error={errors.mintEndDate}
        touched={touched.mintEndDate}
      >
        <input
          type="datetime-local"
          value={formData.mintEndDate}
          onChange={(e) => updateField('mintEndDate', e.target.value)}
          onBlur={() => markTouched('mintEndDate')}
          className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
            touched.mintEndDate && errors.mintEndDate ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-cyan-400'
          }`}
        />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Field
        label={
          <Tooltip text="Limit how many NFTs one wallet can mint. 0 = unlimited.">
            Max Per Wallet
          </Tooltip>
        }
      >
        <input
          type="number"
          min={0}
          value={formData.maxPerWallet}
          onChange={(e) => updateField('maxPerWallet', parseInt(e.target.value) || 0)}
          className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">0 = no limit</p>
      </Field>
    </div>

    <div className="space-y-3 pt-2">
      <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#1a1a25] rounded-xl hover:bg-[#252535] transition-colors">
        <input
          type="checkbox"
          checked={formData.whitelistEnabled}
          onChange={(e) => updateField('whitelistEnabled', e.target.checked)}
          className="w-5 h-5 rounded border-gray-600 bg-[#12121a] text-cyan-500"
        />
        <div>
          <span className="text-white font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Enable Whitelist
          </span>
          <p className="text-xs text-gray-500">Only approved wallets can mint</p>
        </div>
      </label>

      <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#1a1a25] rounded-xl hover:bg-[#252535] transition-colors">
        <input
          type="checkbox"
          checked={formData.isSoulbound}
          onChange={(e) => updateField('isSoulbound', e.target.checked)}
          className="w-5 h-5 rounded border-gray-600 bg-[#12121a] text-cyan-500"
        />
        <div>
          <span className="text-white font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" /> Soulbound
          </span>
          <p className="text-xs text-gray-500">Non-transferable after mint</p>
        </div>
      </label>
    </div>
  </div>
);

// ─── Step 3: Assets ────────────────────────────────────────
const AssetsStep: React.FC<{
  formData: CollectionFormData;
  updateField: <K extends keyof CollectionFormData>(field: K, value: CollectionFormData[K]) => void;
  errors: FormErrors;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, field: 'image' | 'banner') => void;
}> = ({ formData, updateField, errors, touched, markTouched, dragActive, handleDrag, handleDrop }) => (
  <div className="space-y-8">
    <Field
      label={
        <Tooltip text="This image represents your entire collection. It's shown on marketplaces, wallets, and collection pages. Recommended: 512x512px or larger square image.">
          Collection Image *
        </Tooltip>
      }
      error={errors.image}
      touched={touched.image}
    >
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={(e) => handleDrop(e, 'image')}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-cyan-400 bg-cyan-400/10'
            : touched.image && errors.image
            ? 'border-red-500 bg-red-500/5'
            : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        {formData.image ? (
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="w-40 h-40 mx-auto rounded-2xl object-cover border border-gray-700"
            />
            <button
              onClick={() => updateField('image', null)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm text-gray-400 mt-3">{formData.image.name}</p>
          </div>
        ) : (
          <label className="cursor-pointer">
            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-cyan-400' : 'text-gray-600'}`} />
            <p className="text-gray-400 font-medium">
              {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF up to 10MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                updateField('image', e.target.files?.[0] || null);
                markTouched('image');
              }}
              className="hidden"
            />
          </label>
        )}
      </div>
    </Field>

    <Field
      label={
        <Tooltip text="A wide banner image displayed at the top of your collection page. Recommended: 1400x400px.">
          Banner Image
        </Tooltip>
      }
    >
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={(e) => handleDrop(e, 'banner')}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive ? 'border-purple-400 bg-purple-400/10' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        {formData.banner ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(formData.banner)}
              alt="Banner"
              className="w-full h-32 mx-auto rounded-xl object-cover border border-gray-700"
            />
            <button
              onClick={() => updateField('banner', null)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm text-gray-400 mt-2">{formData.banner.name}</p>
          </div>
        ) : (
          <label className="cursor-pointer">
            <ImageIcon className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-purple-400' : 'text-gray-600'}`} />
            <p className="text-gray-400 text-sm">
              {dragActive ? 'Drop banner here' : 'Upload banner (optional)'}
            </p>
            <p className="text-xs text-gray-600 mt-1">Recommended: 1400x400px</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateField('banner', e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        )}
      </div>
    </Field>
  </div>
);

// ─── Step 4: Review ────────────────────────────────────────
const ReviewStep: React.FC<{
  formData: CollectionFormData;
  onCreate: () => void;
  isCreating: boolean;
  hasEnoughBalance: boolean;
  deploymentCost: number;
}> = ({ formData, onCreate, isCreating, hasEnoughBalance, deploymentCost }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-white flex items-center gap-2">
      <Layers className="w-5 h-5 text-cyan-400" /> Review & Deploy
    </h3>

    <div className="bg-[#1a1a25] rounded-xl p-6 space-y-4 border border-gray-800">
      <ReviewRow icon={<Tag className="w-4 h-4" />} label="Name" value={formData.name || '—'} />
      <ReviewRow icon={<Coins className="w-4 h-4" />} label="Ticker" value={formData.ticker || '—'} />
      <ReviewRow icon={<Layers className="w-4 h-4" />} label="Max Supply" value={formData.maxSupply.toLocaleString()} />
      <ReviewRow
        icon={<Coins className="w-4 h-4" />}
        label="Mint Price"
        value={`${formData.mintPrice} EGLD`}
      />
      <ReviewRow icon={<Sparkles className="w-4 h-4" />} label="Royalties" value={`${formData.royalties}%`} />
      {formData.mintStartDate && (
        <ReviewRow icon={<Calendar className="w-4 h-4" />} label="Starts" value={new Date(formData.mintStartDate).toLocaleString()} />
      )}
      {formData.mintEndDate && (
        <ReviewRow icon={<Calendar className="w-4 h-4" />} label="Ends" value={new Date(formData.mintEndDate).toLocaleString()} />
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        {formData.whitelistEnabled && (
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-medium">
            Whitelist
          </span>
        )}
        {formData.isSoulbound && (
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
            Soulbound
          </span>
        )}
        {formData.maxPerWallet > 0 && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
            Max {formData.maxPerWallet}/wallet
          </span>
        )}
      </div>
    </div>

    {/* Cost Summary */}
    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-400/20">
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-400">Deployment Cost</span>
        <span className="text-2xl font-bold text-white">{deploymentCost} EGLD</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Network Fee (estimated)</span>
        <span className="text-cyan-400">~0.001 EGLD</span>
      </div>
      {!hasEnoughBalance && (
        <p className="text-red-400 text-sm mt-3 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> Insufficient balance to deploy
        </p>
      )}
    </div>

    <p className="text-xs text-gray-500">
      By deploying, you confirm that you own the rights to this collection and its assets. 
      This transaction is irreversible.
    </p>
  </div>
);

const ReviewRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      {icon}
      {label}
    </div>
    <span className="text-white font-medium text-sm">{value}</span>
  </div>
);

// ─── Live Preview Card ─────────────────────────────────────
const CollectionPreviewCard: React.FC<{
  formData: CollectionFormData;
  imagePreview: string | null;
  bannerPreview: string | null;
}> = ({ formData, imagePreview, bannerPreview }) => (
  <div className="bg-[#12121a] rounded-2xl border border-gray-800 overflow-hidden">
    {/* Banner */}
    <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 relative">
      {bannerPreview ? (
        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <ImageIcon className="w-6 h-6" />
        </div>
      )}
    </div>

    {/* Avatar + Info */}
    <div className="px-5 pb-5">
      <div className="relative -mt-10 mb-3">
        <div className="w-20 h-20 rounded-2xl border-4 border-[#12121a] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {imagePreview ? (
            <img src={imagePreview} alt="Collection" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <Layers className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>

      <h4 className="text-lg font-bold text-white truncate">
        {formData.name || 'Untitled Collection'}
      </h4>
      <p className="text-cyan-400 text-sm font-mono mb-2">
        {formData.ticker || 'TICKER'}
      </p>
      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
        {formData.description || 'No description provided'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a1a25] rounded-lg p-3">
          <p className="text-xs text-gray-500">Supply</p>
          <p className="text-white font-bold">{formData.maxSupply.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a25] rounded-lg p-3">
          <p className="text-xs text-gray-500">Price</p>
          <p className="text-white font-bold">
            {parseFloat(formData.mintPrice) > 0 ? `${formData.mintPrice} EGLD` : 'Free'}
          </p>
        </div>
      </div>

      {formData.royalties > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          {formData.royalties}% creator royalties
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-2">
        {formData.whitelistEnabled && (
          <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-md">Whitelist</span>
        )}
        {formData.isSoulbound && (
          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-md">Soulbound</span>
        )}
        {formData.maxPerWallet > 0 && (
          <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-md">
            {formData.maxPerWallet}/wallet
          </span>
        )}
      </div>
    </div>
  </div>
);

// ─── Success Modal ─────────────────────────────────────────
const SuccessModal: React.FC<{
  txHash: string;
  formData: CollectionFormData;
  onClose: () => void;
}> = ({ txHash, formData, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-[#12121a] rounded-2xl border border-gray-800 p-8 max-w-md w-full text-center"
    >
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Collection Created!</h2>
      <p className="text-gray-400 mb-6">
        <strong className="text-white">{formData.name}</strong> has been submitted to the blockchain.
      </p>

      <div className="bg-[#1a1a25] rounded-xl p-4 mb-6 text-left">
        <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
        <p className="text-cyan-400 text-sm font-mono break-all">{txHash}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gray-800 rounded-xl text-white font-medium hover:bg-gray-700 transition-colors"
        >
          Create Another
        </button>
        <button
          onClick={() => {
            window.open(`https://devnet-explorer.multiversx.com/transactions/${txHash}`, '_blank');
          }}
          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-bold hover:shadow-lg transition-all"
        >
          View on Explorer
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default CreateCollection;
