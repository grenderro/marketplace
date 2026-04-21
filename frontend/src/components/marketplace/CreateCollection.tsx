// components/marketplace/CreateCollection.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, Upload, X, Check, AlertCircle, ChevronRight, ChevronLeft,
  Wallet, Image as ImageIcon, Layers, Tag, Coins, Shield,
  Calendar, Users, Sparkles, Loader2,
} from 'lucide-react';
import { useGetAccountInfo } from '../../hooks/sdkStubs';
import { Transaction, Address, TokenTransfer } from '@multiversx/sdk-core';

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
  name: '', ticker: '', description: '', maxSupply: 10000, mintPrice: '0.1',
  royalties: 2.5, isSoulbound: false, whitelistEnabled: false, maxPerWallet: 0,
  mintStartDate: '', mintEndDate: '', image: null, banner: null,
};

// ─── Theme Constants ───────────────────────────────────────
const theme = {
  bg: '#0a0e17',
  card: '#12121a',
  input: '#1a1a25',
  inputHover: '#252535',
  border: 'rgba(148, 163, 184, 0.1)',
  borderFocus: 'rgba(0, 212, 255, 0.4)',
  borderError: 'rgba(239, 68, 68, 0.5)',
  cyan: '#00d4ff',
  turquoise: '#2dd4bf',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  gradient: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 100%)',
  shadowCyan: '0 0 20px rgba(0, 212, 255, 0.2)',
};

// ─── Component ─────────────────────────────────────────────
export const CreateCollection: React.FC = () => {
  const { address, account } = useGetAccountInfo();
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

  const validateStep = useCallback((step: number, data = formData): FormErrors => {
    const e: FormErrors = {};
    if (step === 0) {
      if (!data.name.trim()) e.name = 'Collection name is required';
      else if (data.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
      else if (data.name.trim().length > 50) e.name = 'Name must be under 50 characters';
      if (!data.ticker.trim()) e.ticker = 'Ticker is required';
      else if (!/^[A-Z]{3,10}$/.test(data.ticker.trim())) e.ticker = 'Ticker must be 3-10 uppercase letters (A-Z)';
    }
    if (step === 1) {
      if (data.maxSupply < 1 || data.maxSupply > 100000) e.maxSupply = 'Supply must be between 1 and 100,000';
      const price = parseFloat(data.mintPrice);
      if (isNaN(price) || price < 0) e.mintPrice = 'Price must be 0 or greater';
      if (data.mintEndDate && data.mintStartDate && new Date(data.mintEndDate) <= new Date(data.mintStartDate))
        e.mintEndDate = 'End date must be after start date';
    }
    if (step === 2) {
      if (!data.image) e.image = 'Collection image is required';
    }
    return e;
  }, [formData]);

  const isStepValid = useCallback((step: number) => Object.keys(validateStep(step)).length === 0, [validateStep]);
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const updateField = <K extends keyof CollectionFormData>(field: K, value: CollectionFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field as keyof FormErrors]; return next; });
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setTouched((prev) => { const next = { ...prev }; Object.keys(stepErrors).forEach((k) => (next[k] = true)); return next; });
      return;
    }
    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const handleCreate = async () => {
    const allErrors = { ...validateStep(0), ...validateStep(1), ...validateStep(2) };
    if (Object.keys(allErrors).length > 0) { setErrors(allErrors); return; }
    if (!address) { alert('Please connect your wallet first'); return; }
    if (!hasEnoughBalance) { alert(`Insufficient balance. You need at least ${deploymentCost} EGLD`); return; }

    setIsCreating(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const result = await sendTransaction({} as Transaction);
      setTxHash(result.hash);
      setShowSuccess(true);
    } finally {
      setIsCreating(false);
    }
  };

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
    if (e.dataTransfer.files?.[0]) updateField(field, e.dataTransfer.files[0]);
  };

  const imagePreview = formData.image ? URL.createObjectURL(formData.image) : null;
  const bannerPreview = formData.banner ? URL.createObjectURL(formData.banner) : null;

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: theme.text, marginBottom: '0.5rem' }}>Create NFT Collection</h1>
        <p style={{ color: theme.textMuted, fontSize: '0.875rem' }}>Launch your own collection on MultiversX</p>
      </div>

      {/* Wallet Balance Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem', borderRadius: '0.75rem', marginBottom: '2rem',
        background: hasEnoughBalance ? 'rgba(0, 212, 255, 0.05)' : 'rgba(239, 68, 68, 0.05)',
        border: `1px solid ${hasEnoughBalance ? 'rgba(0, 212, 255, 0.15)' : 'rgba(239, 68, 68, 0.2)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Wallet size={20} style={{ color: hasEnoughBalance ? theme.cyan : '#ef4444' }} />
          <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
            Wallet: <strong style={{ color: theme.text }}>{walletBalance.toFixed(4)} EGLD</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
          <span style={{ color: theme.textMuted }}>
            Deployment cost: <strong style={{ color: theme.text }}>{deploymentCost} EGLD</strong>
          </span>
          {!hasEnoughBalance && (
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={16} /> Insufficient balance
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="create-grid">
        {/* Left: Form Wizard */}
        <div>
          {/* Progress Steps */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            {STEPS.map((step, idx) => {
              const isComplete = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.3s',
                      background: isComplete ? 'rgba(0, 212, 255, 0.2)' : isCurrent ? theme.gradient : theme.input,
                      color: isComplete || isCurrent ? theme.text : theme.textMuted,
                      border: isCurrent ? `2px solid ${theme.cyan}` : 'none',
                      boxShadow: isCurrent ? theme.shadowCyan : 'none',
                    }}>
                      {isComplete ? <Check size={20} style={{ color: theme.cyan }} /> : idx + 1}
                    </div>
                    <span style={{
                      fontSize: '0.75rem', marginTop: '0.5rem',
                      color: isCurrent ? theme.text : isComplete ? theme.cyan : theme.textMuted,
                    }}>{step}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: '0.25rem', margin: '0 0.5rem', borderRadius: '9999px',
                      background: isComplete ? 'rgba(0, 212, 255, 0.3)' : theme.input,
                    }} />
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
              style={{
                background: theme.card, borderRadius: '1rem', padding: '2rem',
                border: `1px solid ${theme.border}`,
              }}
            >
              {currentStep === 0 && <BasicInfoStep formData={formData} updateField={updateField} errors={errors} touched={touched} markTouched={markTouched} />}
              {currentStep === 1 && <TokenomicsStep formData={formData} updateField={updateField} errors={errors} touched={touched} markTouched={markTouched} />}
              {currentStep === 2 && <AssetsStep formData={formData} updateField={updateField} errors={errors} touched={touched} markTouched={markTouched} dragActive={dragActive} handleDrag={handleDrag} handleDrop={handleDrop} />}
              {currentStep === 3 && <ReviewStep formData={formData} onCreate={handleCreate} isCreating={isCreating} hasEnoughBalance={hasEnoughBalance} deploymentCost={deploymentCost} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                border: `1px solid ${theme.border}`, color: theme.textSecondary, background: 'transparent', cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 0 ? 0.4 : 1, transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (currentStep !== 0) { e.currentTarget.style.borderColor = theme.borderFocus; e.currentTarget.style.color = theme.text; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                  background: theme.gradient, color: theme.bg, fontWeight: 700, border: 'none', cursor: 'pointer',
                  boxShadow: theme.shadowCyan, transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = theme.shadowCyan; e.currentTarget.style.transform = 'none'; }}
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={isCreating || !hasEnoughBalance}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: '0.75rem',
                  background: theme.gradient, color: theme.bg, fontWeight: 700, border: 'none',
                  opacity: isCreating || !hasEnoughBalance ? 0.5 : 1, cursor: isCreating || !hasEnoughBalance ? 'not-allowed' : 'pointer',
                  boxShadow: theme.shadowCyan, transition: 'all 0.2s',
                }}
              >
                {isCreating ? <><Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : <><Sparkles size={20} /> Deploy Collection</>}
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div>
          <div style={{ position: 'sticky', top: '1rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Live Preview
            </h3>
            <CollectionPreviewCard formData={formData} imagePreview={imagePreview} bannerPreview={bannerPreview} />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal txHash={txHash} formData={formData} onClose={() => {
            setShowSuccess(false); setFormData(INITIAL_DATA); setCurrentStep(0); setErrors({}); setTouched({});
          }} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Subcomponents ─────────────────────────────────────────

const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <span style={{ marginLeft: '0.5rem', color: theme.textMuted, cursor: 'help' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        <Info size={16} />
      </span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            style={{
              position: 'absolute', left: '100%', marginLeft: '0.5rem', top: '50%', transform: 'translateY(-50%)',
              width: '14rem', padding: '0.75rem', background: theme.input, border: `1px solid ${theme.border}`,
              borderRadius: '0.75rem', fontSize: '0.75rem', color: theme.textSecondary, zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Field: React.FC<{ label: React.ReactNode; error?: string; touched?: boolean; children: React.ReactNode }> =
  ({ label, error, touched, children }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: theme.textSecondary, marginBottom: '0.5rem' }}>{label}</label>
      {children}
      {touched && error && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertCircle size={12} /> {error}
        </motion.p>
      )}
    </div>
  );

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', background: theme.input, border: `1px solid ${hasError ? theme.borderError : theme.border}`,
  borderRadius: '0.75rem', padding: '0.75rem 1rem', color: theme.text, outline: 'none', transition: 'border-color 0.2s',
});

const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, hasError: boolean) => {
  e.currentTarget.style.borderColor = hasError ? '#ef4444' : theme.borderFocus;
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, hasError: boolean) => {
  e.currentTarget.style.borderColor = hasError ? theme.borderError : theme.border;
};

// ─── Step 1: Basic Info ────────────────────────────────────
const BasicInfoStep: React.FC<any> = ({ formData, updateField, errors, touched, markTouched }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <Field label={<Tooltip text="The display name of your NFT collection. This will be shown on marketplaces and wallets.">Collection Name *</Tooltip>} error={errors.name} touched={touched.name}>
      <input type="text" value={formData.name} maxLength={50}
        onChange={(e) => updateField('name', e.target.value)} onBlur={() => markTouched('name')}
        placeholder="e.g., Cosmic Warriors"
        style={inputStyle(!!(touched.name && errors.name))}
        onFocus={(e) => inputFocus(e, !!(touched.name && errors.name))}
        onBlurCapture={(e) => { inputBlur(e, !!(touched.name && errors.name)); markTouched('name'); }}
      />
      <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.25rem', textAlign: 'right' }}>{formData.name.length}/50</p>
    </Field>

    <Field label={<Tooltip text="A short uppercase identifier for your collection (like BAYC, AZUKI). Once set, it cannot be changed.">Token Ticker *</Tooltip>} error={errors.ticker} touched={touched.ticker}>
      <input type="text" value={formData.ticker} maxLength={10}
        onChange={(e) => updateField('ticker', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
        placeholder="e.g., WARRIOR"
        style={{ ...inputStyle(!!(touched.ticker && errors.ticker)), fontFamily: 'monospace' }}
        onFocus={(e) => inputFocus(e, !!(touched.ticker && errors.ticker))}
        onBlurCapture={(e) => { inputBlur(e, !!(touched.ticker && errors.ticker)); markTouched('ticker'); }}
      />
      <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.25rem' }}>3-10 uppercase letters only. Cannot be changed later.</p>
    </Field>

    <Field label="Description">
      <textarea value={formData.description} rows={4} maxLength={500}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder="Tell the story of your collection..."
        style={{ ...inputStyle(false), resize: 'none' }}
        onFocus={(e) => inputFocus(e, false)} onBlur={(e) => inputBlur(e, false)}
      />
      <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.25rem', textAlign: 'right' }}>{formData.description.length}/500</p>
    </Field>
  </div>
);

// ─── Step 2: Tokenomics ────────────────────────────────────
const TokenomicsStep: React.FC<any> = ({ formData, updateField, errors, touched, markTouched }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <Field label={<Tooltip text="The maximum number of NFTs that can ever be minted in this collection.">Max Supply *</Tooltip>} error={errors.maxSupply} touched={touched.maxSupply}>
        <input type="number" min={1} max={100000} value={formData.maxSupply}
          onChange={(e) => updateField('maxSupply', parseInt(e.target.value) || 0)}
          onBlur={() => markTouched('maxSupply')}
          style={inputStyle(!!(touched.maxSupply && errors.maxSupply))}
          onFocus={(e) => inputFocus(e, !!(touched.maxSupply && errors.maxSupply))}
          onBlurCapture={(e) => { inputBlur(e, !!(touched.maxSupply && errors.maxSupply)); markTouched('maxSupply'); }}
        />
      </Field>

      <Field label={<Tooltip text="The price users pay to mint one NFT. Set to 0 for a free mint.">Mint Price (EGLD)</Tooltip>} error={errors.mintPrice} touched={touched.mintPrice}>
        <input type="number" step="0.01" min="0" value={formData.mintPrice}
          onChange={(e) => updateField('mintPrice', e.target.value)} onBlur={() => markTouched('mintPrice')}
          placeholder="0.00 for free mint"
          style={inputStyle(!!(touched.mintPrice && errors.mintPrice))}
          onFocus={(e) => inputFocus(e, !!(touched.mintPrice && errors.mintPrice))}
          onBlurCapture={(e) => { inputBlur(e, !!(touched.mintPrice && errors.mintPrice)); markTouched('mintPrice'); }}
        />
      </Field>
    </div>

    <Field label={<Tooltip text="Percentage you earn on every secondary sale. MultiversX standard is 2.5% - 10%.">Creator Royalties: {formData.royalties}%</Tooltip>}>
      <input type="range" min="0" max="10" step="0.5" value={formData.royalties}
        onChange={(e) => updateField('royalties', parseFloat(e.target.value))}
        style={{ width: '100%', height: '0.5rem', borderRadius: '9999px', appearance: 'none', background: theme.input, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.25rem' }}>
        <span>0%</span><span>2.5%</span><span>5%</span><span>7.5%</span><span>10%</span>
      </div>
    </Field>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <Field label={<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> Mint Start Date</span>}>
        <input type="datetime-local" value={formData.mintStartDate}
          onChange={(e) => updateField('mintStartDate', e.target.value)}
          style={inputStyle(false)} onFocus={(e) => inputFocus(e, false)} onBlur={(e) => inputBlur(e, false)}
        />
      </Field>
      <Field label={<span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> Mint End Date</span>} error={errors.mintEndDate} touched={touched.mintEndDate}>
        <input type="datetime-local" value={formData.mintEndDate}
          onChange={(e) => updateField('mintEndDate', e.target.value)} onBlur={() => markTouched('mintEndDate')}
          style={inputStyle(!!(touched.mintEndDate && errors.mintEndDate))}
          onFocus={(e) => inputFocus(e, !!(touched.mintEndDate && errors.mintEndDate))}
          onBlurCapture={(e) => { inputBlur(e, !!(touched.mintEndDate && errors.mintEndDate)); markTouched('mintEndDate'); }}
        />
      </Field>
    </div>

    <Field label={<Tooltip text="Limit how many NFTs one wallet can mint. 0 = unlimited.">Max Per Wallet</Tooltip>}>
      <input type="number" min={0} value={formData.maxPerWallet}
        onChange={(e) => updateField('maxPerWallet', parseInt(e.target.value) || 0)}
        style={inputStyle(false)} onFocus={(e) => inputFocus(e, false)} onBlur={(e) => inputBlur(e, false)}
      />
      <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.25rem' }}>0 = no limit</p>
    </Field>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
      <ToggleCard icon={<Users size={18} style={{ color: theme.cyan }} />} label="Enable Whitelist" description="Only approved wallets can mint"
        checked={formData.whitelistEnabled} onChange={(v) => updateField('whitelistEnabled', v)} />
      <ToggleCard icon={<Shield size={18} style={{ color: '#a78bfa' }} />} label="Soulbound" description="Non-transferable after mint"
        checked={formData.isSoulbound} onChange={(v) => updateField('isSoulbound', v)} />
    </div>
  </div>
);

const ToggleCard: React.FC<{ icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }> =
  ({ icon, label, description, checked, onChange }) => (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem',
      background: checked ? 'rgba(0, 212, 255, 0.05)' : theme.input, border: `1px solid ${checked ? 'rgba(0, 212, 255, 0.2)' : theme.border}`,
      cursor: 'pointer', transition: 'all 0.2s',
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: '1.25rem', height: '1.25rem', accentColor: theme.cyan, cursor: 'pointer' }} />
      <div>
        <span style={{ color: theme.text, fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon} {label}
        </span>
        <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0 }}>{description}</p>
      </div>
    </label>
  );

// ─── Step 3: Assets ────────────────────────────────────────
const AssetsStep: React.FC<any> = ({ formData, updateField, errors, touched, markTouched, dragActive, handleDrag, handleDrop }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <Field label={<Tooltip text="This image represents your entire collection. Recommended: 512x512px or larger square image.">Collection Image *</Tooltip>} error={errors.image} touched={touched.image}>
      <div
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={(e) => handleDrop(e, 'image')}
        style={{
          border: `2px dashed ${dragActive ? theme.cyan : touched.image && errors.image ? theme.borderError : theme.border}`,
          borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', transition: 'all 0.2s',
          background: dragActive ? 'rgba(0, 212, 255, 0.05)' : touched.image && errors.image ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
        }}
      >
        {formData.image ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={URL.createObjectURL(formData.image)} alt="Preview" style={{ width: '10rem', height: '10rem', borderRadius: '1rem', objectFit: 'cover', border: `1px solid ${theme.border}` }} />
            <button onClick={() => updateField('image', null)}
              style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', width: '2rem', height: '2rem', borderRadius: '9999px', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
            <p style={{ fontSize: '0.875rem', color: theme.textSecondary, marginTop: '0.75rem' }}>{formData.image.name}</p>
          </div>
        ) : (
          <label style={{ cursor: 'pointer' }}>
            <Upload size={40} style={{ color: dragActive ? theme.cyan : theme.textMuted, margin: '0 auto 0.75rem' }} />
            <p style={{ color: theme.textSecondary, fontWeight: 500 }}>{dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}</p>
            <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.25rem' }}>PNG, JPG, GIF up to 10MB</p>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { updateField('image', e.target.files?.[0] || null); markTouched('image'); }}
            />
          </label>
        )}
      </div>
    </Field>

    <Field label={<Tooltip text="A wide banner image displayed at the top of your collection page. Recommended: 1400x400px.">Banner Image</Tooltip>}>
      <div
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={(e) => handleDrop(e, 'banner')}
        style={{ border: `2px dashed ${dragActive ? theme.cyan : theme.border}`, borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', transition: 'all 0.2s', background: dragActive ? 'rgba(0, 212, 255, 0.05)' : 'transparent' }}
      >
        {formData.banner ? (
          <div style={{ position: 'relative' }}>
            <img src={URL.createObjectURL(formData.banner)} alt="Banner" style={{ width: '100%', height: '8rem', borderRadius: '0.75rem', objectFit: 'cover', border: `1px solid ${theme.border}` }} />
            <button onClick={() => updateField('banner', null)}
              style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', width: '2rem', height: '2rem', borderRadius: '9999px', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
            <p style={{ fontSize: '0.875rem', color: theme.textSecondary, marginTop: '0.5rem' }}>{formData.banner.name}</p>
          </div>
        ) : (
          <label style={{ cursor: 'pointer' }}>
            <ImageIcon size={32} style={{ color: dragActive ? theme.cyan : theme.textMuted, margin: '0 auto 0.5rem' }} />
            <p style={{ color: theme.textSecondary, fontSize: '0.875rem' }}>{dragActive ? 'Drop banner here' : 'Upload banner (optional)'}</p>
            <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.25rem' }}>Recommended: 1400x400px</p>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => updateField('banner', e.target.files?.[0] || null)} />
          </label>
        )}
      </div>
    </Field>
  </div>
);

// ─── Step 4: Review ────────────────────────────────────────
const ReviewStep: React.FC<any> = ({ formData, onCreate, isCreating, hasEnoughBalance, deploymentCost }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Layers size={20} style={{ color: theme.cyan }} /> Review & Deploy
    </h3>

    <div style={{ background: theme.input, borderRadius: '0.75rem', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
      <ReviewRow icon={<Tag size={16} />} label="Name" value={formData.name || '—'} />
      <ReviewRow icon={<Coins size={16} />} label="Ticker" value={formData.ticker || '—'} />
      <ReviewRow icon={<Layers size={16} />} label="Max Supply" value={formData.maxSupply.toLocaleString()} />
      <ReviewRow icon={<Coins size={16} />} label="Mint Price" value={`${formData.mintPrice} EGLD`} />
      <ReviewRow icon={<Sparkles size={16} />} label="Royalties" value={`${formData.royalties}%`} />
      {formData.mintStartDate && <ReviewRow icon={<Calendar size={16} />} label="Starts" value={new Date(formData.mintStartDate).toLocaleString()} />}
      {formData.mintEndDate && <ReviewRow icon={<Calendar size={16} />} label="Ends" value={new Date(formData.mintEndDate).toLocaleString()} />}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem' }}>
        {formData.whitelistEnabled && <Badge text="Whitelist" color={theme.cyan} />}
        {formData.isSoulbound && <Badge text="Soulbound" color="#a78bfa" />}
        {formData.maxPerWallet > 0 && <Badge text={`Max ${formData.maxPerWallet}/wallet`} color="#4ade80" />}
      </div>
    </div>

    <div style={{
      background: 'rgba(0, 212, 255, 0.05)', borderRadius: '0.75rem', padding: '1.25rem', border: `1px solid rgba(0, 212, 255, 0.15)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ color: theme.textSecondary }}>Deployment Cost</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text }}>{deploymentCost} EGLD</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
        <span style={{ color: theme.textMuted }}>Network Fee (estimated)</span>
        <span style={{ color: theme.cyan }}>~0.001 EGLD</span>
      </div>
      {!hasEnoughBalance && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertCircle size={16} /> Insufficient balance to deploy
        </p>
      )}
    </div>

    <p style={{ fontSize: '0.75rem', color: theme.textMuted }}>
      By deploying, you confirm that you own the rights to this collection and its assets. This transaction is irreversible.
    </p>
  </div>
);

const ReviewRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.textSecondary, fontSize: '0.875rem' }}>
      {icon} {label}
    </div>
    <span style={{ color: theme.text, fontWeight: 500, fontSize: '0.875rem' }}>{value}</span>
  </div>
);

const Badge: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <span style={{
    padding: '0.25rem 0.75rem', background: `${color}20`, color, fontSize: '0.75rem', borderRadius: '9999px', fontWeight: 500,
  }}>{text}</span>
);

// ─── Live Preview Card ─────────────────────────────────────
const CollectionPreviewCard: React.FC<any> = ({ formData, imagePreview, bannerPreview }) => (
  <div style={{
    background: theme.card, borderRadius: '1rem', border: `1px solid ${theme.border}`, overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  }}>
    {/* Banner */}
    <div style={{ height: '6rem', background: 'linear-gradient(90deg, #1a2332, #0f172a)', position: 'relative' }}>
      {bannerPreview ? (
        <img src={bannerPreview} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
          <ImageIcon size={24} />
        </div>
      )}
    </div>

    {/* Avatar + Info */}
    <div style={{ padding: '0 1.25rem 1.25rem' }}>
      <div style={{ position: 'relative', marginTop: '-2.5rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: '5rem', height: '5rem', borderRadius: '1rem', border: `4px solid ${theme.card}`,
          background: 'linear-gradient(135deg, #1a2332, #0f172a)', overflow: 'hidden',
        }}>
          {imagePreview ? (
            <img src={imagePreview} alt="Collection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
              <Layers size={24} />
            </div>
          )}
        </div>
      </div>

      <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {formData.name || 'Untitled Collection'}
      </h4>
      <p style={{ color: theme.cyan, fontSize: '0.875rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
        {formData.ticker || 'TICKER'}
      </p>
      <p style={{ color: theme.textMuted, fontSize: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '1rem' }}>
        {formData.description || 'No description provided'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ background: theme.input, borderRadius: '0.5rem', padding: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: theme.textMuted }}>Supply</p>
          <p style={{ color: theme.text, fontWeight: 700 }}>{formData.maxSupply.toLocaleString()}</p>
        </div>
        <div style={{ background: theme.input, borderRadius: '0.5rem', padding: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: theme.textMuted }}>Price</p>
          <p style={{ color: theme.text, fontWeight: 700 }}>{parseFloat(formData.mintPrice) > 0 ? `${formData.mintPrice} EGLD` : 'Free'}</p>
        </div>
      </div>

      {formData.royalties > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: theme.textMuted }}>
          <Sparkles size={14} style={{ color: '#fbbf24' }} /> {formData.royalties}% creator royalties
        </div>
      )}

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.border}`, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {formData.whitelistEnabled && <Badge text="Whitelist" color={theme.cyan} />}
        {formData.isSoulbound && <Badge text="Soulbound" color="#a78bfa" />}
        {formData.maxPerWallet > 0 && <Badge text={`${formData.maxPerWallet}/wallet`} color="#4ade80" />}
      </div>
    </div>
  </div>
);

// ─── Success Modal ─────────────────────────────────────────
const SuccessModal: React.FC<any> = ({ txHash, formData, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      style={{ background: theme.card, borderRadius: '1rem', border: `1px solid ${theme.border}`, padding: '2rem', maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
      <div style={{
        width: '4rem', height: '4rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '9999px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
      }}>
        <Check size={32} style={{ color: theme.cyan }} />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, marginBottom: '0.5rem' }}>Collection Created!</h2>
      <p style={{ color: theme.textSecondary, marginBottom: '1.5rem' }}>
        <strong style={{ color: theme.text }}>{formData.name}</strong> has been submitted to the blockchain.
      </p>
      <div style={{ background: theme.input, borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
        <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '0.25rem' }}>Transaction Hash</p>
        <p style={{ color: theme.cyan, fontSize: '0.875rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{txHash}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onClose}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: theme.input, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 500, cursor: 'pointer' }}>
          Create Another
        </button>
        <button onClick={() => window.open(`https://devnet-explorer.multiversx.com/transactions/${txHash}`, '_blank')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: theme.gradient, color: theme.bg, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          View on Explorer
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default CreateCollection;
