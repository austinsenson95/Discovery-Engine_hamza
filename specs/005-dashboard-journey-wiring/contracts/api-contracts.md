# API Contracts: Dashboard and Journey Blueprint Integration

**Feature**: 005-dashboard-journey-wiring

## New Endpoints

### GET /api/user/activities

**Description**: Fetch activity log for the current user.

**Request**: None (auth header only)

**Response**:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "act_001",
        "userId": "usr_001",
        "blueprintId": "bp_001",
        "title": "Niche Discovery Completed",
        "description": "Found 3 potential niches",
        "type": "niche",
        "createdAt": "2026-05-29T10:00:00Z"
      }
    ]
  }
}
```

**Error Codes**: 401 (unauthorized)

---

### GET /api/user/me

**Description**: Fetch current user profile.

**Request**: None (auth header only)

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe",
      "language": "english",
      "credits": 100
    }
  }
}
```

**Error Codes**: 401 (unauthorized)

---

### GET /api/blueprint/problems

**Description**: Fetch niche-scoped problems for the current blueprint.

**Request**: Query param `blueprintId`

**Response**:
```json
{
  "success": true,
  "data": {
    "problems": [
      "Feeling stuck in corporate with no clear exit strategy",
      "Having expertise but no idea how to package it into a sellable offer"
    ]
  }
}
```

**Error Codes**: 400 (missing blueprintId), 404 (blueprint not found)

## Modified Endpoints

### POST /api/blueprint/curriculum

**Change**: Remove the `currentStep: 7` overwrite. The controller should save the curriculum to `blueprint.program.curriculum` but leave `currentStep` and `progress` untouched.

**Before**:
```ts
updateBlueprint(blueprint.id, {
  program: blueprint.program,
  currentStep: 7,   // ← REMOVE THIS
  progress: 80,     // ← REMOVE THIS
});
```

**After**:
```ts
updateBlueprint(blueprint.id, {
  program: blueprint.program,
  // currentStep and progress are managed by the frontend
});
```

---

### POST /api/blueprint/roadmap

**Change**: Remove the `currentStep: 8` overwrite. The controller should save the roadmap phases and PDF URL but leave `currentStep` and `progress` untouched. The frontend advances to step 8 only when the user clicks "Download PDF."

**Before**:
```ts
updateBlueprint(blueprint.id, {
  program: blueprint.program,
  roadmap: { phases, pdfUrl },
  currentStep: 8,   // ← REMOVE THIS
  progress: 100,    // ← REMOVE THIS
});
```

**After**:
```ts
updateBlueprint(blueprint.id, {
  program: blueprint.program,
  roadmap: { phases, pdfUrl },
  // currentStep and progress are managed by the frontend
});
```

## Frontend API Functions

### New Functions in `app/src/lib/api.ts`

```ts
export const fetchUser = async (): Promise<User>;
export const fetchActivities = async (): Promise<ActivityItem[]>;
export const fetchProblems = async (blueprintId: string): Promise<string[]>;
```

### Type Alignment in `app/src/types/index.ts`

```ts
export interface ActivityItem {
  id: string;
  userId: string;           // ← ADD
  blueprintId?: string;     // ← ADD
  title: string;
  description?: string;     // ← MAKE OPTIONAL
  type: 'blueprint' | 'niche' | 'audience' | 'program' | 'roadmap' | 'credit';
  createdAt: Date;          // ← RENAME from timestamp
}
```
