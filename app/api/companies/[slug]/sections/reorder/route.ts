import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const reorderSchema = z.object({
  sectionIds: z.array(z.string()),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;

    const company = await db.company.findUnique({
      where: { slug, userId: session.user.id },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const { sectionIds } = reorderSchema.parse(body);

    const sections = await db.section.findMany({
      where: {
        id: { in: sectionIds },
        companyId: company.id,
      },
      select: { id: true },
    });

    if (sections.length !== sectionIds.length) {
      return NextResponse.json(
        { error: "One or more sections do not belong to this company" },
        { status: 403 }
      );
    }

    await db.$transaction(
      sectionIds.map((sectionId, index) =>
        db.section.update({
          where: { id: sectionId },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error reordering sections:", error);
    return NextResponse.json(
      { error: "Failed to reorder sections" },
      { status: 500 }
    );
  }
}
