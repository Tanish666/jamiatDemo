import ProjectDetailsPage from "../../../components/ProjectDetailsPage";
import { cache } from "react";
import { redirect } from "next/navigation";

const getProjectId = cache(getProjectIdFromSlug);

async function getProjectIdFromSlug(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/slug/${slug}`
  ).then((res) => res.json());
  return res.projectId;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const projectId = await getProjectId(slug);
  const project = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
    { cache: "no-store" }
  ).then((res) => res.json());

  return {
    title: project.metatitle || project.title,
    description: project.metadescription || project.description,
    keywords: project.target_keywords || [],
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const projectId = await getProjectId(slug);

  const project = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
    {
      cache: "no-store",
    }
  ).then((res) => res.json());

  if (project.slug && project.slug !== slug) {
    redirect(`/projects/${project.slug}`);
  }

  console.log(project);

  return (
    <>
      {project.scheme?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(project.scheme, null, 2),
          }}
        />
      )}
      <ProjectDetailsPage slug={project.slug || slug} projectId={projectId} />
    </>
  );
}

