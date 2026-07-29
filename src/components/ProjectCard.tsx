import styles from "./ProjectCard.module.css";

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  stack: string[];
  status: "Live" | "Archived";
  live: string | null;
  github: string;
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={styles.card} data-testid="project-card">
      <div className={styles.thumbnail}>
        <span
          className={
            project.status === "Live"
              ? styles.statusBadgeLive
              : styles.statusBadgeArchived
          }
        >
          {project.status}
        </span>
        <div className={styles.thumbnailFallback}>
          <span className={styles.categoryLabel}>Project</span>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.tagRow}>
          {project.stack.map((tech) => (
            <span key={tech} className={styles.tagPill}>
              {tech}
            </span>
          ))}
        </div>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.period}>{project.period}</p>
        <p className={styles.subtitle}>{project.subtitle}</p>
        <div className={styles.linkRow}>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.liveLink}
            >
              Live →
            </a>
          )}
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            GitHub
          </a>
        </div>
      </div>
    </article>
  );
}
