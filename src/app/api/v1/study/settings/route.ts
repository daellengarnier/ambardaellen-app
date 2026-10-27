import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { parseBody, unauthorized } from "@/lib/server/http";
import { StudySettingsSchema, getStudySettings, saveStudySettings } from "@/lib/server/learn";

export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  return NextResponse.json(await getStudySettings());
}

// PUT /api/v1/study/settings  Body: beliebige Teilmenge von
// { newPerDay, dailyGoal, reminderEnabled, reminderTime }
export async function PUT(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const body = await parseBody(req, StudySettingsSchema.partial());
  if (!body.ok) return body.res;
  return NextResponse.json(await saveStudySettings(body.data));
}
