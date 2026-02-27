import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function mapKnownPrismaError(
  error: unknown,
  handlers: Partial<Record<string, () => NextResponse>>
): NextResponse | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  const handler = handlers[error.code];
  return handler ? handler() : null;
}
