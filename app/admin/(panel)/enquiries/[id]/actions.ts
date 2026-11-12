"use server";

import { EnquiryStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function updateStatus(
  id: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  if (!(Object.values(EnquiryStatus) as string[]).includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  try {
    await db.enquiry.update({ where: { id }, data: { status: status as EnquiryStatus } });
  } catch {
    return { ok: false, error: "Could not update the status." };
  }

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  return { ok: true };
}
