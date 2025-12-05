import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await db.company.findFirst({
      where: {
        slug: (await params).slug,
        userId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      websiteUrl: z.url().optional().nullable().or(z.literal("")),
      logo: z.url().optional().nullable(),
      bannerImage: z.url().optional().nullable(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      cultureVideoUrl: z
        .union([
          z.string().url(),
          z.literal(""),
          z.null(),
        ])
        .optional()
        .transform((val) => (val === "" ? null : val)),
    });

    const validatedData = schema.parse(body);

    const updatedCompany = await db.company.update({
      where: { id: company.id },
      data: validatedData,
    });

    return NextResponse.json({ company: updatedCompany });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

