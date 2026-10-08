import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Building2, House, BedDouble, GraduationCap, ArrowLeft, ArrowRight,
  Check, CheckCircle2, Save, LoaderCircle, Plus, Trash2, Sparkles, HelpCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import PhotoUpload from '../components/PhotoUpload';
import Select from '../components/Select';
import { PriceInput, PriceDisplay } from '../components/Pricing';
import { formatPrice, listingPrice } from '../utils/price';
import { properties } from '../data/properties';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, isDemo } from '../services/api';
import { readDemo, writeDemo } from '../services/demoStore';

const STEPS = [
  'Property Type',
  'Location',
  'Property Details',
  'Amenities',
  'Custom Fields',
  'Photos',
  'Pricing',
  'Preview'
];

const TITLES = [
  'What kind of place is it?',
  'Where is your property located?',
  'Tell us about your space.',
  'What amenities are available?',
  'Add custom details for your tenants.',
  'Let your space speak for itself.',
  'Set a price that works for you.',
  'One last look before you list.'
];

const SUBTITLES = [
  'Start with the type of accommodation or home you are listing.',
  'Help people find the right neighbourhood and locality.',
  'Fields update dynamically based on your chosen property type.',
  'Choose predefined amenities or add your own custom ones.',
  'Add any custom information (e.g. Food, Electricity, House Rules).',
  'Add clear, well-lit photos of the actual property.',
  'Give future residents a clear picture of the costs.',
  'Review your property details before submitting for approval.'
];

const STANDARD_AMENITIES_MAP = {
  'Flat': ['WiFi', 'Power Backup', 'Security', 'Lift', 'Parking', 'Gym', 'Balcony', 'CCTV', 'Water Supply'],
  'Apartment': ['WiFi', 'Power Backup', 'Security', 'Lift', 'Parking', 'Gym', 'Balcony', 'CCTV', 'Swimming Pool'],
  'Villa': ['Private Garden', 'Parking', 'Power Backup', 'Security', 'Balcony', 'CCTV', 'Modular Kitchen', 'Water Supply'],
  'House': ['Private Garden', 'Parking', 'Power Backup', 'Security', 'Balcony', 'CCTV', 'Water Supply'],
  'PG': ['WiFi', 'Food Included', 'AC', 'Cooler', 'Bed & Mattress', 'Wardrobe', 'Study Table', 'Laundry', 'CCTV', 'Security Guard', 'Geyser', 'Power Backup'],
  'Hostel': ['WiFi', 'All Meals Included', 'Laundry', 'CCTV', 'Security Guard', 'Biometric Entry', 'Library/Study Hall', 'Geyser', 'Power Backup'],
  'Student Flat': ['WiFi', 'Study Table', 'Wardrobe', 'Refrigerator', 'Kitchen Access', 'Power Backup', 'Parking', 'Geyser', 'Washing Machine']
};

const SUGGESTED_CUSTOM_FIELDS = {
  'Flat': [
    { name: 'Electricity', value: 'As per meter' },
    { name: 'Water', value: '24/7 Included' },
    { name: 'Food', value: 'Self-cooking' },
    { name: 'House Help', value: 'Available on request' }
  ],
  'Apartment': [
    { name: 'Clubhouse', value: 'Free access' },
    { name: 'Electricity', value: 'As per meter' },
    { name: 'Gas Pipeline', value: 'Available' },
    { name: 'Intercom', value: 'Connected' }
  ],
  'PG': [
    { name: 'Food', value: 'Yes – 3 Meals Included' },
    { name: 'Electricity', value: 'Included in rent' },
    { name: 'Cooler / AC', value: 'Cooler included, AC extra' },
    { name: 'Cooking Allowed', value: 'Self-cooking allowed' },
    { name: 'Curfew', value: '10:30 PM' },
    { name: 'Notice Period', value: '1 Month' }
  ],
  'Hostel': [
    { name: 'Food', value: 'Breakfast, Lunch & Dinner' },
    { name: 'Curfew', value: '10:00 PM' },
    { name: 'Visitor Policy', value: 'Allowed in lounge only' },
    { name: 'Campus Distance', value: '0.8 km' }
  ],
  'Villa': [
    { name: 'Floors', value: '2 Floors (Duplex)' },
    { name: 'Garden', value: 'Private landscaped garden' },
    { name: 'Pet Friendly', value: 'Yes' },
    { name: 'Servant Quarter', value: 'Available' }
  ],
  'Student Flat': [
    { name: 'University Distance', value: '1.2 km' },
    { name: 'Sharing Option', value: 'Available' },
    { name: 'Student Rules', value: 'Quiet hours after 11 PM' },
    { name: 'Appliances', value: 'Fridge & RO provided' }
  ]
};

const INITIAL = {
  name: '',
  type: 'Flat',
  listingFor: 'rent',
  location: '',
  city: '',
  state: '',
  pin: '',
  description: '',
  facilities: ['WiFi', 'Power Backup', 'Security', 'Parking'],
  images: [],
  rent: '',
  salePrice: '',
  deposit: '',
  maintenance: '',
  // Type-specific fields
  bedrooms: '2',
  bathrooms: '2',
  area: '1000',
  furnishing: 'Semi-Furnished',
  // PG / Hostel specific
  sharingType: 'Double Sharing',
  bedsPerRoom: '2',
  totalBeds: '12',
  bathroomType: 'Attached Bathroom',
  targetGender: 'Co-ed',
  foodStatus: 'Food Included (3 Meals)',
  cookingAllowed: 'Self-cooking allowed',
  curfew: '10:30 PM',
  visitorRules: 'Allowed during day',
  universityDistance: '1.0 km',
  // Villa specific
  floors: '2 Floors (Duplex)',
  garden: 'Private Garden',
  parkingType: 'Covered Parking',
  // Custom fields: array of { id, name, value }
  customFieldsList: [
    { id: 'cf-1', name: 'Food', value: 'Yes – Free' },
    { id: 'cf-2', name: 'Electricity', value: 'Included' },
    { id: 'cf-3', name: 'House Help', value: 'Available' }
  ]
};

export default function ListProperty() {
  const draft = () => readDemo('property-draft', null);
  const [form, setForm] = useState(() => ({ ...INITIAL, ...draft()?.form }));
  const [step, setStep] = useState(() => Math.min(draft()?.step || 0, 7));
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const set = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setError('');
  };

  const handleTypeChange = newType => {
    const amenities = STANDARD_AMENITIES_MAP[newType] || STANDARD_AMENITIES_MAP['Flat'];
    const defaultCustom = SUGGESTED_CUSTOM_FIELDS[newType] || SUGGESTED_CUSTOM_FIELDS['Flat'];
    setForm(prev => ({
      ...prev,
      type: newType,
      facilities: amenities.slice(0, 5),
      customFieldsList: defaultCustom.map((item, idx) => ({ id: `cf-${Date.now()}-${idx}`, ...item }))
    }));
  };

  const addCustomField = (name = '', value = '') => {
    const newField = { id: `cf-${Date.now()}`, name, value };
    setForm(prev => ({
      ...prev,
      customFieldsList: [...prev.customFieldsList, newField]
    }));
  };

  const updateCustomField = (id, key, val) => {
    setForm(prev => ({
      ...prev,
      customFieldsList: prev.customFieldsList.map(item =>
        item.id === id ? { ...item, [key]: val } : item
      )
    }));
  };

  const removeCustomField = id => {
    setForm(prev => ({
      ...prev,
      customFieldsList: prev.customFieldsList.filter(item => item.id !== id)
    }));
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (!form.facilities.includes(trimmed)) {
      set('facilities', [...form.facilities, trimmed]);
      toast(`Added amenity: ${trimmed}`);
    }
    setCustomAmenityInput('');
  };

  const saveDraft = () => {
    try {
      writeDemo('property-draft', { form, step });
      toast('Draft saved on this device');
      return true;
    } catch {
      setError('Your draft could not be saved. Try fewer or smaller photos.');
      return false;
    }
  };

  const field = (key, label, type = 'text', props = {}) => (
    <label>
      {label}
      <input
        type={type}
        value={form[key] ?? ''}
        onChange={event => set(key, event.target.value)}
        required
        {...props}
      />
    </label>
  );

  const go = next => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setError('');
  };

  const submit = async event => {
    event.preventDefault();
    setError('');

    if (step === 1 && !/^\d{6}$/.test(form.pin)) {
      setError('Enter a valid 6-digit PIN code.');
      return;
    }
    if (step === 5 && !form.images.length) {
      setError('Add at least one property photo to continue.');
      return;
    }
    if (step < 7) {
      go(step + 1);
      return;
    }

    if (!user || !['Property Manager', 'Admin'].includes(user.role)) {
      if (saveDraft()) navigate('/login?role=Property%20Manager&next=%2Flist-property');
      return;
    }

    setBusy(true);
    try {
      // Build dynamic custom fields map
      const customFieldsMap = {};
      (form.customFieldsList || []).forEach(item => {
        if (item.name && item.name.trim()) {
          customFieldsMap[item.name.trim()] = item.value?.trim() || 'Yes';
        }
      });

      // Also attach type-specific metadata into customFields if relevant
      if (form.type === 'PG' || form.type === 'Hostel') {
        customFieldsMap['Sharing'] = form.sharingType;
        customFieldsMap['Beds per room'] = form.bedsPerRoom;
        customFieldsMap['Bathroom'] = form.bathroomType;
        customFieldsMap['Food'] = form.foodStatus;
        customFieldsMap['Cooking'] = form.cookingAllowed;
        customFieldsMap['Curfew'] = form.curfew;
        customFieldsMap['Visitor Policy'] = form.visitorRules;
        customFieldsMap['Gender'] = form.targetGender;
        customFieldsMap['University Distance'] = form.universityDistance;
      } else if (form.type === 'Villa' || form.type === 'House') {
        customFieldsMap['Floors'] = form.floors;
        customFieldsMap['Garden'] = form.garden;
        customFieldsMap['Parking Type'] = form.parkingType;
      } else if (form.type === 'Student Flat') {
        customFieldsMap['Sharing Option'] = form.sharingType;
        customFieldsMap['University Distance'] = form.universityDistance;
      }

      const data = {
        title: form.name,
        name: form.name,
        type: form.type,
        listingFor: form.listingFor,
        location: `${form.location}, ${form.city}`,
        city: form.city,
        state: form.state,
        pin: form.pin,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        area: form.area ? Number(form.area) : null,
        areaSqft: form.area ? Number(form.area) : null,
        rent: Number(form.rent),
        rentMonthly: Number(form.rent),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        deposit: form.deposit === '' ? null : Number(form.deposit),
        maintenance: form.maintenance === '' ? null : Number(form.maintenance),
        furnishing: form.furnishing,
        description: form.description,
        facilities: form.facilities,
        customFields: customFieldsMap,
        image: form.images[0],
        imageUrl: form.images[0],
        owner: user.name,
        ownerEmail: user.email
      };

      await api.createProperty(data);
      writeDemo('property-draft', null);
      setSuccess(true);
      toast('Listing submitted for review');
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    } catch (err) {
      setError(err?.message || 'Couldn’t submit the listing. Your details are still here. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const similar = properties
    .filter(
      p =>
        p.city?.toLowerCase() === form.city?.trim().toLowerCase() &&
        p.type === form.type &&
        p.listingFor === form.listingFor
    )
    .map(listingPrice)
    .filter(Number.isFinite);

  if (success) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="wizard-container wizard-success">
          <CheckCircle2 size={54} />
          <h1>Your listing is ready for review.</h1>
          <p>
            {isDemo
              ? 'Your demo listing is saved on this device and marked Pending.'
              : 'Your listing has been submitted to MySQL database. You can track its status in your dashboard.'}
          </p>
          <Link
            to={user?.role === 'Admin' ? '/admin' : '/manager?tab=My%20Listings'}
            className="primary-button"
          >
            View your listings
          </Link>
        </main>
      </>
    );
  }

  const standardAmenities = STANDARD_AMENITIES_MAP[form.type] || STANDARD_AMENITIES_MAP['Flat'];
  const suggestedFields = SUGGESTED_CUSTOM_FIELDS[form.type] || SUGGESTED_CUSTOM_FIELDS['Flat'];

  return (
    <>
      <Navbar />
      <main id="main-content" className="wizard-container">
        <div className="wizard-header">
          <div>
            <h1>List your property</h1>
            <p>A few details now. A better match tomorrow.</p>
          </div>
          <button className="outline-button" onClick={saveDraft} disabled={busy}>
            <Save size={14} />
            Save draft
          </button>
        </div>

        <div
          className="wizard-progress"
          role="progressbar"
          aria-label="Listing completion"
          aria-valuemin="0"
          aria-valuemax="8"
          aria-valuenow={step + 1}
        >
          <motion.span
            animate={{ width: `${((step + 1) / 8) * 100}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>

        <div className="wizard-layout">
          <aside className="wizard-steps" aria-label="Listing steps">
            {STEPS.map((title, index) => (
              <div
                key={title}
                className={
                  index === step
                    ? 'wizard-step--active'
                    : index < step
                    ? 'wizard-step--complete'
                    : ''
                }
                aria-current={index === step ? 'step' : undefined}
              >
                <span>{index < step ? <Check size={14} /> : index + 1}</span>
                {title}
              </div>
            ))}
          </aside>

          <form onSubmit={submit} className="wizard-card" aria-busy={busy}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={{
                  enter: d => ({ opacity: 0, x: reduced ? 0 : d * 15 }),
                  center: { opacity: 1, x: 0 },
                  exit: d => ({ opacity: 0, x: reduced ? 0 : -d * 15 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18 }}
              >
                <span className="eyebrow">STEP {step + 1} OF 8</span>
                <h2>{TITLES[step]}</h2>
                <p className="wizard-subtitle">{SUBTITLES[step]}</p>

                {/* STEP 0: PROPERTY TYPE */}
                {step === 0 && (
                  <>
                    <div className="listing-category-row">
                      {[
                        ['rent', 'For rent'],
                        ['buy', 'For sale']
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={form.listingFor === value}
                          className={form.listingFor === value ? 'category-tab--active' : ''}
                          onClick={() => set('listingFor', value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="choice-grid">
                      {[
                        ['Flat', Building2],
                        ['Apartment', Building2],
                        ['PG', GraduationCap],
                        ['Hostel', BedDouble],
                        ['Villa', House],
                        ['Student Flat', GraduationCap],
                        ['House', House],
                        ['Studio', BedDouble]
                      ].map(([type, Icon]) => (
                        <button
                          type="button"
                          className={`choice-card ${
                            form.type === type ? 'property-type--selected' : ''
                          }`}
                          key={type}
                          onClick={() => handleTypeChange(type)}
                          aria-pressed={form.type === type}
                        >
                          <Icon size={25} strokeWidth={1.5} />
                          {type}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* STEP 1: LOCATION */}
                {step === 1 && (
                  <div className="premium-form">
                    {field('location', 'Street address / Locality', 'text', {
                      placeholder: 'House/Building, street, sector or landmark'
                    })}
                    <div className="form-two-columns">
                      {field('city', 'City', 'text', { placeholder: 'e.g. Noida, Delhi' })}
                      {field('state', 'State', 'text', { placeholder: 'e.g. Uttar Pradesh' })}
                    </div>
                    {field('pin', 'PIN code', 'text', {
                      inputMode: 'numeric',
                      pattern: '[0-9]{6}',
                      maxLength: 6,
                      placeholder: '6-digit PIN code'
                    })}
                  </div>
                )}

                {/* STEP 2: DYNAMIC PROPERTY-TYPE FIELDS */}
                {step === 2 && (
                  <div className="premium-form">
                    {field('name', 'Listing Title', 'text', {
                      placeholder:
                        form.type === 'PG'
                          ? 'e.g. Comfort Stay Luxury Boys PG'
                          : form.type === 'Hostel'
                          ? 'e.g. Sunrise Student Hostel near Campus'
                          : 'e.g. Spacious 2 BHK Apartment in Sector 62',
                      maxLength: 85
                    })}

                    {/* FLAT / APARTMENT / STUDIO SPECIFIC FIELDS */}
                    {(form.type === 'Flat' || form.type === 'Apartment' || form.type === 'Studio') && (
                      <>
                        <div className="form-two-columns">
                          {field('bedrooms', 'Bedrooms', 'number', { min: 1, max: 20 })}
                          {field('bathrooms', 'Bathrooms', 'number', { min: 1, max: 20 })}
                        </div>
                        <div className="form-two-columns">
                          {field('area', 'Square Feet (sq.ft)', 'number', { min: 50, max: 100000 })}
                          <Select
                            label="Furnishing"
                            value={form.furnishing}
                            onChange={val => set('furnishing', val)}
                            options={['Unfurnished', 'Semi-Furnished', 'Fully Furnished']}
                          />
                        </div>
                      </>
                    )}

                    {/* PG SPECIFIC FIELDS */}
                    {form.type === 'PG' && (
                      <>
                        <div className="form-two-columns">
                          <Select
                            label="Sharing Type"
                            value={form.sharingType}
                            onChange={val => set('sharingType', val)}
                            options={['Single Room', 'Double Sharing', 'Triple Sharing', 'Four Sharing']}
                          />
                          {field('bedsPerRoom', 'Beds per Room', 'number', { min: 1, max: 10 })}
                        </div>
                        <div className="form-two-columns">
                          <Select
                            label="Bathroom Type"
                            value={form.bathroomType}
                            onChange={val => set('bathroomType', val)}
                            options={['Attached Bathroom', 'Common Bathroom']}
                          />
                          <Select
                            label="Target Resident"
                            value={form.targetGender}
                            onChange={val => set('targetGender', val)}
                            options={['Boys Only', 'Girls Only', 'Co-ed']}
                          />
                        </div>
                        <div className="form-two-columns">
                          <Select
                            label="Food & Meals"
                            value={form.foodStatus}
                            onChange={val => set('foodStatus', val)}
                            options={[
                              'Food Included (3 Meals)',
                              'Breakfast & Dinner',
                              'Self Cooking / Kitchen Allowed',
                              'Food Not Included'
                            ]}
                          />
                          {field('curfew', 'Curfew / Gate Closing', 'text', {
                            placeholder: 'e.g. 10:30 PM or No Curfew'
                          })}
                        </div>
                        <div className="form-two-columns">
                          {field('universityDistance', 'Distance to Campus / Metro', 'text', {
                            placeholder: 'e.g. 0.8 km'
                          })}
                          <Select
                            label="Furnishing"
                            value={form.furnishing}
                            onChange={val => set('furnishing', val)}
                            options={['Fully Furnished (Bed, Desk, Wardrobe)', 'Semi-Furnished']}
                          />
                        </div>
                      </>
                    )}

                    {/* HOSTEL SPECIFIC FIELDS */}
                    {form.type === 'Hostel' && (
                      <>
                        <div className="form-two-columns">
                          <Select
                            label="Room Sharing Type"
                            value={form.sharingType}
                            onChange={val => set('sharingType', val)}
                            options={['Single Room', 'Double Sharing', 'Triple Sharing', 'Dormitory']}
                          />
                          {field('totalBeds', 'Total Available Beds', 'number', { min: 1, max: 500 })}
                        </div>
                        <div className="form-two-columns">
                          <Select
                            label="Meal Plan"
                            value={form.foodStatus}
                            onChange={val => set('foodStatus', val)}
                            options={[
                              'All 3 Meals Included (Veg)',
                              'All 3 Meals Included (Veg & Non-Veg)',
                              'Breakfast & Dinner',
                              'Optional / Pay per meal'
                            ]}
                          />
                          {field('curfew', 'Hostel Curfew Time', 'text', {
                            placeholder: 'e.g. 10:00 PM'
                          })}
                        </div>
                        <div className="form-two-columns">
                          {field('universityDistance', 'Distance to Campus (km)', 'text', {
                            placeholder: 'e.g. 0.5 km'
                          })}
                          <Select
                            label="Resident Type"
                            value={form.targetGender}
                            onChange={val => set('targetGender', val)}
                            options={['Boys Hostel', 'Girls Hostel', 'Co-ed Hostel']}
                          />
                        </div>
                      </>
                    )}

                    {/* VILLA / HOUSE SPECIFIC FIELDS */}
                    {(form.type === 'Villa' || form.type === 'House') && (
                      <>
                        <div className="form-two-columns">
                          {field('bedrooms', 'Bedrooms', 'number', { min: 1, max: 20 })}
                          {field('bathrooms', 'Bathrooms', 'number', { min: 1, max: 20 })}
                        </div>
                        <div className="form-two-columns">
                          {field('area', 'Total Built-up Area (sq.ft)', 'number', { min: 100, max: 100000 })}
                          <Select
                            label="Number of Floors"
                            value={form.floors}
                            onChange={val => set('floors', val)}
                            options={['Independent Ground Floor', '2 Floors (Duplex)', '3+ Floors (Triplex)']}
                          />
                        </div>
                        <div className="form-two-columns">
                          <Select
                            label="Garden"
                            value={form.garden}
                            onChange={val => set('garden', val)}
                            options={['Private Landscaped Garden', 'Common Garden', 'No Garden']}
                          />
                          <Select
                            label="Parking"
                            value={form.parkingType}
                            onChange={val => set('parkingType', val)}
                            options={['Covered Parking (2+ Cars)', 'Covered Parking (1 Car)', 'Open Parking']}
                          />
                        </div>
                      </>
                    )}

                    {/* STUDENT FLAT SPECIFIC FIELDS */}
                    {form.type === 'Student Flat' && (
                      <>
                        <div className="form-two-columns">
                          {field('bedrooms', 'Bedrooms in Flat', 'number', { min: 1, max: 10 })}
                          {field('bathrooms', 'Bathrooms', 'number', { min: 1, max: 10 })}
                        </div>
                        <div className="form-two-columns">
                          <Select
                            label="Rental Mode"
                            value={form.sharingType}
                            onChange={val => set('sharingType', val)}
                            options={['Entire Flat for Group', 'Room-by-Room Sharing']}
                          />
                          {field('universityDistance', 'Distance to College', 'text', {
                            placeholder: 'e.g. 1.5 km'
                          })}
                        </div>
                        <div className="form-two-columns">
                          <Select
                            label="Furnishing"
                            value={form.furnishing}
                            onChange={val => set('furnishing', val)}
                            options={['Fully Furnished with Beds & Desks', 'Semi-Furnished']}
                          />
                          {field('area', 'Area (sq.ft)', 'number', { min: 100, max: 10000 })}
                        </div>
                      </>
                    )}

                    <label>
                      Description
                      <textarea
                        required
                        minLength={20}
                        rows={4}
                        placeholder={
                          form.type === 'PG' || form.type === 'Hostel'
                            ? 'Mention room details, food quality, nearby colleges, curfew and house rules.'
                            : 'What should someone know about living here? Mention transport, sunlight, neighbours and locality.'
                        }
                        value={form.description}
                        onChange={event => set('description', event.target.value)}
                      />
                    </label>
                  </div>
                )}

                {/* STEP 3: AMENITIES (STANDARD + CUSTOM) */}
                {step === 3 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-3">
                      Select amenities available for {form.type}:
                    </p>
                    <div className="facility-options">
                      {standardAmenities.map(amenity => (
                        <label key={amenity}>
                          <input
                            type="checkbox"
                            checked={form.facilities.includes(amenity)}
                            onChange={() =>
                              set(
                                'facilities',
                                form.facilities.includes(amenity)
                                  ? form.facilities.filter(item => item !== amenity)
                                  : [...form.facilities, amenity]
                              )
                            }
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>

                    {/* + Add Custom Amenity */}
                    <div className="mt-6 pt-5 border-t border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        + Add Custom Amenity
                      </h4>
                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          placeholder="e.g. Induction Cooker, Rooftop Lounge, Table Tennis"
                          value={customAmenityInput}
                          onChange={e => setCustomAmenityInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomAmenity();
                            }
                          }}
                          className="flex-1 px-3 py-2 border rounded-md text-sm"
                        />
                        <button
                          type="button"
                          className="primary-button text-sm py-2 px-4"
                          onClick={addCustomAmenity}
                        >
                          <Plus size={15} /> Add
                        </button>
                      </div>

                      {form.facilities.filter(f => !standardAmenities.includes(f)).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-xs text-slate-400 self-center">Custom added:</span>
                          {form.facilities
                            .filter(f => !standardAmenities.includes(f))
                            .map(item => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() =>
                                    set('facilities', form.facilities.filter(f => f !== item))
                                  }
                                  className="hover:text-red-600"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: + ADD CUSTOM FIELD (DYNAMIC & UNLIMITED) */}
                {step === 4 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          Custom Property Fields
                        </h3>
                        <p className="text-xs text-slate-500">
                          Add custom information that is not in the standard form (e.g. Food, Electricity, House Help).
                        </p>
                      </div>
                      <button
                        type="button"
                        className="primary-button text-xs py-1.5 px-3 flex items-center gap-1"
                        onClick={() => addCustomField('', '')}
                      >
                        <Plus size={14} /> Add Custom Field
                      </button>
                    </div>

                    {/* Pre-fill suggestion buttons */}
                    <div className="mb-4 flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Sparkles size={12} /> Suggestions:
                      </span>
                      {suggestedFields.map(s => (
                        <button
                          key={s.name}
                          type="button"
                          className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                          onClick={() => {
                            if (!form.customFieldsList.some(item => item.name === s.name)) {
                              addCustomField(s.name, s.value);
                            } else {
                              toast(`Field "${s.name}" already added`);
                            }
                          }}
                        >
                          + {s.name}
                        </button>
                      ))}
                    </div>

                    {/* List of custom fields */}
                    <div className="space-y-3">
                      {form.customFieldsList.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <label className="text-xs font-medium text-slate-500 block mb-1">
                              Field Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Food, Curfew, Generator"
                              value={item.name}
                              onChange={e => updateCustomField(item.id, 'name', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="text-xs font-medium text-slate-500 block mb-1">
                              Field Value
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Yes – Free, Included, 10:30 PM"
                              value={item.value}
                              onChange={e => updateCustomField(item.id, 'value', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeCustomField(item.id)}
                            className="text-slate-400 hover:text-red-500 p-2 mt-4 transition"
                            aria-label="Remove custom field"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      {form.customFieldsList.length === 0 && (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
                          <p className="text-sm text-slate-500">
                            No custom fields added yet. Click <strong>+ Add Custom Field</strong> above to add custom information.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 5: PHOTOS */}
                {step === 5 && (
                  <PhotoUpload
                    images={form.images}
                    onChange={images => set('images', images)}
                    busy={busy}
                    setBusy={setBusy}
                    onError={setError}
                  />
                )}

                {/* STEP 6: PRICING */}
                {step === 6 && (
                  <div className="premium-form">
                    <PriceInput
                      label={form.listingFor === 'buy' ? 'Asking price' : 'Monthly rent'}
                      value={form.listingFor === 'buy' ? form.salePrice : form.rent}
                      onChange={value =>
                        set(form.listingFor === 'buy' ? 'salePrice' : 'rent', value)
                      }
                      min={form.listingFor === 'buy' ? 100000 : 1000}
                      max={1000000000}
                      required
                    />
                    <div className="wizard-price-preview">
                      <PriceDisplay property={form} />
                      {similar.length > 1 && (
                        <small>
                          Sample listings in {form.city}:{' '}
                          {formatPrice(Math.min(...similar), { mode: form.listingFor })}–
                          {formatPrice(Math.max(...similar), { mode: form.listingFor })}. Not a market valuation.
                        </small>
                      )}
                    </div>
                    {form.listingFor !== 'buy' && (
                      <>
                        <div className="form-two-columns">
                          <PriceInput
                            label="Security deposit (optional)"
                            value={form.deposit}
                            onChange={value => set('deposit', value)}
                          />
                          <PriceInput
                            label="Monthly maintenance (optional)"
                            value={form.maintenance}
                            onChange={value => set('maintenance', value)}
                          />
                        </div>
                        {form.rent && form.maintenance !== '' && (
                          <p className="form-notice">
                            Total monthly cost:{' '}
                            <strong>
                              {formatPrice(Number(form.rent) + Number(form.maintenance))}
                            </strong>
                            . The refundable deposit is separate.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* STEP 7: PREVIEW */}
                {step === 7 && (
                  <>
                    <div className="max-w-sm">
                      <PropertyCard
                        preview
                        property={{
                          ...form,
                          id: 'draft-preview',
                          image: form.images[0],
                          rent: Number(form.rent),
                          salePrice: Number(form.salePrice),
                          status: 'Pending',
                          verified: false,
                          location: `${form.location}, ${form.city}`
                        }}
                      />
                    </div>

                    <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        {form.type} Details Preview:
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">{form.description}</p>

                      <div className="amenity-chips mb-4">
                        {form.facilities.map(facility => (
                          <span key={facility}>{facility}</span>
                        ))}
                      </div>

                      {form.customFieldsList.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Additional Details (Custom Fields):
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {form.customFieldsList.map(item => (
                              <div
                                key={item.id}
                                className="flex justify-between p-2 bg-white rounded border border-slate-100"
                              >
                                <span className="text-slate-500 font-medium">{item.name}:</span>
                                <span className="text-slate-800 font-semibold">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {form.listingFor !== 'buy' && (
                      <div className="detail-costs mt-3">
                        {form.deposit !== '' && (
                          <p>Security deposit: {formatPrice(form.deposit)}</p>
                        )}
                        {form.maintenance !== '' && (
                          <p>Maintenance: {formatPrice(form.maintenance)}/month</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="form-error mt-5" role="alert">
                {error}
              </p>
            )}

            <div className="wizard-footer">
              <button
                type="button"
                className="outline-button"
                disabled={busy}
                onClick={() => (step ? go(step - 1) : navigate('/'))}
              >
                <ArrowLeft size={15} />
                {step ? 'Back' : 'Cancel'}
              </button>
              <button className="primary-button" disabled={busy}>
                {busy ? (
                  <>
                    <LoaderCircle size={16} className="button-spinner" />
                    Please wait…
                  </>
                ) : step === 7 ? (
                  user && ['Property Manager', 'Admin'].includes(user.role) ? (
                    'Submit for review'
                  ) : (
                    'Sign in to submit'
                  )
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
