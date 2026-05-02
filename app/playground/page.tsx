import { FlowBreaker } from "@/components/flow-breaker";

export const metadata = {
  title: "Playground",
  description: "Flow Breaker — a stress-relief node-popping game. Chain reactions, mega nodes, beat your best score."
};

export default function PlaygroundPage() {
  return (
    <div className="playground-page">
      <FlowBreaker />
    </div>
  );
}
