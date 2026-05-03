import { WorkflowSpeedrun } from "@/components/workflow-speedrun";

export const metadata = {
  title: "Workflow Speedrun",
  description: "Execute n8n workflows as fast as you can. Route data, handle IF branches, beat your best time.",
};

export default function SpeedrunPage() {
  return (
    <div className="playground-page">
      <div className="playground-desktop">
        <WorkflowSpeedrun />
      </div>
      <div className="playground-mobile-gate">
        <div className="playground-mobile-gate__inner">
          <span className="playground-mobile-gate__icon">🖥</span>
          <h2 className="playground-mobile-gate__title">Desktop only</h2>
          <p className="playground-mobile-gate__desc mono">
            Workflow Speedrun needs a bigger screen.<br />
            Open it on your laptop or desktop to play.
          </p>
        </div>
      </div>
    </div>
  );
}
