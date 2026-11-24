import { Reorder } from 'framer-motion';
import { Suspense, lazy, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '../../components/ui';
import { useData } from '../../hooks/useData';
import { savePlot } from '../../lib/api';
import { formatINR, ratePer } from '../../lib/format';
import type { AreaUnit, DraftImage, PlotFields, PlotStatus } from '../../lib/types';

const PlotMap = lazy(() => import('../../components/PlotMap'));

const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 }; // Hyderabad
const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

const empty: PlotFields = {
  title: '',
  location: '',
  city: '',
  area_value: 0,
  area_unit: 'sqyd',
  price: 0,
  price_negotiable: false,
  facing: '',
  approval: '',
  description: '',
  latitude: null,
  longitude: null,
  status: 'available',
  featured: false,
};

const keyOf = (im: DraftImage) => (im.kind === 'existing' ? im.id : im.key);

export default function PlotForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plots, loading, refresh } = useData();
  const existing = id ? plots.find((p) => p.id === id) : undefined;

  const [f, setF] = useState<PlotFields>(empty);
  const [images, setImages] = useState<DraftImage[]>([]);
  const [cover, setCover] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const loadedFor = useRef<string | null>(null);

  // Load the plot being edited once data arrives
  useEffect(() => {
    if (!existing || loadedFor.current === existing.id) return;
    loadedFor.current = existing.id;
    const { id: _i, created_at: _c, images: imgs, ...fields } = existing;
    setF(fields);
    setImages(imgs.map((im) => ({ kind: 'existing', id: im.id, storage_path: im.storage_path, url: im.url })));
    setCover((imgs.find((i) => i.is_cover) ?? imgs[0])?.id ?? null);
  }, [existing]);

  // Free preview URLs
  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(
    () => () => imagesRef.current.forEach((im) => im.kind === 'new' && URL.revokeObjectURL(im.url)),
    [],
  );

  const set = <K extends keyof PlotFields>(k: K, v: PlotFields[K]) => setF((s) => ({ ...s, [k]: v }));

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith('image/'));
    const drafts: DraftImage[] = list.map((file) => ({
      kind: 'new',
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((cur) => {
      const next = [...cur, ...drafts];
      if (!cover && next.length) setCover(keyOf(next[0]));
      return next;
    });
  };

  const removeImage = (k: string) => {
    setImages((cur) => {
      const im = cur.find((i) => keyOf(i) === k);
      if (im?.kind === 'new') URL.revokeObjectURL(im.url);
      const next = cur.filter((i) => keyOf(i) !== k);
      if (cover === k) setCover(next[0] ? keyOf(next[0]) : null);
      return next;
    });
  };

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        set('latitude', Number(pos.coords.latitude.toFixed(6)));
        set('longitude', Number(pos.coords.longitude.toFixed(6)));
      },
      () => setError('Could not get your location. Allow location access, or tap the map instead.'),
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() || !f.location.trim()) return setError('Please add a title and location.');
    if (!(f.area_value > 0)) return setError('Please enter the plot area.');
    if (!(f.price > 0)) return setError('Please enter the price.');
    setSaving(true);
    setError('');
    try {
      const coverIndex = Math.max(0, images.findIndex((im) => keyOf(im) === cover));
      const savedId = await savePlot(id ?? null, { ...f, title: f.title.trim() }, images, coverIndex, existing?.images ?? []);
      await refresh();
      navigate(`/admin?saved=${savedId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the plot');
    } finally {
      setSaving(false);
    }
  };

  if (id && loading) return <Spinner />;
  if (id && !existing) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center">
        Plot not found. <Link to="/admin" className="text-violet-600 underline">Back to plots</Link>
      </p>
    );
  }

  const hasPin = f.latitude !== null && f.longitude !== null;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-sm text-violet-600 hover:underline">← Plots</Link>
        <h1 className="text-2xl font-bold text-night-900">{id ? 'Edit plot' : 'Add a new plot'}</h1>
      </div>

      {/* Photos */}
      <section className="card">
        <h2 className="card-title">Photos</h2>
        <p className="text-sm text-slate-500">Drag to reorder. Tap ★ to choose the cover photo clients see first.</p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInput.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400'}`}
        >
          <p className="text-4xl">📸</p>
          <p className="mt-2 font-medium text-slate-700">Drop photos here or tap to choose</p>
          <p className="text-xs text-slate-400">Photos are compressed automatically before upload</p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        {images.length > 0 && (
          <Reorder.Group axis="x" values={images} onReorder={setImages} className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {images.map((im) => {
              const k = keyOf(im);
              return (
                <Reorder.Item key={k} value={im} className="relative h-28 w-36 shrink-0 cursor-grab overflow-hidden rounded-xl ring-2 ring-slate-200 active:cursor-grabbing">
                  <img src={im.url} alt="" className="pointer-events-none h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCover(k)}
                    title="Use as cover"
                    className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${cover === k ? 'bg-gold-400 text-night-900' : 'bg-black/50 text-white'}`}
                  >
                    ★{cover === k ? ' Cover' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(k)}
                    aria-label="Remove photo"
                    className="absolute right-1.5 top-1.5 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white"
                  >
                    ✕
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </section>

      {/* Details */}
      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="card-title md:col-span-2">Plot details</h2>
        <label className="label md:col-span-2">
          Title *
          <input className="field" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="East-facing corner plot near ORR" />
        </label>
        <label className="label">
          Area / locality *
          <input className="field" value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="Shamshabad" />
        </label>
        <label className="label">
          City / district
          <input className="field" value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Hyderabad" />
        </label>
        <div className="label">
          Plot size *
          <div className="flex gap-2">
            <input
              className="field"
              type="number"
              min="0"
              step="any"
              value={f.area_value || ''}
              onChange={(e) => set('area_value', Number(e.target.value))}
              placeholder="200"
            />
            <select className="field max-w-[8rem]" value={f.area_unit} onChange={(e) => set('area_unit', e.target.value as AreaUnit)}>
              <option value="sqyd">sq.yards</option>
              <option value="sqft">sq.feet</option>
              <option value="acre">acres</option>
            </select>
          </div>
        </div>
        <label className="label">
          Total price (₹) *
          <input
            className="field"
            type="number"
            min="0"
            step="1000"
            value={f.price || ''}
            onChange={(e) => set('price', Number(e.target.value))}
            placeholder="6400000"
          />
          <span className="text-xs font-normal text-violet-600">
            {f.price > 0 ? `${formatINR(f.price)}${f.area_value > 0 ? ` · ${ratePer(f)}` : ''}` : 'Enter the full amount, e.g. 4500000 for ₹45 L'}
          </span>
        </label>
        <label className="label">
          Facing
          <select className="field" value={f.facing} onChange={(e) => set('facing', e.target.value)}>
            <option value="">Not specified</option>
            {FACINGS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Approval
          <input className="field" list="approvals" value={f.approval} onChange={(e) => set('approval', e.target.value)} placeholder="HMDA Approved" />
          <datalist id="approvals">
            {['HMDA Approved', 'DTCP Approved', 'GHMC Approved', 'RERA Registered', 'HMDA + RERA', 'Patta Land', 'Gram Panchayat'].map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </label>
        <label className="label md:col-span-2">
          Description
          <textarea
            className="field min-h-[120px]"
            value={f.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Roads, nearby landmarks, amenities, documents…"
          />
        </label>
        <div className="flex flex-wrap gap-6 md:col-span-2">
          <label className="label">
            Status
            <select className="field" value={f.status} onChange={(e) => set('status', e.target.value as PlotStatus)}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-5 w-5 accent-violet-600" checked={f.price_negotiable} onChange={(e) => set('price_negotiable', e.target.checked)} />
            Price negotiable
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-5 w-5 accent-violet-600" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} />
            Feature on home page
          </label>
        </div>
      </section>

      {/* Location */}
      <section className="card space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="card-title">Map location</h2>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={useMyLocation} className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
              📍 Use my current location
            </button>
            {hasPin && (
              <button
                type="button"
                onClick={() => {
                  set('latitude', null);
                  set('longitude', null);
                }}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600"
              >
                Remove pin
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500">Tap on the map to drop the pin where the plot is. Standing at the plot? Use your current location.</p>
        <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-slate-100" />}>
          <PlotMap
            lat={f.latitude ?? DEFAULT_CENTER.lat}
            lng={f.longitude ?? DEFAULT_CENTER.lng}
            zoom={hasPin ? 15 : 10}
            className="h-80"
            showPin={hasPin}
            onPick={(lat, lng) => {
              set('latitude', lat);
              set('longitude', lng);
            }}
          />
        </Suspense>
        <div className="grid grid-cols-2 gap-3">
          <label className="label">
            Latitude
            <input
              className="field"
              type="number"
              step="any"
              value={f.latitude ?? ''}
              onChange={(e) => set('latitude', e.target.value === '' ? null : Number(e.target.value))}
            />
          </label>
          <label className="label">
            Longitude
            <input
              className="field"
              type="number"
              step="any"
              value={f.longitude ?? ''}
              onChange={(e) => set('longitude', e.target.value === '' ? null : Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <Link to="/admin" className="rounded-full bg-white px-6 py-3 font-medium ring-1 ring-slate-200">
          Cancel
        </Link>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving & uploading photos…' : id ? 'Save changes' : 'Publish plot ✨'}
        </button>
      </div>
    </form>
  );
}
