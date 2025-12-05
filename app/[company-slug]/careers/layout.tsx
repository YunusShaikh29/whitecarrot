import { Metadata } from "next";
import db from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "company-slug": string }>;
}): Promise<Metadata> {
  const { "company-slug": slug } = await params;

  try {
    const company = await db.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { isActive: true },
        },
      },
    });

    if (!company) {
      return {
        title: "Company Not Found",
        description: "The requested company careers page could not be found.",
      };
    }

    const jobCount = company.jobs.length;
    const title = `${company.name} Careers - Join Our Team`;
    const description =
      company.description ||
      `Explore ${jobCount} open positions at ${company.name}. Join our team and help us build the future.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: company.bannerImage
          ? [
              {
                url: company.bannerImage,
                width: 1200,
                height: 630,
                alt: `${company.name} banner`,
              },
            ]
          : company.logo
          ? [
              {
                url: company.logo,
                width: 1200,
                height: 630,
                alt: `${company.name} logo`,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: company.bannerImage
          ? [company.bannerImage]
          : company.logo
          ? [company.logo]
          : [],
      },
      alternates: {
        canonical: `/${slug}/careers`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Careers",
      description: "Explore career opportunities.",
    };
  }
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

