/**
 * ============================================================================
 * DISCOVERY ENGINE - Blueprint Repository
 * ============================================================================
 * Data access layer for blueprints and activities using PostgreSQL.
 * ============================================================================
 */

import { query } from './index';
import type { Blueprint, ActivityItem } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function serialize<T>(data: T): string {
  return JSON.stringify(data);
}

function deserialize<T>(json: string | null): T | undefined {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

function rowToBlueprint(row: any): Blueprint {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    currentStep: row.current_step,
    progress: row.progress,
    niche: deserialize(row.niche),
    audience: deserialize(row.audience),
    program: deserialize(row.program),
    roadmap: deserialize(row.roadmap),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ---------------------------------------------------------------------------
// Blueprint CRUD
// ---------------------------------------------------------------------------
export async function getBlueprintsByUser(userId: string): Promise<Blueprint[]> {
  const { rows } = await query(
    'SELECT * FROM blueprints WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return rows.map(rowToBlueprint);
}

export async function getBlueprintById(id: string): Promise<Blueprint | undefined> {
  const { rows } = await query('SELECT * FROM blueprints WHERE id = $1', [id]);
  return rows[0] ? rowToBlueprint(rows[0]) : undefined;
}

export async function createBlueprint(blueprint: Blueprint): Promise<Blueprint> {
  await query(
    `INSERT INTO blueprints (id, user_id, title, status, current_step, progress, niche, audience, program, roadmap, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      blueprint.id,
      blueprint.userId,
      blueprint.title || null,
      blueprint.status,
      blueprint.currentStep,
      blueprint.progress,
      serialize(blueprint.niche),
      serialize(blueprint.audience),
      serialize(blueprint.program),
      serialize(blueprint.roadmap),
      blueprint.createdAt.toISOString(),
      blueprint.updatedAt.toISOString(),
    ]
  );
  return blueprint;
}

export async function updateBlueprint(
  id: string,
  updates: Partial<Blueprint>
): Promise<Blueprint | undefined> {
  const existing = await getBlueprintById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates, updatedAt: new Date() };

  await query(
    `UPDATE blueprints SET
      title = $1,
      status = $2,
      current_step = $3,
      progress = $4,
      niche = $5,
      audience = $6,
      program = $7,
      roadmap = $8,
      updated_at = $9
    WHERE id = $10`,
    [
      merged.title || null,
      merged.status,
      merged.currentStep,
      merged.progress,
      serialize(merged.niche),
      serialize(merged.audience),
      serialize(merged.program),
      serialize(merged.roadmap),
      merged.updatedAt.toISOString(),
      id,
    ]
  );
  return merged;
}

export async function deleteBlueprint(id: string): Promise<boolean> {
  const result = await query('DELETE FROM blueprints WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------
export async function getActivitiesByUser(userId: string, limit = 20): Promise<ActivityItem[]> {
  const { rows } = await query(
    'SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return rows.map((row) => ({
    id: String(row.id),
    userId: row.user_id,
    blueprintId: row.blueprint_id,
    title: row.title,
    description: row.description,
    type: row.type,
    createdAt: new Date(row.created_at),
  }));
}

export async function addActivity(activity: Omit<ActivityItem, 'id'>): Promise<ActivityItem> {
  const { rows } = await query(
    `INSERT INTO activities (user_id, blueprint_id, title, description, type, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      activity.userId,
      activity.blueprintId || null,
      activity.title,
      activity.description || null,
      activity.type,
      activity.createdAt.toISOString(),
    ]
  );
  return {
    ...activity,
    id: String(rows[0].id),
  };
}
