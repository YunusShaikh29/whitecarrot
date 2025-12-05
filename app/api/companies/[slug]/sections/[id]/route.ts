import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const updateSectionSchema = z.object({
    title: z.string().optional(),
    content: z.any().optional(),
    isVisible: z.boolean().optional()
})

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
  
      const company = await db.company.findUnique({
        where: { slug, userId: session.user.id },
      });
  
      if (!company) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
  
      const section = await db.section.findFirst({
        where: { id, companyId: company.id },
      });
  
      if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
      }
  
      const body = await request.json();
      const data = updateSectionSchema.parse(body);
  
      const updated = await db.section.update({
        where: { id },
        data,
      });
  
      return NextResponse.json({ section: updated }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      console.error("Error updating section:", error);
      return NextResponse.json(
        { error: "Failed to update section" },
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
  
      const company = await db.company.findUnique({
        where: { slug, userId: session.user.id },
      });
  
      if (!company) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
  
      const section = await db.section.findFirst({
        where: { id, companyId: company.id },
      });
  
      if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
      }
  
      await db.section.delete({
        where: { id },
      });
  
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error deleting section:", error);
      return NextResponse.json(
        { error: "Failed to delete section" },
        { status: 500 }
      );
    }
  }
  
  