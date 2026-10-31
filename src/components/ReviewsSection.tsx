"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Quote } from "lucide-react";
import { getPublicTeachers } from "@/services/scheduling.service";
import { StarRating } from "@/components/ui/star-rating";
import { lessonDateTime } from "@/lib/lesson-feedback";

export function ReviewsSection() {
  const teachersQuery = useQuery({
    queryKey: ["teachers", "public"],
    queryFn: getPublicTeachers,
  });

  const reviews = (teachersQuery.data ?? [])
    .flatMap((teacher) =>
      teacher.reviews.map((review) => ({ ...review, teacherId: teacher.id }))
    )
    .filter((review) => Boolean(review.comment))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  if (!reviews.length) return null;

  return (
    <section className="bg-[#eef3e9] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e]">
              Student reviews
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] sm:text-4xl">
              Reviewed after every lesson.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-[#687b70]">
              Ratings come only from students who completed a lesson, so every
              review reflects a real class.
            </p>
          </div>
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 font-semibold text-[#1d5144] hover:gap-3"
          >
            Browse all teachers <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col rounded-2xl border border-[#dce6d8] bg-white p-6 shadow-sm"
            >
              <Quote size={22} className="text-[#b47b3c]" />
              <p className="mt-4 flex-1 leading-7 text-[#4f6459]">
                {review.comment}
              </p>
              <div className="mt-5 border-t border-[#e7eee3] pt-4">
                <StarRating value={review.rating} count={1} />
                <p className="mt-2 text-sm font-semibold text-[#23483c]">
                  {review.studentName}
                </p>
                <p className="text-xs text-[#7b8a7f]">
                  with{" "}
                  <Link
                    href={`/teachers/${review.teacherId}`}
                    className="font-semibold text-[#1d5144] hover:underline"
                  >
                    {review.teacherName}
                  </Link>{" "}
                  · {lessonDateTime(review.createdAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
