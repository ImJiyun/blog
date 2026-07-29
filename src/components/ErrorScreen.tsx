import Link from "next/link";
import styles from "./ErrorScreen.module.css";

export default function ErrorScreen({
  code,
  title,
  message,
  children,
}: {
  code: string;
  title: string;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.screen}>
      <Link href="/" className={styles.wordmark}>
        <span className={styles.wordmarkPrompt}>&gt;</span>jiyun.dev
      </Link>
      <div className={styles.code}>{code}</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{message}</p>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
