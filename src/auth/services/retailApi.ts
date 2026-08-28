import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ─── Base URL helper ────────────────────────────────────────────────────────
const getBaseUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mobile-test.alpha10group.com/alphaten-admin/api';
  return envUrl.replace(/\/+$/, '');
};

// ─── Generic Response Wrapper ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  statusCode?: number;
  statusMessage?: string;
  data?: T;
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
}

// ─── Enums & Enums Strings ─────────────────────────────────────────────────
export type UserStatus = 'Active' | 'Pending' | 'Suspended' | 'Deleted' | 'Dormant';
export type KycStatus = 'Pending' | 'Approved' | 'Rejected';

export type TransactionCategory =
  | 'CashDeposit'
  | 'CashTransfer'
  | 'CashWithdrawal'
  | 'Wallet'
  | 'MutualFund'
  | 'FixedDeposit';

export type TransactionType =
  | 'CashInflow'
  | 'CashOutflow'
  | 'CashTransfer'
  | 'WalletFunding'
  | 'WalletDebit'
  | 'WalletCredit'
  | 'WalletTransfer'
  | 'MutualFundAccountCreation'
  | 'MutualFundAccountCreationWithSubscription'
  | 'MutualFundSubscription'
  | 'MutualFundTopUpSubscription'
  | 'MutualFundRedemption'
  | 'MutualFundRedemptionAllInterest'
  | 'MutualFundRedemptionWithInterest'
  | 'FixedDepositPlacement'
  | 'FixedDepositTopUp'
  | 'FixedDepositLiquidation'
  | 'FixedDepositWithdrawal';

export type TransactionStatus = 'Pending' | 'Successful' | 'Failed' | 'Reversed';
export type VaTransactionStatus = 'Pending' | 'Successful' | 'Failed';

// ─── Retail User Models ─────────────────────────────────────────────────────
export interface RetailUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  username?: string;
  referralCode?: string;
  bvn?: string;
  status?: UserStatus;
  kycStatus?: KycStatus;
  dateOfBirth?: string;
  gender?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  createdAt?: string;
  updatedAt?: string;
  biometricLoginEnabled?: boolean;
  biometricForTransactionsEnabled?: boolean;
  hasSecurityQuestionsConfigured?: boolean;
  loginAttempts?: number;
  balance?: string | number;
  cashAccountNo?: string;
  customerId?: string;
  vnuban?: string;
}

export interface PaginatedRetailUsersResponse {
  items?: RetailUser[];
  users?: RetailUser[];
  data?: RetailUser[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

export interface UpdateRetailProfileRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  photoUrl?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
}

export interface RetailUserFullRecord extends RetailUser {
  profile?: RetailUser;
  kyc?: KycProfile;
  nextOfKin?: NextOfKin[];
  documents?: KycDocument[];
  cashAccounts?: CashAccount[];
  wallet?: Wallet;
  virtualAccount?: VirtualAccount;
  riskProfile?: RiskProfile;
  identityValidation?: IdentityValidation;
}

// ─── KYC Models ────────────────────────────────────────────────────────────
export interface KycProfile {
  id?: string;
  userId?: string;
  title?: string;
  otherNames?: string;
  maritalStatus?: string;
  motherMaidenName?: string;
  weddingAnniversaryDate?: string;
  nationality?: string;
  alternatePhoneNumber?: string;
  alternateEmailAddress?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  addressZipCode?: string;
  occupation?: string;
  employerName?: string;
  employmentJobTitle?: string;
  employerAddressStreet?: string;
  employerAddressCity?: string;
  employerAddressCountry?: string;
  estimatedAnnualIncome?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranchName?: string;
  bankAddressDetails?: string;
  identityDocType?: string;
  identityDocName?: string;
  identityDocNumber?: string;
  identityDocIssueDate?: string;
  identityDocExpiryDate?: string;
  identityDocIssueAuthority?: string;
  nationalId?: string;
  remarks?: string;
  status?: KycStatus;
  updatedAt?: string;
}

export interface UpdateRetailKycRequest extends Partial<KycProfile> {}

export interface KycDocument {
  id?: string;
  documentId?: string;
  userId?: string;
  documentType?: string;
  documentName?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issueAuthority?: string;
  status?: KycStatus;
  remarks?: string;
  contentBase64?: string;
  fileBase64?: string;
  createdAt?: string;
}

export interface NextOfKin {
  id?: string;
  userId?: string;
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
  emailAddress?: string;
  address?: string;
}

export interface RejectKycRequest {
  remarks: string;
}

export interface RejectDocumentRequest {
  remarks: string;
}

export interface IdentityValidation {
  id?: string;
  userId?: string;
  bvnVerified?: boolean;
  ninVerified?: boolean;
  bvnData?: Record<string, unknown>;
  ninData?: Record<string, unknown>;
  verifiedAt?: string;
}

export interface RiskProfile {
  id?: string;
  userId?: string;
  riskScore?: number;
  riskCategory?: string;
  assessmentDate?: string;
}

// ─── Cash Accounts ──────────────────────────────────────────────────────────
export interface CashAccount {
  id?: string;
  userId?: string;
  customerId?: string;
  customerSourceReference?: string;
  accountNumber?: string;
  accountType?: string;
  fundAccountNo?: string;
  fundAccountId?: string;
  externalReference?: string;
  subscriptionReference?: string;
  accountName?: string;
  gender?: string;
  phoneNumber?: string;
  primaryEmail?: string;
  accountOfficerName?: string;
  accountOfficerId?: string;
  planId?: string;
  balance?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRetailCashAccountRequest {
  planId: string;
}

// ─── Mutual Funds ───────────────────────────────────────────────────────────
export interface MutualFundHolding {
  id?: string;
  fundAccountId?: string;
  fundId?: string;
  fundName?: string;
  units?: number;
  currentValue?: number;
  accruedInterest?: number;
  purchaseValue?: number;
  yieldPercent?: number;
}

export interface MutualFundTransaction {
  id?: string;
  fundAccountId?: string;
  transactionType?: string;
  amount?: number;
  units?: number;
  status?: string;
  transactionDate?: string;
}

// ─── Wallet & Ledger Transactions ───────────────────────────────────────────
export interface Wallet {
  id?: string;
  userId?: string;
  walletNumber?: string;
  balance?: number;
  ledgerBalance?: number;
  currency?: string;
  status?: string;
  isSuspended?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SymplusHolding {
  account_description?: string;
  fund_account_id?: string;
  account_opened_date?: string;
  balance_date?: string;
  balance_quantity?: number;
  cash_account_description?: string;
  cash_account_id?: string;
  cost_price?: number;
  cost_value?: number;
  current_bid_price?: number;
  current_value?: number;
  customer_id?: string;
  customer_name?: string;
  external_reference?: string;
  fund_currency?: string;
  fund_description?: string;
  fund_id?: string;
  gain_loss_amount?: number;
  total_accrued_interest?: number;
  total_purchase_amount?: number;
}

export interface MutualFundHoldingsResponse {
  localAccounts?: CashAccount[];
  symplusHoldings?: SymplusHolding[];
}

export interface LedgerTransaction {
  id?: string;
  userId?: string;
  customerId?: string;
  transactionId?: string;
  category?: string;
  type?: string;
  transactionType?: string;
  status?: string;
  amount?: number;
  fee?: number;
  currency?: string;
  debitAccount?: string;
  debitAccountName?: string;
  creditAccount?: string;
  creditAccountName?: string;
  description?: string;
  narrative?: string;
  reference?: string;
  externalReference?: string;
  fundAccountId?: string;
  transactionDate?: string;
  createdDate?: string;
  timestamp?: string;
}

// ─── Virtual Account ────────────────────────────────────────────────────────
export interface VirtualAccount {
  id?: string;
  userId?: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  status?: string;
  vNuban?: string;
  productType?: string;
  merchantCode?: string;
  customerReference?: string;
  type?: string;
  singleDepositLimit?: number;
  bvn?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDevice {
  id?: string;
  userId?: string;
  deviceName?: string;
  deviceId?: string;
  platform?: string;
  osVersion?: string;
  manufacturer?: string;
  model?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VirtualAccountInflow {
  id?: string;
  accountNumber?: string;
  amount?: number;
  senderName?: string;
  senderBank?: string;
  narration?: string;
  timestamp?: string;
}

export interface VirtualAccountTransfer {
  id?: string;
  reference?: string;
  amount?: number;
  beneficiaryAccount?: string;
  beneficiaryBank?: string;
  status?: VaTransactionStatus;
  timestamp?: string;
}

// ─── Transfers & Transfer Banks ─────────────────────────────────────────────
export interface Transfer {
  id?: string;
  userId?: string;
  transactionRef?: string;
  ubaReference?: string;
  amount?: number;
  senderName?: string;
  beneficiaryAccountName?: string;
  beneficiaryAccountNumber?: string;
  beneficiaryBankCode?: string;
  beneficiaryBankName?: string;
  status?: VaTransactionStatus;
  createdAt?: string;
}

export interface TransferBank {
  id: string;
  bankName: string;
  bankCode: string;
  cbnCode: string;
  createdAt?: string;
}

export interface CreateTransferBankRequest {
  bankName: string;
  bankCode: string;
  cbnCode: string;
}

export interface UpdateTransferBankRequest {
  bankName?: string;
  bankCode?: string;
  cbnCode?: string;
}

// ─── Referrals, Devices, Logs, Portfolios, Security ──────────────────────────
export interface ReferralRecord {
  id?: string;
  userId?: string;
  referredUserId?: string;
  referredName?: string;
  referredEmail?: string;
  dateReferred?: string;
  rewardStatus?: string;
}

export interface DeviceRecord {
  id: string;
  userId?: string;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  ipAddress?: string;
  lastLogin?: string;
  isRevoked?: boolean;
}

export interface LoginLog {
  id?: string;
  userId?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  status?: string;
  loginTime?: string;
}

export interface PortfolioRecord {
  id: string;
  userId?: string;
  name?: string;
  totalValue?: number;
  holdingsCount?: number;
  createdAt?: string;
}

export interface SecurityQuestion {
  id?: string;
  questionText?: string;
  isConfigured?: boolean;
}

// ─── Symplus ────────────────────────────────────────────────────────────────
export interface SymplusCustomer {
  customerId?: string;
  email?: string;
  alternateEmail?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  bvn?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  addressZip?: string;
  postalAddress?: string;
  employerName?: string;
  jobTitle?: string;
  employerAddressStreet?: string;
  employerAddressCity?: string;
  employerAddressState?: string;
  employerAddressCountry?: string;
  identityDocType?: string;
  identityDocName?: string;
  identityDocNumber?: string;
  identityDocIssueDate?: string;
  identityDocExpiryDate?: string;
  identityDocIssueAuthority?: string;
  remarks?: string;
}

export interface UpdateSymplusRetailCustomerRequest extends Partial<SymplusCustomer> {}

export interface SymplusNetworth {
  customerId?: string;
  cashBalance?: number;
  investmentsBalance?: number;
  totalNetworth?: number;
  currency?: string;
}

export interface SymplusPosition {
  customerId?: string;
  assets?: Array<{ assetType?: string; marketValue?: number; costBasis?: number }>;
}

// ─── RTK Query API Slice ────────────────────────────────────────────────────
export const retailApi = createApi({
  reducerPath: 'retailApi',
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
    'RetailUsers',
    'RetailUser',
    'RetailUserFull',
    'PendingKyc',
    'UserKyc',
    'KycDocuments',
    'KycDocument',
    'NextOfKin',
    'IdentityValidation',
    'RiskProfile',
    'CashAccounts',
    'MutualFunds',
    'MutualFundAccount',
    'MutualFundTransactions',
    'MutualFundInterest',
    'Wallet',
    'LedgerTransactions',
    'VirtualAccount',
    'VaInflows',
    'VaTransfers',
    'Transfers',
    'PendingTransfers',
    'TransferBanks',
    'Referrals',
    'Devices',
    'LoginLogs',
    'Portfolios',
    'SecurityQuestions',
    'SymplusUser',
    'SymplusNetworth',
    'SymplusPosition',
  ],
  endpoints: (builder) => ({
    // ── Customers ────────────────────────────────────────────────────────────
    getRetailUsers: builder.query<
      ApiResponse<PaginatedRetailUsersResponse>,
      { page?: number; pageSize?: number; status?: string; kycStatus?: string; search?: string }
    >({
      query: ({ page = 1, pageSize = 10, status, kycStatus, search } = {}) => {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (status && status !== 'All') params.append('status', status);
        if (kycStatus && kycStatus !== 'All') params.append('kycStatus', kycStatus);
        if (search) params.append('search', search);
        return `/retail/users?${params.toString()}`;
      },
      providesTags: ['RetailUsers'],
    }),

    getRetailUserById: builder.query<ApiResponse<RetailUser>, string>({
      query: (id) => `/retail/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'RetailUser', id }],
    }),

    getRetailUserFull: builder.query<ApiResponse<RetailUserFullRecord>, string>({
      query: (id) => `/retail/users/${id}/full`,
      providesTags: (_result, _error, id) => [{ type: 'RetailUserFull', id }],
    }),

    // Lookups
    getRetailUserByEmail: builder.query<ApiResponse<RetailUser>, string>({
      query: (email) => `/retail/users/email/${encodeURIComponent(email)}`,
    }),
    getRetailUserByPhone: builder.query<ApiResponse<RetailUser>, string>({
      query: (phoneNumber) => `/retail/users/phone/${encodeURIComponent(phoneNumber)}`,
    }),
    getRetailUserByBvn: builder.query<ApiResponse<RetailUser>, string>({
      query: (bvn) => `/retail/users/bvn/${encodeURIComponent(bvn)}`,
    }),
    getRetailUserByUsername: builder.query<ApiResponse<RetailUser>, string>({
      query: (username) => `/retail/users/username/${encodeURIComponent(username)}`,
    }),
    getRetailUserByReferralCode: builder.query<ApiResponse<RetailUser>, string>({
      query: (code) => `/retail/users/referral-code/${encodeURIComponent(code)}`,
    }),
    getRetailUserByCashAccount: builder.query<ApiResponse<RetailUser>, string>({
      query: (accountNumber) => `/retail/users/cash-account/${encodeURIComponent(accountNumber)}`,
    }),
    getRetailUserByCustomerId: builder.query<ApiResponse<RetailUser>, string>({
      query: (customerId) => `/retail/users/customer-id/${encodeURIComponent(customerId)}`,
    }),
    getRetailUserByVnuban: builder.query<ApiResponse<RetailUser>, string>({
      query: (vnuban) => `/retail/users/vnuban/${encodeURIComponent(vnuban)}`,
    }),

    // Actions
    updateRetailProfile: builder.mutation<ApiResponse<RetailUser>, { id: string; body: UpdateRetailProfileRequest }>({
      query: ({ id, body }) => ({
        url: `/retail/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'RetailUsers',
        { type: 'RetailUser', id },
        { type: 'RetailUserFull', id },
      ],
    }),

    blockUser: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/block`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        'RetailUsers',
        { type: 'RetailUser', id },
      ],
    }),

    suspendUser: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/suspend`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        'RetailUsers',
        { type: 'RetailUser', id },
      ],
    }),

    activateUser: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        'RetailUsers',
        { type: 'RetailUser', id },
      ],
    }),

    deleteUser: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/delete`,
        method: 'POST',
      }),
      invalidatesTags: ['RetailUsers'],
    }),

    resetPassword: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/reset-password`,
        method: 'POST',
      }),
    }),

    resetPin: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/reset-pin`,
        method: 'POST',
      }),
    }),

    unlockLogin: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/unlock-login`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RetailUser', id }],
    }),

    disableBiometrics: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/disable-biometrics`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RetailUser', id }],
    }),

    resetSecurityQuestions: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/reset-security-questions`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'SecurityQuestions', id }],
    }),

    getTransferBeneficiaries: builder.query<ApiResponse<unknown[]>, string>({
      query: (id) => `/retail/users/${id}/transfer-beneficiaries`,
    }),

    // ── KYC Endpoints ────────────────────────────────────────────────────────
    getPendingKyc: builder.query<ApiResponse<{ items?: KycProfile[]; data?: KycProfile[] }>, void>({
      query: () => '/retail/users/kyc/pending',
      providesTags: ['PendingKyc'],
    }),

    getRetailUserKyc: builder.query<ApiResponse<KycProfile>, string>({
      query: (id) => `/retail/users/${id}/kyc`,
      providesTags: (_result, _error, id) => [{ type: 'UserKyc', id }],
    }),

    updateRetailKyc: builder.mutation<ApiResponse<KycProfile>, { id: string; body: UpdateRetailKycRequest }>({
      query: ({ id, body }) => ({
        url: `/retail/users/${id}/kyc`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserKyc', id }, 'PendingKyc'],
    }),

    getKycDocuments: builder.query<ApiResponse<KycDocument[]>, string>({
      query: (id) => `/retail/users/${id}/kyc/documents`,
      providesTags: (_result, _error, id) => [{ type: 'KycDocuments', id }],
    }),

    getKycDocumentById: builder.query<ApiResponse<KycDocument>, { id: string; documentId: string }>({
      query: ({ id, documentId }) => `/retail/users/${id}/kyc/documents/${documentId}`,
      providesTags: (_result, _error, { documentId }) => [{ type: 'KycDocument', id: documentId }],
    }),

    getNextOfKin: builder.query<ApiResponse<NextOfKin[]>, string>({
      query: (id) => `/retail/users/${id}/kyc/next-of-kin`,
      providesTags: (_result, _error, id) => [{ type: 'NextOfKin', id }],
    }),

    approveKyc: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/kyc/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        'PendingKyc',
        'RetailUsers',
        { type: 'UserKyc', id },
        { type: 'RetailUser', id },
      ],
    }),

    rejectKyc: builder.mutation<ApiResponse<unknown>, { id: string; body: RejectKycRequest }>({
      query: ({ id, body }) => ({
        url: `/retail/users/${id}/kyc/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'PendingKyc',
        'RetailUsers',
        { type: 'UserKyc', id },
        { type: 'RetailUser', id },
      ],
    }),

    approveKycDocument: builder.mutation<ApiResponse<unknown>, { id: string; documentId: string }>({
      query: ({ id, documentId }) => ({
        url: `/retail/users/${id}/kyc/documents/${documentId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id, documentId }) => [
        { type: 'KycDocuments', id },
        { type: 'KycDocument', id: documentId },
      ],
    }),

    rejectKycDocument: builder.mutation<ApiResponse<unknown>, { id: string; documentId: string; body: RejectDocumentRequest }>({
      query: ({ id, documentId, body }) => ({
        url: `/retail/users/${id}/kyc/documents/${documentId}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id, documentId }) => [
        { type: 'KycDocuments', id },
        { type: 'KycDocument', id: documentId },
      ],
    }),

    getIdentityValidation: builder.query<ApiResponse<IdentityValidation>, string>({
      query: (id) => `/retail/users/${id}/identity-validation`,
      providesTags: (_result, _error, id) => [{ type: 'IdentityValidation', id }],
    }),

    getRiskProfile: builder.query<ApiResponse<RiskProfile>, string>({
      query: (id) => `/retail/users/${id}/risk-profile`,
      providesTags: (_result, _error, id) => [{ type: 'RiskProfile', id }],
    }),

    // ── Cash Accounts ────────────────────────────────────────────────────────
    getCashAccounts: builder.query<ApiResponse<CashAccount[]>, string>({
      query: (id) => `/retail/users/${id}/cash-accounts`,
      providesTags: (_result, _error, id) => [{ type: 'CashAccounts', id }],
    }),

    createCashAccount: builder.mutation<ApiResponse<CashAccount>, { id: string; body: CreateRetailCashAccountRequest }>({
      query: ({ id, body }) => ({
        url: `/retail/users/${id}/cash-accounts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CashAccounts', id }],
    }),

    // ── Mutual Funds ─────────────────────────────────────────────────────────
    getMutualFundHoldings: builder.query<ApiResponse<MutualFundHolding[]>, string>({
      query: (id) => `/retail/users/${id}/mutual-funds`,
      providesTags: (_result, _error, id) => [{ type: 'MutualFunds', id }],
    }),

    getMutualFundAccount: builder.query<ApiResponse<MutualFundHolding>, { id: string; fundAccountId: string }>({
      query: ({ id, fundAccountId }) => `/retail/users/${id}/mutual-funds/${fundAccountId}`,
      providesTags: (_result, _error, { fundAccountId }) => [{ type: 'MutualFundAccount', id: fundAccountId }],
    }),

    getMutualFundTransactions: builder.query<ApiResponse<MutualFundTransaction[]>, { id: string; fundAccountId: string; startDate?: string; endDate?: string }>({
      query: ({ id, fundAccountId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/retail/users/${id}/mutual-funds/${fundAccountId}/transactions?${params.toString()}`;
      },
      providesTags: (_result, _error, { fundAccountId }) => [{ type: 'MutualFundTransactions', id: fundAccountId }],
    }),

    getMutualFundStatement: builder.query<ApiResponse<{ statementBase64?: string }>, { id: string; fundAccountId: string; startDate?: string; endDate?: string }>({
      query: ({ id, fundAccountId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/retail/users/${id}/mutual-funds/${fundAccountId}/statement?${params.toString()}`;
      },
    }),

    getMutualFundPenalty: builder.query<ApiResponse<{ penaltyAmount?: number }>, { id: string; fundAccountId: string; amount?: number }>({
      query: ({ id, fundAccountId, amount }) => {
        const params = new URLSearchParams();
        if (amount) params.append('amount', String(amount));
        return `/retail/users/${id}/mutual-funds/${fundAccountId}/penalty?${params.toString()}`;
      },
    }),

    getMutualFundAccruedInterest: builder.query<ApiResponse<{ accruedInterest?: number }>, { id: string; fundAccountId: string }>({
      query: ({ id, fundAccountId }) => `/retail/users/${id}/mutual-funds/${fundAccountId}/accrued-interest`,
      providesTags: (_result, _error, { fundAccountId }) => [{ type: 'MutualFundInterest', id: fundAccountId }],
    }),

    // ── Wallet & Transactions ────────────────────────────────────────────────
    getWallet: builder.query<ApiResponse<Wallet>, string>({
      query: (id) => `/retail/users/${id}/wallet`,
      providesTags: (_result, _error, id) => [{ type: 'Wallet', id }],
    }),

    suspendWallet: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/wallet/suspend`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Wallet', id }],
    }),

    activateWallet: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/users/${id}/wallet/activate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Wallet', id }],
    }),

    getLedgerTransactions: builder.query<
      ApiResponse<{ items?: LedgerTransaction[]; data?: LedgerTransaction[]; totalCount?: number }>,
      { id: string; category?: string; type?: string; status?: string; from?: string; to?: string; page?: number; pageSize?: number }
    >({
      query: ({ id, category, type, status, from, to, page = 1, pageSize = 10 }) => {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (category && category !== 'All') params.append('category', category);
        if (type && type !== 'All') params.append('type', type);
        if (status && status !== 'All') params.append('status', status);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        return `/retail/users/${id}/transactions?${params.toString()}`;
      },
      providesTags: (_result, _error, { id }) => [{ type: 'LedgerTransactions', id }],
    }),

    getLedgerTransactionById: builder.query<ApiResponse<LedgerTransaction>, { id: string; transactionId: string }>({
      query: ({ id, transactionId }) => `/retail/users/${id}/transactions/${transactionId}`,
    }),

    // ── Virtual Accounts ────────────────────────────────────────────────────
    getVirtualAccount: builder.query<ApiResponse<VirtualAccount>, string>({
      query: (id) => `/retail/users/${id}/virtual-account`,
      providesTags: (_result, _error, id) => [{ type: 'VirtualAccount', id }],
    }),

    getVaInflows: builder.query<ApiResponse<VirtualAccountInflow[]>, string>({
      query: (id) => `/retail/users/${id}/virtual-account/inflows`,
      providesTags: (_result, _error, id) => [{ type: 'VaInflows', id }],
    }),

    getVaTransfers: builder.query<ApiResponse<{ items?: VirtualAccountTransfer[]; totalCount?: number }>, { id: string; page?: number; pageSize?: number; status?: string }>({
      query: ({ id, page = 1, pageSize = 10, status }) => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (status && status !== 'All') params.append('status', status);
        return `/retail/users/${id}/virtual-account/transfers?${params.toString()}`;
      },
      providesTags: (_result, _error, { id }) => [{ type: 'VaTransfers', id }],
    }),

    // ── Transfers & Transfer Banks ──────────────────────────────────────────
    getTransfers: builder.query<
      ApiResponse<{ items?: Transfer[]; data?: Transfer[]; totalCount?: number }>,
      { page?: number; pageSize?: number; status?: string; search?: string; from?: string; to?: string }
    >({
      query: ({ page = 1, pageSize = 10, status, search, from, to } = {}) => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (status && status !== 'All') params.append('status', status);
        if (search) params.append('search', search);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        return `/retail/transfers?${params.toString()}`;
      },
      providesTags: ['Transfers'],
    }),

    getPendingTransfers: builder.query<ApiResponse<{ items?: Transfer[]; totalCount?: number }>, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 } = {}) => `/retail/transfers/pending?page=${page}&pageSize=${pageSize}`,
      providesTags: ['PendingTransfers'],
    }),

    getTransferBanks: builder.query<ApiResponse<{ items?: TransferBank[]; data?: TransferBank[] }>, { search?: string } | void>({
      query: (params) => {
        if (params?.search) {
          return `/retail/transfers/banks?search=${encodeURIComponent(params.search)}`;
        }
        return '/retail/transfers/banks';
      },
      providesTags: ['TransferBanks'],
    }),

    createTransferBank: builder.mutation<ApiResponse<TransferBank>, CreateTransferBankRequest>({
      query: (body) => ({
        url: '/retail/transfers/banks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransferBanks'],
    }),

    updateTransferBank: builder.mutation<ApiResponse<TransferBank>, { id: string; body: UpdateTransferBankRequest }>({
      query: ({ id, body }) => ({
        url: `/retail/transfers/banks/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['TransferBanks'],
    }),

    deleteTransferBank: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/retail/transfers/banks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransferBanks'],
    }),

    getTransferByRef: builder.query<ApiResponse<Transfer>, string>({
      query: (transactionRef) => `/retail/transfers/ref/${encodeURIComponent(transactionRef)}`,
    }),

    getTransfersByUserId: builder.query<ApiResponse<{ items?: Transfer[]; totalCount?: number }>, { userId: string; page?: number; pageSize?: number; status?: string }>({
      query: ({ userId, page = 1, pageSize = 10, status }) => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (status && status !== 'All') params.append('status', status);
        return `/retail/transfers/user/${userId}?${params.toString()}`;
      },
    }),

    getTransferById: builder.query<ApiResponse<Transfer>, string>({
      query: (id) => `/retail/transfers/${id}`,
    }),

    queryTransferStatus: builder.mutation<ApiResponse<Transfer>, string>({
      query: (id) => ({
        url: `/retail/transfers/${id}/query`,
        method: 'POST',
      }),
      invalidatesTags: ['Transfers', 'PendingTransfers'],
    }),

    // ── Referrals, Devices, Logs, Portfolios, Security ────────────────────────
    getReferrals: builder.query<ApiResponse<ReferralRecord[]>, string>({
      query: (id) => `/retail/users/${id}/referrals`,
      providesTags: (_result, _error, id) => [{ type: 'Referrals', id }],
    }),

    getReferredBy: builder.query<ApiResponse<ReferralRecord>, string>({
      query: (id) => `/retail/users/${id}/referred-by`,
    }),

    getDevices: builder.query<ApiResponse<DeviceRecord[]>, string>({
      query: (id) => `/retail/users/${id}/devices`,
      providesTags: (_result, _error, id) => [{ type: 'Devices', id }],
    }),

    revokeDevice: builder.mutation<ApiResponse<unknown>, { id: string; deviceId: string }>({
      query: ({ id, deviceId }) => ({
        url: `/retail/users/${id}/devices/${deviceId}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Devices', id }],
    }),

    getLoginLogs: builder.query<ApiResponse<LoginLog[]>, string>({
      query: (id) => `/retail/users/${id}/login-logs`,
      providesTags: (_result, _error, id) => [{ type: 'LoginLogs', id }],
    }),

    getPortfolios: builder.query<ApiResponse<PortfolioRecord[]>, string>({
      query: (id) => `/retail/users/${id}/portfolios`,
      providesTags: (_result, _error, id) => [{ type: 'Portfolios', id }],
    }),

    getPortfolioById: builder.query<ApiResponse<PortfolioRecord>, { id: string; portfolioId: string }>({
      query: ({ id, portfolioId }) => `/retail/users/${id}/portfolios/${portfolioId}`,
    }),

    getSecurityQuestions: builder.query<ApiResponse<SecurityQuestion[]>, string>({
      query: (id) => `/retail/users/${id}/security-questions`,
      providesTags: (_result, _error, id) => [{ type: 'SecurityQuestions', id }],
    }),

    // ── Symplus ──────────────────────────────────────────────────────────────
    pullSymplusByCustomerId: builder.query<ApiResponse<SymplusCustomer>, string>({
      query: (customerId) => `/retail/users/pull-by-customer-id/${encodeURIComponent(customerId)}`,
    }),

    pullSymplusUser: builder.query<ApiResponse<SymplusCustomer>, string>({
      query: (id) => `/retail/users/${id}/symplus`,
      providesTags: (_result, _error, id) => [{ type: 'SymplusUser', id }],
    }),

    updateSymplusCustomer: builder.mutation<ApiResponse<unknown>, { id: string; body: UpdateSymplusRetailCustomerRequest }>({
      query: ({ id, body }) => ({
        url: `/retail/users/${id}/symplus`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SymplusUser', id },
        { type: 'RetailUser', id },
        { type: 'UserKyc', id },
      ],
    }),

    getSymplusNetworth: builder.query<ApiResponse<SymplusNetworth>, string>({
      query: (id) => `/retail/users/${id}/networth`,
      providesTags: (_result, _error, id) => [{ type: 'SymplusNetworth', id }],
    }),

    getSymplusPosition: builder.query<ApiResponse<SymplusPosition>, string>({
      query: (id) => `/retail/users/${id}/position`,
      providesTags: (_result, _error, id) => [{ type: 'SymplusPosition', id }],
    }),
  }),
});

export const {
  // Customers
  useGetRetailUsersQuery,
  useGetRetailUserByIdQuery,
  useGetRetailUserFullQuery,
  useLazyGetRetailUserByEmailQuery,
  useLazyGetRetailUserByPhoneQuery,
  useLazyGetRetailUserByBvnQuery,
  useLazyGetRetailUserByUsernameQuery,
  useLazyGetRetailUserByReferralCodeQuery,
  useLazyGetRetailUserByCashAccountQuery,
  useLazyGetRetailUserByCustomerIdQuery,
  useLazyGetRetailUserByVnubanQuery,
  useUpdateRetailProfileMutation,
  useBlockUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useResetPinMutation,
  useUnlockLoginMutation,
  useDisableBiometricsMutation,
  useResetSecurityQuestionsMutation,
  useGetTransferBeneficiariesQuery,
  // KYC
  useGetPendingKycQuery,
  useGetRetailUserKycQuery,
  useUpdateRetailKycMutation,
  useGetKycDocumentsQuery,
  useGetKycDocumentByIdQuery,
  useLazyGetKycDocumentByIdQuery,
  useGetNextOfKinQuery,
  useApproveKycMutation,
  useRejectKycMutation,
  useApproveKycDocumentMutation,
  useRejectKycDocumentMutation,
  useGetIdentityValidationQuery,
  useGetRiskProfileQuery,
  // Cash Accounts
  useGetCashAccountsQuery,
  useCreateCashAccountMutation,
  // Mutual Funds
  useGetMutualFundHoldingsQuery,
  useLazyGetMutualFundHoldingsQuery,
  useGetMutualFundAccountQuery,
  useLazyGetMutualFundAccountQuery,
  useGetMutualFundTransactionsQuery,
  useLazyGetMutualFundTransactionsQuery,
  useGetMutualFundStatementQuery,
  useLazyGetMutualFundStatementQuery,
  useGetMutualFundPenaltyQuery,
  useLazyGetMutualFundPenaltyQuery,
  useGetMutualFundAccruedInterestQuery,
  useLazyGetMutualFundAccruedInterestQuery,
  // Wallet & Transactions
  useGetWalletQuery,
  useSuspendWalletMutation,
  useActivateWalletMutation,
  useGetLedgerTransactionsQuery,
  useGetLedgerTransactionByIdQuery,
  // Virtual Accounts
  useGetVirtualAccountQuery,
  useGetVaInflowsQuery,
  useGetVaTransfersQuery,
  // Transfers & Banks
  useGetTransfersQuery,
  useGetPendingTransfersQuery,
  useGetTransferBanksQuery,
  useCreateTransferBankMutation,
  useUpdateTransferBankMutation,
  useDeleteTransferBankMutation,
  useGetTransferByRefQuery,
  useGetTransfersByUserIdQuery,
  useGetTransferByIdQuery,
  useQueryTransferStatusMutation,
  // Referrals, Devices, Logs, Portfolios, Security
  useGetReferralsQuery,
  useGetReferredByQuery,
  useGetDevicesQuery,
  useRevokeDeviceMutation,
  useGetLoginLogsQuery,
  useGetPortfoliosQuery,
  useGetPortfolioByIdQuery,
  useGetSecurityQuestionsQuery,
  // Symplus
  useLazyPullSymplusByCustomerIdQuery,
  usePullSymplusUserQuery,
  useUpdateSymplusCustomerMutation,
  useGetSymplusNetworthQuery,
  useGetSymplusPositionQuery,
} = retailApi;
