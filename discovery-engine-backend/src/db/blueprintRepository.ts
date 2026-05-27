/**
 * ============================================================================
 * DISCOVERY ENGINE - Blueprint Repository
 * ============================================================================
 * Data access layer for blueprints and activities using SQLite.
 * ============================================================================
 */

import { db } from './index';
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
export function getBlueprintsByUser(userId: string): Blueprint[] {
  const stmt = db.prepare('SELECT * FROM blueprints WHERE user_id = ? ORDER BY updated_at DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map(rowToBlueprint);
}

export function getBlueprintById(id: string): Blueprint | undefined {
  const stmt = db.prepare('SELECT * FROM blueprints WHERE id = ?');
  const row = stmt.get(id) as any;
  return row ? rowToBlueprint(row) : undefined;
}

export function createBlueprint(blueprint: Blueprint): Blueprint {
  const stmt = db.prepare(`
    INSERT INTO blueprints (id, user_id, title, status, current_step, progress, niche, audience, program, roadmap, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
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
    blueprint.updatedAt.toISOString()
  );
  return blueprint;
}

export function updateBlueprint(id: string, updates: Partial<Blueprint>): Blueprint | undefined {
  const existing = getBlueprintById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates, updatedAt: new Date() };

  const stmt = db.prepare(`
    UPDATE blueprints SET
      title = ?,
      status = ?,
      current_step = ?,
      progress = ?,
      niche = ?,
      audience = ?,
      program = ?,
      roadmap = ?,
      updated_at = ?
    WHERE id = ?
  `);
  stmt.run(
    merged.title || null,
    merged.status,
    merged.currentStep,
    merged.progress,
    serialize(merged.niche),
    serialize(merged.audience),
    serialize(merged.program),
    serialize(merged.roadmap),
    merged.updatedAt.toISOString(),
    id
  );
  return merged;
}

export function deleteBlueprint(id: string): boolean {
  const stmt = db.prepare('DELETE FROM blueprints WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------
export function getActivitiesByUser(userId: string, limit = 20): ActivityItem[] {
  const stmt = db.prepare('SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  const rows = stmt.all(userId, limit) as any[];
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

export function addActivity(activity: Omit<ActivityItem, 'id'>): ActivityItem {
  const stmt = db.prepare(`
    INSERT INTO activities (user_id, blueprint_id, title, description, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    activity.userId,
    activity.blueprintId || null,
    activity.title,
    activity.description || null,
    activity.type,
    activity.createdAt.toISOString()
  );
  return {
    ...activity,
    id: String(result.lastInsertRowid),
  };
}
