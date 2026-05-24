"use client";

import { useState } from "react";
import { Trash2, Plane, TrainFront, Bus, Car, Ship, Route } from "lucide-react";
import { Sheet } from "../Sheet";
import { useStore } from "@/lib/store";
import type { TripSegment, TripSegmentKind } from "@/lib/types";

const KIND_OPTIONS: Array<{ id: TripSegmentKind; label: string; Icon: typeof Plane }> = [
  { id: "flight", label: "Flug", Icon: Plane },
  { id: "train", label: "Zug", Icon: TrainFront },
  { id: "bus", label: "Bus", Icon: Bus },
  { id: "car", label: "Auto", Icon: Car },
  { id: "ferry", label: "Fähre", Icon: Ship },
  { id: "other", label: "Anderes", Icon: Route },
];

type Props = {
  activityId: string;
  /** null = closed; { mode: "new" } = neue Strecke; { mode: "edit", id } = bearbeiten */
  state: { mode: "new" } | { mode: "edit"; segmentId: string } | null;
  onClose: () => void;
};

export function SegmentEditor({ activityId, state, onClose }: Props) {
  if (!state) return null;
  return <SegmentEditorInner activityId={activityId} state={state} onClose={onClose} />;
}

function SegmentEditorInner({
  activityId,
  state,
  onClose,
}: {
  activityId: string;
  state: { mode: "new" } | { mode: "edit"; segmentId: string };
  onClose: () => void;
}) {
  const activity = useStore((s) => s.activities.find((a) => a.id === activityId));
  const addSegment = useStore((s) => s.addSegment);
  const updateSegment = useStore((s) => s.updateSegment);
  const removeSegment = useStore((s) => s.removeSegment);

  const existing =
    state.mode === "edit"
      ? activity?.segments.find((g) => g.id === state.segmentId) ?? null
      : null;

  const [kind, setKind] = useState<TripSegmentKind>(existing?.kind ?? "train");
  const [from, setFrom] = useState(existing?.from ?? "");
  const [to, setTo] = useState(existing?.to ?? "");
  const [depart, setDepart] = useState(existing?.depart ?? "");
  const [arrive, setArrive] = useState(existing?.arrive ?? "");
  const [ref, setRef] = useState(existing?.ref ?? "");
  const [note, setNote] = useState(existing?.note ?? "");

  const submit = () => {
    if (!from.trim() && !to.trim()) return;
    const payload: Omit<TripSegment, "id"> = {
      kind,
      from: from.trim(),
      to: to.trim(),
      depart,
      arrive,
      ref: ref.trim(),
      note: note.trim(),
    };
    if (state.mode === "new") {
      addSegment(activityId, payload);
    } else {
      updateSegment(activityId, state.segmentId, payload);
    }
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={state.mode === "new" ? "Neue Strecke" : "Strecke bearbeiten"}
    >
      <div className="uplabel text-[10.5px] mt-2 mb-1.5" style={{ color: "var(--muted)" }}>
        Art
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {KIND_OPTIONS.map(({ id, label, Icon }) => {
          const active = kind === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className="tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
              style={
                active
                  ? { background: "var(--terra)", color: "white" }
                  : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
              }
            >
              <Icon size={12} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Field label="Von" value={from} onChange={setFrom} placeholder="z. B. Berlin Hbf" />
        <Field label="Nach" value={to} onChange={setTo} placeholder="z. B. Wien Hbf" />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <DateTimeField label="Abfahrt" value={depart} onChange={setDepart} />
        <DateTimeField label="Ankunft" value={arrive} onChange={setArrive} />
      </div>

      <Field
        label="Referenz (Flugnr., Buchungs-Nr., Wagen, …)"
        value={ref}
        onChange={setRef}
        placeholder={kind === "flight" ? "LH 1234" : kind === "train" ? "EC 173 · Wagen 24" : ""}
      />

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Notiz
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="z. B. Sitzplatz, Adresse, Pickup-Ort…"
        className="w-full rounded-2xl p-3 text-[14px] resize-none"
        style={{ background: "rgba(228,217,191,0.5)" }}
      />

      <button
        type="button"
        onClick={submit}
        className="w-full mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: "var(--terra)" }}
      >
        {state.mode === "new" ? "Hinzufügen" : "Speichern"}
      </button>

      {state.mode === "edit" && (
        <button
          type="button"
          onClick={() => {
            removeSegment(activityId, state.segmentId);
            onClose();
          }}
          className="w-full mt-2 py-2.5 rounded-2xl text-[13.5px] font-medium tap inline-flex items-center justify-center gap-2"
          style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
        >
          <Trash2 size={13} strokeWidth={1.75} /> Strecke löschen
        </button>
      )}
    </Sheet>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mt-3">
      <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl px-3.5 py-2.5 text-[14.5px]"
        style={{ background: "rgba(228,217,191,0.5)" }}
      />
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl px-3 py-2.5 text-[13.5px]"
        style={{ background: "rgba(228,217,191,0.5)" }}
      />
    </div>
  );
}
