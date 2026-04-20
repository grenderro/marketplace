// components/marketplace/CreateESDT.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  Check,
  AlertCircle,
  Wallet,
  Coins,
  Tag,
  Settings,
  Shield,
  Flame,
  Pause,
  Snowflake,
  Trash2,
  UserCheck,
  ArrowUpCircle,
  Sparkles,
  Loader2,
  Zap,
  Fuel,
  Wrench,
  Layers,
} from 'lucide-react';
import { useGetAccountInfo, useGetNetworkConfig } from '../../hooks/sdkStubs';
import {
  Transaction,
  Address,
  TokenTransfer,
} from '@multiversx/sdk-core';

// ─── Helpers ───────────────────────────────────────────────
const toHex = (str: string) => Buffer.from(str, 'utf-8').toString('hex');

const getNonce = async (_address: string): Promise<number> => 0;

const sendTransaction = async (tx: Transaction) => {
  console.log('Sending ESDT transaction:', tx);
  return { hash: 'stub-esdt-tx-' + Date.now() };
};

// ─── Types ─────────────────────────────────────────────────
type TokenType = 'fungible' | 'semi-fungible' | 'meta';

interface ESDTFormData {
  name: string;
  ticker: string;
  tokenType: TokenType;
  initialSupply: string;
  decimals: number;
  properties: {
    canMint: boolean;
    canBurn: boolean;
    canPause: boolean;
    canFreeze: boolean;
    canWipe: boolean;
    canChangeOwner: boolean;
    canUpgrade: boolean;
  };
}

interface FormErrors {
  name?: string;
  ticker?: string;
  initialSupply?: string;
}

const INITIAL_DATA: ESDTFormData = {
  name: '',
  ticker: '',
  tokenType: 'fungible',
  initialSupply: '1000000',
  decimals: 18,
  properties: {
    canMint: true,
    canBurn: true,
    canPause: true,
    canFreeze: false,
    canWipe: false,
    canChangeOwner: true,
    canUpgrade: true,
  },
};

// ─── Token Type Config ─────────────────────────────────────
const TOKEN_TYPES = [
  {
    type: 'fungible' as TokenType,
    title: 'Fungible Token',
    subtitle: 'Standard cryptocurrency',
    description: 'Interchangeable 1:1. Perfect for governance, utility tokens, and stablecoins.',
    icon: Coins,
    color: 'cyan',
    examples: ['USDC', 'MEX', 'ZPAY'],
    features: ['Divisible', 'Transferable', 'Low gas'],
  },
  {
    type: 'semi-fungible' as TokenType,
    title: 'Semi-Fungible (SFT)',
    subtitle: 'Quantity-based items',
    description: 'Multiple copies of the same item. Event tickets, game items, memberships.',
    icon: Layers,
    color: 'purple',
    examples: ['Tickets', 'Badges', 'Coupons'],
    features: ['Multiple copies', 'Same ID', 'Batch transfer'],
  },
  {
    type: 'meta' as TokenType,
    title: 'MetaESDT',
    subtitle: 'DeFi special tokens',
    description: 'LP positions, staking derivatives, and wrapped assets with metadata.',
    icon: Sparkles,
    color: 'amber',
    examples: ['LP tokens', 'Staking derivs', 'Wrapped assets'],
    features: ['Metadata', 'DeFi native', 'Composable'],
  },
];

const PROPERTY_META: Record<
  string,
  { icon: React.ElementType; label: string; desc: string; risk?: string }
> = {
  canMint: {
    icon: Zap,
    label: 'Can Mint',
    desc: 'Create additional tokens after initial issuance. Essential for inflationary models.',
  },
  canBurn: {
    icon: Flame,
    label: 'Can Burn',
    desc: 'Permanently destroy tokens to reduce supply. Common for deflationary mechanics.',
  },
  canPause: {
    icon: Pause,
    label: 'Can Pause',
    desc: 'Halt all token transfers in emergencies. Use with caution — affects all holders.',
    risk: 'Centralized control',
  },
  canFreeze: {
    icon: Snowflake,
    label: 'Can Freeze',
    desc: 'Block specific wallet addresses from transferring tokens.',
    risk: 'Centralized control',
  },
  canWipe: {
    icon: Trash2,
    label: 'Can Wipe',
    desc: 'Delete balances of frozen accounts. Extreme power — use only if legally required.',
    risk: 'High centralization',
  },
  canChangeOwner: {
    icon: UserCheck,
    label: 'Can Change Owner',
    desc: 'Transfer administrative rights to another wallet. Useful for DAO handovers.',
  },
  canUpgrade: {
    icon: ArrowUpCircle,
    label: 'Can Upgrade',
    desc: 'Modify token properties after deployment. Required for most evolving projects.',
  },
};

// ─── Component ─────────────────────────────────────────────
export const CreateESDT: React.FC = () => {
  const { address, account } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();

  const [formData, setFormData] = useState<ESDTFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const walletBalance = useMemo(() => {
    if (!account?.balance) return 0;
    return parseInt(account.balance) / 1e18;
  }, [account]);

  const deploymentCost = 0.05;
  const hasEnoughBalance = walletBalance >= deploymentCost;

  // ─── Validation ──────────────────────────────────────
  const validate = useCallback((data = formData): FormErrors => {
    const e: FormErrors = {};
    if (!data.name.trim()) e.name = 'Token name is required';
    else if (data.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
    else if (data.name.trim().length > 50) e.name = 'Name must be under 50 characters';

    if (!data.ticker.trim()) e.ticker = 'Ticker is required';
    else if (!/^[A-Z]{3,10}$/.test(data.ticker.trim()))
      e.ticker = 'Ticker must be 3-10 uppercase letters (A-Z)';

    if (data.tokenType === 'fungible') {
      const supply = parseFloat(data.initialSupply);
      if (isNaN(supply) || supply <= 0) e.initialSupply = 'Supply must be greater than 0';
      else if (supply > 1e18) e.initialSupply = 'Supply seems unreasonably high';
    }
    return e;
  }, [formData]);

  const isValid = useCallback(() => Object.keys(validate()).length === 0, [validate]);

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const updateField = <K extends keyof ESDTFormData>(field: K, value: ESDTFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as keyof FormErrors];
      return next;
    });
  };

  const setTokenType = (type: TokenType) => {
    setFormData((prev) => ({ ...prev, tokenType: type }));
  };

  const handleCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched((prev) => {
        const next = { ...prev };
        Object.keys(validationErrors).forEach((k) => (next[k] = true));
        return next;
      });
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
      const nonce = await getNonce(address);

      // Build ESDT issuance transaction
      const props = formData.properties;
      const propertyFlags = [
        props.canMint,
        props.canBurn,
        props.canChangeOwner,
        props.canPause,
        props.canFreeze,
        props.canWipe,
        props.canUpgrade,
      ]
        .map((v) => (v ? 'true' : 'false'))
        .join('@');

      const supplyHex =
        formData.tokenType === 'fungible'
          ? BigInt(Math.floor(parseFloat(formData.initialSupply) * Math.pow(10, formData.decimals))).toString(16)
          : '00';

      const functionName =
        formData.tokenType === 'fungible'
          ? 'issue'
          : formData.tokenType === 'semi-fungible'
          ? 'issueSemiFungible'
          : 'registerMetaESDT';

      const dataString = `${functionName}@${toHex(formData.name)}@${toHex(formData.ticker)}@${supplyHex}@${formData.decimals.toString(16)}@${propertyFlags}`;
      const data = new TextEncoder().encode(dataString);

      const tx = new Transaction({
        nonce,
        value: TokenTransfer.egldFromAmount(deploymentCost),
        sender: Address.fromBech32(address),
        receiver: Address.fromBech32('erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u'),
        gasLimit: 100_000_000,
        data: data as any,
        chainID: network?.chainId || 'D',
      });

      const result = await sendTransaction(tx);
      setTxHash(result.hash);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating ESDT:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedType = TOKEN_TYPES.find((t) => t.type === formData.tokenType)!;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create ESDT Token</h1>
        <p className="text-gray-400">Deploy your own cryptocurrency on MultiversX</p>
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
            Cost: <strong className="text-white">{deploymentCost} EGLD</strong>
          </span>
          {!hasEnoughBalance && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Insufficient
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Token Type Selector */}
          <div className="grid md:grid-cols-3 gap-4">
            {TOKEN_TYPES.map((card) => {
              const Icon = card.icon;
              const isActive = formData.tokenType === card.type;
              const colorClasses =
                card.color === 'cyan'
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : card.color === 'purple'
                  ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                  : 'border-amber-400 bg-amber-400/10 text-amber-400';

              return (
                <button
                  key={card.type}
                  onClick={() => setTokenType(card.type)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                    isActive
                      ? colorClasses
                      : 'border-gray-800 bg-[#12121a] hover:border-gray-700'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                  <Icon
                    className={`w-8 h-8 mb-3 ${isActive ? '' : 'text-gray-500'}`}
                  />
                  <h3 className="text-base font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">{card.subtitle}</p>
                  <div className="flex flex-wrap gap-1">
                    {card.features.map((f) => (
                      <span
                        key={f}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/10' : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Type Description */}
          <motion.div
            key={formData.tokenType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#12121a] rounded-xl p-4 border border-gray-800"
          >
            <p className="text-sm text-gray-400">{selectedType.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Examples:</span>
              {selectedType.examples.map((ex) => (
                <span
                  key={ex}
                  className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full"
                >
                  {ex}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Main Form */}
          <div className="bg-[#12121a] rounded-2xl p-8 border border-gray-800 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Field
                label="Token Name *"
                error={errors.name}
                touched={touched.name}
                hint="Display name shown in wallets and explorers"
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => markTouched('name')}
                  placeholder="e.g., MyToken"
                  maxLength={50}
                  className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
                    touched.name && errors.name
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-gray-700 focus:border-cyan-400'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formData.name.length}/50
                </p>
              </Field>

              <Field
                label="Token Ticker *"
                error={errors.ticker}
                touched={touched.ticker}
                hint="3-10 uppercase letters. Cannot be changed."
              >
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) =>
                    updateField('ticker', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                  }
                  onBlur={() => markTouched('ticker')}
                  placeholder="e.g., MYTKN"
                  maxLength={10}
                  className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none font-mono transition-colors ${
                    touched.ticker && errors.ticker
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-gray-700 focus:border-cyan-400'
                  }`}
                />
              </Field>
            </div>

            {formData.tokenType === 'fungible' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid md:grid-cols-2 gap-6"
              >
                <Field
                  label="Initial Supply"
                  error={errors.initialSupply}
                  touched={touched.initialSupply}
                  hint="Total tokens created at launch"
                >
                  <input
                    type="number"
                    value={formData.initialSupply}
                    onChange={(e) => updateField('initialSupply', e.target.value)}
                    onBlur={() => markTouched('initialSupply')}
                    min="0"
                    className={`w-full bg-[#1a1a25] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
                      touched.initialSupply && errors.initialSupply
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-gray-700 focus:border-cyan-400'
                    }`}
                  />
                </Field>

                <Field label="Decimals" hint="How divisible is your token?">
                  <input
                    type="range"
                    min="0"
                    max="18"
                    value={formData.decimals}
                    onChange={(e) => updateField('decimals', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (Whole)</span>
                    <span className="text-cyan-400 font-medium">{formData.decimals}</span>
                    <span>18 (Standard)</span>
                  </div>
                </Field>
              </motion.div>
            )}

            {/* Properties */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-400">Token Properties</h3>
                <span className="text-xs text-gray-600">Hover for details</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(formData.properties).map(([key, value]) => {
                  const meta = PROPERTY_META[key];
                  const Icon = meta.icon;
                  return (
                    <Tooltip key={key} text={meta.desc} risk={meta.risk}>
                      <label
                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                          value
                            ? 'bg-cyan-500/10 border-cyan-500/30'
                            : 'bg-[#1a1a25] border-transparent hover:bg-[#252535]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            updateField('properties', {
                              ...formData.properties,
                              [key]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-600 bg-[#12121a] text-cyan-500 shrink-0"
                        />
                        <Icon className={`w-5 h-5 shrink-0 ${value ? 'text-cyan-400' : 'text-gray-500'}`} />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${value ? 'text-white' : 'text-gray-300'}`}>
                            {meta.label}
                          </p>
                        </div>
                      </label>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Cost & Submit */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-400/20">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-400">Deployment Cost</p>
                  <p className="text-2xl font-bold text-white">{deploymentCost} EGLD</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Network Fee</p>
                  <p className="text-lg text-cyan-400">~0.001 EGLD</p>
                </div>
              </div>
              {!hasEnoughBalance && (
                <p className="text-red-400 text-sm mb-3 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Insufficient balance to deploy
                </p>
              )}
              <button
                onClick={handleCreate}
                disabled={isCreating || !hasEnoughBalance}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white text-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Deploying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Deploy {selectedType.title}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <InfoCard
              title="What is ESDT?"
              description="MultiversX Standard Digital Tokens are native tokens with low fees and high speed."
              icon={Zap}
            />
            <InfoCard
              title="Gas Efficiency"
              description="ESDT transfers cost ~0.001 EGLD vs 21000 gas for ERC-20."
              icon={Fuel}
            />
            <InfoCard
              title="Built-in Features"
              description="No smart contract needed for pausing, minting, or burning."
              icon={Wrench}
            />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Token Preview
            </h3>
            <TokenPreviewCard formData={formData} selectedType={selectedType} />
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
              setErrors({});
              setTouched({});
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Subcomponents ─────────────────────────────────────────

const Field: React.FC<{
  label: string;
  error?: string;
  touched?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, error, touched, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-400 mb-2">
      {label}
      {hint && <span className="text-xs text-gray-600 font-normal ml-2">({hint})</span>}
    </label>
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

const Tooltip: React.FC<{
  children: React.ReactNode;
  text: string;
  risk?: string;
}> = ({ children, text, risk }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#1a1a25] border border-gray-700 rounded-xl text-xs text-gray-300 shadow-xl z-50"
          >
            <p>{text}</p>
            {risk && (
              <p className="text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {risk}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
}> = ({ title, description, icon: Icon }) => (
  <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
    <Icon className="w-8 h-8 text-cyan-400 mb-3" />
    <h4 className="font-bold text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

// ─── Token Preview Card ────────────────────────────────────
const TokenPreviewCard: React.FC<{
  formData: ESDTFormData;
  selectedType: (typeof TOKEN_TYPES)[0];
}> = ({ formData, selectedType }) => {
  const TypeIcon = selectedType.icon;
  const supplyFormatted =
    formData.tokenType === 'fungible'
      ? (parseFloat(formData.initialSupply) / Math.pow(10, 0)).toLocaleString()
      : 'N/A';

  const propertiesActive = Object.entries(formData.properties).filter(([, v]) => v);

  return (
    <div className="bg-[#12121a] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-gradient-to-r from-gray-800 to-gray-900 relative flex items-center justify-center">
        <TypeIcon className="w-10 h-10 text-gray-600" />
      </div>

      <div className="px-5 pb-5">
        <div className="relative -mt-8 mb-3 flex justify-center">
          <div className="w-16 h-16 rounded-2xl border-4 border-[#12121a] bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {formData.ticker ? formData.ticker.slice(0, 2) : '??'}
            </span>
          </div>
        </div>

        <div className="text-center mb-4">
          <h4 className="text-lg font-bold text-white truncate">
            {formData.name || 'Untitled Token'}
          </h4>
          <p className="text-cyan-400 text-sm font-mono">{formData.ticker || 'TICKER'}</p>
          <span
            className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
              selectedType.color === 'cyan'
                ? 'bg-cyan-500/20 text-cyan-400'
                : selectedType.color === 'purple'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {selectedType.title}
          </span>
        </div>

        {formData.tokenType === 'fungible' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1a1a25] rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Supply</p>
              <p className="text-white font-bold text-sm">{supplyFormatted}</p>
            </div>
            <div className="bg-[#1a1a25] rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Decimals</p>
              <p className="text-white font-bold text-sm">{formData.decimals}</p>
            </div>
          </div>
        )}

        {propertiesActive.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Active Properties</p>
            <div className="flex flex-wrap gap-1.5">
              {propertiesActive.map(([key]) => {
                const meta = PROPERTY_META[key];
                const Icon = meta.icon;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] rounded-md"
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Success Modal ─────────────────────────────────────────
const SuccessModal: React.FC<{
  txHash: string;
  formData: ESDTFormData;
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

      <h2 className="text-2xl font-bold text-white mb-2">Token Deployed!</h2>
      <p className="text-gray-400 mb-6">
        <strong className="text-white">{formData.name}</strong> ({formData.ticker}) has been
        submitted to the blockchain.
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

export default CreateESDT;
