import { Card } from "./Card";

export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="px-4 mt-6">
      <Card className="p-6 text-center">
        <p className="text-[14px] text-[var(--ink-soft)]">
          Der Tab <span className="serif-i text-[var(--ink)]">{name}</span> kommt
          als nächstes — Heute zuerst.
        </p>
      </Card>
    </div>
  );
}
