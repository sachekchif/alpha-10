# 🚨 Alpha-10 Backend Issue Report: 401 Permission Denied on Investment Education API

**System:** Alpha-10 Admin Portal / Retail Investor Education  
**Date:** October 23, 2026  
**Severity:** 🔴 **Critical / Blocker (P0)**  
**Target:** Backend Engineering Team  
**Reported by:** Front-end Engineering Team  
**Environment:** `https://mobile-test.alpha10group.com/alphaten-admin`  

---

## 📌 Issue Summary

While logged in with a valid authenticated **`SuperAdmin`** account, requests to the Investment Education listing API endpoint fail with a `401 Unauthorized / Forbidden` error stating that the user does not have permission.

Even though certain granular permission restrictions or segregation of duties may exist in final production compliance guidelines, **for testing and staging, `SuperAdmin` accounts must have full access across all administrative modules**, including Retail Investment Education.

---

## 🔍 Request & Response Details

### Request
```http
GET https://mobile-test.alpha10group.com/alphaten-admin/api/admin/investment-education?pageNumber=1&pageSize=20 HTTP/1.1
Host: mobile-test.alpha10group.com
Authorization: Bearer <VALID_SUPERADMIN_JWT_TOKEN>
Accept: application/json
Content-Type: application/json
```

### Response
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```
```json
{
    "statusCode": 401,
    "statusMessage": "You do not have permission to perform this action."
}
```

---

## 💥 Impact & Consequences

1. **Retail Education Management Blocked (`/dashboard/retail/education`)**:
   - SuperAdmin users are unable to load the Investment Education curriculum table, preventing testing of listing, filtering, creation, updates, and deletion.
2. **Customer Education Overview Hub Affected (`/dashboard/learn`)**:
   - The centralized Customers Education overview cannot aggregate the live module count for Investment Education.
3. **End-to-End Testing Halted**:
   - Admins cannot configure education topics, risk appetite boundaries, or financial rules for the retail mobile application.

---

## 🛠️ Root Cause Analysis & Technical Diagnosis

1. **Missing Role / Claim Mapping in Controller**:
   - The endpoint controller for `/api/admin/investment-education` likely has an `[Authorize]` attribute specifying roles or permissions that omit `SuperAdmin` (e.g. only checking for a non-existent role, or requiring a specific claim that is not issued to `SuperAdmin` in the JWT).
2. **Permission Policy Misconfiguration**:
   - If policy-based authorization (e.g. `[Authorize(Policy = "ManageEducation")]`) is in place, the policy definition in `Program.cs` / `Startup.cs` does not currently include the `SuperAdmin` role.

---

## ✅ Required Action / Proposed Solution

1. **Grant Full Access to `SuperAdmin` Role (Immediate Requirement)**:
   - Update the authorization policy / controller attributes for `/api/admin/investment-education` (covering `GET`, `POST`, `PUT`, `DELETE`, and any future `PATCH` endpoints) to explicitly allow:
     ```csharp
     [Authorize(Roles = "SuperAdmin,Control")]
     ```
     *(or ensure `SuperAdmin` is mapped in the authorization handler)*.

2. **Full SuperAdmin Access During Testing Phase**:
   - For all admin APIs under `/api/admin/*`, please verify that `SuperAdmin` has unrestricted access across all modules during current testing and staging milestones.

3. **Verify JWT Token Claims**:
   - Confirm that the login endpoint (`/api/admin/auth/login` or `/api/auth/login`) issues the exact role claim string expected by the authorization middleware (e.g. `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` or `"role": "SuperAdmin"`).

---

## 📋 Affected Endpoints Checklist

| Method | Endpoint | Expected SuperAdmin Access | Current Status |
| :--- | :--- | :---: | :---: |
| `GET` | `/api/admin/investment-education` | ✅ Allowed | ❌ **401 Unauthorized** |
| `GET` | `/api/admin/investment-education/{id}` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `POST` | `/api/admin/investment-education` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `PUT` | `/api/admin/investment-education/{id}` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `DELETE` | `/api/admin/investment-education/{id}` | ✅ Allowed | ⚠️ Unverified (likely 401) |

---

# 🚀 Alpha-10 Feature Requirement: Centralized Media & Document Upload API

**System:** Alpha-10 Admin Portal / Global Media & Asset Management  
**Date:** October 23, 2026  
**Severity:** 🟠 **High / Blocker for Production Asset Management**  
**Target:** Backend Engineering Team  
**Reported by:** Front-end Engineering Team  
**Environment:** `https://mobile-test.alpha10group.com/alphaten-admin`  

---

## 📌 Requirement Summary

The Admin Portal has removed manual URL text inputs and media-type selectors in favor of modern, direct file upload drag-and-drop boxes (specifically in **Learn Articles** `/dashboard/learn/articles`).

However, **there is currently no backend multipart file upload endpoint** available to receive, validate, store, and serve image/document assets. As a result, the frontend temporarily relies on local browser blob URLs (`URL.createObjectURL`), which do not persist across user sessions, backend databases, or the retail mobile applications.

A dedicated, centralized **File / Image Upload API** is required immediately for Learn Articles and generally across the entire Alpha-10 administrative platform.

---

## 🎯 Use Cases & Modules Requiring File Upload

1. **Learn Articles (`/dashboard/learn/articles`)**:
   - Direct image upload box for article cover graphics and thumbnails.
   - Eliminates cumbersome manual media URL typing and dropdown selection for administrators.
2. **Retail Mutual Funds (`/dashboard/retail/mutual-funds`)**:
   - Cover thumbnails, fund manager avatars, and official PDF documents (Prospectus, Factsheets, KIID).
3. **Retail Education Hub (`/dashboard/retail/education`)**:
   - Course hero banners, module visual assets, and video thumbnail posters.
4. **Operations / Financial Products (`/dashboard/operations/products`)**:
   - Product collateral, regulatory disclosure PDFs, and institutional logos.
5. **Corporate KYC & User Verification**:
   - Administrative file attachment uploads for customer KYC compliance reviews.

---

## 🛠️ Proposed Endpoint Specification

### `POST /api/admin/uploads` (or `/api/admin/media/upload`)

#### Request Headers
```http
POST https://mobile-test.alpha10group.com/alphaten-admin/api/admin/uploads HTTP/1.1
Host: mobile-test.alpha10group.com
Authorization: Bearer <VALID_SUPERADMIN_OR_CONTROL_JWT_TOKEN>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXyZ123
```

#### Form-Data Parameters
| Field Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `file` | `Binary / File` | **Yes** | The actual file payload (image or document). |
| `category` | `string` | No | Target folder/namespace: e.g. `articles`, `mutual-funds`, `products`, `documents`. Defaults to `general`. |
| `altText` | `string` | No | Optional accessible label or description for the file. |

#### Allowed File Types & Size Limits
- **Images:** `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `image/gif` (Max: **5 MB**)
- **Documents:** `application/pdf` (Max: **20 MB**)

#### Success Response (`200 OK` or `201 Created`)
```json
{
  "statusCode": 200,
  "statusMessage": "File uploaded successfully.",
  "data": {
    "url": "https://cdn.alpha10group.com/uploads/articles/2026/10/cover_inflation_guide.webp",
    "fileName": "cover_inflation_guide.webp",
    "originalFileName": "hero-image-banner.png",
    "fileSize": 284160,
    "mimeType": "image/webp",
    "category": "articles",
    "createdAt": "2026-10-23T14:40:00Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`**: File exceeds maximum allowed size or unsupported MIME type.
  ```json
  {
    "statusCode": 400,
    "statusMessage": "File type 'application/x-msdownload' is not allowed. Supported types: jpg, png, webp, svg, pdf."
  }
  ```
- **`401 Unauthorized` / `403 Forbidden`**: Missing or expired JWT token, or user missing `SuperAdmin` / `Control` role.
- **`500 Internal Server Error`**: Cloud storage (DigitalOcean Spaces / S3 / Azure Blob) connection failure.

---

## ☁️ Infrastructure & Cloud Storage Architecture

1. **Storage Provider**: Store uploaded assets in S3-compatible cloud object storage (e.g., DigitalOcean Spaces or AWS S3 bucket).
2. **CDN Delivery**: Serve files via HTTPS with edge CDN caching (e.g., `https://cdn.alpha10group.com/...` or DigitalOcean Spaces CDN).
3. **Automatic Optimization (Recommended)**: If possible, convert uploaded JPEG/PNG images to modern WebP format on upload for fast mobile application loading.
4. **Access Control**: Public-read for educational and product media; secure/presigned URLs for sensitive KYC compliance documents.

---

# 🚨 Alpha-10 Backend Issue Report: Circular Reference & Infinite Recursion on `PUT /api/admin/learn/quiz/questions/{id}`

**System:** Alpha-10 Admin Portal / Learn Quiz Management  
**Date:** October 23, 2026  
**Severity:** 🔴 **Critical / False Error & Payload Corruption (P0)**  
**Target:** Backend Engineering Team  
**Reported by:** Front-end Engineering Team  
**Environment:** `https://mobile-test.alpha10group.com/alphaten-admin`  

---

## 📌 Issue Summary

When updating a quiz question via `PUT /api/admin/learn/quiz/questions/{id}`, the backend database update **succeeds**, but the HTTP response terminates with **`500 Internal Server Error`** and a truncated, malformed JSON payload.

The response body starts with `"statusCode": 200, "statusMessage": "Question updated."`, but then falls into an **infinite circular serialization loop** between `Question` and `Option` entity models (`question.options[0].question.options[0].question...`), until the JSON serializer crashes deep in the recursive stack and outputs an error object inside `"body"`.

Because the HTTP status code is `500`, front-end HTTP interceptors (Axios / Fetch) treat the entire request as failed and display error alerts to administrators, even though the database write actually succeeded.

---

## 🔍 Request & Response Details

### Request
```http
PUT https://mobile-test.alpha10group.com/alphaten-admin/api/admin/learn/quiz/questions/aaaaaaaa-1111-2222-3333-444444444411 HTTP/1.1
Host: mobile-test.alpha10group.com
Authorization: Bearer <VALID_SUPERADMIN_JWT_TOKEN>
Accept: application/json
Content-Type: application/json

{
    "quizId": "aaaaaaaa-1111-2222-3333-444444444401",
    "prompt": "How do you feel about taking risks and facing possible losses when you are investing?",
    "displayOrder": 1,
    "options": [
        {
            "id": "08a4b113-074f-489c-b6e6-e4b95333989e",
            "label": "A",
            "body": "Protecting your capital comes first. You prefer steady, modest gains with very low risk of loss.",
            "isCorrect": false,
            "displayOrder": 1
        }
    ]
}
```

### Response
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json; charset=utf-8
```
```json
{
    "statusCode": 200,
    "statusMessage": "Question updated.",
    "data": {
        "id": "aaaaaaaa-1111-2222-3333-444444444411",
        "quizId": "aaaaaaaa-1111-2222-3333-444444444401",
        "prompt": "How do you feel about taking risks and facing possible losses when you are investing?",
        "displayOrder": 1,
        "quiz": null,
        "options": [
            {
                "id": "08a4b113-074f-489c-b6e6-e4b95333989e",
                "questionId": "aaaaaaaa-1111-2222-3333-444444444411",
                "label": "A",
                "body": "Protecting your capital comes first. You prefer steady, modest gains with very low risk of loss.",
                "isCorrect": false,
                "displayOrder": 1,
                "question": {
                    "id": "aaaaaaaa-1111-2222-3333-444444444411",
                    "quizId": "aaaaaaaa-1111-2222-3333-444444444401",
                    "prompt": "How do you feel about taking risks and facing possible losses when you are investing?",
                    "displayOrder": 1,
                    "quiz": null,
                    "options": [
                        {
                            "id": "08a4b113-074f-489c-b6e6-e4b95333989e",
                            "questionId": "aaaaaaaa-1111-2222-3333-444444444411",
                            "label": "A",
                            "body": "Protecting your capital comes first. You prefer steady, modest gains with very low risk of loss.",
                            "isCorrect": false,
                            "displayOrder": 1,
                            "question": {
                                /* ... repeats cyclically 10+ levels deep ... */
                                "options": [
                                    {
                                        "id": "08a4b113-074f-489c-b6e6-e4b95333989e",
                                        "questionId": "aaaaaaaa-1111-2222-3333-444444444411",
                                        "label": "A",
                                        "body": {
                                            "code": 500,
                                            "message": "An unexpected error occurred"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    }
}
```

---

## 🛠️ Root Cause Analysis & Technical Diagnosis

1. **Bi-Directional ORM Navigation Property Circular Reference**:
   - The ORM entity model has a two-way navigation link:
     - `Question` has a collection property `ICollection<QuizOption> Options`
     - `QuizOption` has a parent navigation property `Question Question`
2. **Direct Entity Model Return (Missing DTO Projection)**:
   - The endpoint controller is directly serializing the tracked ORM entity rather than projecting it into a clean, decoupled Data Transfer Object (`QuestionResponseDto`).
3. **Serializer Infinite Loop & Stack Overflow / Mid-Stream 500 Crash**:
   - The JSON serializer attempts to serialize `Question -> Options -> Option.Question -> Options -> Option.Question...` indefinitely.
   - When reaching serializer maximum depth limit or call stack exhaustion, the serializer crashes mid-stream, replaces `"body"` with a `{ "code": 500, "message": "An unexpected error occurred" }` error object, and alters the HTTP response status to `500 Internal Server Error`.

---

## 💥 Impact & Consequences

1. **False Failure Alerts for Admins**:
   - Frontend receives HTTP status `500`, displaying *"Failed to update question"* notification, prompting administrators to retry repeatedly even though records are already updated in the database.
2. **Malformed JSON & Client Memory Bloat**:
   - Deeply nested recursive objects consume unnecessary bandwidth (hundreds of KB instead of 1 KB) and can crash frontend state stores.
3. **Server CPU & Memory Spikes**:
   - Every single question update triggers unbounded recursive object graph traversal, risking server OutOfMemory (OOM) crashes and CPU bottlenecks under production load.

---

## ✅ Required Action / Proposed Solution

### Solution 1: Use Dedicated DTOs (Recommended Architecture)
Never expose raw ORM entities directly in controller responses. Project the question and its options into flat DTOs:

```csharp
// Response DTOs without circular parent references
public class QuestionResponseDto
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
}

public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int DisplayOrder { get; set; }
    // OMIT the parent 'Question' reference here!
}
```

### Solution 2: Configure Global JSON Serializer Cycle Handling
If using .NET System.Text.Json in `Program.cs` / `Startup.cs`:
```csharp
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});
```
Or if using Newtonsoft.Json:
```csharp
builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});
```

### Solution 3: Add `[JsonIgnore]` on Inverse Navigation Properties
In the `QuizOption` entity definition:
```csharp
public class QuizOption
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int DisplayOrder { get; set; }

    [JsonIgnore] // Prevents recursive back-reference serialization
    public virtual Question? Question { get; set; }
}
```

---

## 📋 Affected Endpoints Checklist

| Method | Endpoint | Expected Behavior | Current Status |
| :--- | :--- | :---: | :---: |
| `PUT` | `/api/admin/learn/quiz/questions/{id}` | Return flat 200 OK with clean question DTO | ❌ **500 Error (Circular Infinite Recursion)** |
| `POST` | `/api/admin/learn/quiz/questions` | Return 201 Created with clean question DTO | ⚠️ Unverified (likely shares same circular entity) |
| `GET` | `/api/admin/learn/quiz/questions/{id}` | Return 200 OK with clean question DTO | ⚠️ Unverified (likely shares same circular entity) |

---

# 🚨 Alpha-10 Backend Issue Report: 401 Unauthorized on Mutual Fund Contents API

**System:** Alpha-10 Admin Portal / Retail Mutual Funds Management  
**Date:** October 23, 2026  
**Severity:** 🔴 **Critical / Blocker for Mutual Funds & Retail Investments Testing (P0)**  
**Target:** Backend Engineering Team  
**Reported by:** Front-end Engineering Team  
**Environment:** `https://mobile-test.alpha10group.com/alphaten-admin`  

---

## 📌 Issue Summary

Requests to the Mutual Fund Contents listing API endpoint fail with a **`401 Unauthorized`** error when accessed by an authenticated **`SuperAdmin`** account.

This endpoint is actively used by the Admin Portal to power the **Retail Mutual Funds Management** interface (`/dashboard/retail/mutual-funds`) and the **Customer Investment Detail** view (`/dashboard/retail/investments/[id]`).

**This API and its associated endpoints need to be opened immediately for `SuperAdmin` so testing of mutual fund creation, asset allocation, top holdings, and fund prospectus management can proceed.**

---

## 🔍 Request & Response Details

### Request
```http
GET https://mobile-test.alpha10group.com/alphaten-admin/api/admin/mutual-fund-contents?pageNumber=1&pageSize=20 HTTP/1.1
Host: mobile-test.alpha10group.com
Authorization: Bearer <VALID_SUPERADMIN_JWT_TOKEN>
Accept: application/json
Content-Type: application/json
```

### Response
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```
```json
{
    "statusCode": 401,
    "statusMessage": "You do not have permission to perform this action."
}
```

---

## 💥 Impact & Consequences

1. **Retail Mutual Funds Management Blocked (`/dashboard/retail/mutual-funds`)**:
   - SuperAdmin administrators are unable to load the list of mutual funds, view fund details, update fund parameters, or configure fund statuses.
2. **Sub-Resource APIs Untestable**:
   - Asset allocations (`POST /api/admin/mutual-fund-contents/{id}/allocations`) and top holdings (`POST /api/admin/mutual-fund-contents/{id}/holdings`) management cannot be verified.
3. **Retail Customer Portfolio Breakdown Incomplete (`/dashboard/retail/investments/[id]`)**:
   - The mutual funds breakdown within customer investment profiles cannot resolve fund metadata.
4. **End-to-End Testing Halted**:
   - QA and administrative teams are blocked from configuring and validating mutual fund products before retail investor launch.

---

## 🛠️ Root Cause Analysis & Technical Diagnosis

1. **Role / Policy Misconfiguration in Controller**:
   - Similar to the earlier `investment-education` issue, the controller for `/api/admin/mutual-fund-contents` likely contains an `[Authorize]` attribute or policy requirement that either:
     - Omitted the `SuperAdmin` role.
     - Demands a granular permission claim not mapped to the `SuperAdmin` test user profile.
2. **Missing SuperAdmin Fallback Policy**:
   - During active development and testing, all `/api/admin/*` controllers should permit unrestricted access for `SuperAdmin`.

---

## ✅ Required Action / Proposed Solution

1. **Open Mutual Fund Contents APIs to `SuperAdmin` (Immediate)**:
   - Update the authorization policy and controller attributes on `/api/admin/mutual-fund-contents` to grant access to `SuperAdmin` and `Control`:
     ```csharp
     [Authorize(Roles = "SuperAdmin,Control")]
     ```
2. **Grant Access Across Full CRUD & Sub-Endpoints**:
   - Ensure the permission grant applies to:
     - `GET /api/admin/mutual-fund-contents` (listing)
     - `GET /api/admin/mutual-fund-contents/{id}` (detail)
     - `POST /api/admin/mutual-fund-contents` (create)
     - `PUT /api/admin/mutual-fund-contents/{id}` (update)
     - `DELETE /api/admin/mutual-fund-contents/{id}` (delete)
     - `POST /api/admin/mutual-fund-contents/{id}/allocations` (asset allocations)
     - `POST /api/admin/mutual-fund-contents/{id}/holdings` (top holdings)
3. **Audit Remaining Admin Routes for SuperAdmin Access**:
   - Ensure any remaining unverified routes under `/api/admin/*` allow `SuperAdmin` without permission rejections.

---

## 📋 Affected Endpoints Checklist

| Method | Endpoint | Expected SuperAdmin Access | Current Status |
| :--- | :--- | :---: | :---: |
| `GET` | `/api/admin/mutual-fund-contents` | ✅ Allowed | ❌ **401 Unauthorized** |
| `GET` | `/api/admin/mutual-fund-contents/{id}` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `POST` | `/api/admin/mutual-fund-contents` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `PUT` | `/api/admin/mutual-fund-contents/{id}` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `DELETE` | `/api/admin/mutual-fund-contents/{id}` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `POST` | `/api/admin/mutual-fund-contents/{id}/allocations` | ✅ Allowed | ⚠️ Unverified (likely 401) |
| `POST` | `/api/admin/mutual-fund-contents/{id}/holdings` | ✅ Allowed | ⚠️ Unverified (likely 401) |



