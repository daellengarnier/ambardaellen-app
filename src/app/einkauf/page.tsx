import { ScreenHeader } from "@/components/ScreenHeader";
import { ComingSoon } from "@/components/ComingSoon";

export default function EinkaufPage() {
  return (
    <div className="phone-scroll overflow-y-auto h-full pt-[48px] pb-[120px]">
      <ScreenHeader title="Einkauf" subtitle="Was als nächstes mit muss" />
      <ComingSoon name="Einkauf" />
    </div>
  );
}
