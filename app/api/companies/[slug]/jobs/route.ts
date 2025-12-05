import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;

    const company = await db.company.findFirst({
      where: {
        slug,
        userId: session.user.id,
      },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ jobs: company.jobs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  location: z.string().min(1, "Location is required"),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  workMode: z.enum(["REMOTE", "HYBRID", "ON_SITE"]),
  department: z.string().optional().nullable(),
  salaryRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional()
    .nullable(),
  applicationUrl: z.url().optional().nullable().or(z.literal("")),
  isActive: z.boolean().optional().nullable(),
});

export async function POST(
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

    const company = await db.company.findFirst({
      where: {
        slug,
        userId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = createJobSchema.parse(body);

    const salaryRange = data.salaryRange && (data.salaryRange.min || data.salaryRange.max)
      ? data.salaryRange
      : null;

    const job = await db.job.create({
      data: {
        companyId: company.id,
        title: data.title,
        description: data.description,
        location: data.location,
        jobType: data.jobType,
        workMode: data.workMode,
        department: data.department,
        salaryRange: salaryRange as any,
        applicationUrl: data.applicationUrl || null,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

