
type PersonSchemaProps = {
  siteUrl: string;
};

export default function PersonSchema({ siteUrl }: PersonSchemaProps) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Laukik Pawar",
    url: siteUrl,
    jobTitle: "Computer Science Graduate Student",
    description:
      "Computer Science graduate student interested in software engineering, data engineering, cloud computing, and machine learning.",
    sameAs: [
      "https://github.com/Laukik-Pawar",
      "https://www.linkedin.com/in/laukik-pawar/"
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(person).replace(/</g, "\\u003c"),
      }}
    />
  );
}
