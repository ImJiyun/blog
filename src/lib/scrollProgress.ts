export type ScrollProgressInput = {
  articleTop: number;
  articleHeight: number;
  scrollY: number;
  viewportHeight: number;
};

export function computeScrollProgress({
  articleTop,
  articleHeight,
  scrollY,
  viewportHeight,
}: ScrollProgressInput): number {
  const scrollableDistance = articleHeight - viewportHeight;
  if (scrollableDistance <= 0) {
    return scrollY >= articleTop ? 100 : 0;
  }
  const scrolledIntoArticle = scrollY - articleTop;
  const percentage = (scrolledIntoArticle / scrollableDistance) * 100;
  return Math.min(100, Math.max(0, percentage));
}
