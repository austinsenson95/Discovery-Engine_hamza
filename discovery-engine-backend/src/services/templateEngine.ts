/**
 * ============================================================================
 * DISCOVERY ENGINE - PDF Template Engine
 * ============================================================================
 * Compiles HTML template partials into a complete PDF-ready document.
 * Reads partial files from src/templates/pdf/ and replaces {{token}}
 * placeholders with Blueprint data.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import type { Blueprint } from '../types';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const TEMPLATES_DIR = path.resolve(__dirname, '../templates/pdf');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function readPartial(name: string): string {
  const filePath = path.join(TEMPLATES_DIR, name);
  return fs.readFileSync(filePath, 'utf-8');
}

function buildListItems(items: string[]): string {
  if (!items || items.length === 0) return '<li>—</li>';
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n');
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9\- ]/g, '').replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// Persona Page
// ---------------------------------------------------------------------------
function buildPersonaPage(blueprint: Blueprint): string {
  const persona = blueprint.audience?.persona;
  if (!persona) return '';

  let html = readPartial('persona.html')
    .replace(/{{personaName}}/g, escapeHtml(persona.name))
    .replace(/{{personaAgeRange}}/g, escapeHtml(persona.ageRange))
    .replace(/{{personaRole}}/g, escapeHtml(persona.role))
    .replace(/{{personaLocation}}/g, escapeHtml(persona.location))
    .replace(/{{personaCurrentSituation}}/g, escapeHtml(persona.currentSituation))
    .replace(/{{personaPayingCapacity}}/g, escapeHtml(persona.payingCapacity))
    .replace(/{{personaPlatforms}}/g, escapeHtml(persona.onlinePlatforms?.join(', ') || '—'))
    .replace(/{{personaBiggestDesire}}/g, escapeHtml(persona.biggestDesire))
    .replace(/{{painPoints}}/g, buildListItems(persona.painPoints))
    .replace(/{{goals}}/g, buildListItems(persona.goals));

  if (persona.quote) {
    html = html.replace(
      /{{personaQuoteBlock}}/g,
      `<div class="quote">${escapeHtml(persona.quote)}</div>`
    );
  } else {
    html = html.replace(/{{personaQuoteBlock}}/g, '');
  }

  return html;
}

// ---------------------------------------------------------------------------
// Program Page
// ---------------------------------------------------------------------------
function buildProgramPage(blueprint: Blueprint): string {
  const program = blueprint.program;
  if (!program) return '';

  const pricing = program.pricing;
  const name = program.selectedName;

  return readPartial('program.html')
    .replace(/{{programName}}/g, escapeHtml(name?.name || 'Your Program'))
    .replace(/{{programDescription}}/g, escapeHtml(name?.description || ''))
    .replace(/{{startingPrice}}/g, String(pricing?.startingPrice || 0))
    .replace(/{{sweetSpotRange}}/g, escapeHtml(pricing?.sweetSpotRange || '—'))
    .replace(/{{priceJustification}}/g, escapeHtml(pricing?.priceJustification || ''))
    .replace(/{{marketInsight}}/g, escapeHtml(pricing?.marketInsight || ''))
    .replace(/{{launchPrice}}/g, String(pricing?.priceEvolution?.launch || 0))
    .replace(/{{after10Students}}/g, escapeHtml(pricing?.priceEvolution?.after10Students || '—'))
    .replace(/{{premiumTier}}/g, escapeHtml(pricing?.priceEvolution?.premiumTier || '—'))
    .replace(/{{revenue10}}/g, String(pricing?.milestones?.students10 || 0))
    .replace(/{{revenue50}}/g, String(pricing?.milestones?.students50 || 0))
    .replace(/{{revenue100}}/g, String(pricing?.milestones?.students100 || 0));
}

// ---------------------------------------------------------------------------
// Roadmap Page
// ---------------------------------------------------------------------------
function buildRoadmapPage(blueprint: Blueprint): string {
  const phases = blueprint.roadmap?.phases;
  if (!phases || phases.length === 0) return '';

  const phasesHtml = phases
    .map((phase) => {
      const itemsHtml = phase.items
        .map(
          (item) => `
        <div class="week-card">
          <div class="week-header">
            <span class="badge">Week ${item.week}</span>
            <strong style="color: #0A0A0A;">${escapeHtml(item.tasks[0] || 'Milestone')}</strong>
          </div>
          <ul style="margin: 0; padding-left: 16px;">
            ${buildListItems(item.tasks)}
          </ul>
        </div>
      `
        )
        .join('\n');

      return `
        <div class="phase-header">
          <span class="badge">Phase ${phase.phase}</span>
          <h3 style="font-size: 18px;">${escapeHtml(phase.title)}</h3>
          <span style="font-size: 12px; color: #4A4A4A; margin-left: auto;">${escapeHtml(phase.weeks)}</span>
        </div>
        ${itemsHtml}
      `;
    })
    .join('\n');

  return readPartial('roadmap.html').replace(/{{roadmapPhases}}/g, phasesHtml);
}

// ---------------------------------------------------------------------------
// Next Steps Page
// ---------------------------------------------------------------------------
function buildNextStepsPage(blueprint: Blueprint): string {
  const personaName = blueprint.audience?.persona?.name || 'your ideal client';
  return readPartial('next-steps.html').replace(/{{personaName}}/g, escapeHtml(personaName));
}

// ---------------------------------------------------------------------------
// Cover Page
// ---------------------------------------------------------------------------
function buildCoverPage(blueprint: Blueprint): string {
  const nicheName = blueprint.niche?.selectedNiche?.name || 'Your Coaching Blueprint';
  return readPartial('cover.html')
    .replace(/{{nicheName}}/g, escapeHtml(nicheName))
    .replace(/{{generationDate}}/g, formatDate(new Date()));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CompiledTemplate {
  html: string;
  filename: string;
}

/**
 * Compile all template partials into a single HTML document ready for Puppeteer.
 */
export function compileBlueprintTemplate(blueprint: Blueprint): CompiledTemplate {
  console.log(`[TemplateEngine] Compiling PDF template for blueprint: ${blueprint.id}`);

  const shell = readPartial('blueprint.html');

  const content = [
    buildCoverPage(blueprint),
    buildPersonaPage(blueprint),
    buildProgramPage(blueprint),
    buildRoadmapPage(blueprint),
    buildNextStepsPage(blueprint),
  ].join('\n');

  const html = shell.replace(/{{content}}/g, content);

  const nicheSlug = sanitizeFilename(blueprint.niche?.selectedNiche?.name || 'Blueprint');
  const filename = `Discovery-Engine-Blueprint-${nicheSlug}.pdf`;

  console.log(`[TemplateEngine] Template compiled. Filename: ${filename}`);
  return { html, filename };
}

/**
 * Validate that a blueprint has all required data for PDF generation.
 * Returns an array of missing field names. Empty array = valid.
 */
export function validateBlueprintForPDF(blueprint: Blueprint): string[] {
  const missing: string[] = [];

  if (!blueprint.niche?.selectedNiche?.name) missing.push('niche');
  if (!blueprint.audience?.persona) missing.push('audience');
  if (!blueprint.program?.selectedName) missing.push('program.name');
  if (!blueprint.program?.pricing) missing.push('program.pricing');
  if (!blueprint.roadmap?.phases || blueprint.roadmap.phases.length === 0) missing.push('roadmap');

  return missing;
}
