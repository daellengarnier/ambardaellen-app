import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { ISO_DATE_RE, jsonError, parseBody, unauthorized } from "@/lib/server/http";
import { TodoCreateSchema, createTodo, isValidArea, listTodos } from "@/lib/server/life";
import { TODO_STATUSES, type TodoStatus, type World } from "@/lib/life";

// GET /api/v1/todos?status=offen,erledigt&area=privat-lernen&world=privat
//   &due_before=YYYY-MM-DD&planned_for=YYYY-MM-DD&q=text&limit=500
// Ohne status: nur offene. status=alle liefert alles.
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const p = new URL(req.url).searchParams;

  const statusParam = p.get("status") ?? "offen";
  const status =
    statusParam === "alle"
      ? undefined
      : statusParam.split(",").filter((s): s is TodoStatus => TODO_STATUSES.includes(s as TodoStatus));
  const world = p.get("world");
  const dueBefore = p.get("due_before");
  const plannedFor = p.get("planned_for");
  if (world && world !== "spinnerei" && world !== "privat") {
    return jsonError(400, "world muss spinnerei oder privat sein.");
  }
  if ((dueBefore && !ISO_DATE_RE.test(dueBefore)) || (plannedFor && !ISO_DATE_RE.test(plannedFor))) {
    return jsonError(400, "Datum als YYYY-MM-DD.");
  }

  const todos = await listTodos({
    status,
    area: p.get("area") ?? undefined,
    world: (world as World | null) ?? undefined,
    dueBefore: dueBefore ?? undefined,
    plannedFor: plannedFor ?? undefined,
    q: p.get("q")?.trim() || undefined,
    limit: p.get("limit") ? Number(p.get("limit")) || undefined : undefined,
  });
  return NextResponse.json({ todos });
}

export async function POST(req: Request) {
  const actor = await authenticate(req);
  if (!actor) return unauthorized();
  const body = await parseBody(req, TodoCreateSchema);
  if (!body.ok) return body.res;
  if (!(await isValidArea(body.data.area))) return jsonError(400, "Unbekannter Bereich.");
  const todo = await createTodo(body.data, actor);
  return NextResponse.json({ todo }, { status: 201 });
}
