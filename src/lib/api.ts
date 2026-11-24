import imageCompression from 'browser-image-compression';
import { BUCKET, isDemo, supabase } from './supabase';
import { demoPlots, demoProfile } from './demoData';
import type { AgentProfile, DraftImage, Plot, PlotFields, PlotImage, PlotStatus } from './types';

/* ------------------------------------------------------------------ */
/* Demo store: data lives in this browser's localStorage               */
/* ------------------------------------------------------------------ */

const DEMO_KEY = 'plotgenie-demo-v1';
interface DemoDb {
  plots: Plot[];
  profile: AgentProfile;
}

function loadDemo(): DemoDb {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) return JSON.parse(raw) as DemoDb;
  } catch {
    /* storage unavailable */
  }
  return { plots: structuredClone(demoPlots), profile: { ...demoProfile } };
}

function saveDemo(db: DemoDb) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(db));
  } catch {
    throw new Error('Browser storage is full. Use fewer or smaller images in demo mode, or connect Supabase.');
  }
}

export function resetDemo() {
  try {
    localStorage.removeItem(DEMO_KEY);
  } catch {
    /* ignore */
  }
}

const fileToDataUrl = (f: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

async function compress(file: File, demo: boolean): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: demo ? 0.25 : 1,
    maxWidthOrHeight: demo ? 1280 : 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}

function publicUrl(path: string): string {
  return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlotRow(row: any): Plot {
  const images: PlotImage[] = (row.plot_images ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((im: any) => ({ ...im, url: publicUrl(im.storage_path) }))
    .sort((a: PlotImage, b: PlotImage) => a.sort_order - b.sort_order);
  const { plot_images: _omit, ...rest } = row;
  return {
    ...rest,
    area_value: Number(row.area_value),
    price: Number(row.price),
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    images,
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function fetchPlots(): Promise<Plot[]> {
  if (isDemo) return loadDemo().plots;
  const { data, error } = await supabase!
    .from('plots')
    .select('*, plot_images(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPlotRow);
}

export async function fetchProfile(): Promise<AgentProfile> {
  if (isDemo) return loadDemo().profile;
  const { data, error } = await supabase!.from('agent_profile').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  const p = { ...demoProfile, name: 'Agent', bio: '', ...(data ?? {}) } as AgentProfile;
  for (const k of Object.keys(p) as (keyof AgentProfile)[]) {
    if (p[k] === null) (p as unknown as Record<string, unknown>)[k] = '';
  }
  p.photo_url = p.photo_path ? publicUrl(p.photo_path) : '';
  return p;
}

/**
 * Creates or updates a plot. `images` is the final ordered list from the editor;
 * existing images missing from it are deleted. `coverIndex` picks the cover photo.
 */
export async function savePlot(
  id: string | null,
  fields: PlotFields,
  images: DraftImage[],
  coverIndex: number,
  original: PlotImage[] = [],
): Promise<string> {
  if (isDemo) {
    const db = loadDemo();
    const finalImages: PlotImage[] = [];
    for (const [i, im] of images.entries()) {
      const url = im.kind === 'existing' ? im.url : await fileToDataUrl(await compress(im.file, true));
      finalImages.push({
        id: im.kind === 'existing' ? im.id : uid(),
        storage_path: '',
        sort_order: i,
        is_cover: i === coverIndex,
        url,
      });
    }
    if (id) {
      db.plots = db.plots.map((p) => (p.id === id ? { ...p, ...fields, images: finalImages } : p));
    } else {
      id = `demo-${uid()}`;
      db.plots.unshift({ ...fields, id, created_at: new Date().toISOString(), images: finalImages });
    }
    saveDemo(db);
    return id;
  }

  const sb = supabase!;
  if (id) {
    const { error } = await sb.from('plots').update(fields).eq('id', id);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from('plots').insert(fields).select('id').single();
    if (error) throw error;
    id = data.id as string;
  }

  // Remove images the agent deleted
  const keptIds = new Set<string>();
  for (const im of images) if (im.kind === 'existing') keptIds.add(im.id);
  const removed = original.filter((o) => !keptIds.has(o.id));
  if (removed.length) {
    await sb.storage.from(BUCKET).remove(removed.map((r) => r.storage_path));
    const { error } = await sb
      .from('plot_images')
      .delete()
      .in(
        'id',
        removed.map((r) => r.id),
      );
    if (error) throw error;
  }

  // Upload new images and set order + cover for all
  for (const [i, im] of images.entries()) {
    if (im.kind === 'new') {
      const file = await compress(im.file, false);
      const path = `${id}/${uid()}.jpg`;
      const up = await sb.storage.from(BUCKET).upload(path, file, { contentType: 'image/jpeg' });
      if (up.error) throw up.error;
      const { error } = await sb
        .from('plot_images')
        .insert({ plot_id: id, storage_path: path, sort_order: i, is_cover: i === coverIndex });
      if (error) throw error;
    } else {
      const { error } = await sb
        .from('plot_images')
        .update({ sort_order: i, is_cover: i === coverIndex })
        .eq('id', im.id);
      if (error) throw error;
    }
  }
  return id;
}

export async function updatePlotQuick(id: string, patch: { status?: PlotStatus; featured?: boolean }) {
  if (isDemo) {
    const db = loadDemo();
    db.plots = db.plots.map((p) => (p.id === id ? { ...p, ...patch } : p));
    saveDemo(db);
    return;
  }
  const { error } = await supabase!.from('plots').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deletePlot(plot: Plot) {
  if (isDemo) {
    const db = loadDemo();
    db.plots = db.plots.filter((p) => p.id !== plot.id);
    saveDemo(db);
    return;
  }
  const paths = plot.images.map((i) => i.storage_path).filter(Boolean);
  if (paths.length) await supabase!.storage.from(BUCKET).remove(paths);
  const { error } = await supabase!.from('plots').delete().eq('id', plot.id);
  if (error) throw error;
}

export async function saveProfile(profile: AgentProfile, photo: File | null) {
  if (isDemo) {
    const db = loadDemo();
    const next = { ...profile };
    if (photo) next.photo_url = await fileToDataUrl(await compress(photo, true));
    db.profile = next;
    saveDemo(db);
    return;
  }
  const { photo_url: _u, ...row } = profile;
  if (photo) {
    const path = `profile/${uid()}.jpg`;
    const up = await supabase!.storage
      .from(BUCKET)
      .upload(path, await compress(photo, false), { contentType: 'image/jpeg' });
    if (up.error) throw up.error;
    if (profile.photo_path) await supabase!.storage.from(BUCKET).remove([profile.photo_path]);
    row.photo_path = path;
  }
  const { error } = await supabase!.from('agent_profile').upsert({ id: 1, ...row });
  if (error) throw error;
}
