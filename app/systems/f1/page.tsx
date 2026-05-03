import { F1Studio } from "@/components/f1-studio";

export const metadata = {
  title: "n8n Racing · F1 Studio",
  description: "Interactive 3D F1 car — Red Bull chassis in n8n livery. Drag to inspect.",
};

export default function F1Page() {
  return (
    <div className="f1-page">
      <F1Studio />
    </div>
  );
}
