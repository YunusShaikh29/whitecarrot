import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

export async function GET() {
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
        userId: session.user.id,
      },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const schema = z.object({
      name: z.string().min(1, "Company name is required"),
      slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
      description: z.string().optional(),
      websiteUrl: z.url().optional().or(z.literal("")),
    });

    const validatedData = schema.parse(body);

    const existingUserCompany = await db.company.findFirst({
      where: { userId: session.user.id },
    });

    if (existingUserCompany) {
      return NextResponse.json(
        { error: "You already have a company. Each recruiter can only have one company." },
        { status: 400 }
      );
    }

    const existingSlug = await db.company.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "A company with this slug already exists" },
        { status: 400 }
      );
    }

    const company = await db.company.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        websiteUrl: validatedData.websiteUrl || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}

