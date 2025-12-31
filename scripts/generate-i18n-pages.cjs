const fs = require('fs');
const path = require('path');

const pages = [
  {
    name: 'about',
    title: 'About Us - PPT Master',
    revalidate: 3600,
  },
  {
    name: 'help',
    title: 'Help Center - PPT Master',
    revalidate: 3600,
  },
  {
    name: 'prompt-guide',
    title: 'Prompt Guide - PPT Master',
    revalidate: 3600,
  },
  {
    name: 'pricing',
    title: 'Pricing - PPT Master',
    revalidate: 3600,
  },
  {
    name: 'contact',
    title: 'Contact Us - PPT Master',
    revalidate: 3600,
  },
  {
    name: 'cookies',
    title: 'Cookie Notice - PPT Master',
    revalidate: 86400,
  },
  {
    name: 'privacy',
    title: 'Privacy Policy - PPT Master',
    revalidate: 86400,
  },
  {
    name: 'terms',
    title: 'Terms of Use - PPT Master',
    revalidate: 86400,
  },
];

const template = (pageName, title, revalidate) => `import { redirect } from "next/navigation";
import { generateLanguageParams } from "~/lib/i18n";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "${title}",
  };
}

export const revalidate = ${revalidate};

export default async function ${pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('-', '')}Page() {
  // Import the existing page component
  try {
    const PageComponent = (await import("../../${pageName}/page")).default;
    return <PageComponent />;
  } catch (error) {
    redirect("/");
  }
}
`;

// Create directories and files
pages.forEach(({ name, title, revalidate }) => {
  const dir = path.join(__dirname, '..', 'src', 'app', '[lang]', name);
  const file = path.join(dir, 'page.tsx');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(file, template(name, title, revalidate));
  console.log(`✓ Created ${name}/page.tsx`);
});

console.log('\n✅ All i18n pages created!');
