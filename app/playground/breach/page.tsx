import { DataBreach } from "@/components/data-breach";

export const metadata = {
  title: "Data Breach",
  description: "Fling n8n packets at rogue node towers. Destroy Error nodes to trigger workflow execution cascades.",
};

export default function BreachPage() {
  return (
    <div className="playground-page">
      <div className="playground-desktop">
        <DataBreach />
      </div>
      <div className="playground-mobile-gate">
        <div className="playground-mobile-gate__inner">
          <span className="playground-mobile-gate__icon">🖥</span>
          <h2 className="playground-mobile-gate__title">Desktop only</h2>
          <p className="playground-mobile-gate__desc mono">
            Data Breach needs a bigger screen.<br />
            Open it on your laptop or desktop to play.
          </p>
        </div>
      </div>
    </div>
  );
}
