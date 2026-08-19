"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function enrollInProgram(programId: string) {
  const user = await requireUser();
  await prisma.enrollment.upsert({
    where: { userId_programId: { userId: user.id, programId } },
    update: {},
    create: { userId: user.id, programId },
  });
  revalidatePath(`/programs/${programId}`);
}

export async function toggleProgramItem(programId: string, itemId: string) {
  const user = await requireUser();

  const [enrollment, items] = await Promise.all([
    prisma.enrollment.upsert({
      where: { userId_programId: { userId: user.id, programId } },
      update: {},
      create: { userId: user.id, programId },
    }),
    prisma.programItem.findMany({ where: { programId }, select: { id: true } }),
  ]);

  const completed: string[] = JSON.parse(enrollment.completedItems || "[]");
  const next = completed.includes(itemId)
    ? completed.filter((id) => id !== itemId)
    : [...completed, itemId];

  const allDone = items.length > 0 && items.every((i) => next.includes(i.id));

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      completedItems: JSON.stringify(next),
      status: allDone ? "COMPLETED" : "IN_PROGRESS",
    },
  });

  revalidatePath(`/programs/${programId}`);
}
