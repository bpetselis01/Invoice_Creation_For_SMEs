# Invoice_Creation_For_SMEs

## Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend — React + TypeScript (Vite)"]
        UI[React components<br/>InvoiceCreator, Dashboard, ViewInvoices]
    end

    subgraph Server["Backend — Express + TypeScript (EC2, port 4000)"]
        API[REST API<br/>auth.ts / create.ts / server.ts]
    end

    subgraph AWS["AWS"]
        EC2[(EC2 instance<br/>hosts the Express API)]
        S3[(S3 bucket<br/>invoices-ctrlfreaks)]
    end

    UI -- "axios: /login, /upload, /create/json, /invoices/:user" --> API
    API -- "s3.upload / getSignedUrl / listObjectsV2" --> S3
    API -.runs on.-> EC2
```

## Invoice upload & retrieval flow

```mermaid
sequenceDiagram
    participant U as User (React UI)
    participant A as Express API
    participant S as S3 bucket

    U->>A: POST /login (username, password)
    A-->>U: JWT set as httpOnly cookie

    U->>A: POST /upload (file, cookie)
    A->>A: verifyToken(cookie)
    A->>S: s3.upload({Bucket, Key: user/timestamp_filename})
    S-->>A: upload confirmation
    A-->>U: "File uploaded successfully"

    U->>A: GET /download/:fileKey
    A->>S: headObject (existence check)
    A->>S: getSignedUrl('getObject')
    S-->>A: pre-signed URL
    A-->>U: pre-signed download URL
```

**What each piece does:**
- **React + TypeScript (frontend)** — Vite app under `invoice_creation/frontend`, built with MUI. Components poll `/alive`, submit invoices via JSON/CSV/manual entry, and call the backend with `axios`.
- **Express + TypeScript (backend)** — `invoice_creation/backend/src/server.ts` exposes REST endpoints for auth (JWT cookie), UBL invoice generation, and S3 file upload/download/listing.
- **AWS S3** — stores uploaded invoice files, keyed by `username/timestamp_filename`; downloads go through short-lived pre-signed URLs rather than public access.
- **AWS EC2** — `server.ts` binds to `0.0.0.0` when it detects it's running as the `ubuntu` user, which is how the API is hosted on an EC2 instance rather than localhost.

> **Not present in this repo:** there is no GPT-4/OpenAI integration anywhere in the codebase — none of the source, `package.json` files, or workflows reference it. Let me know if it's planned, lives in another repo, or you meant a different piece, and I'll add an accurate diagram for it.

> **Security note:** `invoice_creation/backend/src/server.ts` currently has a live AWS access key and secret hardcoded (not an env var). Recommend rotating that key in the AWS console and loading credentials from environment variables instead.
