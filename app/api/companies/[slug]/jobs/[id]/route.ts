import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  location: z.string().min(1).optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]).optional(),
  workMode: z.enum(["REMOTE", "HYBRID", "ON_SITE"]).optional(),
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
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await context.params;

    const company = await db.company.findFirst({
      where: {
        slug,
        userId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const job = await db.job.findFirst({
      where: { id, companyId: company.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsedData = updateJobSchema.parse(body);

    const updateData: any = {};

    if (parsedData.title !== undefined) updateData.title = parsedData.title;
    if (parsedData.description !== undefined) updateData.description = parsedData.description;
    if (parsedData.location !== undefined) updateData.location = parsedData.location;
    if (parsedData.jobType !== undefined) updateData.jobType = parsedData.jobType;
    if (parsedData.workMode !== undefined) updateData.workMode = parsedData.workMode;
    if (parsedData.department !== undefined) updateData.department = parsedData.department;
    if (parsedData.applicationUrl !== undefined) {
      updateData.applicationUrl = parsedData.applicationUrl || null;
    }
    if (parsedData.isActive !== undefined) updateData.isActive = parsedData.isActive;

    if (parsedData.salaryRange !== undefined) {
      if (parsedData.salaryRange === null ||
        (!parsedData.salaryRange.min && !parsedData.salaryRange.max)) {
        updateData.salaryRange = null as any;
      } else {
        updateData.salaryRange = parsedData.salaryRange as any;
      }
    }

    const updated = await db.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ job: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await context.params;

    const company = await db.company.findFirst({
      where: {
        slug,
        userId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const job = await db.job.findFirst({
      where: { id, companyId: company.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await db.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

