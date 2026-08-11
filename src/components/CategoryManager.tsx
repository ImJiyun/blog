"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import type { Category } from "@/lib/api";
import styles from "./CategoryManager.module.css";

const SECTION_OPTIONS: { value: "" | "data" | "dev" | "life"; label: string }[] = [
  { value: "", label: "없음" },
  { value: "data", label: "Data" },
  { value: "dev", label: "Dev" },
  { value: "life", label: "Life" },
];

export default function CategoryManager() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [newName, setNewName] = useState("");
  const [newSection, setNewSection] = useState<"" | "data" | "dev" | "life">("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCategories(await fetchCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  function openModal() {
    setOpen(true);
    setRenamingId(null);
    setDeletingId(null);
    setNewName("");
    setNewSection("");
    setError(null);
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    try {
      await createCategory({ name, section: newSection || null });
      setNewName("");
      setNewSection("");
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category.");
    }
  }

  async function handleSectionChange(id: string, section: "" | "data" | "dev" | "life") {
    setError(null);
    try {
      await updateCategory(id, { section: section || null });
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move category.");
    }
  }

  async function handleRenameConfirm(id: string) {
    const name = renameValue.trim();
    if (!name) return;
    setError(null);
    try {
      await updateCategory(id, { name });
      setRenamingId(null);
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename category.");
    }
  }

  async function handleDeleteConfirm(id: string) {
    setError(null);
    try {
      await deleteCategory(id, reassignTo || undefined);
      setDeletingId(null);
      setReassignTo("");
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.badge}
        onClick={openModal}
        data-testid="category-manager-button"
      >
        카테고리 관리
      </button>
      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
          data-testid="category-manager-modal"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.title}>카테고리 관리</h3>
            {error && <p className={styles.error}>{error}</p>}
            {loading ? (
              <p className={styles.loading}>불러오는 중…</p>
            ) : (
              <div className={styles.list}>
                {categories.map((c) => (
                  <div key={c.id} className={styles.row} data-testid="category-row">
                    {renamingId === c.id ? (
                      <div className={styles.inlineRow}>
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          autoFocus
                          className={styles.inlineInput}
                          data-testid="category-rename-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameConfirm(c.id)}
                          className={styles.primaryButton}
                          data-testid="category-rename-confirm"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className={styles.ghostButton}
                        >
                          취소
                        </button>
                      </div>
                    ) : deletingId === c.id ? (
                      <div className={styles.deleteColumn}>
                        <p className={styles.confirmText}>
                          {c.postCount > 0
                            ? `"${c.name}" 카테고리의 글 ${c.postCount}개를 어떻게 할까요?`
                            : `"${c.name}" 카테고리를 삭제할까요? (사용 중인 글 없음)`}
                        </p>
                        <div className={styles.inlineRow}>
                          {c.postCount > 0 && (
                            <select
                              value={reassignTo}
                              onChange={(e) => setReassignTo(e.target.value)}
                              className={styles.inlineInput}
                              data-testid="category-reassign-select"
                            >
                              <option value="">이동할 카테고리 선택</option>
                              {categories
                                .filter((other) => other.id !== c.id)
                                .map((other) => (
                                  <option key={other.id} value={other.id}>
                                    {other.name}(으)로 이동
                                  </option>
                                ))}
                            </select>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteConfirm(c.id)}
                            disabled={c.postCount > 0 && !reassignTo}
                            className={styles.dangerButton}
                            data-testid="category-delete-confirm"
                          >
                            삭제
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(null);
                              setReassignTo("");
                            }}
                            className={styles.ghostButton}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.idleRow}>
                        <div className={styles.nameGroup}>
                          <span className={styles.name}>{c.name}</span>
                          <span className={styles.count}>글 {c.postCount}개</span>
                        </div>
                        <select
                          value={c.section ?? ""}
                          onChange={(e) =>
                            handleSectionChange(c.id, e.target.value as "" | "data" | "dev" | "life")
                          }
                          className={styles.sectionSelect}
                          data-testid="category-section-select"
                        >
                          {SECTION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingId(c.id);
                              setRenameValue(c.name);
                              setDeletingId(null);
                            }}
                            className={styles.ghostButton}
                            data-testid="category-rename-start"
                          >
                            이름 변경
                          </button>
                          {categories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingId(c.id);
                                setReassignTo("");
                                setRenamingId(null);
                              }}
                              className={styles.dangerGhostButton}
                              data-testid="category-delete-start"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className={styles.addRow}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="새 카테고리 이름"
                className={styles.inlineInput}
                data-testid="category-new-name-input"
              />
              <select
                value={newSection}
                onChange={(e) => setNewSection(e.target.value as "" | "data" | "dev" | "life")}
                className={styles.inlineInput}
                data-testid="category-new-section-select"
              >
                {SECTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                className={styles.primaryButton}
                data-testid="category-add-button"
              >
                추가
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={styles.closeButton}
              data-testid="category-manager-close"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
