import Image from "next/image";
import styles from "./PostAuthorCard.module.css";

export default function PostAuthorCard() {
  return (
    <div className={styles.card} data-testid="post-author-card">
      <Image
        src="/character.jpg"
        alt="hanul.dev"
        width={48}
        height={48}
        className={styles.avatar}
      />
      <div>
        <p className={styles.name}>hanul.dev</p>
        <p className={styles.bio}>데이터와 일상을 기록합니다</p>
      </div>
    </div>
  );
}
