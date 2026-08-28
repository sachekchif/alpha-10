import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://alpha10-api-qa.up.railway.app/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://alpha10-api-qa.up.railway.app/api';
};

export interface CorporateUser {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhoneNumber?: string;
  companyAddress?: string;
  companyRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  bvn?: string;
  registrationDate?: string;
  industryCd?: string;
  businessNature?: string;
  alternatePhoneNumber?: string;
  alternateEmailAddress?: string;
  addressCity?: string;
  addressStateCd?: string;
  addressCountryCd?: string;
  addressZipCode?: string;
  bankCd?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  bankBranchName?: string;
  bankAddressDetails?: string;
  contactPersonTitleCd?: string;
  contactPersonLastName?: string;
  contactPersonFirstName?: string;
  contactPersonOtherNames?: string;
  contactPersonPhoneNo?: string;
  contactPersonEmailAddress?: string;
  identityDocTypeCd?: string;
  identityDocName?: string;
  identityDocNo?: string;
  identityDocIssueDate?: string;
  identityDocExpiryDate?: string;
  identityDocIssueAuthority?: string;
  locationCd?: string;
  officerId?: string;
  introducerId?: string;
  planId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  accountsCount?: number;
  totalBalance?: number;
}

export interface CorporateOnboardingPayload {
  companyName: string;
  companyEmail: string;
  companyPhoneNumber: string;
  companyAddress: string;
  companyRegistrationNumber: string;
  taxIdentificationNumber: string;
  bvn: string;
  registrationDate: string;
  industryCd: string;
  businessNature: string;
  alternatePhoneNumber?: string;
  alternateEmailAddress?: string;
  addressCity?: string;
  addressStateCd?: string;
  addressCountryCd?: string;
  addressZipCode?: string;
  bankCd?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  bankBranchName?: string;
  bankAddressDetails?: string;
  contactPersonTitleCd?: string;
  contactPersonLastName?: string;
  contactPersonFirstName?: string;
  contactPersonOtherNames?: string;
  contactPersonPhoneNo?: string;
  contactPersonEmailAddress?: string;
  identityDocTypeCd?: string;
  identityDocName?: string;
  identityDocNo?: string;
  identityDocIssueDate?: string;
  identityDocExpiryDate?: string;
  identityDocIssueAuthority?: string;
  locationCd?: string;
  officerId?: string;
  introducerId?: string;
  planId?: string;
}

export interface CorporateCashAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: number;
  status: string;
  bankCode?: string;
  branchName?: string;
  createdAt?: string;
}

export interface CorporateMutualFund {
  fundAccountId: string;
  fundDescription: string;
  currency: string;
  currentValue: number;
  units: number;
  costPrice?: number;
  gainLossAmount?: number;
  status?: string;
}

export const corporateApi = createApi({
  reducerPath: 'corporateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['CorporateUsers', 'CorporateUser', 'CorporateAccounts', 'CorporateMutualFunds'],
  endpoints: (builder) => ({
    // 1. GET /api/corporate/users - Retrieves all corporate customers
    getCorporateUsers: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateUser[] }, void>({
      query: () => '/corporate/users',
      providesTags: ['CorporateUsers'],
    }),

    // 2. GET /api/corporate/users/{id} - Retrieves corporate customer by ID
    getCorporateUserById: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateUser }, string>({
      query: (id) => `/corporate/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'CorporateUser', id }],
    }),

    // 3. GET /api/corporate/users/cash-account/{cashAccountNumber}
    getCorporateUserByCashAccount: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateUser }, string>({
      query: (cashAccountNumber) => `/corporate/users/cash-account/${cashAccountNumber}`,
    }),

    // 4. GET /api/corporate/users/bvn/{bvn}
    getCorporateUserByBvn: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateUser }, string>({
      query: (bvn) => `/corporate/users/bvn/${bvn}`,
    }),

    // 5. GET /api/corporate/users/email/{email}
    getCorporateUserByEmail: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateUser }, string>({
      query: (email) => `/corporate/users/email/${email}`,
    }),

    // 6. GET /api/corporate/users/phone/{phoneNumber}
    getCorporateUserByPhone: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateUser }, string>({
      query: (phoneNumber) => `/corporate/users/phone/${phoneNumber}`,
    }),

    // 7. GET /api/corporate/users/pull-corporate-customer-by-id/{customerId}
    pullCorporateCustomerById: builder.query<{ statusCode?: number; statusMessage?: string; data: any }, string>({
      query: (customerId) => `/corporate/users/pull-corporate-customer-by-id/${customerId}`,
    }),

    // 8. GET /api/corporate/users/{id}/accounts
    getCorporateUserAccounts: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateCashAccount[] }, string>({
      query: (id) => `/corporate/users/${id}/accounts`,
      providesTags: (result, error, id) => [{ type: 'CorporateAccounts', id }],
    }),

    // 9. GET /api/corporate/users/{id}/mutual-funds
    getCorporateUserMutualFunds: builder.query<{ statusCode?: number; statusMessage?: string; data: CorporateMutualFund[] }, string>({
      query: (id) => `/corporate/users/${id}/mutual-funds`,
      providesTags: (result, error, id) => [{ type: 'CorporateMutualFunds', id }],
    }),

    // 10. POST /api/corporate/users/onboard
    onboardCorporateUser: builder.mutation<{ statusCode?: number; statusMessage?: string; data: CorporateUser }, CorporateOnboardingPayload>({
      query: (payload) => ({
        url: '/corporate/users/onboard',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['CorporateUsers'],
    }),

    // 11. POST /api/corporate/users/onboard/{id}/approve
    approveCorporateOnboarding: builder.mutation<{ statusCode?: number; statusMessage?: string; data: any }, string>({
      query: (id) => ({
        url: `/corporate/users/onboard/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => ['CorporateUsers', { type: 'CorporateUser', id }],
    }),

    // 12. POST /api/corporate/users/{id}/block
    blockCorporateUser: builder.mutation<{ statusCode?: number; statusMessage?: string; data: any }, string>({
      query: (id) => ({
        url: `/corporate/users/${id}/block`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => ['CorporateUsers', { type: 'CorporateUser', id }],
    }),

    // 13. POST /api/corporate/users/{id}/reset-password
    resetCorporateUserPassword: builder.mutation<{ statusCode?: number; statusMessage?: string; data: any }, string>({
      query: (id) => ({
        url: `/corporate/users/${id}/reset-password`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetCorporateUsersQuery,
  useGetCorporateUserByIdQuery,
  useLazyGetCorporateUserByIdQuery,
  useLazyGetCorporateUserByCashAccountQuery,
  useLazyGetCorporateUserByBvnQuery,
  useLazyGetCorporateUserByEmailQuery,
  useLazyGetCorporateUserByPhoneQuery,
  useLazyPullCorporateCustomerByIdQuery,
  useGetCorporateUserAccountsQuery,
  useLazyGetCorporateUserAccountsQuery,
  useGetCorporateUserMutualFundsQuery,
  useLazyGetCorporateUserMutualFundsQuery,
  useOnboardCorporateUserMutation,
  useApproveCorporateOnboardingMutation,
  useBlockCorporateUserMutation,
  useResetCorporateUserPasswordMutation,
} = corporateApi;
