"use client";

import { useState } from "react";

interface Wallet {
  chain: string;
  symbol: string;
  address: string;
  color: string;
  icon: string;
}

const WALLETS: Wallet[] = [
  {
    chain: "Ethereum",
    symbol: "ETH",
    address: "0x4e3e742Fe7C890c61d713aa1eB42270FFdBFEbDa",
    color: "#627EEA",
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L7 16.5L16 21L25 16.5L16 4Z" fill="currentColor" opacity="0.6"/>
      <path d="M16 21L7 16.5L16 28L25 16.5L16 21Z" fill="currentColor"/>
      <path d="M16 4L16 21L25 16.5L16 4Z" fill="currentColor" opacity="0.2"/>
      <path d="M16 21L16 28L25 16.5L16 21Z" fill="currentColor" opacity="0.6"/>
    </svg>`
  },
  {
    chain: "Solana",
    symbol: "SOL",
    address: "4Em6oT2DWgivRB35bcfkKNzJ27aKg8DNFgh5Nsav6JW2",
    color: "#9945FF",
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 22.5H26L22 26H6L6 22.5Z" fill="url(#sol-grad-1)"/>
      <path d="M6 14.25H26L22 17.75H6L6 14.25Z" fill="url(#sol-grad-2)"/>
      <path d="M22 6H6L6 9.5H26L22 6Z" fill="url(#sol-grad-3)"/>
      <defs>
        <linearGradient id="sol-grad-1" x1="6" y1="24.25" x2="26" y2="24.25" gradientUnits="userSpaceOnUse">
          <stop stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/>
        </linearGradient>
        <linearGradient id="sol-grad-2" x1="6" y1="16" x2="26" y2="16" gradientUnits="userSpaceOnUse">
          <stop stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/>
        </linearGradient>
        <linearGradient id="sol-grad-3" x1="6" y1="7.75" x2="26" y2="7.75" gradientUnits="userSpaceOnUse">
          <stop stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/>
        </linearGradient>
      </defs>
    </svg>`
  },
  {
    chain: "Bitcoin",
    symbol: "BTC",
    address: "bc1qhrwflj746j5erj07v72spxdd8dw4dfwmqqjsjx",
    color: "#F7931A",
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.2 13.8c.4-2.6-1.6-4-4.3-4.9l.9-3.5-2.1-.5-.9 3.4-1.7-.4.9-3.4-2.1-.5-.9 3.5-1.3-.3-2.9-.7-.6 2.3s1.6.4 1.5.4c.9.2 1 .8 1 1.2l-1 4.1c.1 0 .2.1.3.1h-.3l-1.5 5.8c-.1.3-.4.7-1 .6 0 .1-1.5-.4-1.5-.4L7 23.4l2.7.7 1.5.4-.9 3.5 2.1.5.9-3.5 1.7.4-.9 3.5 2.1.5.9-3.5c3.5.7 6.1.4 7.2-2.8.9-2.5-.1-4-1.9-4.9 1.4-.3 2.4-1.2 2.7-3zm-4.8 6.7c-.6 2.5-4.9 1.2-6.3.8l1.1-4.5c1.4.4 5.9 1 5.2 3.7zm.7-6.8c-.6 2.3-4.2 1.1-5.3.8l1-4.1c1.2.3 4.9.8 4.3 3.3z" fill="currentColor"/>
    </svg>`
  },
  {
    chain: "BNB Chain",
    symbol: "BNB",
    address: "0x4e3e742Fe7C890c61d713aa1eB42270FFdBFEbDa",
    color: "#F0B90B",
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4l2.8 2.8-8.2 8.2-2.8-2.8L16 4z" fill="currentColor"/>
      <path d="M10.4 9.6l2.8 2.8-2.8 2.8-2.8-2.8 2.8-2.8z" fill="currentColor"/>
      <path d="M21.6 9.6l2.8 2.8-2.8 2.8-2.8-2.8 2.8-2.8z" fill="currentColor"/>
      <path d="M16 14l2.8 2.8-8.2 8.2L7.8 22 16 14z" fill="currentColor" opacity="0.7"/>
      <path d="M16 14l5.4 5.4-2.8 2.8L16 19.6l-2.6 2.6-2.8-2.8L16 14z" fill="currentColor"/>
      <path d="M16 20.4l2.8 2.8L16 26l-2.8-2.8 2.8-2.8z" fill="currentColor"/>
    </svg>`
  }
];

function truncate(address: string) {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function WalletCard({ wallet }: { wallet: Wallet }) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ffffff&bgcolor=0d0d12&data=${encodeURIComponent(wallet.address)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="coffee-card">
      <div className="coffee-card-header">
        <div
          className="coffee-chain-icon"
          style={{ color: wallet.color }}
          dangerouslySetInnerHTML={{ __html: wallet.icon }}
        />
        <div>
          <div className="coffee-chain-name">{wallet.chain}</div>
          <div className="coffee-chain-symbol mono">{wallet.symbol}</div>
        </div>
      </div>

      <div className="coffee-address-row">
        <code className="coffee-address mono">{truncate(wallet.address)}</code>
        <button
          type="button"
          className={`coffee-copy-btn mono${copied ? " coffee-copy-btn--copied" : ""}`}
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy address"}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      <div className="coffee-full-address mono">{wallet.address}</div>

      <button
        type="button"
        className="coffee-qr-toggle mono"
        onClick={() => setQrOpen((o) => !o)}
      >
        {qrOpen ? "Hide QR code ↑" : "Show QR code ↓"}
      </button>

      {qrOpen && (
        <div className="coffee-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={`QR code for ${wallet.chain} address`}
            width={160}
            height={160}
          />
        </div>
      )}
    </div>
  );
}

export function CoffeeWallets() {
  return (
    <div className="coffee-wallets">
      {WALLETS.map((wallet) => (
        <WalletCard key={wallet.chain} wallet={wallet} />
      ))}
    </div>
  );
}
