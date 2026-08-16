"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

export default function CategoryLink({
  href,
  category,
  children,
}: {
  href: string;
  category: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent("click", { target_type: "category", category })}
    >
      {children}
    </Link>
  );
}
