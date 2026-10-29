// Edit these placeholders with the real company details.
const CONFIG = {
  phone: "(647) 803 9249",
  email: "ahmadsinkis1967@gmail.com",
  hours: "We come to you. Call or message to book.",
  formKey: "",  // free access key from web3forms.com (enter the email above). Empty = opens the visitor's email app instead.
  whatsapp: "16478039249", // digits with country code, e.g. "16135550100". Empty hides the button.
  city: "Ottawa", // e.g. "Ottawa"
  areas: [],    // e.g. ["Kanata", "Nepean", "Orleans", "Gatineau"]. Empty hides the section.
  // Real customer reviews only, with permission. Empty hides the section.
  // Example: { name: "A. Smith", place: "Kanata", text: "Neat fitting and a fair price.", stars: 5 }
  reviews: [],
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const tel = "tel:+1" + CONFIG.phone.replace(/\D/g, "");

$$("[data-phone]").forEach((el) => {
  el.textContent = CONFIG.phone;
  if (el.tagName === "A") el.href = tel;
});
$$("[data-email]").forEach((el) => {
  el.textContent = CONFIG.email;
  el.href = "mailto:" + CONFIG.email;
});
$$("[data-phone-link]").forEach((a) => (a.href = tel));

// Mobile menu
const menu = $(".menu");
const setMenu = (open) => {
  $("#nav").classList.toggle("open", open);
  menu.setAttribute("aria-expanded", open);
};
menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
$$("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
$("[data-hours]").textContent = CONFIG.hours;
$("#year").textContent = new Date().getFullYear();

// Contact dialog
const contact = $("#contact");
$$("[data-open-contact]").forEach((b) => b.addEventListener("click", () => contact.showModal()));

// Message form: emails the owner through Web3Forms when CONFIG.formKey is set,
// otherwise (or on failure) opens the visitor's email app with the message filled in.
$("#message").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const text = `I need: ${f.get("need")}\n\n${f.get("msg")}\n\nName: ${f.get("name")}\nContact: ${f.get("contact")}`;
  const status = $("#status");
  const fallback = () => {
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Enquiry from " + f.get("name"))}&body=${encodeURIComponent(text)}`;
  };
  if (!CONFIG.formKey) return fallback();
  status.textContent = "Sending...";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: CONFIG.formKey,
        subject: "New enquiry from " + f.get("name"),
        name: f.get("name"),
        contact: f.get("contact"),
        need: f.get("need"),
        message: f.get("msg"),
      }),
    });
    if (!(await res.json()).success) throw new Error("rejected");
    e.target.reset();
    status.textContent = "Thank you. We have your message and will be in touch soon.";
  } catch {
    status.textContent = "";
    fallback();
  }
});

// Close any dialog on backdrop click
$$("dialog").forEach((d) =>
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); })
);

// Gallery filter
$$(".chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    $$(".chip").forEach((c) => {
      const on = c === chip;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on);
    });
    const f = chip.dataset.filter;
    $$("#gallery-grid li").forEach((li) => (li.hidden = f !== "all" && li.dataset.cat !== f));
  })
);

// Lightbox
const lb = $("#lightbox");
$$("#gallery-grid button").forEach((b) =>
  b.addEventListener("click", () => {
    const img = $("img", lb);
    img.src = b.dataset.full;
    img.alt = $("img", b).alt;
    lb.showModal();
  })
);

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
};

// Reviews (only shown when CONFIG.reviews has entries)
if (CONFIG.reviews.length) {
  $("#reviews").hidden = false;
  CONFIG.reviews.forEach((r) => {
    const c = el("figure", "card review reveal");
    c.append(
      el("div", "stars", "★".repeat(r.stars || 5)),
      el("blockquote", "", r.text),
      el("figcaption", "", r.place ? `${r.name}, ${r.place}` : r.name)
    );
    c.querySelector(".stars").setAttribute("aria-label", `${r.stars || 5} out of 5 stars`);
    $("#review-list").append(c);
  });
}

// Areas served (only shown when CONFIG.areas has entries)
if (CONFIG.areas.length) {
  $("#areas").hidden = false;
  $("#areas-title").textContent = `Carpet and flooring installers${CONFIG.city ? " in " + CONFIG.city : ""}`;
  CONFIG.areas.forEach((a) => $("#areas-list").append(el("li", "", a)));
}

// WhatsApp (only shown when CONFIG.whatsapp is set)
if (CONFIG.whatsapp) {
  const w = $("#whatsapp");
  w.hidden = false;
  w.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hello CarpetDesign, I would like a quote.")}`;
  w.target = "_blank";
  w.rel = "noopener";
}

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => io.observe(el));
