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
  performedBy?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string;
  ipAddress?: string;
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
    getInvestmentEducations: builder.query<ApiResponse<{ items?: InvestmentEducation[]; data?: InvestmentEducation[]; totalCount?: number }>, { pageNumber?: number; pageSize?: number }>({
      query: ({ pageNumber = 1, pageSize = 20 } = {}) =>
        `/admin/investment-education?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
} = adminApi;
