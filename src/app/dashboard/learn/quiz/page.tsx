'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Drawer, Modal, Dropdown } from 'antd';
import {
  HelpCircle,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Check,
  MoreHorizontal,
  Sparkles,
  FileText,
  Percent,
  Eye,
} from 'lucide-react';
import { RoleGuard } from '@/auth/components/RoleGuard';
import {
  useGetLearnQuizQuery,
  useCreateQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  QuizQuestion,
  QuizOption,
  CreateQuizQuestionRequest,
} from '@/auth/services/adminApi';
import { useToast } from '@/auth/components/ToastContainer';
import { TableSkeletonRows, TableSkeletonCol } from '@/components/TableSkeleton';

function extractQuestions(data: any): QuizQuestion[] {
  if (!data) return [];
  const raw = data.data !== undefined ? data.data : data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.questions)) return raw.questions;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

const DEFAULT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const defaultOptions = (): QuizOption[] => [
  { label: 'A', body: '', isCorrect: true, displayOrder: 1 },
  { label: 'B', body: '', isCorrect: false, displayOrder: 2 },
  { label: 'C', body: '', isCorrect: false, displayOrder: 3 },
  { label: 'D', body: '', isCorrect: false, displayOrder: 4 },
];

const QUIZ_SKELETON_COLS: TableSkeletonCol[] = [
  { type: 'number', align: 'center', width: 'w-6' },
  { type: 'text', width: 'w-72' },
  { type: 'text', width: 'w-48' },
  { type: 'number', align: 'center', width: 'w-10' },
  { type: 'number', align: 'center', width: 'w-10' },
  { type: 'actions', align: 'right', stickyRight: true, width: 'w-20' },
];

export default function QuizManagementPage() {
  return (
    <RoleGuard allowedRoles={['SuperAdmin', 'Control']}>
      <QuizManagementContent />
    </RoleGuard>
  );
}

function QuizManagementContent() {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const PAGE_SIZE = 20;

  // Drawer / Form state
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);
  const [prompt, setPrompt] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [options, setOptions] = useState<QuizOption[]>(defaultOptions());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View details drawer state
  const [viewQuestion, setViewQuestion] = useState<QuizQuestion | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<QuizQuestion | null>(null);

  // RTK Query
  const { data, isFetching, isError, error, refetch } = useGetLearnQuizQuery();
  const [createQuestion, { isLoading: isCreating }] = useCreateQuizQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateQuizQuestionMutation();
  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteQuizQuestionMutation();

  const questions = useMemo(() => extractQuestions(data), [data]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase();
    return questions.filter(
      (item) =>
        item.prompt?.toLowerCase().includes(q) ||
        item.options?.some((opt) => opt.body?.toLowerCase().includes(q))
    );
  }, [questions, searchQuery]);

  const totalCount = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedQuestions = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, pageNumber, PAGE_SIZE]);

  const avgOptions = useMemo(() => {
    if (!questions.length) return '4.0';
    const total = questions.reduce((acc, q) => acc + (q.options?.length || 0), 0);
    return (total / questions.length).toFixed(1);
  }, [questions]);

  // Form Handlers
  const handleOpenCreate = () => {
    setSelectedQuestion(null);
    setPrompt('');
    setDisplayOrder((questions.length || 0) + 1);
    setOptions(defaultOptions());
    setFormErrors({});
    setDrawerMode('create');
  };

  const handleOpenEdit = (q: QuizQuestion) => {
    setSelectedQuestion(q);
    setPrompt(q.prompt || '');
    setDisplayOrder(q.displayOrder ?? 1);
    if (q.options && q.options.length > 0) {
      setOptions(
        q.options.map((opt, idx) => ({
          label: opt.label || DEFAULT_LABELS[idx] || `Option ${idx + 1}`,
          body: opt.body || '',
          isCorrect: Boolean(opt.isCorrect),
          displayOrder: opt.displayOrder ?? idx + 1,
        }))
      );
    } else {
      setOptions(defaultOptions());
    }
    setFormErrors({});
    setDrawerMode('edit');
  };

  const handleOptionBodyChange = (index: number, body: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], body };
      return copy;
    });
  };

  const handleSelectCorrectOption = (correctIndex: number) => {
    setOptions((prev) =>
      prev.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === correctIndex,
      }))
    );
  };

  const handleAddOption = () => {
    if (options.length >= DEFAULT_LABELS.length) {
      toast.error(`Maximum of ${DEFAULT_LABELS.length} options allowed.`, 'Limit Reached');
      return;
    }
    const nextIdx = options.length;
    setOptions((prev) => [
      ...prev,
      {
        label: DEFAULT_LABELS[nextIdx] || `Option ${nextIdx + 1}`,
        body: '',
        isCorrect: false,
        displayOrder: nextIdx + 1,
      },
    ]);
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) {
      toast.error('Questions must have at least 2 options.', 'Minimum Required');
      return;
    }
    setOptions((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      const remapped = filtered.map((opt, idx) => ({
        ...opt,
        label: DEFAULT_LABELS[idx] || `Option ${idx + 1}`,
        displayOrder: idx + 1,
      }));
      const hasCorrect = remapped.some((o) => o.isCorrect);
      if (!hasCorrect && remapped.length > 0) {
        remapped[0].isCorrect = true;
      }
      return remapped;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!prompt.trim()) {
      errors.prompt = 'Question prompt is required';
    }
    if (options.length < 2) {
      errors.options = 'At least 2 options are required';
    }
    const emptyOpt = options.find((o) => !o.body.trim());
    if (emptyOpt) {
      errors.options = `Option ${emptyOpt.label} text cannot be empty`;
    }
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      errors.correct = 'Exactly ONE option must be marked as correct';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: CreateQuizQuestionRequest = {
      prompt,
      displayOrder,
      options: options.map((opt, idx) => ({
        label: opt.label,
        body: opt.body,
        isCorrect: opt.isCorrect,
        displayOrder: idx + 1,
      })),
    };

    try {
      if (drawerMode === 'create') {
        await createQuestion(payload).unwrap();
        toast.success('Quiz question added successfully.', 'Question Created');
      } else if (drawerMode === 'edit' && selectedQuestion) {
        await updateQuestion({ id: selectedQuestion.id, body: payload }).unwrap();
        toast.success('Quiz question updated successfully.', 'Question Updated');
      }
      setDrawerMode(null);
      refetch();
    } catch (err: any) {
      // Handle known backend issue where database update succeeds (statusCode 200) but serializer throws 500 due to circular recursion
      if (err?.data?.statusCode === 200 || err?.data?.statusMessage?.toLowerCase().includes('updated')) {
        toast.success(err?.data?.statusMessage || 'Quiz question updated successfully.', 'Question Updated');
        setDrawerMode(null);
        refetch();
        return;
      }
      const msg =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.data?.title ||
        'Failed to save quiz question.';
      toast.error(msg, 'Save Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuestion(deleteTarget.id).unwrap();
      toast.success('Quiz question deleted.', 'Question Deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.data?.message || err?.data?.title || 'Failed to delete question.';
      toast.error(msg, 'Delete Failed');
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
            Quiz Questions Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Curate multiple choice knowledge assessment questions to test investor comprehension
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus size={14} /> Add Question
          </button>
        </div>
      </div>

      {/* ── Analytics Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          cardTitle="Total"
          value={isFetching ? '—' : String(questions.length)}
          topText="Total"
          icon={<HelpCircle size={14} className="text-gray-400 shrink-0" />}
          subText="Interactive questions"
        />
        <StatCard
          cardTitle="Active"
          value={isFetching ? '—' : String(questions.length)}
          topText="Active"
          icon={<Check size={14} className="text-emerald-500 shrink-0" />}
          subText="Active assessment bank"
        />
        <StatCard
          cardTitle="Inactive"
          value={isFetching ? '—' : '0'}
          topText="Inactive"
          icon={<X size={14} className="text-gray-400 shrink-0" />}
          subText="Unpublished drafts"
        />
        <StatCard
          cardTitle="User Percentage"
          value={isFetching ? '—' : (questions.length > 0 ? '100.0%' : '0.0%')}
          topText="User Percentage"
          icon={<Percent size={14} className="text-[#961A1C] shrink-0" />}
          subText="Curriculum assessment coverage"
        />
      </div>

      {/* ── Main Content Card (Audit Ledger Style) ────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search question prompt or option answer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>

          {/* Reset Filters */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPageNumber(1);
              }}
              className="text-[11px] text-gray-500 hover:text-[#961A1C] underline font-medium cursor-pointer ml-auto"
            >
              Reset search
            </button>
          )}
        </div>

        {/* Content Table */}
        <div className="min-h-[300px]">
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center">
                <AlertCircle size={20} className="text-[#961A1C]" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Failed to load quiz questions
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(error as any)?.data?.statusMessage ||
                    'An error occurred while fetching quiz assessment questions.'}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#961A1C] hover:bg-[#7e1517] text-white rounded-md text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <span>Retry Fetch</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/75 dark:bg-gray-800/80 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center border-b border-r border-gray-200 dark:border-gray-700">
                      #
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700">
                      Question Prompt
                    </th>
                    <th className="px-3 py-2 border-b border-r border-gray-200 dark:border-gray-700">
                      Multiple Choice Options (Green = Correct)
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Total Choices
                    </th>
                    <th className="px-3 py-2 text-center border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      Order
                    </th>
                    <th className="px-3 py-2 w-24 text-right border-b border-gray-200 dark:border-gray-700 sticky right-0 bg-gray-100 dark:bg-gray-800 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-sans">
                  {isFetching ? (
                    <TableSkeletonRows rows={7} columns={QUIZ_SKELETON_COLS} />
                  ) : filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <HelpCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={36} />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          No quiz questions found
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          {searchQuery
                            ? 'No questions match your current search query.'
                            : 'No quiz questions created yet. Click "+ Add Question" to start building your quiz assessment.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedQuestions.map((q, idx) => (
                      <QuizRow
                        key={q.id}
                        question={q}
                        index={(pageNumber - 1) * PAGE_SIZE + idx}
                        onView={() => setViewQuestion(q)}
                        onEdit={() => handleOpenEdit(q)}
                        onDelete={() => setDeleteTarget(q)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!isFetching && !isError && filteredQuestions.length > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 mt-auto text-xs">
            <span className="text-gray-500 font-mono text-[11px]">
              Showing {(pageNumber - 1) * PAGE_SIZE + 1}–{Math.min(pageNumber * PAGE_SIZE, totalCount)} of {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px]">
                Page {pageNumber} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                  disabled={pageNumber >= totalPages}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={Boolean(drawerMode)}
        onClose={() => setDrawerMode(null)}
        size={560}
        destroyOnClose
        maskClosable={false}
        className="dark:bg-gray-900"
        title={
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <HelpCircle size={18} className="text-[#961A1C]" />
            <h3 className="text-sm font-semibold">
              {drawerMode === 'create' ? 'Add Quiz Question' : 'Edit Quiz Question'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 [scrollbar-width:none]">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Question Prompt *
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Which of the following investments offers guaranteed return on capital?"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#961A1C] ${
                  formErrors.prompt ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.prompt && <p className="text-xs text-red-500 mt-1">{formErrors.prompt}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-32 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>

            {/* Multiple Choice Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Multiple Choice Options (Click checkbox to set correct answer) *
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Exactly one option must be selected as the correct answer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-[#961A1C] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Option
                </button>
              </div>

              {formErrors.options && (
                <p className="text-xs text-red-500 mb-2">{formErrors.options}</p>
              )}
              {formErrors.correct && (
                <p className="text-xs text-red-500 mb-2">{formErrors.correct}</p>
              )}

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div
                    key={opt.label}
                    className={`flex items-center gap-2 p-2 rounded-md border transition ${
                      opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectCorrectOption(idx)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 cursor-pointer transition ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                      }`}
                      title={opt.isCorrect ? 'Marked as Correct' : 'Click to mark as correct'}
                    >
                      {opt.label}
                    </button>
                    <input
                      type="text"
                      value={opt.body}
                      onChange={(e) => handleOptionBodyChange(idx, e.target.value)}
                      placeholder={`Enter answer option ${opt.label}...`}
                      className="flex-1 bg-transparent border-0 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Remove Option"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-3">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="w-full py-2 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white rounded-md text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCreating || isUpdating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              <span>{drawerMode === 'create' ? 'Save Question' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Quiz Question Details Drawer ─────────────────────────────────── */}
      <QuizDetailsDrawer
        question={viewQuestion}
        onClose={() => setViewQuestion(null)}
        onEdit={(q) => {
          setViewQuestion(null);
          handleOpenEdit(q);
        }}
      />

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        width={400}
        centered
        destroyOnClose
        className="dark:bg-gray-900"
      >
        <div className="p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center mx-auto mb-3">
            <Trash2 size={20} className="text-[#961A1C]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Delete Question</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
            Are you sure you want to delete question:{' '}
            <strong className="text-gray-800 dark:text-gray-200">"{deleteTarget?.prompt}"</strong>?
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-md bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function QuizRow({
  question,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  question: QuizQuestion;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-blue-50/20 dark:hover:bg-gray-800/40 transition-colors group">
      {/* S/N */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 font-mono text-[11px] text-gray-500 whitespace-nowrap">
        #{index + 1}
      </td>

      {/* Prompt */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[240px]">
        <button
          onClick={onView}
          className="font-medium text-xs text-gray-900 dark:text-white hover:text-[#961A1C] dark:hover:text-[#e05557] transition-colors text-left line-clamp-2 block cursor-pointer"
          title={question.prompt}
        >
          {question.prompt}
        </button>
      </td>

      {/* Options Summary */}
      <td className="px-3 py-2 align-middle border-b border-r border-gray-200 dark:border-gray-800 min-w-[260px]">
        <div className="flex flex-wrap gap-1.5">
          {question.options?.map((opt) => (
            <span
              key={opt.label}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                opt.isCorrect
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
              title={opt.body}
            >
              <span>{opt.label}:</span>
              <span className="truncate max-w-[120px]">{opt.body}</span>
              {opt.isCorrect && <Check size={10} className="stroke-[3]" />}
            </span>
          ))}
        </div>
      </td>

      {/* Total Choices */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
        {question.options?.length ?? 0}
      </td>

      {/* Display Order */}
      <td className="px-3 py-2 text-center align-middle border-b border-r border-gray-200 dark:border-gray-800 whitespace-nowrap font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
        {question.displayOrder ?? 1}
      </td>

      {/* Sticky Right Actions Column */}
      <td className="px-3 py-2 align-middle border-b border-gray-200 dark:border-gray-800 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 z-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-850 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={onView}
            className="text-[11px] font-medium text-[#961A1C] hover:bg-[#961A1C]/10 px-2.5 py-0.5 rounded border border-[#961A1C]/20 hover:border-[#961A1C]/40 transition-colors cursor-pointer"
          >
            Details
          </button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'View Details',
                  icon: <Eye size={13} />,
                  onClick: onView,
                },
                {
                  key: 'edit',
                  label: 'Edit Question',
                  icon: <Pencil size={13} />,
                  onClick: onEdit,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: 'Delete Question',
                  danger: true,
                  icon: <Trash2 size={13} />,
                  onClick: onDelete,
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
              <MoreHorizontal size={14} />
            </button>
          </Dropdown>
        </div>
      </td>
    </tr>
  );
}

interface StatCardProps {
  cardTitle: string;
  value: string;
  topText?: string;
  icon: React.ReactNode;
  subText: string;
}

function StatCard({ cardTitle, value, topText, icon, subText }: StatCardProps) {
  const displayTitle = cardTitle || topText;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3.5 shadow-xs border border-gray-200 dark:border-gray-800 relative overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] bg-[#961A1C] rounded-r-sm" />
      <div className="flex items-center justify-between pl-2">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
          {displayTitle}
        </span>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded transition cursor-pointer">
          <MoreHorizontal size={15} />
        </button>
      </div>
      <div className="my-2 pl-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight font-mono">
          {value}
        </h2>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pl-2 pt-1 border-t border-gray-100 dark:border-gray-800">
        {icon}
        <span>{subText}</span>
      </div>
    </div>
  );
}

// ─── Quiz Question Details Drawer ──────────────────────────────────────────────
function QuizDetailsDrawer({
  question,
  onClose,
  onEdit,
}: {
  question: QuizQuestion | null;
  onClose: () => void;
  onEdit: (q: QuizQuestion) => void;
}) {
  return (
    <Drawer
      open={Boolean(question)}
      onClose={onClose}
      size={580}
      destroyOnClose
      className="dark:bg-gray-900"
      title={
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <HelpCircle size={18} className="text-[#961A1C]" />
          <h3 className="text-sm font-semibold">Quiz Question Details</h3>
        </div>
      }
    >
      {question && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none]">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                Display Order: #{question.displayOrder ?? 1}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {question.options?.length ?? 0} Answer Choices
              </span>
            </div>

            {/* Question Prompt */}
            <div>
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                Question Prompt
              </span>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50 leading-relaxed tracking-tight mt-1">
                {question.prompt}
              </h2>
            </div>

            {/* Answer Options List */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                  Configured Choices
                </span>
                <span className="text-[11px] text-gray-400">
                  Green indicates the correct answer
                </span>
              </div>
              <div className="space-y-2">
                {question.options?.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                      opt.isCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {opt.label || String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-sans leading-relaxed ${
                          opt.isCorrect
                            ? 'font-medium text-emerald-950 dark:text-emerald-100'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {opt.body}
                      </p>
                    </div>
                    {opt.isCorrect && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 shrink-0">
                        <Check size={11} className="stroke-[3]" />
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Drawer Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(question)}
              className="px-3.5 py-1.5 rounded-md bg-[#961A1C] hover:bg-[#7a1517] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit Question</span>
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
