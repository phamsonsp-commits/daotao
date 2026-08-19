"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/session";
import { MAX_OPTIONS } from "@/lib/quiz-constants";

const quizMetaSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().default(""),
  level: z.enum(["INTERN", "STAFF", "SENIOR", "MANAGER"]),
  passScore: z.coerce.number().int().min(1).max(100),
  programId: z.string().optional().nullable(),
});

export async function createQuiz(formData: FormData) {
  const user = await requireAdmin();
  const programId = String(formData.get("programId") || "") || null;
  const data = quizMetaSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    level: formData.get("level"),
    passScore: formData.get("passScore") || 70,
    programId,
  });

  const quiz = await prisma.quiz.create({
    data: { ...data, createdById: user.id },
  });

  revalidatePath("/admin/quizzes");
  if (programId) revalidatePath(`/admin/programs/${programId}/edit`);
  redirect(`/admin/quizzes/${quiz.id}/edit`);
}

export async function updateQuizMeta(quizId: string, formData: FormData) {
  await requireAdmin();
  const programId = String(formData.get("programId") || "") || null;
  const data = quizMetaSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    level: formData.get("level"),
    passScore: formData.get("passScore") || 70,
    programId,
  });

  await prisma.quiz.update({ where: { id: quizId }, data });
  revalidatePath(`/admin/quizzes/${quizId}/edit`);
  revalidatePath("/admin/quizzes");
}

export async function deleteQuiz(quizId: string) {
  await requireAdmin();
  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath("/admin/quizzes");
  redirect("/admin/quizzes");
}

const questionSchema = z.object({
  text: z.string().min(3),
  type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE"]),
  options: z
    .array(z.string())
    .min(2, "Cần ít nhất 2 lựa chọn"),
  correctIndexes: z.array(z.number().int().min(0)).min(1, "Chọn ít nhất 1 đáp án đúng"),
});

function parseQuestionForm(formData: FormData) {
  const slots = Array.from({ length: MAX_OPTIONS }, (_, i) => ({
    text: String(formData.get(`option_${i}`) || "").trim(),
    checked: formData.get(`correct_${i}`) === "on",
  })).filter((slot) => slot.text.length > 0);

  const options = slots.map((s) => s.text);
  const correctIndexes = slots
    .map((s, i) => (s.checked ? i : -1))
    .filter((i) => i >= 0);

  return questionSchema.parse({
    text: formData.get("text"),
    type: formData.get("type"),
    options,
    correctIndexes,
  });
}

export async function createQuestion(quizId: string, formData: FormData) {
  await requireAdmin();
  const data = parseQuestionForm(formData);

  const maxOrder = await prisma.question.aggregate({
    where: { quizId },
    _max: { order: true },
  });

  await prisma.question.create({
    data: {
      quizId,
      text: data.text,
      type: data.type,
      options: JSON.stringify(data.options),
      correctIndexes: JSON.stringify(
        data.type === "SINGLE_CHOICE" ? [data.correctIndexes[0]] : data.correctIndexes,
      ),
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/quizzes/${quizId}/edit`);
  redirect(`/admin/quizzes/${quizId}/edit`);
}

export async function updateQuestion(
  quizId: string,
  questionId: string,
  formData: FormData,
) {
  await requireAdmin();
  const data = parseQuestionForm(formData);

  await prisma.question.update({
    where: { id: questionId },
    data: {
      text: data.text,
      type: data.type,
      options: JSON.stringify(data.options),
      correctIndexes: JSON.stringify(
        data.type === "SINGLE_CHOICE" ? [data.correctIndexes[0]] : data.correctIndexes,
      ),
    },
  });

  revalidatePath(`/admin/quizzes/${quizId}/edit`);
  redirect(`/admin/quizzes/${quizId}/edit`);
}

export async function deleteQuestion(quizId: string, questionId: string) {
  await requireAdmin();
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/admin/quizzes/${quizId}/edit`);
  redirect(`/admin/quizzes/${quizId}/edit`);
}

export async function submitQuizAttempt(quizId: string, formData: FormData) {
  const user = await requireUser();

  const questions = await prisma.question.findMany({ where: { quizId } });
  if (questions.length === 0) return;

  const answers: Record<string, number[]> = {};
  let correctCount = 0;

  for (const q of questions) {
    const selected = formData
      .getAll(`q_${q.id}`)
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n));
    answers[q.id] = selected;

    const correct: number[] = JSON.parse(q.correctIndexes);
    const isCorrect =
      selected.length === correct.length &&
      [...selected].sort().every((v, i) => v === [...correct].sort()[i]);
    if (isCorrect) correctCount++;
  }

  const score = Math.round((correctCount / questions.length) * 100);
  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
  const passed = score >= quiz.passScore;

  await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: user.id,
      answers: JSON.stringify(answers),
      score,
      passed,
    },
  });

  revalidatePath(`/quizzes/${quizId}`);
}
