# API Contract: PDF Blueprint Generation

**Date**: 2026-05-28
**Base URL**: `http://localhost:3001/api`

---

## GET /blueprint/pdf/:id

Download the generated PDF blueprint for a completed wizard.

### Request

```http
GET /api/blueprint/pdf/:id HTTP/1.1
```

**Path Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Blueprint ID (e.g., `bp_1716789456123`) |

### Responses

#### 200 OK — PDF Download

Returns the PDF file as a binary stream with download headers.

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="Discovery-Engine-Blueprint-[Niche-Name].pdf"
Content-Length: <byte-length>

<binary PDF data>
```

**Behavior**:
- If PDF is not cached, server generates it on-demand (2–5 seconds).
- If PDF is cached and TTL is valid, returns immediately from memory.

#### 400 Bad Request — Incomplete Blueprint

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "message": "Blueprint is incomplete. Missing: niche, audience persona, program pricing, roadmap.",
  "data": {
    "missingFields": ["niche", "audience", "program.pricing", "roadmap"]
  }
}
```

#### 404 Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "message": "Blueprint not found."
}
```

#### 500 Internal Server Error — PDF Generation Failed

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "message": "PDF generation failed. Please try again later."
}
```

---

## Frontend Integration

### `downloadPDF(id: string): Promise<void>`

```typescript
async function downloadPDF(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/blueprint/pdf/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to download PDF');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Discovery-Engine-Blueprint.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
```

### Loading State

The frontend MUST show a loading indicator from the moment the user clicks "Download My Blueprint PDF" until the blob download is triggered. The spinner MUST be hidden on error with an error toast/message.
