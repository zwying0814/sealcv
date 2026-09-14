"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/cv/loading-skeleton";

const ResumeEditor = dynamic(() => import("@/components/cv/editor"), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

export default function CvPage() {
  return <ResumeEditor />;
}
