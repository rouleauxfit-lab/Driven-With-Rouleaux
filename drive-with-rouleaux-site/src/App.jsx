import React, { useState } from "react";

const INBOX_EMAIL = "DriveWithRouleaux@gmail.com";
const SHARED_THREAD_SUBJECT = "Drive With Rouleaux Lead Inbox";
const FORM_ENDPOINT = "https://formspree.io/f/xlgzvyqo";
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

const TRUST_POINTS = [
  "5+ years in auto sales",
  "1000+ buyers helped",
  "Trade, lease & payment guidance",
];

const SERVICES = [
  {
    icon: "message",
    title: "Ask",
    text: "Questions about payments, trades, leases, credit, or timing.",
    prefill: "I have a car-buying question and want straight guidance.",
  },
  {
    icon: "shield",
    title: "Plan",
    text: "A cleaner path before you start chasing listings or walking into stores.",
    prefill: "I want help building a game plan for my next vehicle.",
  },
  {
    icon: "pin",
    title: "Move",
    text: "Simple next steps based on what you need and what makes sense.",
    prefill: "I want help figuring out the cleanest next move.",
  },
];

const TESTIMONIAL = {
  quote:
    "The process felt way less overwhelming. Straight answers, no pressure, and actually helpful guidance.",
  author: "Early Drive With Rouleaux user",
};

const FAQS = [
  {
    question: "Do I have to buy from your dealership?",
    answer: "No. Drive With Rouleaux is built to help people shop smarter, whether you buy directly from me or just need guidance.",
  },
  {
    question: "Can you help with trade or payment questions?",
    answer: "Yes. Trades, lease questions, payment goals, timing, and weird situations are exactly what this is for.",
  },
  {
    question: "What happens after I submit?",
    answer: "Your request goes straight to my inbox and I’ll follow up with the cleanest next step.",
  },
];

function clean(value) {
  return String(value || "").trim();
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
    newsletterOptIn: safeForm.newsletterOptIn ? "Yes" : "No",
    shoppingFor: clean(safeForm.shoppingFor),
    vehicle: clean(safeForm.vehicle),
    budget: clean(safeForm.budget),
    trade: clean(safeForm.trade),
    timing: clean(safeForm.timing),
    message: clean(safeForm.message),
  };
}

function getValidationError(form) {
  const hasName = clean(form.name).length > 1;
  const hasContact = clean(form.phone).length > 6 || clean(form.email).includes("@");
  const hasVehicleIntent = clean(form.vehicle).length > 1 || clean(form.shoppingFor).length > 1;

  if (!hasName) return "Add a name before sending.";
  if (!hasContact) return "Add a phone number or email so the lead can be contacted.";
  if (!hasVehicleIntent) return "Add what you are shopping for or a vehicle you want.";
  return "";
}

async function sendLead(form) {
  const safeForm = { ...INITIAL_FORM, ...(form || {}) };
  const payload = buildLeadPayload(safeForm);

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: payload._subject,
      _replyto: payload._replyto,
      brand: payload.brand,
      leadId: payload.leadId,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      newsletterOptIn: payload.newsletterOptIn,
      shoppingFor: payload.shoppingFor,
      vehicle: payload.vehicle,
      budget: payload.budget,
      trade: payload.trade,
      timing: payload.timing,
      message: payload.message,
    }),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(result?.errors?.[0]?.message || "Failed to send lead.");
  }

  return { leadId: payload.leadId };
}

function runSmokeTests() {
  const testForm = {
    name: "Test Lead",
    phone: "555-123-4567",
    email: "testlead@example.com",
    vehicle: "Ford F-150",
    shoppingFor: "Used vehicle",
  };
  const payload = buildLeadPayload(testForm);

  console.assert(payload._subject.includes(SHARED_THREAD_SUBJECT), "Payload should include the shared email subject.");
  console.assert(payload.leadId.startsWith("DWR-"), "Payload should include a unique lead ID.");
  console.assert(getValidationError(testForm) === "", "Valid test form should pass validation.");
  console.assert(getValidationError(INITIAL_FORM).length > 0, "Empty form should fail validation.");
  console.assert(SERVICES.length === 3, "There should be exactly three service cards.");
  console.assert(TRUST_POINTS.length === 3, "There should be exactly three trust points.");
  console.assert(FAQS.length === 3, "There should be exactly three FAQ items.");
  console.assert(typeof BRAND_IMAGE_URL === "string" && BRAND_IMAGE_URL.length > 0, "Brand image URL should be set.");
  console.assert(typeof FORM_ENDPOINT === "string" && FORM_ENDPOINT.startsWith("https://formspree.io"), "Formspree endpoint should be set.");
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

  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12z" />
        <circle cx="12" cy="9" r="2" />
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

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.9z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border ${className}`}>{children}</div>;
}

function HeroVisual() {
  if (HERO_IMAGE_URL) {
    return (
      <img
        src={HERO_IMAGE_URL}
        alt="Drive With Rouleaux"
        className="relative z-10 h-full min-h-[420px] w-full rounded-[2.5rem] border border-white/10 object-cover shadow-[0_35px_120px_rgba(0,0,0,0.55)]"
      />
    );
  }

  return (
    <div className="relative z-10 flex min-h-[320px] md:min-h-[420px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-black via-zinc-950 to-blue-950/50 shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(59,130,246,0.25),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="absolute -left-16 top-16 h-2 w-[32rem] rotate-[-18deg] rounded-full bg-blue-500/30 blur-md" />
      <div className="absolute right-[-7rem] bottom-24 h-2 w-[28rem] rotate-[14deg] rounded-full bg-white/10 blur-md" />
      <LogoMark className="relative h-40 w-40 opacity-95" />
    </div>
  );
}

export default function App() {
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
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToContact = () => scrollToSection("contact");

  const handleServiceClick = (service) => {
    setForm((previousForm) => ({
      ...previousForm,
      message: previousForm.message || service.prefill,
      shoppingFor: previousForm.shoppingFor || "Not sure yet",
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
          ? `Submitted. Confirmation ID: ${submitResult.leadId}.`
          : "Got it. Your request was sent and I’ll reach out shortly with the next move.",
      });
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Something blocked the submission. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.11]" style={{ backgroundImage: `url(${ATMOSPHERE_IMAGE_URL})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/82 via-zinc-950/94 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_80%_25%,rgba(37,99,235,0.12),transparent_30%)]" />
        <div className="absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px] opacity-25" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 text-left">
          <LogoMark className="h-12 w-12" />
          <div>
            <p className="text-lg font-black tracking-tight">Drive With Rouleaux</p>
            <p className="text-xs text-zinc-400">Better car-buying guidance.</p>
          </div>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={() => scrollToSection("about")} className="rounded-2xl px-4 py-2 text-sm font-black text-zinc-300 transition hover:bg-white/10 hover:text-white">About Me</button>
          <button type="button" onClick={() => scrollToSection("contact")} className="rounded-2xl px-4 py-2 text-sm font-black text-zinc-300 transition hover:bg-white/10 hover:text-white">Start</button>
          <button type="button" onClick={() => scrollToSection("questions")} className="rounded-2xl px-4 py-2 text-sm font-black text-zinc-300 transition hover:bg-white/10 hover:text-white">FAQ</button>
        </nav>

        <button type="button" onClick={scrollToContact} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-2 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 active:scale-[0.98]">
          Get Help
        </button>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:pt-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 shadow-2xl shadow-blue-500/10 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Drive With Rouleaux
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Drive smarter.
              <span className="block text-zinc-500">Buy with clarity.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-[1.08rem] leading-8 text-zinc-300">
              Personal guidance for buying, trading, leasing, and finding the right fit.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={scrollToContact} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 text-base font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 active:scale-[0.98]">
                Start Here <Icon name="arrow" className="h-4 w-4" />
              </button>
              
            </div>

            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              {TRUST_POINTS.map((point) => (
                <div key={point} className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm font-bold text-blue-50 backdrop-blur">
                  {point}
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </section>

        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950/40 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur md:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-blue-400/10" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <div className="flex items-center gap-4">
                  <LogoMark className="h-24 w-24" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">Digital Business Card</p>
                    <h2 className="mt-2 text-4xl font-black tracking-tight text-white">Michael Roulo</h2>
                    <p className="mt-1 text-lg font-semibold text-zinc-400">Drive With Rouleaux</p>
                  </div>
                </div>

                <p className="mt-6 max-w-xl leading-8 text-zinc-300">
                  A simple way to connect for vehicle advice, shopping help, trade guidance, and real-world dealership insight.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
  <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-blue-400">
    Email
  </p>

  <div className="mt-4 flex justify-center">
    <a
      href={`mailto:${INBOX_EMAIL}`}
      className="flex max-w-full flex-wrap items-center justify-center gap-3 text-center text-base font-bold leading-6 text-white transition hover:text-blue-300"
    >
      <Icon name="mail" className="h-5 w-5 shrink-0" />
      <span className="break-all">{INBOX_EMAIL}</span>
    </a>
  </div>
</div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Socials</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-pink-400/20 bg-pink-500/10 px-4 py-3 text-sm font-black text-pink-100 transition hover:-translate-y-0.5 hover:bg-pink-500 hover:text-white">
                      <Icon name="instagram" className="h-4 w-4" /> Instagram
                    </a>
                    <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-black text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white">
                      <Icon name="linkedin" className="h-4 w-4" /> LinkedIn
                    </a>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-blue-500/10 p-5 backdrop-blur sm:col-span-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Specialty</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {TRUST_POINTS.map((point) => (
                      <div key={point} className="rounded-2xl border border-blue-400/20 bg-black/20 px-4 py-2 text-sm font-bold text-blue-50">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-5 py-6 md:grid-cols-3">
          {SERVICES.map((item) => (
            <Card key={item.title} className="group relative overflow-hidden border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] text-white transition duration-300 hover:-translate-y-2 hover:border-blue-400/30 hover:bg-white/[0.09] hover:shadow-2xl hover:shadow-blue-950/20">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
              <div className="relative p-7">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
                  <Icon name={item.icon} className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-zinc-300">{item.text}</p>
                <button type="button" onClick={() => handleServiceClick(item)} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-200 transition hover:bg-blue-500 hover:text-white active:scale-[0.98]">
                  Start here <Icon name="arrow" className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </section>

        <section id="about" className="mx-auto max-w-6xl px-5 py-6">
          <div className="grid gap-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-500/20 via-zinc-950 to-black p-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">About Me</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-white">Real dealership experience. Cleaner car-buying help.</h2>
            </div>

            <div>
              <p className="leading-8 text-zinc-300">
                I’ve spent the last 5+ years in automotive sales helping people navigate first-time purchases, trades, leases, performance cars, and hard-to-find inventory.
              </p>
              <p className="mt-4 leading-8 text-zinc-300">
                Drive With Rouleaux was built to make the process feel more direct, more human, and easier to understand before making a major purchase.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
                  <p className="text-3xl font-black text-white">1000+</p>
                  <p className="mt-2 text-sm font-semibold text-blue-100">Drivers helped through the buying process</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-3xl font-black text-white">5+ Years</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-300">Hands-on dealership experience</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-5 py-6">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Start here</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">Send the basics.</h2>
              <p className="mt-4 leading-8 text-zinc-300">New, used, lease, trade, budget questions, all fair game.</p>

              <div className="mt-6 space-y-3 text-sm text-zinc-300">
                <p className="flex items-center gap-3"><Icon name="mail" className="h-4 w-4 text-blue-400" /> {INBOX_EMAIL}</p>
                <p className="flex items-center gap-3"><Icon name="message" className="h-4 w-4 text-blue-400" /> Fast follow-up after every request</p>
              </div>

              </div>

            <Card className="overflow-hidden border-white/10 bg-white text-zinc-950 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500" />
              <form onSubmit={handleSubmit} className="relative p-6 md:p-8">
                <div className="mb-5 rounded-2xl bg-zinc-950 p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Private lead request</p>
                  <p className="mt-1 text-sm text-zinc-300">No pressure. Just enough info to help point you in the right direction.</p>
                </div>

                <input type="hidden" name="_subject" value={SHARED_THREAD_SUBJECT} />
                <input type="hidden" name="brand" value="Drive With Rouleaux" />
                <input type="hidden" name="to" value={INBOX_EMAIL} />
                <input type="text" name="_gotcha" tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" />

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
                    <input type="checkbox" name="newsletterOptIn" checked={form.newsletterOptIn} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-zinc-300 accent-blue-500" />
                    <span>Send me occasional Drive With Rouleaux car-buying tips and market notes.</span>
                  </label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Anything else I should know?" rows={4} className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500 md:col-span-2" />
                </div>

                {status.message && (
                  <div className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${status.type === "error" ? "bg-red-50 text-red-700" : status.type === "loading" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {status.message}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-6 py-4 text-lg font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
              </form>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-6">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 to-white/5 p-8 backdrop-blur">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">Early Feedback</p>
            <blockquote className="mt-4 max-w-3xl text-2xl font-bold leading-relaxed text-white md:text-3xl">
              “{TESTIMONIAL.quote}”
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-zinc-400">{TESTIMONIAL.author}</p>
          </div>
        </section>

        <section id="questions" className="mx-auto max-w-6xl px-5 pb-16 pt-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">FAQ</p>
            <h2 className="mt-3 text-3xl font-black">Questions</h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {FAQS.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 transition hover:border-blue-400/30">
                  <p className="text-lg font-black text-white">{faq.question}</p>
                  <p className="mt-2 leading-7 text-zinc-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="text-lg font-black text-white">Drive With Rouleaux</p>
            <p className="mt-1 text-sm text-zinc-500">Better car-buying guidance.</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">LinkedIn</a>
            <a href={`mailto:${INBOX_EMAIL}`} className="transition hover:text-white">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
