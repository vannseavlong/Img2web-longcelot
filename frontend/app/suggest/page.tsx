import type { Metadata } from "next";
import SuggestFeature from "../components/SuggestFeature";

export const metadata: Metadata = {
  title: "Suggest a Feature — img2webp",
  description: "Have an idea? Submit a feature request or contribute to img2webp.",
};

export default function SuggestPage(): React.JSX.Element {
  return (
    <main className="flex justify-center px-4 pt-10 pb-16">
      <SuggestFeature />
    </main>
  );
}
