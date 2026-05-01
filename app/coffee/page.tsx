import { CoffeeWallets } from "@/components/coffee-wallets";

export const metadata = {
  title: "Buy Me a Coffee",
  description:
    "If my work helped you, feel free to send a coffee. ETH or SOL accepted."
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
              ☕ &nbsp;Send any amount — even{" "}
              <span style={{ color: "var(--accent)" }}>0.001 ETH</span> or{" "}
              <span style={{ color: "#9945FF" }}>0.01 SOL</span> is appreciated.
              No account needed, just a wallet.
            </p>
          </div>

          <CoffeeWallets />

          <div className="coffee-footer-note mono">
            <p>
              Not into crypto?{" "}
              <a
                href="https://www.buymeacoffee.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)" }}
              >
                Buy Me a Coffee ↗
              </a>{" "}
              also works.
            </p>
            <p style={{ color: "var(--fg-mute)", marginTop: "8px" }}>
              All addresses are verified — double-check before sending.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
