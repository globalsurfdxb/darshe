"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

/** Permanently deletes one survey response. Deleting an already-removed row counts as success. */
export async function deleteSurveyResponse(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    await db.surveyResponse.deleteMany({ where: { id } });
  } catch (error) {
    console.error("[admin] Failed to delete survey response:", error);
    return { ok: false, error: "Could not delete this response. Please try again." };
  }
  revalidatePath("/admin/survey");
  return { ok: true };
}
