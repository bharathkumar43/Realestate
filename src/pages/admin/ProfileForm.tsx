import { useEffect, useState, type FormEvent } from 'react';
import { useData } from '../../hooks/useData';
import { saveProfile } from '../../lib/api';
import type { AgentProfile } from '../../lib/types';

export default function ProfileForm() {
  const { profile, refresh } = useData();
  const [p, setP] = useState<AgentProfile>(profile);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => setP(profile), [profile]);
  useEffect(() => {
    if (!photo) return setPreview('');
    const u = URL.createObjectURL(photo);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [photo]);

  const set = <K extends keyof AgentProfile>(k: K, v: AgentProfile[K]) => setP((s) => ({ ...s, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await saveProfile(p, photo);
      setPhoto(null);
      await refresh();
      setMsg({ ok: true, text: 'Profile saved!' });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not save' });
    } finally {
      setSaving(false);
    }
  };

  const img = preview || p.photo_url;

  return (
    <form onSubmit={submit} className="space-y-6">
      <h1 className="text-2xl font-bold text-night-900">My profile</h1>
      <p className="-mt-4 text-sm text-slate-500">This is what clients see on the About page, in the footer and on WhatsApp/Call buttons.</p>

      <section className="card flex flex-col items-center gap-4 sm:flex-row">
        {img ? (
          <img src={img} alt="" className="h-28 w-28 rounded-full object-cover ring-4 ring-violet-100" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-violet-600 text-4xl font-bold text-white">
            {(p.name || 'A').charAt(0)}
          </div>
        )}
        <label className="cursor-pointer rounded-full bg-violet-100 px-5 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-200">
          Change photo
          <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
        </label>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <label className="label">
          Your name
          <input className="field" value={p.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        <label className="label">
          Tagline
          <input className="field" value={p.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Trusted plots, clear titles." />
        </label>
        <label className="label">
          Phone (for Call button)
          <input className="field" type="tel" value={p.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9876543210" />
        </label>
        <label className="label">
          WhatsApp number
          <input className="field" type="tel" value={p.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="9876543210" />
          <span className="text-xs font-normal text-slate-400">10-digit Indian numbers get +91 automatically</span>
        </label>
        <label className="label">
          Instagram handle
          <input className="field" value={p.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@yourhandle" />
        </label>
        <label className="label">
          Email
          <input className="field" type="email" value={p.email} onChange={(e) => set('email', e.target.value)} />
        </label>
        <label className="label">
          Years of experience
          <input className="field" type="number" min="0" value={p.experience_years} onChange={(e) => set('experience_years', Number(e.target.value))} />
        </label>
        <label className="label">
          Plots sold so far
          <input className="field" type="number" min="0" value={p.plots_sold} onChange={(e) => set('plots_sold', Number(e.target.value))} />
        </label>
        <label className="label md:col-span-2">
          About you
          <textarea className="field min-h-[140px]" value={p.bio} onChange={(e) => set('bio', e.target.value)} />
        </label>
      </section>

      {msg && <p className={`rounded-xl p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}

      <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
