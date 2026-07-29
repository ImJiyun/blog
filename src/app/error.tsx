"use client";

import { useEffect } from "react";
import Link from "next/link";
import ErrorScreen from "@/components/ErrorScreen";
import styles from "@/components/ErrorScreen.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="ERROR"
      title="문제가 발생했습니다"
      message="일시적인 오류예요. 잠시 후 다시 시도해주세요."
    >
      <Link href="/" className={styles.homeButton}>
        ← 홈으로 돌아가기
      </Link>
      <button onClick={reset} className={styles.retryButton}>
        다시 시도
      </button>
    </ErrorScreen>
  );
}
