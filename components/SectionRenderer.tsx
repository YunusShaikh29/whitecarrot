"use client";

interface Section {
  id: string;
  type: "HERO" | "ABOUT" | "CULTURE" | "JOBS";
  title: string | null;
  content: any;
  isVisible: boolean;
}

interface SectionRendererProps {
  section: Section;
  cultureVideoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export default function SectionRenderer({
  section,
  cultureVideoUrl,
  primaryColor,
  secondaryColor,
}: SectionRendererProps) {
  const renderContent = () => {
    switch (section.type) {
      case "HERO":
        const heroContent = section.content || {};
        return (
          <div
            className="relative text-white py-20 px-4"
            style={{
              background: primaryColor
                ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                : "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
            }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {heroContent.headline || section.title || "Join Our Team"}
              </h1>
              {heroContent.subheadline && (
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  {heroContent.subheadline}
                </p>
              )}
              {heroContent.ctaText && (
                <a
                  href="#jobs"
                  aria-label={`${heroContent.ctaText} - View open positions`}
                  className="inline-block px-8 py-3 font-semibold rounded-lg transition"
                  style={{
                    backgroundColor: primaryColor || "#FFFFFF",
                    color: secondaryColor || "#000000",
                  }}
                >
                  {heroContent.ctaText}
                </a>
              )}
            </div>
          </div>
        );

      case "ABOUT":
        const aboutContent = section.content || {};
        return (
          <div className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2
                  className="text-3xl font-bold mb-6"
                  style={{ color: primaryColor || "#000000" }}
                >
                  {section.title}
                </h2>
              )}
              {aboutContent.description && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {aboutContent.description}
                  </p>
                </div>
              )}
              {aboutContent.values && Array.isArray(aboutContent.values) && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aboutContent.values.map((value: string, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border-2"
                      style={{
                        backgroundColor: secondaryColor || "#F9FAFB",
                        borderColor: primaryColor || "#E5E7EB",
                      }}
                    >
                      <p className="font-medium" style={{ color: primaryColor || "#000000" }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "CULTURE":
        const cultureContent = section.content || {};
        return (
          <div
            className="py-16 px-4"
            style={{ backgroundColor: secondaryColor || "#F9FAFB" }}
          >
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2
                  className="text-3xl font-bold mb-6"
                  style={{ color: primaryColor || "#000000" }}
                >
                  {section.title}
                </h2>
              )}
              {cultureVideoUrl && (
                <div className="mb-8">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      src={cultureVideoUrl}
                      title="Culture Video"
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              {cultureContent.description && (
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {cultureContent.description}
                  </p>
                </div>
              )}
              {cultureContent.highlights &&
                Array.isArray(cultureContent.highlights) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cultureContent.highlights.map(
                      (
                        highlight: {
                          title: string;
                          description: string;
                        },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="p-6 bg-white rounded-lg shadow-sm"
                        >
                          {highlight.title && (
                            <h3 className="text-xl font-semibold mb-2">
                              {highlight.title}
                            </h3>
                          )}
                          {highlight.description && (
                            <p className="text-gray-600">
                              {highlight.description}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
}

