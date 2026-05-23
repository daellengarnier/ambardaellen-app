import { ScreenHeader } from "@/components/ScreenHeader";
import { ComingSoon } from "@/components/ComingSoon";

export default function AktivitaetenPage() {
  return (
    <div className="phone-scroll overflow-y-auto h-full pt-[48px] pb-[120px]">
      <ScreenHeader title="Aktivitäten" subtitle="Gemeinsam unterwegs" />
      <ComingSoon name="Aktivitäten" />
    </div>
  );
}
