import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, Select, TextArea, Toggle } from '../../components/ui/Field';
import { Panel } from '../../components/ui/Surface';
import { Badge, Rating } from '../../components/ui/Badge';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, RowSkeleton } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';
import { useApi, useDebounced } from '../../hooks/useApi';
import { hotels as hotelApi } from '../../api/endpoints';
import { useToast } from '../../context/toast-context';
import { CATEGORY_META } from '../../lib/constants';
import { currency } from '../../lib/format';

const EMPTY_FORM = {
  name: '', city: '', country: '', continent: 'Europe', category: 'luxury',
  starRating: 5, basePrice: 400, description: '', featured: false,
};

const CONTINENTS = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Middle East'];

const HotelForm = ({ open, onClose, editing, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadedFor, setLoadedFor] = useState(null);

  // Seed the form once per opened record rather than on every render.
  if (open && loadedFor !== (editing?.id || 'new')) {
    setForm(editing ? { ...EMPTY_FORM, ...editing } : EMPTY_FORM);
    setErrors({});
    setLoadedFor(editing?.id || 'new');
  }
  if (!open && loadedFor !== null) setLoadedFor(null);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        name: form.name,
        city: form.city,
        country: form.country,
        continent: form.continent,
        category: form.category,
        starRating: Number(form.starRating),
        basePrice: Number(form.basePrice),
        description: form.description,
        featured: Boolean(form.featured),
      };

      if (editing) await hotelApi.update(editing.id, payload);
      else await hotelApi.create(payload);

      toast.success(editing ? 'Hotel updated.' : 'Hotel added to the collection.');
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.details || {});
      toast.error(err.message || 'Could not save that hotel.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${editing.name}` : 'Add a hotel'}
      description={
        editing
          ? 'Changing the base rate re-prices every room tier proportionally.'
          : 'Three room tiers are generated from the base rate.'
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>
            {editing ? 'Save changes' : 'Create hotel'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Hotel name"
          className="sm:col-span-2"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />
        <Field label="City" value={form.city} onChange={set('city')} error={errors.city} />
        <Field label="Country" value={form.country} onChange={set('country')} error={errors.country} />
        <Select
          label="Region"
          value={form.continent}
          onChange={set('continent')}
          error={errors.continent}
          options={CONTINENTS.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Style"
          value={form.category}
          onChange={set('category')}
          error={errors.category}
          options={Object.entries(CATEGORY_META).map(([value, meta]) => ({
            value,
            label: meta.label,
          }))}
        />
        <Select
          label="Star rating"
          value={form.starRating}
          onChange={set('starRating')}
          error={errors.starRating}
          options={[5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star` }))}
        />
        <Field
          label="Base nightly rate (USD)"
          type="number"
          min="20"
          value={form.basePrice}
          onChange={set('basePrice')}
          error={errors.basePrice}
          hint="Deluxe room rate; suites scale from this."
        />
        <TextArea
          label="Description"
          className="sm:col-span-2"
          rows={4}
          value={form.description}
          onChange={set('description')}
          error={errors.description}
          hint="At least 20 characters."
        />
        <div className="sm:col-span-2">
          <Toggle
            checked={Boolean(form.featured)}
            onChange={(featured) => setForm({ ...form, featured })}
            label="Feature on the home page"
            description="Featured hotels appear in Editor’s picks and sort first."
          />
        </div>
      </form>
    </Modal>
  );
};

const AdminHotels = () => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [working, setWorking] = useState(false);

  const debounced = useDebounced(query, 350);
  const { data, loading, error, refetch } = useApi(
    () => hotelApi.list({ q: debounced, page, limit: 10, sort: 'name' }),
    [debounced, page]
  );

  const toggleActive = async (hotel) => {
    try {
      await hotelApi.update(hotel.id, { active: !hotel.active });
      toast.success(hotel.active ? `${hotel.name} hidden from guests.` : `${hotel.name} is live again.`);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update that hotel.');
    }
  };

  const remove = async () => {
    setWorking(true);
    try {
      const result = await hotelApi.remove(deleting.id);
      toast.success(result.message || 'Hotel deleted.');
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not delete that hotel.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Field
          icon={Search}
          placeholder="Search hotels by name, city or country"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="min-w-56 flex-1"
        />
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add hotel
        </Button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading ? (
        <RowSkeleton rows={6} />
      ) : data?.hotels.length === 0 ? (
        <Panel>
          <EmptyState icon={Building2} title="No hotels match" message="Try a different search." />
        </Panel>
      ) : (
        <div className="space-y-3">
          {data.hotels.map((hotel) => (
            <Panel key={hotel.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                loading="lazy"
                className="h-28 w-full shrink-0 rounded-2xl object-cover ring-1 ring-ink-900/10 lg:size-20"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/hotels/${hotel.id}`}
                    className="font-semibold text-ink-900 transition-colors hover:text-brand-600"
                  >
                    {hotel.name}
                  </Link>
                  {hotel.featured && <Badge tone="gold">Featured</Badge>}
                  {!hotel.active && <Badge tone="rose">Hidden</Badge>}
                </div>
                <p className="text-sm text-ink-600">
                  {hotel.city}, {hotel.country} · {hotel.continent} ·{' '}
                  {CATEGORY_META[hotel.category]?.label || hotel.category}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-4">
                  <Rating value={hotel.rating} count={hotel.reviewsCount} />
                  <span className="text-sm text-ink-600">
                    from <span className="font-medium text-ink-900">{currency(hotel.basePrice)}</span>
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="subtle"
                  icon={Pencil}
                  onClick={() => {
                    setEditing(hotel);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="ghost" icon={Power} onClick={() => toggleActive(hotel)}>
                  {hotel.active ? 'Hide' : 'Publish'}
                </Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleting(hotel)}>
                  Delete
                </Button>
              </div>
            </Panel>
          ))}

          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onChange={setPage}
            className="pt-6"
          />
        </div>
      )}

      <HotelForm
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={working}
        title={`Delete ${deleting?.name}?`}
        confirmLabel="Delete hotel"
        message="If the hotel still has live bookings it will be deactivated instead of deleted, so guest records keep pointing at a real property."
      />
    </div>
  );
};

export default AdminHotels;
