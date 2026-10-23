'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderTree,
  FileText,
  BookMarked,
  HelpCircle,
  Video,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetLearnTopicsQuery,
  useGetLearnArticlesQuery,
  useGetLearnGlossaryQuery,
  useGetLearnQuizQuery,
  useGetLearnWebinarsQuery,
  useGetInvestmentEducationsQuery,
} from '@/auth/services/adminApi';

function safeLength(data: any, fieldName?: string): number {
  if (!data) return 0;
  const raw = data.data !== undefined ? data.data : data;
  if (Array.isArray(raw)) return raw.length;
  if (fieldName && Array.isArray(raw?.[fieldName])) return raw[fieldName].length;
  if (Array.isArray(raw?.items)) return raw.items.length;
  if (Array.isArray(raw?.data)) return raw.data.length;
  if (typeof raw?.totalCount === 'number') return raw.totalCount;
  return 0;
}

export default function LearnOverviewPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <LearnOverviewContent />
    </RoleGuard>
  );
}

function LearnOverviewContent() {
  const router = useRouter();
  const [navigatingSection, setNavigatingSection] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleNavigate = (title: string, href: string) => {
    setNavigatingSection(title);
    router.push(href);
  };

  const {
    data: educationData,
    isFetching: fetchingEducation,
    refetch: refetchEducation,
  } = useGetInvestmentEducationsQuery();

  const {
    data: topicsData,
    isFetching: fetchingTopics,
    refetch: refetchTopics,
  } = useGetLearnTopicsQuery();

  const {
    data: articlesData,
    isFetching: fetchingArticles,
    refetch: refetchArticles,
  } = useGetLearnArticlesQuery();

  const {
    data: glossaryData,
    isFetching: fetchingGlossary,
    refetch: refetchGlossary,
  } = useGetLearnGlossaryQuery();

  const {
    data: quizData,
    isFetching: fetchingQuiz,
    refetch: refetchQuiz,
  } = useGetLearnQuizQuery();

  const {
    data: webinarsData,
    isFetching: fetchingWebinars,
    refetch: refetchWebinars,
  } = useGetLearnWebinarsQuery();

  const educationCount = safeLength(educationData);
  const topicsCount = safeLength(topicsData);
  const articlesCount = safeLength(articlesData);
  const glossaryCount = safeLength(glossaryData);
  const quizCount = safeLength(quizData, 'questions');
  const webinarsCount = safeLength(webinarsData);

  const isLoadingAny =
    fetchingEducation ||
    fetchingTopics ||
    fetchingArticles ||
    fetchingGlossary ||
    fetchingQuiz ||
    fetchingWebinars;

  const handleRefreshAll = () => {
    refetchEducation();
    refetchTopics();
    refetchArticles();
    refetchGlossary();
    refetchQuiz();
    refetchWebinars();
  };

  const sections = [
    {
      title: 'Investment Education',
      count: educationCount,
      description:
        'Core financial literacy curriculum, asset class rules, risk appetite ratings, and returns.',
      href: '/dashboard/retail/education',
      icon: <BookOpen size={24} className="text-[#961A1C] dark:text-red-400" />,
      tag: 'LMS Curriculum',
      image:
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=700&q=80',
      accent: 'from-rose-500/15 via-red-500/5 to-transparent',
      illustration: (
        <svg
          className="w-16 h-16 text-[#961A1C]/30 dark:text-[#961A1C]/50"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="12" y="8" width="40" height="48" rx="4" />
          <path d="M20 20h24M20 28h24M20 36h16" />
          <circle cx="44" cy="44" r="10" className="fill-[#961A1C]/20" />
          <path d="M44 38v12M38 44h12" />
        </svg>
      ),
    },
    {
      title: 'Topics',
      count: topicsCount,
      description:
        'Organizational category tags and taxonomy for structuring articles and lessons.',
      href: '/dashboard/learn/topics',
      icon: <FolderTree size={24} className="text-[#961A1C] dark:text-red-400" />,
      tag: 'Taxonomy',
      image:
        'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=700&q=80',
      accent: 'from-amber-500/15 via-orange-500/5 to-transparent',
      illustration: (
        <svg
          className="w-16 h-16 text-amber-600/30 dark:text-amber-500/50"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="8" y="10" width="20" height="14" rx="3" />
          <rect x="36" y="24" width="20" height="14" rx="3" />
          <rect x="36" y="42" width="20" height="14" rx="3" />
          <path d="M28 17h4c2 0 4 2 4 4v28c0 2-2 4-4 4h-4" />
        </svg>
      ),
    },
    {
      title: 'Articles',
      count: articlesCount,
      description:
        'In-depth educational articles, guides, market insights, and reading material.',
      href: '/dashboard/learn/articles',
      icon: <FileText size={24} className="text-[#961A1C] dark:text-red-400" />,
      tag: 'Editorial',
      image:
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=80',
      accent: 'from-blue-500/15 via-sky-500/5 to-transparent',
      illustration: (
        <svg
          className="w-16 h-16 text-blue-600/30 dark:text-blue-500/50"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 10h28l12 12v32H14z" />
          <path d="M42 10v12h12M22 26h12M22 34h20M22 42h20" />
        </svg>
      ),
    },
    {
      title: 'Glossary',
      count: glossaryCount,
      description:
        'A-Z financial terminology dictionary with concise, beginner-friendly explanations.',
      href: '/dashboard/learn/glossary',
      icon: <BookMarked size={24} className="text-[#961A1C] dark:text-red-400" />,
      tag: 'Terminology',
      image:
        'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=700&q=80',
      accent: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      illustration: (
        <svg
          className="w-16 h-16 text-emerald-600/30 dark:text-emerald-500/50"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 14c0-4 4-6 18-6s18 2 18 6v42c-4-3-10-4-18-4s-14 1-18 4V14z" />
          <path d="M30 8v44" />
          <path d="M18 22h6M18 28h8M38 22h8M38 28h6" />
        </svg>
      ),
    },
    {
      title: 'Quiz Questions',
      count: quizCount,
      description:
        'Interactive multiple-choice assessment tests to evaluate investor comprehension.',
      href: '/dashboard/learn/quiz',
      icon: <HelpCircle size={24} className="text-[#961A1C] dark:text-red-400" />,
      tag: 'Assessments',
      image:
        'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=700&q=80',
      accent: 'from-purple-500/15 via-indigo-500/5 to-transparent',
      illustration: (
        <svg
          className="w-16 h-16 text-purple-600/30 dark:text-purple-500/50"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="32" cy="32" r="24" />
          <path d="M26 24c0-4 3-6 6-6s6 2 6 5c0 4-4 6-4 9" />
          <circle cx="32" cy="43" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Webinars',
      count: webinarsCount,
      description:
        'Recorded video masterclasses, investor tutorials, and live streaming sessions.',
      href: '/dashboard/learn/webinars',
      icon: <Video size={24} className="text-[#961A1C] dark:text-red-400" />,
      tag: 'Video Content',
      image:
        'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=700&q=80',
      accent: 'from-rose-500/15 via-pink-500/5 to-transparent',
      illustration: (
        <svg
          className="w-16 h-16 text-red-600/30 dark:text-red-500/50"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="8" y="16" width="36" height="32" rx="4" />
          <path d="M44 26l12-7v26l-12-7V26z" />
          <polygon points="23,26 31,32 23,38" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Customers Education
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Central overview and curriculum management for retail investor learning modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            disabled={isLoadingAny}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={isLoadingAny ? 'animate-spin' : ''}
            />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

      {/* ── 6 Management Modules Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs flex flex-col justify-between overflow-hidden hover:border-[#961A1C]/50 hover:shadow-md transition-all duration-200 group"
          >
            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              {/* Top Row: Big Number & Content Label on Left + Top-Right Manage Button */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80">
                <div>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight leading-none">
                    {isLoadingAny ? (
                      <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
                    ) : (
                      section.count
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1.5 font-mono">
                    Content
                  </p>
                </div>

                {/* Top Right Manage Button (No arrow, shows spinner on click) */}
                <button
                  type="button"
                  onClick={() => handleNavigate(section.title, section.href)}
                  disabled={navigatingSection === section.title}
                  className="inline-flex items-center justify-center min-w-[72px] px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7e1517] shadow-2xs transition-colors cursor-pointer disabled:opacity-85"
                >
                  {navigatingSection === section.title ? (
                    <Loader2 size={13} className="animate-spin text-white" />
                  ) : (
                    <span>Manage</span>
                  )}
                </button>
              </div>

              {/* Middle Visual Image Banner with Subtle Gradient & Tag Badge */}
              <div className="relative h-28 w-full rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800/60">
                {!imgErrors[section.title] ? (
                  <>
                    <img
                      src={section.image}
                      alt={section.title}
                      loading="lazy"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [section.title]: true }))
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  </>
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${section.accent} flex items-center justify-center`}
                  >
                    {section.illustration}
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs border border-white/20">
                  {section.tag}
                </span>
              </div>

              {/* Module Info: Icon with NO background + Name of Module + Description */}
              <div className="pt-0.5">
                <div className="mb-2">
                  {section.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                  {section.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                  {section.description}
                </p>
              </div>
            </div>

            {/* Full-width dark red footer section with "Manage" on the left and Arrow on the right in white */}
            <button
              type="button"
              onClick={() => handleNavigate(section.title, section.href)}
              disabled={navigatingSection === section.title}
              className="w-full flex items-center justify-between px-5 py-3 bg-[#961A1C] hover:bg-[#7e1517] text-white transition-colors duration-200 group-hover:bg-[#7a1517] cursor-pointer disabled:opacity-90"
            >
              <div className="flex items-center gap-2">
                {navigatingSection === section.title && (
                  <Loader2 size={14} className="animate-spin text-white" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Manage
                </span>
              </div>
              <ArrowRight
                size={16}
                className="text-white transform group-hover:translate-x-1.5 transition-transform duration-200"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

