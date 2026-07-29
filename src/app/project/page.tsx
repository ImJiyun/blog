import PostGrid from "@/components/PostGrid";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/components/ProjectCard";

const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "GateReady",
    subtitle:
      "인천공항 실시간 운항 데이터 파이프라인. 지연 공지 후 악화 패턴을 정량 분석.",
    period: "2026.03 - 현재",
    stack: ["Python", "GCP", "BigQuery"],
    status: "Live",
    live: "https://public.tableau.com/app/profile/jiyun.kim2059/viz/GateReady/Overview",
    github: "https://github.com/ImJiyun/GateReady",
  },
  {
    id: "p2",
    title: "PaletteMe",
    subtitle:
      "취향으로 채우는 나만의 팔레트. 미술 작품 감상 및 추천 서비스 (팀 프로젝트).",
    period: "2025.02 - 2025.04",
    stack: ["React", "TypeScript"],
    status: "Archived",
    live: null,
    github: "https://github.com/ImJiyun/PaletteMe",
  },
  {
    id: "p3",
    title: "BITEBYTE",
    subtitle: "CS 퀴즈 기반 실시간 멀티플레이 게임 플랫폼 (팀 프로젝트).",
    period: "2025.04 - 2025.06",
    stack: ["React", "TypeScript"],
    status: "Archived",
    live: null,
    github: "https://github.com/ImJiyun/BITEBYTE",
  },
];

export const metadata = { title: "Project — jiyun.dev" };

export default function ProjectPage() {
  return (
    <main>
      <h1 className="sr-only">Project</h1>
      <PostGrid>
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </PostGrid>
    </main>
  );
}
