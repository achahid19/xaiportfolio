import { CoffeeWallets } from "@/components/coffee-wallets";

export const metadata = {
  title: "Buy Me a Coffee",
  description:
    "If my work helped you, feel free to send a coffee. ETH, SOL, BTC or BNB accepted."
};

export default function CoffeePage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow mono">Support</div>
          <h1>
            Buy me a coffee.
            <br />
            <span style={{ color: "var(--fg-mute)" }}>
              Crypto accepted. No pressure.
            </span>
          </h1>
          <p>
            If something I built, wrote, or shipped saved you time — feel free
            to send a coffee. Every sip funds the next automation experiment.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "120px" }}>
        <div className="coffee-page">
          <div className="coffee-intro">
            <p className="mono coffee-note">
              ☕ &nbsp;Send any amount — even a small tip is appreciated.
              Supports{" "}
              <span style={{ color: "#627EEA" }}>ETH</span>,{" "}
              <span style={{ color: "#9945FF" }}>SOL</span>,{" "}
              <span style={{ color: "#F7931A" }}>BTC</span>, and{" "}
              <span style={{ color: "#F0B90B" }}>BNB</span>.{" "}
              No account needed, just a wallet.
            </p>
          </div>

          <CoffeeWallets />

          <div className="coffee-footer-note mono">
            <p style={{ color: "var(--fg-mute)" }}>
              All addresses are verified — double-check before sending.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
