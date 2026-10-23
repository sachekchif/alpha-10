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
