import { ScreenHeader } from "@/components/ScreenHeader";
import { ComingSoon } from "@/components/ComingSoon";

export default function TodoPage() {
  return (
    <div className="phone-scroll overflow-y-auto h-full pt-[48px] pb-[120px]">
      <ScreenHeader title="Todo" subtitle="Was zu tun ist" />
      <ComingSoon name="Todo" />
    </div>
  );
}
