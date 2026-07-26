import styles from "./page.module.css";

export const metadata = { title: "About — Data Learning Platform" };

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>About</h1>
      <p className={styles.paragraph}>
        Data Learning Platform is a personal blog and a BI/analytics practice project
        in one. It starts as a place to write about SQL, Python, statistics, and BI
        tooling — and, deliberately, about travel and career reflections too, under
        the Life tab, since this is the author&apos;s one personal blog rather than a
        second site kept separate from the technical work.
      </p>
      <p className={styles.paragraph}>
        The blog itself is only the first phase. Its own visitor traffic is meant to
        become the input to a small analytics and BI pipeline built on top of it —
        event tracking, a data warehouse export, and a dashboard — so the site is both
        the subject and the output of that practice.
      </p>
    </main>
  );
}
