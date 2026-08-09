import { useState } from "react";
import { deletePost } from "@/lib/api";

export function useDeletePost({
  postId,
  confirmMessage,
  errorMessage,
  onSuccess,
}: {
  postId: string;
  confirmMessage: string;
  errorMessage: string;
  onSuccess: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;
    setPending(true);
    try {
      await deletePost(postId);
      onSuccess();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : errorMessage);
    } finally {
      setPending(false);
    }
  }

  return { pending, handleDelete };
}
