# 🚨 Alpha-10 Backend Issues & Requirements Summary

**Target:** Backend Engineering Team  
**System:** Alpha-10 Admin Portal  
**Environment:** `https://mobile-test.alpha10group.com/alphaten-admin`  
**Date:** October 23, 2026  
**Reported by:** Frontend Team  

---

## 📌 Summary of Issues

| # | Priority | Module | Endpoint | Issue | Action Needed |
|---|---|---|---|---|---|
| **1** | 🔴 P0 (Blocker) | Investment Education | `GET /api/admin/investment-education` | **401 Unauthorized** for `SuperAdmin` | Grant `SuperAdmin` & `Control` access |
| **2** | 🔴 P0 (Blocker) | Mutual Funds | `GET /api/admin/mutual-fund-contents` | **401 Unauthorized** for `SuperAdmin` | Grant `SuperAdmin` & `Control` access across CRUD, allocations & holdings |
| **3** | 🔴 P0 (Bug) | Learn Quiz Questions | `PUT /api/admin/learn/quiz/questions/{id}` | **500 Error** from circular JSON recursion (`Question` ↔ `Options`) | Return flat DTO / enable `IgnoreCycles` / add `[JsonIgnore]` |
| **4** | 🟠 P1 (Feature) | Media / File Uploads | `POST /api/admin/uploads` | **No upload endpoint** for images/PDFs | Provide `multipart/form-data` upload API returning asset URL |
| **5** | 🟡 P2 (Bug) | Retail Customers KYC | `GET /api/retail/users/{id}/kyc` | **404 Not Found** for unverified customer KYC | Return 200 with `data: null` instead of 404 |
| **6** | 🔴 P0 (Outage) | Retail Positions | `GET /api/retail/users/{id}/position` | **500 Error** (`401 Unauthorized` upstream from Symplus) | Renew Symplus upstream gateway token / service credentials |
| **7** | 🔴 P0 (Outage) | Retail Symplus Core | `GET /api/retail/users/{id}/symplus` | **500 Error** (`401 Unauthorized` upstream from Symplus) | Renew Symplus upstream gateway token / service credentials |
| **8** | 🔴 P0 (Outage) | Retail Net Worth | `GET /api/retail/users/{id}/networth` | **500 Error** (`401 Unauthorized` upstream from Symplus) | Renew Symplus upstream gateway token / service credentials |

---

## 1. 401 Permission Denied — Investment Education

- **Endpoint:** `GET /api/admin/investment-education?pageNumber=1&pageSize=20` (and related `POST`, `PUT`, `DELETE` endpoints)
- **Current Behavior:** Logged-in `SuperAdmin` receives:
  ```json
  {
    "statusCode": 401,
    "statusMessage": "You do not have permission to perform this action."
  }
  ```
- **Impact:** Retail Education Hub (`/dashboard/retail/education`) and Learn overview (`/dashboard/learn`) cannot load courses or count active modules.
- **Action Required:**
  - Add `SuperAdmin` and `Control` to authorized roles on `/api/admin/investment-education`.
  - Ensure all staging `/api/admin/*` routes permit `SuperAdmin` by default.

---

## 2. 401 Permission Denied — Mutual Fund Contents

- **Endpoint:** `GET /api/admin/mutual-fund-contents?pageNumber=1&pageSize=20`
- **Current Behavior:** Logged-in `SuperAdmin` receives:
  ```json
  {
    "statusCode": 401,
    "statusMessage": "You do not have permission to perform this action."
  }
  ```
- **Impact:** Retail Mutual Funds (`/dashboard/retail/mutual-funds`) and Customer Investment Detail (`/dashboard/retail/investments/[id]`) cannot list or configure mutual funds.
- **Action Required:**
  - Grant `SuperAdmin` and `Control` access across all mutual fund endpoints:
    - `GET /api/admin/mutual-fund-contents` (listing)
    - `GET / POST / PUT / DELETE /api/admin/mutual-fund-contents/{id}`
    - `POST /api/admin/mutual-fund-contents/{id}/allocations` (asset allocation)
    - `POST /api/admin/mutual-fund-contents/{id}/holdings` (top holdings)

---

## 3. Circular JSON Recursion (500 Error) — Quiz Question Update

- **Endpoint:** `PUT /api/admin/learn/quiz/questions/{id}`
- **Current Behavior:**
  - The database update succeeds, but JSON serialization loops infinitely between `Question` and `QuizOption` (`Question -> Options -> Question -> Options...`).
  - Serializer crashes mid-stream, changing the HTTP status to `500 Internal Server Error` and terminating with:
    ```json
    { "code": 500, "message": "An unexpected error occurred" }
    ```
  - Frontend interceptors show a failure toast to admins even though the record was saved.
- **Action Required (any of the following):**
  1. **Recommended:** Project to a flat response DTO without parent navigation properties (`QuestionResponseDto` containing `List<QuestionOptionDto>`).
  2. **Serializer Config:** Add `ReferenceHandler.IgnoreCycles` in `.AddJsonOptions(...)` (or `ReferenceLoopHandling.Ignore` if using Newtonsoft).
  3. **Entity Annotation:** Place `[JsonIgnore]` on the `Question` navigation property inside `QuizOption`.

---

## 4. Feature Request — Direct File / Media Upload API

- **Module:** Learn Articles, Mutual Funds, Financial Products
- **Current Behavior:** Frontend has file upload drag-and-drop boxes, but no backend multipart endpoint exists to receive and store them. Frontend temporarily uses temporary browser blob URLs (`URL.createObjectURL`), which do not persist.
- **Proposed Endpoint:** `POST /api/admin/uploads` (or `/api/admin/media/upload`)
  - **Content-Type:** `multipart/form-data`
  - **Form Fields:**
    - `file` (Binary, required) — Image (`jpg`, `png`, `webp`, `svg`, max 5MB) or document (`pdf`, max 20MB)
    - `category` (string, optional) — e.g. `articles`, `mutual-funds`, `products`
  - **Expected Response (`200 OK` or `201 Created`):**
    ```json
    {
      "statusCode": 200,
      "statusMessage": "File uploaded successfully.",
      "data": {
        "url": "https://<storage-cdn-domain>/uploads/articles/image-name.webp",
        "fileName": "image-name.webp",
        "fileSize": 128400,
        "mimeType": "image/webp"
      }
    }
    ```

---

## 5. 404 Not Found When Querying Unverified Customer KYC

- **Endpoint:** `GET /api/retail/users/{id}/kyc`
- **Example Request:** `GET https://mobile-test.alpha10group.com/alphaten-admin/api/retail/users/67bc3c5a-2e8a-4f64-a4ea-435ff62cf292/kyc`
- **Current Behavior:** Returns HTTP 404 Not Found:
  ```json
  {
    "statusCode": 404,
    "statusMessage": "KYC profile not found for this customer."
  }
  ```
- **Impact:** Frontend customer details and KYC tabs trigger uncaught error toasts for newly onboarded customers who have not yet submitted KYC documents.
- **Action Required:**
  - For unverified customers or customers without a KYC record, return `200 OK` with `data: null` or `{ "tier": 0, "status": "NotSubmitted" }` rather than throwing an uncaught HTTP 404 exception.

---

## 6. 500 Error: Upstream Symplus 401 Unauthorized on Position Lookup

- **Endpoint:** `GET /api/retail/users/{id}/position`
- **Example Request:** `GET https://mobile-test.alpha10group.com/alphaten-admin/api/retail/users/67bc3c5a-2e8a-4f64-a4ea-435ff62cf292/position`
- **Current Behavior:** Returns HTTP 500 Internal Server Error:
  ```json
  {
    "statusCode": 500,
    "statusMessage": "Failed to fetch position: Response status code does not indicate success: 401 (Unauthorized)."
  }
  ```
- **Impact:** Customer details page cannot load investment holding positions from Symplus Core Banking.
- **Root Cause & Action Required:**
  - The Alpha-10 backend's integration gateway with Symplus core banking failed authentication (`401 Unauthorized`).
  - Refresh/rotate the Symplus Core API key or OAuth service credentials in backend configuration.
  - Wrap upstream calls in resilient exception handling so upstream auth issues return structured `502 Bad Gateway` / `503 Service Unavailable` with fallback cached data.

---

## 7. 500 Error: Upstream Symplus 401 Unauthorized on Customer Pull

- **Endpoint:** `GET /api/retail/users/{id}/symplus`
- **Example Request:** `GET https://mobile-test.alpha10group.com/alphaten-admin/api/retail/users/67bc3c5a-2e8a-4f64-a4ea-435ff62cf292/symplus`
- **Current Behavior:** Returns HTTP 500 Internal Server Error:
  ```json
  {
    "statusCode": 500,
    "statusMessage": "Failed to pull customer from Symplus: Response status code does not indicate success: 401 (Unauthorized)."
  }
  ```
- **Impact:** Cannot pull or synchronize retail customer profile details directly from Symplus Core Banking.
- **Root Cause & Action Required:**
  - Symplus Core integration gateway credentials expired. Rotate/renew upstream authentication credentials.

---

## 8. 500 Error: Upstream Symplus 401 Unauthorized on Net Worth Calculation

- **Endpoint:** `GET /api/retail/users/{id}/networth`
- **Example Request:** `GET https://mobile-test.alpha10group.com/alphaten-admin/api/retail/users/67bc3c5a-2e8a-4f64-a4ea-435ff62cf292/networth`
- **Current Behavior:** Returns HTTP 500 Internal Server Error:
  ```json
  {
    "statusCode": 500,
    "statusMessage": "Failed to fetch net worth: Response status code does not indicate success: 401 (Unauthorized)."
  }
  ```
- **Impact:** Total net worth, total assets, and total liabilities calculations cannot be retrieved from Symplus.
- **Root Cause & Action Required:**
  - Re-authenticate Symplus Core service integration credentials. Ensure token auto-renewal cron is active.

