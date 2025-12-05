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
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  const renderContent = () => {
    switch (section.type) {
      case "HERO":
        const heroContent = section.content || {};
        return (
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 px-4">
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
                  className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
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
                <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
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
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <p className="font-medium">{value}</p>
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
          <div className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
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

