import Link from "next/link";
import ErrorScreen from "@/components/ErrorScreen";
import styles from "@/components/ErrorScreen.module.css";

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="페이지를 찾을 수 없습니다"
      message="요청하신 주소가 삭제되었거나 잘못 입력되었을 수 있어요."
    >
      <Link href="/" className={styles.homeButton}>
        ← 홈으로 돌아가기
      </Link>
    </ErrorScreen>
  );
}
