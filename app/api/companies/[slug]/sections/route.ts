import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const headerList = await headers()
        const session = await auth.api.getSession({ headers: headerList })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params;

        const company = await db.company.findFirst({
            where: {
                slug: slug,
                userId: session.user.id
            },
            include: {
                sections: {
                    orderBy: { order: "asc" }
                }
            }
        })

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        return NextResponse.json({ sections: company.sections }, {status: 200})

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch sections" },
            { status: 500 }
        );
    }
}


const createSectionSchema = z.object({
    type: z.enum(["HERO", "ABOUT", "CULTURE", "JOBS"]),
    title: z.string().optional(),
    content: z.any().optional(),
    order: z.number().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const headerList = await headers()
        const session = await auth.api.getSession({ headers: headerList })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params;

        const company = await db.company.findFirst({
            where: {
                slug: slug,
                userId: session.user.id
            }
        })

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        const body = await request.json()
        const data = createSectionSchema.parse(body)

        const maxOrder = await db.section.findFirst({
            where: { companyId: company.id },
            orderBy: { order: "desc" },
            select: { order: true }
        })

        const section = await db.section.create({
            data: {
                companyId: company.id,
                type: data.type,
                title: data.title,
                content: data.content || {},
                order: data.order ?? (maxOrder?.order ?? 0) + 1,
                isVisible: true
            }
        })

        return NextResponse.json({ section }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Error creating section:", error);
        return NextResponse.json(
            { error: "Failed to create section" },
            { status: 500 }
        );
    }
}
