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
