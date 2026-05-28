import type { NicheOption, Persona, ProgramName, PricingStrategy, RoadmapPhase, User, Blueprint } from '@/types';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const registerUser = (body: { name: string; email: string; password: string }) =>
  fetchJson<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) });

export const loginUser = (body: { email: string; password: string }) =>
  fetchJson<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) });

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export const fetchUser = (): Promise<User> =>
  fetchJson<{ data: User }>('/user/me').then(r => r.data);

export const fetchCredits = () =>
  fetchJson<{ data: { balance: number; costs: Record<string, number> } }>('/user/credits').then(r => r.data);

// ---------------------------------------------------------------------------
// Blueprint
// ---------------------------------------------------------------------------
export const fetchBlueprint = (): Promise<Blueprint> =>
  fetchJson<{ data: Blueprint }>('/blueprint').then(r => r.data);

export const fetchAllBlueprints = (): Promise<Blueprint[]> =>
  fetchJson<{ data: Blueprint[] }>('/blueprint/all').then(r => r.data);

export const createBlueprint = (): Promise<Blueprint> =>
  fetchJson<{ data: Blueprint }>('/blueprint', { method: 'POST' }).then(r => r.data);

export const updateBlueprint = (id: string, updates: Partial<Blueprint>): Promise<Blueprint> =>
  fetchJson<{ data: Blueprint }>(`/blueprint/${id}`, { method: 'PUT', body: JSON.stringify(updates) }).then(r => r.data);

export const deleteBlueprint = (id: string): Promise<{ deleted: boolean }> =>
  fetchJson<{ data: { deleted: boolean } }>(`/blueprint/${id}`, { method: 'DELETE' }).then(r => r.data);

export const submitNicheForm = async (data: { skills: string; experience: string; passions: string; domains: string[] }) => {
  const res = await fetchJson<{
    data: { niches: NicheOption[]; blueprint: Blueprint };
    meta?: { creditsDeducted?: number; remainingCredits?: number };
  }>('/blueprint/niche', { method: 'POST', body: JSON.stringify(data) });
  return { niches: res.data.niches, blueprint: res.data.blueprint, creditsDeducted: res.meta?.creditsDeducted ?? 10 };
};

export const generatePersona = async (nicheId: string) => {
  const res = await fetchJson<{
    data: { persona: Persona };
    meta?: { creditsDeducted?: number; remainingCredits?: number };
  }>('/blueprint/audience', { method: 'POST', body: JSON.stringify({ nicheId }) });
  return { persona: res.data.persona, creditsDeducted: res.meta?.creditsDeducted ?? 10 };
};

export const submitProblems = async (selectedProblems: string[]) => {
  const res = await fetchJson<{ data: { problems: string[] } }>('/blueprint/problems', {
    method: 'POST',
    body: JSON.stringify({ selectedProblems }),
  });
  return res.data.problems;
};

export const generateProgramNames = async () => {
  const res = await fetchJson<{
    data: { names: ProgramName[] };
    meta?: { creditsDeducted?: number; remainingCredits?: number };
  }>('/blueprint/program-name', { method: 'POST' });
  return { names: res.data.names, creditsDeducted: res.meta?.creditsDeducted ?? 5 };
};

export const generatePricing = async () => {
  const res = await fetchJson<{
    data: { pricing: PricingStrategy };
    meta?: { creditsDeducted?: number; remainingCredits?: number };
  }>('/blueprint/pricing', { method: 'POST' });
  return { pricing: res.data.pricing, creditsDeducted: res.meta?.creditsDeducted ?? 5 };
};

export const generateRoadmap = async () => {
  const res = await fetchJson<{
    data: { phases: RoadmapPhase[]; pdfUrl: string; blueprint?: Blueprint };
    meta?: { creditsDeducted?: number; remainingCredits?: number };
  }>('/blueprint/roadmap', { method: 'POST' });
  return { phases: res.data.phases, pdfUrl: res.data.pdfUrl, creditsDeducted: res.meta?.creditsDeducted ?? 15 };
};

export const fetchProblems = async (): Promise<string[]> => {
  // Backend does not have a dedicated fetch problems endpoint; return mock for now
  await new Promise(r => setTimeout(r, 800));
  return [
    'Feeling stuck in their career with no clear direction',
    'Lack of confidence when speaking up in meetings or presentations',
    'Struggling to transition from individual contributor to leader',
    'Burnout from trying to meet everyone\'s expectations',
    'Difficulty building a personal brand and online presence',
    'Not knowing how to negotiate salary or promotions effectively',
  ];
};

export const downloadPDF = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/blueprint/pdf/${id}`);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Failed to download PDF');
    let message = 'Failed to download PDF';
    try {
      const json = JSON.parse(errorText);
      message = json.message || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  // Extract filename from Content-Disposition header if available
  const disposition = response.headers.get('Content-Disposition');
  let filename = 'Discovery-Engine-Blueprint.pdf';
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  // msSaveOrOpenBlob for IE/Edge legacy support
  const nav = window.navigator as any;
  if (nav.msSaveOrOpenBlob) {
    nav.msSaveOrOpenBlob(blob, filename);
    window.URL.revokeObjectURL(url);
    return;
  }

  // Cross-browser download strategy
  // Safari is strict about user gesture context — a.click() after await often fails.
  // MouseEvent dispatch + longer element persistence is more reliable.
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const clickDelay = isSafari ? 300 : 50;
  const cleanupDelay = isSafari ? 5000 : 2000;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);

  setTimeout(() => {
    // Use MouseEvent dispatch instead of a.click() — Safari handles this better
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    a.dispatchEvent(event);

    // Keep anchor and URL alive long enough for the browser to start download
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, cleanupDelay);
  }, clickDelay);
};
