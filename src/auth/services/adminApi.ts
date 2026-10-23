import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ─── helpers ────────────────────────────────────────────────────────────────
const getBaseUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mobile-test.alpha10group.com/alphaten-admin/api';
  return envUrl.replace(/\/+$/, '');
};

// ─── shared API wrapper ──────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  statusCode: number;
  statusMessage: string;
  data?: T;
}

// ─── Admin Users ─────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface AdminUsersResponse {
  users?: AdminUser[];
  items?: AdminUser[];
  data?: AdminUser[];
  totalCount?: number;
  page?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────
export interface AuditTrailEntry {
  id: string;
  module: string;
  action: string;
  referenceId?: string;
  performedById?: string;
  performedByName?: string;
  performedByEmail?: string;
  performedByRole?: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  remarks?: string | null;
  description?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface AuditTrailFilter {
  module?: string;
  action?: string;
  referenceId?: string;
  performedById?: string;
  pageNumber?: number;
  pageSize?: number;
}

// ─── Investment Education ────────────────────────────────────────────────────
export interface InvestmentEducation {
  id: string;
  code: string;
  title: string;
  heroText?: string;
  detailsText?: string;
  howItWorksText?: string;
  riskLevel?: string;
  capitalGuaranteed?: boolean;
  returnsGuaranteed?: boolean;
  withdrawalRestrictions?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvestmentEducationRequest {
  code: string;
  title: string;
  heroText?: string;
  detailsText?: string;
  howItWorksText?: string;
  riskLevel?: string;
  capitalGuaranteed?: boolean;
  returnsGuaranteed?: boolean;
  withdrawalRestrictions?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

// ─── Mutual Fund Contents ────────────────────────────────────────────────────
export interface MutualFundContent {
  id: string;
  fundId: string;
  displayName: string;
  shortDescription?: string;
  riskLevel?: string;
  isRecommended?: boolean;
  durationLabel?: string;
  expectedYieldLabel?: string;
  howYouEarnText?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMutualFundRequest {
  fundId: string;
  displayName: string;
  shortDescription?: string;
  riskLevel?: string;
  isRecommended?: boolean;
  durationLabel?: string;
  expectedYieldLabel?: string;
  howYouEarnText?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface AllocationItem {
  assetName: string;
  minPercent: number;
  maxPercent: number;
  colorHex?: string;
  displayOrder?: number;
}

export interface HoldingItem {
  holdingName: string;
  minPercent: number;
  maxPercent: number;
  displayOrder?: number;
}

// ─── Portfolio Settings ──────────────────────────────────────────────────────
export interface PortfolioCategory {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
}

export interface CreatePortfolioCategoryRequest {
  code: string;
  name: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface PortfolioDuration {
  id: string;
  durationMonths: number;
  label: string;
  expectedReturnMinPercent?: number;
  expectedReturnMaxPercent?: number;
  badge?: string;
  earlyExitPenaltyPercent?: number;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
}

export interface CreatePortfolioDurationRequest {
  durationMonths: number;
  label: string;
  expectedReturnMinPercent?: number;
  expectedReturnMaxPercent?: number;
  badge?: string;
  earlyExitPenaltyPercent?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface RetailGLMapping {
  mutualFundsGL: string | null;
  fixedDepositGL: string | null;
  bondsGL: string | null;
  stocksGL: string | null;
}

export interface SystemDateResponse {
  systemDate: string | null;
}

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

// ─── Learn Management: Topics ────────────────────────────────────────────────
export interface LearnTopic {
  id: string;
  code: string;
  title: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLearnTopicRequest {
  code: string;
  title: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ─── Learn Management: Articles ──────────────────────────────────────────────
export interface LearnArticle {
  id: string;
  code: string;
  topicCode: string;
  title: string;
  summary: string;
  body: string;
  keyTakeaway: string;
  level: 'Beginner' | 'Intermediate';
  readMinutes: number;
  mediaType: 'None' | 'Image' | 'Video';
  mediaUrl?: string;
  nextArticleCode?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLearnArticleRequest {
  code: string;
  topicCode: string;
  title: string;
  summary: string;
  body: string;
  keyTakeaway: string;
  level: 'Beginner' | 'Intermediate';
  readMinutes: number;
  mediaType: 'None' | 'Image' | 'Video';
  mediaUrl?: string;
  nextArticleCode?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ─── Learn Management: Glossary ──────────────────────────────────────────────
export interface LearnGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLearnGlossaryRequest {
  term: string;
  definition: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ─── Learn Management: Quiz ──────────────────────────────────────────────────
export interface QuizOption {
  label: string;
  body: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  displayOrder: number;
  options: QuizOption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuizQuestionRequest {
  prompt: string;
  displayOrder: number;
  options: QuizOption[];
}

// ─── Learn Management: Webinars ─────────────────────────────────────────────
export interface LearnWebinar {
  id: string;
  code: string;
  title: string;
  durationMinutes: number;
  videoUrl: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLearnWebinarRequest {
  code: string;
  title: string;
  durationMinutes: number;
  videoUrl: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ─── Support Management ──────────────────────────────────────────────────────
export interface SupportCase {
  id: string;
  ticketNumber?: string;
  subject: string;
  customerName?: string;
  customerEmail?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Pending' | 'Escalated' | 'Resolved' | 'WaitingOnUs' | 'WaitingOnCustomer';
  assignedTo?: string;
  categoryCode?: string;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'Credit' | 'Debit';
  description: string;
  timestamp: string;
}

export interface SupportCaseDetails extends SupportCase {
  customerWallet?: {
    accountNumber: string;
    balance: number;
    currency: string;
    tier: string;
  };
  recentTransactions?: WalletTransaction[];
  notes?: Array<{
    id: string;
    author: string;
    note: string;
    isCustomerVisible: boolean;
    createdAt: string;
  }>;
}

export interface SupportCategory {
  id: string;
  code: string;
  title: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  caseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportMacro {
  id?: string;
  code: string;
  title: string;
  body: string;
  setsStatusTo?: string;
}

export interface AssignSupportCaseRequest {
  assignedToUserEmail?: string;
}

export interface AddSupportNoteRequest {
  note: string;
  isCustomerVisible?: boolean;
}

export interface UpdateSupportCaseStatusRequest {
  status: 'Open' | 'WaitingOnUs' | 'WaitingOnCustomer' | 'Resolved' | 'Escalated';
}

export interface UpsertSupportCategoryRequest {
  code?: string;
  title: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpsertCashInflowGlRequest {
  productId: string;
  glAccount: string;
  group?: 'mutual_funds' | 'fixed_returns' | 'bonds' | 'stocks';
}

// ─── createApi ───────────────────────────────────────────────────────────────
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('alpha10_token') ||
          sessionStorage.getItem('alpha10_token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'AdminUsers',
    'AdminUser',
    'AuditTrail',
    'InvestmentEducation',
    'InvestmentEducationItem',
    'MutualFundContents',
    'MutualFundContent',
    'PortfolioCategories',
    'PortfolioDurations',
    'RetailSettings',
    'LearnTopics',
    'LearnArticles',
    'LearnGlossary',
    'LearnQuiz',
    'LearnWebinars',
    'SupportCases',
    'SupportCase',
    'SupportCategories',
    'SupportMacros',
  ],
  endpoints: (builder) => ({
    // ── Admin Users ──────────────────────────────────────────────────────────
    getAdminUsers: builder.query<
      ApiResponse<AdminUsersResponse>,
      { pageNumber?: number; pageSize?: number; role?: string }
    >({
      query: ({ pageNumber = 1, pageSize = 20, role } = {}) => {
        const params = new URLSearchParams({
          pageNumber: String(pageNumber),
          pageSize: String(pageSize),
        });
        if (role && role !== 'All') params.append('role', role);
        return `/admin/users?${params.toString()}`;
      },
      providesTags: ['AdminUsers'],
    }),

    getAdminUser: builder.query<ApiResponse<AdminUser>, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminUser', id }],
    }),

    createAdminUser: builder.mutation<ApiResponse<AdminUser>, CreateAdminRequest>({
      query: (body) => ({
        url: '/admin/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    // ── Audit Trail ──────────────────────────────────────────────────────────
    getAuditTrail: builder.query<ApiResponse<{ items?: AuditTrailEntry[]; data?: AuditTrailEntry[]; totalCount?: number }>, AuditTrailFilter>({
      query: ({ module, action, referenceId, performedById, pageNumber = 1, pageSize = 20 } = {}) => {
        const params = new URLSearchParams({
          page: String(pageNumber),
          pageNumber: String(pageNumber),
          pageSize: String(pageSize),
        });
        if (module) params.append('module', module);
        if (action) params.append('action', action);
        if (referenceId) params.append('referenceId', referenceId);
        if (performedById) params.append('performedById', performedById);
        return `/admin/audit-trail?${params.toString()}`;
      },
      providesTags: ['AuditTrail'],
    }),

    // ── Investment Education ─────────────────────────────────────────────────
    getInvestmentEducations: builder.query<ApiResponse<{ items?: InvestmentEducation[]; data?: InvestmentEducation[]; totalCount?: number } | InvestmentEducation[]>, { pageNumber?: number; pageSize?: number } | void>({
      query: (params) => {
        if (!params) return '/admin/investment-education';
        const { pageNumber = 1, pageSize = 20 } = params;
        return `/admin/investment-education?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      },
      providesTags: ['InvestmentEducation'],
    }),

    getInvestmentEducation: builder.query<ApiResponse<InvestmentEducation>, string>({
      query: (id) => `/admin/investment-education/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'InvestmentEducationItem', id }],
    }),

    createInvestmentEducation: builder.mutation<ApiResponse<InvestmentEducation>, CreateInvestmentEducationRequest>({
      query: (body) => ({
        url: '/admin/investment-education',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InvestmentEducation'],
    }),

    updateInvestmentEducation: builder.mutation<ApiResponse<InvestmentEducation>, { id: string; body: CreateInvestmentEducationRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/investment-education/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'InvestmentEducation',
        { type: 'InvestmentEducationItem', id },
      ],
    }),

    deleteInvestmentEducation: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/investment-education/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['InvestmentEducation'],
    }),

    // ── Mutual Fund Contents ─────────────────────────────────────────────────
    getMutualFundContents: builder.query<ApiResponse<{ items?: MutualFundContent[]; data?: MutualFundContent[]; totalCount?: number }>, { pageNumber?: number; pageSize?: number }>({
      query: ({ pageNumber = 1, pageSize = 20 } = {}) =>
        `/admin/mutual-fund-contents?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ['MutualFundContents'],
    }),

    getMutualFundContent: builder.query<ApiResponse<MutualFundContent>, string>({
      query: (id) => `/admin/mutual-fund-contents/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'MutualFundContent', id }],
    }),

    createMutualFundContent: builder.mutation<ApiResponse<MutualFundContent>, CreateMutualFundRequest>({
      query: (body) => ({
        url: '/admin/mutual-fund-contents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MutualFundContents'],
    }),

    updateMutualFundContent: builder.mutation<ApiResponse<MutualFundContent>, { id: string; body: CreateMutualFundRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/mutual-fund-contents/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'MutualFundContents',
        { type: 'MutualFundContent', id },
      ],
    }),

    deleteMutualFundContent: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/mutual-fund-contents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MutualFundContents'],
    }),

    updateMutualFundAllocations: builder.mutation<ApiResponse<unknown>, { id: string; items: AllocationItem[] }>({
      query: ({ id, items }) => ({
        url: `/admin/mutual-fund-contents/${id}/allocations`,
        method: 'PUT',
        body: { items },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'MutualFundContent', id }],
    }),

    updateMutualFundHoldings: builder.mutation<ApiResponse<unknown>, { id: string; items: HoldingItem[] }>({
      query: ({ id, items }) => ({
        url: `/admin/mutual-fund-contents/${id}/holdings`,
        method: 'PUT',
        body: { items },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'MutualFundContent', id }],
    }),

    // ── Portfolio Categories ─────────────────────────────────────────────────
    getPortfolioCategories: builder.query<ApiResponse<{ items?: PortfolioCategory[]; data?: PortfolioCategory[] }>, void>({
      query: () => '/admin/portfolio-settings/categories',
      providesTags: ['PortfolioCategories'],
    }),

    createPortfolioCategory: builder.mutation<ApiResponse<PortfolioCategory>, CreatePortfolioCategoryRequest>({
      query: (body) => ({
        url: '/admin/portfolio-settings/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PortfolioCategories'],
    }),

    updatePortfolioCategory: builder.mutation<ApiResponse<PortfolioCategory>, { id: string; body: CreatePortfolioCategoryRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/portfolio-settings/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PortfolioCategories'],
    }),

    deletePortfolioCategory: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/portfolio-settings/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PortfolioCategories'],
    }),

    // ── Portfolio Durations ──────────────────────────────────────────────────
    getPortfolioDurations: builder.query<ApiResponse<{ items?: PortfolioDuration[]; data?: PortfolioDuration[] }>, void>({
      query: () => '/admin/portfolio-settings/durations',
      providesTags: ['PortfolioDurations'],
    }),

    createPortfolioDuration: builder.mutation<ApiResponse<PortfolioDuration>, CreatePortfolioDurationRequest>({
      query: (body) => ({
        url: '/admin/portfolio-settings/durations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PortfolioDurations'],
    }),

    updatePortfolioDuration: builder.mutation<ApiResponse<PortfolioDuration>, { id: string; body: CreatePortfolioDurationRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/portfolio-settings/durations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PortfolioDurations'],
    }),

    deletePortfolioDuration: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/portfolio-settings/durations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PortfolioDurations'],
    }),

    // ── Retail Settings (GL Mapping & CORE System Date) ─────────────────────
    getRetailGLs: builder.query<ApiResponse<RetailGLMapping>, void>({
      query: () => '/admin/settings/Fetch-GLs',
      providesTags: ['RetailSettings'],
    }),

    updateRetailGLs: builder.mutation<ApiResponse<RetailGLMapping>, RetailGLMapping>({
      query: (body) => ({
        url: '/admin/settings/UpdateGls',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['RetailSettings'],
    }),

    getSystemDate: builder.query<ApiResponse<SystemDateResponse>, void>({
      query: () => '/admin/settings/Fetch-System-Date',
      providesTags: ['RetailSettings'],
    }),

    updateSystemDate: builder.mutation<ApiResponse<SystemDateResponse>, { systemDate: string }>({
      query: (body) => ({
        url: '/admin/settings/UpdateSystemDate',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['RetailSettings'],
    }),

    // ── Learn: Topics ────────────────────────────────────────────────────────
    getLearnTopics: builder.query<ApiResponse<LearnTopic[] | { items: LearnTopic[] }>, void>({
      query: () => '/admin/learn/topics',
      providesTags: ['LearnTopics'],
    }),

    createLearnTopic: builder.mutation<ApiResponse<LearnTopic>, CreateLearnTopicRequest>({
      query: (body) => ({
        url: '/admin/learn/topics',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LearnTopics'],
    }),

    updateLearnTopic: builder.mutation<ApiResponse<LearnTopic>, { id: string; body: CreateLearnTopicRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/learn/topics/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LearnTopics'],
    }),

    deleteLearnTopic: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/learn/topics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LearnTopics'],
    }),

    // ── Learn: Articles ──────────────────────────────────────────────────────
    getLearnArticles: builder.query<ApiResponse<LearnArticle[] | { items: LearnArticle[] }>, void>({
      query: () => '/admin/learn/articles',
      providesTags: ['LearnArticles'],
    }),

    getLearnArticleById: builder.query<ApiResponse<LearnArticle>, string>({
      query: (id) => `/admin/learn/articles/${id}`,
      providesTags: ['LearnArticles'],
    }),

    createLearnArticle: builder.mutation<ApiResponse<LearnArticle>, CreateLearnArticleRequest>({
      query: (body) => ({
        url: '/admin/learn/articles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LearnArticles'],
    }),

    updateLearnArticle: builder.mutation<ApiResponse<LearnArticle>, { id: string; body: CreateLearnArticleRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/learn/articles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LearnArticles'],
    }),

    deleteLearnArticle: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/learn/articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LearnArticles'],
    }),

    // ── Learn: Glossary ──────────────────────────────────────────────────────
    getLearnGlossary: builder.query<ApiResponse<LearnGlossaryTerm[] | { items: LearnGlossaryTerm[] }>, void>({
      query: () => '/admin/learn/glossary',
      providesTags: ['LearnGlossary'],
    }),

    createLearnGlossary: builder.mutation<ApiResponse<LearnGlossaryTerm>, CreateLearnGlossaryRequest>({
      query: (body) => ({
        url: '/admin/learn/glossary',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LearnGlossary'],
    }),

    updateLearnGlossary: builder.mutation<ApiResponse<LearnGlossaryTerm>, { id: string; body: CreateLearnGlossaryRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/learn/glossary/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LearnGlossary'],
    }),

    deleteLearnGlossary: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/learn/glossary/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LearnGlossary'],
    }),

    // ── Learn: Quiz ──────────────────────────────────────────────────────────
    getLearnQuiz: builder.query<ApiResponse<QuizQuestion[] | { questions?: QuizQuestion[]; items?: QuizQuestion[] } | QuizQuestion>, void>({
      query: () => '/admin/learn/quiz',
      providesTags: ['LearnQuiz'],
    }),

    createQuizQuestion: builder.mutation<ApiResponse<QuizQuestion>, CreateQuizQuestionRequest>({
      query: (body) => ({
        url: '/admin/learn/quiz/questions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LearnQuiz'],
    }),

    updateQuizQuestion: builder.mutation<ApiResponse<QuizQuestion>, { id: string; body: CreateQuizQuestionRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/learn/quiz/questions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LearnQuiz'],
    }),

    deleteQuizQuestion: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/learn/quiz/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LearnQuiz'],
    }),

    // ── Learn: Webinars ──────────────────────────────────────────────────────
    getLearnWebinars: builder.query<ApiResponse<LearnWebinar[] | { items: LearnWebinar[] }>, void>({
      query: () => '/admin/learn/webinars',
      providesTags: ['LearnWebinars'],
    }),

    createLearnWebinar: builder.mutation<ApiResponse<LearnWebinar>, CreateLearnWebinarRequest>({
      query: (body) => ({
        url: '/admin/learn/webinars',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LearnWebinars'],
    }),

    updateLearnWebinar: builder.mutation<ApiResponse<LearnWebinar>, { id: string; body: CreateLearnWebinarRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/learn/webinars/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LearnWebinars'],
    }),

    deleteLearnWebinar: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/learn/webinars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LearnWebinars'],
    }),

    // ── Retail Settings: Update Single GL ────────────────────────────────────
    updateGl: builder.mutation<ApiResponse<unknown>, UpsertCashInflowGlRequest>({
      query: (body) => ({
        url: '/admin/settings/UpdateGl',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['RetailSettings'],
    }),

    // ── Support Management ──────────────────────────────────────────────────
    getSupportCases: builder.query<
      ApiResponse<{ items?: SupportCase[]; data?: SupportCase[]; totalCount?: number }>,
      { pageNumber?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: ({ pageNumber = 1, pageSize = 20, status, search } = {}) => {
        const params = new URLSearchParams({
          pageNumber: String(pageNumber),
          pageSize: String(pageSize),
        });
        if (status) params.append('status', status);
        if (search) params.append('search', search);
        return `/admin/support/cases?${params.toString()}`;
      },
      providesTags: ['SupportCases'],
    }),

    getSupportCaseById: builder.query<ApiResponse<SupportCaseDetails>, string>({
      query: (id) => `/admin/support/cases/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SupportCase', id }],
    }),

    assignSupportCase: builder.mutation<ApiResponse<unknown>, { id: string; body: AssignSupportCaseRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/support/cases/${id}/assign`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ['SupportCases', { type: 'SupportCase', id }],
    }),

    sendSupportMacro: builder.mutation<ApiResponse<unknown>, { id: string; code: string }>({
      query: ({ id, code }) => ({
        url: `/admin/support/cases/${id}/macros/${code}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => ['SupportCases', { type: 'SupportCase', id }],
    }),

    addSupportNote: builder.mutation<ApiResponse<unknown>, { id: string; body: AddSupportNoteRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/support/cases/${id}/notes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'SupportCase', id }],
    }),

    updateSupportCaseStatus: builder.mutation<ApiResponse<unknown>, { id: string; body: UpdateSupportCaseStatusRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/support/cases/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ['SupportCases', { type: 'SupportCase', id }],
    }),

    getSupportCategories: builder.query<ApiResponse<SupportCategory[] | { items?: SupportCategory[]; data?: SupportCategory[] }>, void>({
      query: () => '/admin/support/categories',
      providesTags: ['SupportCategories'],
    }),

    getSupportCategoryById: builder.query<ApiResponse<SupportCategory>, string>({
      query: (id) => `/admin/support/categories/${id}`,
      providesTags: ['SupportCategories'],
    }),

    createSupportCategory: builder.mutation<ApiResponse<SupportCategory>, UpsertSupportCategoryRequest>({
      query: (body) => ({
        url: '/admin/support/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportCategories'],
    }),

    updateSupportCategory: builder.mutation<ApiResponse<SupportCategory>, { id: string; body: UpsertSupportCategoryRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/support/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SupportCategories'],
    }),

    deleteSupportCategory: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/support/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupportCategories'],
    }),

    getSupportMacros: builder.query<ApiResponse<SupportMacro[] | { items?: SupportMacro[]; data?: SupportMacro[] }>, void>({
      query: () => '/admin/support/macros',
      providesTags: ['SupportMacros'],
    }),
  }),
});

export const {
  // Admin Users
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useCreateAdminUserMutation,
  // Audit Trail
  useGetAuditTrailQuery,
  // Investment Education
  useGetInvestmentEducationsQuery,
  useGetInvestmentEducationQuery,
  useCreateInvestmentEducationMutation,
  useUpdateInvestmentEducationMutation,
  useDeleteInvestmentEducationMutation,
  // Mutual Fund Contents
  useGetMutualFundContentsQuery,
  useGetMutualFundContentQuery,
  useCreateMutualFundContentMutation,
  useUpdateMutualFundContentMutation,
  useDeleteMutualFundContentMutation,
  useUpdateMutualFundAllocationsMutation,
  useUpdateMutualFundHoldingsMutation,
  // Portfolio Categories
  useGetPortfolioCategoriesQuery,
  useCreatePortfolioCategoryMutation,
  useUpdatePortfolioCategoryMutation,
  useDeletePortfolioCategoryMutation,
  // Portfolio Durations
  useGetPortfolioDurationsQuery,
  useCreatePortfolioDurationMutation,
  useUpdatePortfolioDurationMutation,
  useDeletePortfolioDurationMutation,
  // Retail Settings
  useGetRetailGLsQuery,
  useUpdateRetailGLsMutation,
  useGetSystemDateQuery,
  useUpdateSystemDateMutation,
  useUpdateGlMutation,
  // Learn: Topics
  useGetLearnTopicsQuery,
  useCreateLearnTopicMutation,
  useUpdateLearnTopicMutation,
  useDeleteLearnTopicMutation,
  // Learn: Articles
  useGetLearnArticlesQuery,
  useGetLearnArticleByIdQuery,
  useCreateLearnArticleMutation,
  useUpdateLearnArticleMutation,
  useDeleteLearnArticleMutation,
  // Learn: Glossary
  useGetLearnGlossaryQuery,
  useCreateLearnGlossaryMutation,
  useUpdateLearnGlossaryMutation,
  useDeleteLearnGlossaryMutation,
  // Learn: Quiz
  useGetLearnQuizQuery,
  useCreateQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  // Learn: Webinars
  useGetLearnWebinarsQuery,
  useCreateLearnWebinarMutation,
  useUpdateLearnWebinarMutation,
  useDeleteLearnWebinarMutation,
  // Support Management
  useGetSupportCasesQuery,
  useGetSupportCaseByIdQuery,
  useAssignSupportCaseMutation,
  useSendSupportMacroMutation,
  useAddSupportNoteMutation,
  useUpdateSupportCaseStatusMutation,
  useGetSupportCategoriesQuery,
  useGetSupportCategoryByIdQuery,
  useCreateSupportCategoryMutation,
  useUpdateSupportCategoryMutation,
  useDeleteSupportCategoryMutation,
  useGetSupportMacrosQuery,
} = adminApi;
