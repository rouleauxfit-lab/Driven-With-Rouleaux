import React, { useState } from "react";

const INBOX_EMAIL = "rouleauxfit@gmail.com";
const SHARED_THREAD_SUBJECT = "Drive With Rouleaux Lead Inbox";
const FORM_ENDPOINT = "https://formspree.io/f/mykollao";
const FORM_DEBUG_MODE = false;

const ATMOSPHERE_IMAGE_URL = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1800&auto=format&fit=crop";
const HERO_IMAGE_URL = "";
const BRAND_IMAGE_URL = "/dwr-logo.jpeg";
const INSTAGRAM_URL = "https://www.instagram.com/drivewithrouleaux?igsh=MXRpaWp6eGQxemswcg%3D%3D&utm_source=qr";
const LINKEDIN_URL = "https://www.linkedin.com/in/michael-roulo-969705234?utm_source=share_via&utm_content=profile&utm_medium=member_ios";

const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  vehicle: "",
  budget: "",
  trade: "",
  timing: "",
  shoppingFor: "",
  message: "",
  newsletterOptIn: true,
};

const GARAGE_LABELS = ["VIN: DWR-001", "Market read", "Trade check", "Payment path"];

const LIVE_STATS = [
  { label: "Years Selling", value: "5+" },
  { label: "Clients Helped", value: "1000+" },
  { label: "Response Speed", value: "Fast" },
];

const FEATURE_CARDS = [
  {
    icon: "message",
    title: "Real answers",
    action: "Ask a question",
    prefill: "I have a car-buying question and want some straight guidance.",
    text: "Ask the payment, trade, lease, credit, or inventory questions before you waste a Saturday.",
  },
  {
    icon: "shield",
    title: "Less guessing",
    action: "Map my options",
    prefill: "I want help narrowing down what makes sense for my budget, timing, and lifestyle.",
    text: "Get a cleaner idea of what makes sense for your budget, timing, and lifestyle.",
  },
  {
    icon: "pin",
    title: "Local help",
    action: "Get local help",
    prefill: "I want help shopping in the St. Louis / Missouri market.",
    text: "Built for people shopping in the St. Louis / Missouri market and beyond.",
  },
];

const STEPS = [
  {
    title: "Tell me the car",
    text: "You tell me what you're trying to accomplish, even if you're not fully sure yet.",
  },
  {
    title: "Send the basics",
    text: "Budget, trade, timing, financing worries, weird edge cases... all fair game.",
  },
  {
    title: "I help map the move",
    text: "I help narrow the path so the process feels clearer and less chaotic.",
  },
];

const TRUST_POINTS = [
  "5+ years automotive sales experience",
  "Performance-focused vehicle matching",
  "Real-world lease & trade guidance",
  "No pressure conversations",
];

const NEWSLETTER_TOPICS = [
  "Best deals worth watching",
  "Trade-in timing tips",
  "Lease and finance reality checks",
  "Mike's weekly market take",
];

const FAQS = [
  {
    question: "Do I have to buy from your dealership?",
    answer: "Nope. This is meant to help people navigate the process smarter, whether they buy from me directly or just need guidance.",
  },
  {
    question: "Can you help with bad credit or tricky situations?",
    answer: "Absolutely. Sometimes people just need a realistic game plan instead of getting bounced around between dealers.",
  },
  {
    question: "Can I text instead of emailing?",
    answer: "Definitely. The site is really just the launch ramp. Texting is usually faster once we connect.",
  },
];

function clean(value) {
  return String(value || "").trim();
}

function buildEmailBody(form) {
  const safeForm = { ...INITIAL_FORM, ...(form || {}) };

  return `NEW AUTO REQUEST\n\nName: ${clean(safeForm.name)}\nPhone: ${clean(safeForm.phone)}\nEmail: ${clean(safeForm.email)}
Newsletter Opt-In: ${safeForm.newsletterOptIn ? "Yes" : "No"}
Shopping For: ${clean(safeForm.shoppingFor)}\nVehicle Wanted: ${clean(safeForm.vehicle)}\nBudget / Payment Goal: ${clean(safeForm.budget)}\nTrade-In: ${clean(safeForm.trade)}\nTiming: ${clean(safeForm.timing)}\n\nMessage:\n${clean(safeForm.message)}\n\n---\nSent from the Drive With Rouleaux website.`;
}

function buildLeadPayload(form) {
  const safeForm = { ...INITIAL_FORM, ...(form || {}) };
  const leadId = `DWR-${Date.now()}`;

  return {
    _subject: `${SHARED_THREAD_SUBJECT} - ${leadId}`,
    leadId,
    _replyto: clean(safeForm.email),
    brand: "Drive With Rouleaux",
    name: clean(safeForm.name),
    phone: clean(safeForm.phone),
    email: clean(safeForm.email),
    newsletterOptIn: Boolean(safeForm.newsletterOptIn),
    newsletterStatus: safeForm.newsletterOptIn ? "Add to weekly newsletter list" : "Do not add to newsletter list",
    shoppingFor: clean(safeForm.shoppingFor),
    vehicle: clean(safeForm.vehicle),
    budget: clean(safeForm.budget),
    trade: clean(safeForm.trade),
    timing: clean(safeForm.timing),
    message: clean(safeForm.message),
    leadSummary: `${buildEmailBody(safeForm)}\n\nLead ID: ${leadId}`,
  };
}

function getValidationError(form) {
  const hasName = clean(form.name).length > 1;
  const hasContact = clean(form.phone).length > 6 || clean(form.email).includes("@");
  const hasVehicleIntent = clean(form.vehicle).length > 1 || clean(form.shoppingFor).length > 1;

  if (!hasName) return "Add a name before sending.";
  if (!hasContact) return "Add a phone number or email so the lead can be contacted.";
  if (!hasVehicleIntent) return "Add what they are shopping for or a vehicle they want.";
  return "";
}

async function sendLead(form) {
  if (!FORM_ENDPOINT) throw new Error("FORM_ENDPOINT_MISSING");

  const payload = buildLeadPayload(form);
  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    const formspreeMessage = result?.errors?.[0]?.message || result?.error || "Form submission failed.";
    throw new Error(`SUBMIT_FAILED_${response.status}: ${formspreeMessage}`);
  }

  return { response, result, leadId: payload.leadId };
}

function runSmokeTests() {
  const testForm = {
    name: "Test Lead",
    phone: "555-123-4567",
    email: "testlead@example.com",
    vehicle: "Ford F-150",
    shoppingFor: "Used vehicle",
  };
  const emailBody = buildEmailBody(testForm);
  const payload = buildLeadPayload(testForm);

  console.assert(emailBody.includes("NEW AUTO REQUEST"), "Email body should include the lead heading.");
  console.assert(payload._subject.includes(SHARED_THREAD_SUBJECT), "Payload should include the shared email subject.");
  console.assert(payload.leadId.startsWith("DWR-"), "Payload should include a unique lead ID.");
  console.assert(payload.email === "testlead@example.com", "Payload should include customer email.");
  console.assert(getValidationError(testForm) === "", "Valid test form should pass validation.");
  console.assert(getValidationError(INITIAL_FORM).length > 0, "Empty form should fail validation.");
  console.assert(FEATURE_CARDS.length === 3, "There should be exactly three feature cards.");
  console.assert(FEATURE_CARDS.every((card) => card.action && card.prefill), "Every feature card should have a functional action and form prefill.");
  console.assert(STEPS.length === 3, "There should be exactly three process steps.");
  console.assert(TRUST_POINTS.length >= 4, "There should be at least four trust points.");
  console.assert(FAQS.length >= 3, "There should be at least three FAQ items.");
  console.assert(LIVE_STATS.length === 3, "There should be exactly three live stats.");
  console.assert(typeof HERO_IMAGE_URL === "string", "Hero image URL should be a string.");
  console.assert(typeof BRAND_IMAGE_URL === "string" && BRAND_IMAGE_URL.length > 0, "Brand image URL should be set.");
  console.assert(typeof ATMOSPHERE_IMAGE_URL === "string" && ATMOSPHERE_IMAGE_URL.startsWith("https://"), "Atmosphere image URL should be a hosted image.");
  console.assert(GARAGE_LABELS.length === 4, "Garage labels should include four spec-strip items.");
  console.assert(typeof FORM_ENDPOINT === "string" && FORM_ENDPOINT.startsWith("https://"), "Form endpoint should be a secure URL.");
  console.assert(typeof INITIAL_FORM.newsletterOptIn === "boolean", "Newsletter opt-in should be tracked as a boolean.");
  console.assert(NEWSLETTER_TOPICS.length === 4, "Newsletter section should include four topics.");
}

runSmokeTests();

function LogoMark({ className = "" }) {
  return (
    <div className={`relative grid place-items-center ${className}`} aria-label="Drive With Rouleaux logo">
      <div className="absolute inset-0 rounded-[1.35rem] bg-blue-500 opacity-40 blur-md" />
      <img
        src={BRAND_IMAGE_URL}
        alt="Drive With Rouleaux"
        className="relative h-full w-full rounded-[1.35rem] border border-blue-400/30 bg-black object-cover shadow-xl shadow-blue-500/20"
      />
    </div>
  );
}

function Icon({ name, className = "" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (name === "message") {
    return (
      <svg {...common}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-5" />
      </svg>
    );
  }

  if (name === "spark") {
    return (
      <svg {...common}>
        <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
        <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12z" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.9z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 11v5" />
        <path d="M8 8h.01" />
        <path d="M12 16v-3a2 2 0 1 1 4 0v3" />
        <path d="M12 11v5" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function Button({ children, type = "button", variant = "primary", className = "", onClick, disabled = false }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-black transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
  const styles =
    variant === "outline"
      ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
      : "bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:bg-blue-600";

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border ${className}`}>{children}</div>;
}

function HeroPortrait() {
  if (HERO_IMAGE_URL) {
    return (
      <img
        src={HERO_IMAGE_URL}
        alt="Drive With Rouleaux"
        className="relative z-10 h-full max-h-[720px] w-full rounded-[2.5rem] border border-white/10 object-cover shadow-[0_35px_120px_rgba(0,0,0,0.55)]"
      />
    );
  }

  return (
    <div className="relative z-10 flex min-h-[520px] w-full items-center justify-center rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950/40 p-8 text-center shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
      <div>
        <LogoMark className="mx-auto h-24 w-24" />
        <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-blue-400">Photo slot ready</p>
        <h2 className="mt-3 text-3xl font-black text-white">Add your real hero image here.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-zinc-400">Upload the photo as /public/mike-photo.jpeg, then set HERO_IMAGE_URL to /mike-photo.jpeg.</p>
      </div>
    </div>
  );
}

export default function AutoSalesContactWebsite() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: type === "checkbox" ? checked : value }));
    setStatus({ type: "idle", message: "" });
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToContact = () => scrollToSection("contact");

  const handleFeatureAction = (card) => {
    setForm((previousForm) => ({
      ...previousForm,
      message: previousForm.message || card.prefill,
      shoppingFor: previousForm.shoppingFor || "Not sure yet",
    }));
    setStatus({ type: "idle", message: "" });
    setTimeout(scrollToContact, 0);
  };

  const handleLeadMagnetClick = () => {
    setForm((previousForm) => ({
      ...previousForm,
      message: previousForm.message || "I want the free auto game plan. Help me figure out the cleanest path.",
    }));
    setStatus({ type: "idle", message: "" });
    setTimeout(scrollToContact, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = getValidationError(form);

    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "loading", message: "Sending your request..." });

    try {
      const submitResult = await sendLead(form);
      setStatus({
        type: "success",
        message: FORM_DEBUG_MODE
          ? `Submitted to Formspree. Confirmation ID: ${submitResult.leadId}. If no email arrives, check the Formspree dashboard/submissions and verify the destination email.`
          : "Got it. Your request was sent and I’ll reach out shortly with the next move.",
      });
      setForm(INITIAL_FORM);
    } catch (error) {
      if (error.message === "FORM_ENDPOINT_MISSING") {
        setStatus({
          type: "error",
          message: "Submit is ready, but the live form endpoint is not connected yet. Add your Formspree endpoint to FORM_ENDPOINT and this button will send instantly.",
        });
      } else {
        setStatus({ type: "error", message: error.message || "Something blocked the submission. Check your form endpoint or network settings." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `url(${ATMOSPHERE_IMAGE_URL})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/92 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_80%_25%,rgba(37,99,235,0.12),transparent_30%)]" />
        <div className="absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 animate-pulse rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute top-80 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute left-1/2 top-[34rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-[36rem] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full border border-blue-400/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px] opacity-35" />
        <div className="absolute left-0 right-0 top-32 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
        <div className="absolute -left-24 top-[18rem] h-2 w-[38rem] rotate-[-12deg] rounded-full bg-blue-500/20 blur-md" />
        <div className="absolute right-[-8rem] top-[28rem] h-2 w-[34rem] rotate-[10deg] rounded-full bg-white/10 blur-md" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:28px_28px] opacity-25" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 text-left">
          <LogoMark className="h-12 w-12" />
          <div>
            <p className="text-lg font-black tracking-tight">Drive With Rouleaux</p>
            <p className="text-xs text-zinc-400">Auto buying help without the runaround.</p>
          </div>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={() => scrollToSection("process")} className="rounded-2xl px-4 py-2 text-sm font-black text-zinc-300 transition hover:bg-white/10 hover:text-white">
            How It Works
          </button>
          <button type="button" onClick={() => scrollToSection("questions")} className="rounded-2xl px-4 py-2 text-sm font-black text-zinc-300 transition hover:bg-white/10 hover:text-white">
            Questions
          </button>
        </nav>

        <button type="button" onClick={scrollToContact} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-2 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 active:scale-[0.98]">
          Get Help
        </button>
      </header>

      <main className="relative z-10">
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1fr_.95fr] lg:pt-24">
          <div className="absolute right-0 top-10 hidden h-40 w-40 rounded-full border border-blue-400/10 lg:block" />
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 shadow-2xl shadow-blue-500/10 backdrop-blur">
              <Icon name="spark" className="h-4 w-4 text-blue-400" />
              Your shortcut from “I need a car” to “I found the one.”
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Cars without the circus.
              <span className="block text-zinc-500">Real help before the numbers get loud.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-[1.08rem] leading-8 text-zinc-300">
              Tell me what you need, what you want to spend, and what you’re driving now. I’ll help you cut through the noise, spot the smart move, and shop with a little more control.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={scrollToContact} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 text-base font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 active:scale-[0.98]">
                Start Your Search <Icon name="arrow" className="h-4 w-4" />
              </button>
              <button type="button" onClick={scrollToContact} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-base font-black text-white transition hover:bg-white/10 active:scale-[0.98]">
                Ask Mike a Question
              </button>
            </div>

            <div className="mt-10 flex max-w-2xl flex-wrap gap-2">
              {GARAGE_LABELS.map((label) => (
                <span key={label} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 backdrop-blur">
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-5 grid max-w-xl grid-cols-3 gap-3">
              {LIVE_STATS.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {TRUST_POINTS.map((point) => (
                <div key={point} className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-50 shadow-lg shadow-blue-950/10">
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col items-stretch justify-center gap-6 lg:translate-y-4">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-t from-blue-500/10 via-transparent to-transparent blur-2xl" />
            <div className="absolute -left-8 top-10 z-20 rounded-2xl border border-white/10 bg-zinc-950/75 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-blue-300 shadow-2xl shadow-black/40 backdrop-blur">
              Drive With Rouleaux
            </div>
            <HeroPortrait />

            <Card className="relative z-20 w-full overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-950/95 to-zinc-900/90 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="absolute -right-20 bottom-8 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute right-5 top-5 rounded-2xl bg-blue-500 px-4 py-2 text-sm font-black text-white shadow-xl shadow-blue-500/20">
                Free help
              </div>
              <div className="relative p-7">
                <div className="relative rounded-[1.5rem] bg-zinc-950/80 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <LogoMark className="h-14 w-14" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Lead magnet</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">No dealer maze</p>
                    </div>
                  </div>
                  <h2 className="mt-3 max-w-sm text-3xl font-black leading-none tracking-tight sm:text-4xl">
                    Free auto game plan
                    <span className="block text-blue-400">built around your move.</span>
                  </h2>
                  <p className="mt-3 max-w-md text-zinc-300">Send the basics and I’ll help you figure out the cleanest path.</p>
                  <button type="button" onClick={handleLeadMagnetClick} className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 active:scale-[0.98]">
                    Get the Game Plan <Icon name="arrow" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
          {FEATURE_CARDS.map((item) => (
            <Card key={item.title} className="group relative overflow-hidden border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] text-white transition duration-300 hover:-translate-y-2 hover:border-blue-400/30 hover:bg-white/[0.09] hover:shadow-2xl hover:shadow-blue-950/20">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
              <div className="relative p-7">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
                  <Icon name={item.icon} className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-zinc-300">{item.text}</p>
                <button type="button" onClick={() => handleFeatureAction(item)} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-200 transition hover:bg-blue-500 hover:text-white active:scale-[0.98]">
                  {item.action} <Icon name="arrow" className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </section>

        <section id="process" className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">How this works</p>
              <h2 className="mt-3 text-3xl font-black">A smoother way to shop for a car.</h2>
              <div className="mt-8 space-y-6">
                {STEPS.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500 font-black text-white shadow-lg shadow-blue-500/20">{index + 1}</div>
                    <div>
                      <p className="text-lg font-black text-white">{step.title}</p>
                      <p className="mt-1 text-zinc-300">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-zinc-900 p-8 shadow-2xl shadow-blue-950/20">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-200">Why people hate buying cars</p>
              <h2 className="mt-3 text-3xl font-black text-white">Too much noise. Too little honesty.</h2>
              <p className="mt-5 leading-8 text-blue-50/90">Most people walk into the process already stressed. Too many numbers. Too many opinions. Too many “limited-time deals” flying around like confetti from a financial cannon.</p>
              <p className="mt-4 leading-8 text-blue-50/80">This site is meant to feel different. Cleaner. More direct. More like texting somebody who actually knows the game.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-5 pb-10 pt-6">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Start here</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">Send the basics. I’ll sort the next move.</h2>
              <p className="mt-4 leading-8 text-zinc-300">Send me the basics and I’ll help you figure out the cleanest next move. New, used, lease, trade, budget questions, weird situations, all fair game.</p>
              <div className="mt-6 space-y-3 text-sm text-zinc-300">
                <p className="flex items-center gap-3"><Icon name="phone" className="h-4 w-4 text-blue-400" /> Call/Text: add your number here</p>
                <p className="flex items-center gap-3"><Icon name="mail" className="h-4 w-4 text-blue-400" /> {INBOX_EMAIL}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-pink-400/20 bg-pink-500/10 px-4 py-3 text-sm font-black text-pink-100 transition hover:-translate-y-0.5 hover:bg-pink-500 hover:text-white"
                >
                  <Icon name="instagram" className="h-4 w-4" /> Instagram
                </a>

                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-black text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white"
                >
                  <Icon name="linkedin" className="h-4 w-4" /> LinkedIn
                </a>
              </div>
            </div>

            <Card className="overflow-hidden border-white/10 bg-white text-zinc-950 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500" />
              <form onSubmit={handleSubmit} className="relative p-6 md:p-8">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />
                <input type="hidden" name="_subject" value={SHARED_THREAD_SUBJECT} />
                <input type="hidden" name="brand" value="Drive With Rouleaux" />
                <input type="hidden" name="to" value={INBOX_EMAIL} />
                <input type="text" name="_gotcha" tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" />

                <div className="mb-5 rounded-2xl bg-zinc-950 p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Private lead request</p>
                  <p className="mt-1 text-sm text-zinc-300">No pressure. No spam. Just the info needed to help you move smart.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Name" autoComplete="name" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500" />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" autoComplete="tel" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500" />
                  <input name="email" value={form.email} onChange={handleChange} placeholder="Email" autoComplete="email" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500" />
                  <select name="shoppingFor" value={form.shoppingFor} onChange={handleChange} className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500">
                    <option value="">Shopping for...</option>
                    <option value="New vehicle">New vehicle</option>
                    <option value="Used vehicle">Used vehicle</option>
                    <option value="Lease help">Lease help</option>
                    <option value="Trade value help">Trade value help</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                  <input name="vehicle" value={form.vehicle} onChange={handleChange} placeholder="Vehicle wanted" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500" />
                  <input name="budget" value={form.budget} onChange={handleChange} placeholder="Budget or payment goal" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500" />
                  <select name="timing" value={form.timing} onChange={handleChange} className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500">
                    <option value="">When are you looking?</option>
                    <option value="ASAP">ASAP</option>
                    <option value="This week">This week</option>
                    <option value="This month">This month</option>
                    <option value="Just researching">Just researching</option>
                  </select>
                  <input name="trade" value={form.trade} onChange={handleChange} placeholder="Trade-in vehicle, if any" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500" />
                  <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700 md:col-span-2">
                    <input
                      type="checkbox"
                      name="newsletterOptIn"
                      checked={form.newsletterOptIn}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 accent-blue-500"
                    />
                    <span>
                      Add me to the weekly Drive With Rouleaux email drop with car-buying tips, deal alerts, trade advice, and market notes. I can unsubscribe anytime.
                    </span>
                  </label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Anything else I should know?" rows={5} className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500 md:col-span-2" />
                </div>

                {status.message && (
                  <div className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${status.type === "error" ? "bg-red-50 text-red-700" : status.type === "loading" ? "bg-blue-50 text-orange-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {status.message}
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-zinc-950 py-4 text-lg hover:bg-zinc-800">
                  {isSubmitting ? "Sending..." : "Send My Auto Request"}
                </Button>
              </form>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-10">
          <div className="grid gap-6 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Weekly drop</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white">A simple car-market email people might actually read.</h2>
              <p className="mt-4 leading-8 text-zinc-300">
                Every site inquiry can be tagged for the weekly newsletter, then pushed into Mailchimp, Brevo, ConvertKit, HubSpot, or Zapier once the list tool is connected.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {NEWSLETTER_TOPICS.map((topic) => (
                <div key={topic} className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4 text-sm font-bold text-zinc-200">
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-400/20 bg-blue-500 p-8 text-zinc-950 shadow-[0_25px_80px_rgba(59,130,246,0.25)] md:p-10">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/30" />
            <div className="absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-900/60">Ready when you are</p>
                <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">Send the basics. I’ll help you sort the move.</h2>
                <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-900/75">No giant dealer portal. No endless maze. Just a clean request and a real follow-up.</p>
              </div>
              <button type="button" onClick={scrollToContact} className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-7 py-4 text-base font-black text-white shadow-xl shadow-zinc-950/20 transition hover:-translate-y-1 hover:bg-zinc-900 active:scale-[0.98]">
                Start My Request
              </button>
            </div>
          </div>
        </section>

        <section id="questions" className="mx-auto max-w-6xl px-5 pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Questions</p>
                <h2 className="mt-3 text-3xl font-black">Stuff people usually ask first.</h2>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 transition hover:border-blue-400/30">
                  <p className="text-lg font-black text-white">{faq.question}</p>
                  <p className="mt-2 leading-7 text-zinc-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2 rounded-[1.7rem] border border-blue-400/20 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-white">Need help finding the right vehicle?</p>
              <p className="text-xs text-zinc-400">Quick answers. No dealership maze.</p>
            </div>
            <button type="button" onClick={scrollToContact} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-2 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 active:scale-[0.98]">
              Start Here
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

