import { useState, useEffect } from “react”;

// ─── DATA ────────────────────────────────────────────────────────────────────
const LISTINGS = [
{
id: 1, type: “fresh”, status: “available”,
title: “Sunny Studio in Midtown”, area: “Midtown”, city: “New York”,
rent: 1850, beds: 0, baths: 1, sqft: 480,
available: “Now”, img: “🏙️”,
tags: [“Furnished”, “Gym”, “Rooftop”],
interestedCount: 7,
lat: 40.754, lng: -73.984,
desc: “Brand new listing. Never occupied. Modern finishes, floor-to-ceiling windows.”,
},
{
id: 2, type: “used”, status: “vacating”,
title: “Cozy 2BR in Brooklyn”, area: “Brooklyn”, city: “New York”,
rent: 2400, beds: 2, baths: 1, sqft: 820,
available: “May 15”, img: “🏘️”,
tags: [“Pet Friendly”, “Backyard”, “Laundry”],
interestedCount: 12,
lat: 40.678, lng: -73.944,
desc: “Current tenant moving out May 15. Well-maintained, hardwood floors throughout.”,
tenantNote: “Leaving for new job in SF. Great landlord, responsive to repairs.”,
},
{
id: 3, type: “used”, status: “vacating”,
title: “1BR Near Central Park”, area: “Upper West Side”, city: “New York”,
rent: 3100, beds: 1, baths: 1, sqft: 650,
available: “Jun 1”, img: “🌳”,
tags: [“Doorman”, “Elevator”, “Storage”],
interestedCount: 21,
lat: 40.784, lng: -73.977,
desc: “Prime UWS location. Tenant leaving after 4 years. Rarely available.”,
tenantNote: “Loved living here. Moving to be closer to family.”,
},
{
id: 4, type: “fresh”, status: “available”,
title: “Modern Loft in SoHo”, area: “SoHo”, city: “New York”,
rent: 4500, beds: 1, baths: 2, sqft: 1100,
available: “Now”, img: “🏢”,
tags: [“Loft”, “Exposed Brick”, “Dishwasher”],
interestedCount: 3,
lat: 40.723, lng: -74.002,
desc: “New build. Open-plan loft with soaring 14ft ceilings and industrial charm.”,
},
{
id: 5, type: “used”, status: “vacating”,
title: “3BR Family Home in Queens”, area: “Astoria”, city: “New York”,
rent: 2900, beds: 3, baths: 2, sqft: 1400,
available: “May 30”, img: “🏡”,
tags: [“Parking”, “Garden”, “Quiet Block”],
interestedCount: 18,
lat: 40.772, lng: -73.929,
desc: “Family vacating after 6 years. Spacious rooms, private garden.”,
tenantNote: “Perfect for families. Great schools nearby. We’re sad to leave.”,
},
{
id: 6, type: “fresh”, status: “available”,
title: “Downtown Studio Gem”, area: “Financial District”, city: “New York”,
rent: 1650, beds: 0, baths: 1, sqft: 410,
available: “Now”, img: “💎”,
tags: [“New Build”, “City Views”, “Smart Lock”],
interestedCount: 5,
lat: 40.706, lng: -74.009,
desc: “Newly completed tower unit. Smart home features, panoramic harbor views.”,
},
];

const DEMAND_ZONES = [
{ area: “Brooklyn”, count: 143, heat: “hot” },
{ area: “Midtown”, count: 89, heat: “warm” },
{ area: “Upper West Side”, count: 201, heat: “fire” },
{ area: “SoHo”, count: 67, heat: “warm” },
{ area: “Astoria”, count: 112, heat: “hot” },
{ area: “Financial District”, count: 44, heat: “cool” },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function HeatBadge({ heat }) {
const map = {
fire: { label: “🔥 High Demand”, bg: “#ff3b3b22”, color: “#ff6b6b”, border: “#ff3b3b55” },
hot:  { label: “⚡ Active”,      bg: “#ff900022”, color: “#ffb347”, border: “#ff900055” },
warm: { label: “👀 Watched”,     bg: “#ffe06622”, color: “#ffd700”, border: “#ffe06655” },
cool: { label: “✦ Available”,   bg: “#3bcfff22”, color: “#7ee8fa”, border: “#3bcfff55” },
};
const s = map[heat] || map.cool;
return (
<span style={{
fontSize: 10, fontWeight: 700, letterSpacing: “0.08em”,
padding: “3px 8px”, borderRadius: 20,
background: s.bg, color: s.color, border: `1px solid ${s.border}`,
}}>{s.label}</span>
);
}

function TypeBadge({ type }) {
const isFresh = type === “fresh”;
return (
<span style={{
fontSize: 10, fontWeight: 800, letterSpacing: “0.1em”,
padding: “3px 9px”, borderRadius: 20, textTransform: “uppercase”,
background: isFresh ? “#00e09922” : “#a855f722”,
color: isFresh ? “#00e099” : “#c084fc”,
border: `1px solid ${isFresh ? "#00e09955" : "#a855f755"}`,
}}>{isFresh ? “✦ Fresh” : “⟳ Pre-Vacate”}</span>
);
}

function InterestedBar({ count }) {
const level = count > 15 ? “fire” : count > 8 ? “hot” : “warm”;
const colors = { fire: “#ff6b6b”, hot: “#ffb347”, warm: “#ffd700” };
return (
<div style={{ display: “flex”, alignItems: “center”, gap: 6, marginTop: 4 }}>
<div style={{ fontSize: 11, color: “#888” }}>👥 {count} people looking</div>
<div style={{
height: 4, flex: 1, background: “#1e1e2e”, borderRadius: 4, overflow: “hidden”,
}}>
<div style={{
height: “100%”, width: `${Math.min(100, (count / 25) * 100)}%`,
background: colors[level], borderRadius: 4,
transition: “width 0.6s ease”,
boxShadow: `0 0 8px ${colors[level]}`,
}} />
</div>
</div>
);
}

// ─── POST NOTICE MODAL ───────────────────────────────────────────────────────
function PostNoticeModal({ onClose, onPost }) {
const [step, setStep] = useState(1);
const [form, setForm] = useState({
title: “”, area: “”, rent: “”, beds: “”, baths: “”, sqft: “”,
available: “”, note: “”, type: “used”, phone: “”, verified: false,
});
const up = (k, v) => setForm(f => ({ …f, [k]: v }));

const steps = [“Home Details”, “Move-Out Info”, “Verify & Post”];
return (
<div style={{
position: “fixed”, inset: 0, background: “#000000cc”, zIndex: 1000,
display: “flex”, alignItems: “center”, justifyContent: “center”,
backdropFilter: “blur(8px)”, padding: 20,
}}>
<div style={{
background: “#0e0e1a”, border: “1px solid #2a2a3e”,
borderRadius: 20, width: “100%”, maxWidth: 520,
boxShadow: “0 40px 80px #000a”, overflow: “hidden”,
}}>
{/* Header */}
<div style={{
padding: “24px 28px 20px”, borderBottom: “1px solid #1e1e2e”,
background: “linear-gradient(135deg, #0e0e1a, #161628)”,
}}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “start” }}>
<div>
<div style={{ fontSize: 18, fontWeight: 800, color: “#fff”, fontFamily: “‘Syne’, sans-serif” }}>
Post a Move-Out Notice
</div>
<div style={{ fontSize: 12, color: “#666”, marginTop: 3 }}>
Let the next tenant find your place early
</div>
</div>
<button onClick={onClose} style={{
background: “#1e1e2e”, border: “none”, color: “#888”,
width: 32, height: 32, borderRadius: 8, cursor: “pointer”,
fontSize: 16, display: “flex”, alignItems: “center”, justifyContent: “center”,
}}>✕</button>
</div>
{/* Step indicators */}
<div style={{ display: “flex”, gap: 8, marginTop: 18 }}>
{steps.map((s, i) => (
<div key={i} style={{ flex: 1 }}>
<div style={{
height: 3, borderRadius: 2,
background: i < step ? “#00e099” : i === step - 1 ? “#00e099” : “#1e1e2e”,
transition: “background 0.3s”,
}} />
<div style={{
fontSize: 10, marginTop: 5,
color: i === step - 1 ? “#00e099” : i < step - 1 ? “#555” : “#444”,
fontWeight: i === step - 1 ? 700 : 400,
}}>{s}</div>
</div>
))}
</div>
</div>

```
    <div style={{ padding: 28 }}>
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Listing Type">
            <div style={{ display: "flex", gap: 10 }}>
              {["fresh", "used"].map(t => (
                <button key={t} onClick={() => up("type", t)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${form.type === t ? "#00e099" : "#2a2a3e"}`,
                  background: form.type === t ? "#00e09918" : "#131320",
                  color: form.type === t ? "#00e099" : "#666",
                  fontSize: 12, fontWeight: 700,
                }}>{t === "fresh" ? "✦ Fresh Listing" : "⟳ Pre-Vacate"}</button>
              ))}
            </div>
          </Field>
          <Field label="Title"><Input value={form.title} onChange={v => up("title", v)} placeholder="e.g. Cozy 2BR in Brooklyn" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Neighborhood"><Input value={form.area} onChange={v => up("area", v)} placeholder="Area" /></Field>
            <Field label="Monthly Rent ($)"><Input value={form.rent} onChange={v => up("rent", v)} placeholder="2400" type="number" /></Field>
            <Field label="Bedrooms"><Input value={form.beds} onChange={v => up("beds", v)} placeholder="2" type="number" /></Field>
            <Field label="Bathrooms"><Input value={form.baths} onChange={v => up("baths", v)} placeholder="1" type="number" /></Field>
          </div>
          <Field label="Square Footage"><Input value={form.sqft} onChange={v => up("sqft", v)} placeholder="820" type="number" /></Field>
        </div>
      )}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Available From"><Input value={form.available} onChange={v => up("available", v)} placeholder="May 15 / Now" /></Field>
          <Field label="Note for Future Tenants (optional)">
            <textarea value={form.note} onChange={e => up("note", e.target.value)}
              placeholder="Share what you loved about the place, the landlord, neighborhood tips..."
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                background: "#131320", border: "1px solid #2a2a3e",
                color: "#ccc", fontSize: 13, resize: "none", height: 100,
                outline: "none", boxSizing: "border-box", lineHeight: 1.6,
              }}
            />
          </Field>
          <div style={{
            padding: "14px 16px", borderRadius: 12,
            background: "#a855f710", border: "1px solid #a855f740",
          }}>
            <div style={{ fontSize: 12, color: "#c084fc", fontWeight: 700, marginBottom: 6 }}>
              🔒 Privacy Protected
            </div>
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
              Your exact address is hidden until you choose to share it. Searchers will only see your neighborhood until you approve contact.
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Phone Number (for verification)">
            <div style={{ display: "flex", gap: 10 }}>
              <Input value={form.phone} onChange={v => up("phone", v)} placeholder="+1 (555) 000-0000" />
              <button onClick={() => up("verified", true)} style={{
                padding: "0 14px", borderRadius: 10, cursor: "pointer",
                background: form.verified ? "#00e09922" : "#1e1e2e",
                border: `1px solid ${form.verified ? "#00e099" : "#2a2a3e"}`,
                color: form.verified ? "#00e099" : "#888",
                fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
              }}>{form.verified ? "✓ Verified" : "Send OTP"}</button>
            </div>
          </Field>
          <div style={{
            padding: "16px", borderRadius: 12,
            background: "#0a0a16", border: "1px solid #2a2a3e",
          }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Preview</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{form.title || "Your Listing"}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {form.area} · ${form.rent}/mo · {form.beds} bed · Available {form.available}
            </div>
          </div>
        </div>
      )}
    </div>

    <div style={{
      padding: "16px 28px", borderTop: "1px solid #1e1e2e",
      display: "flex", justifyContent: "space-between",
    }}>
      <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} style={{
        padding: "10px 20px", borderRadius: 10, cursor: "pointer",
        background: "transparent", border: "1px solid #2a2a3e",
        color: "#666", fontSize: 13,
      }}>{step > 1 ? "← Back" : "Cancel"}</button>
      <button onClick={() => step < 3 ? setStep(s => s + 1) : (onPost(form), onClose())} style={{
        padding: "10px 24px", borderRadius: 10, cursor: "pointer",
        background: step === 3 ? "linear-gradient(135deg, #00e099, #00b8d4)" : "#00e09922",
        border: `1px solid ${step === 3 ? "transparent" : "#00e09955"}`,
        color: step === 3 ? "#000" : "#00e099",
        fontSize: 13, fontWeight: 800,
      }}>{step === 3 ? "🚀 Post Notice" : "Continue →"}</button>
    </div>
  </div>
</div>
```

);
}

function Field({ label, children }) {
return (
<div>
<div style={{ fontSize: 11, color: “#666”, fontWeight: 700, marginBottom: 7, letterSpacing: “0.05em” }}>{label}</div>
{children}
</div>
);
}

function Input({ value, onChange, placeholder, type = “text” }) {
return (
<input type={type} value={value} placeholder={placeholder}
onChange={e => onChange(e.target.value)}
style={{
width: “100%”, padding: “11px 14px”, borderRadius: 10,
background: “#131320”, border: “1px solid #2a2a3e”,
color: “#ccc”, fontSize: 13, outline: “none”,
boxSizing: “border-box”,
}}
/>
);
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick }) {
const [hovered, setHovered] = useState(false);
const zone = DEMAND_ZONES.find(z => z.area === listing.area);

return (
<div onClick={() => onClick(listing)}
onMouseEnter={() => setHovered(true)}
onMouseLeave={() => setHovered(false)}
style={{
background: hovered ? “#141424” : “#0e0e1a”,
border: `1px solid ${hovered ? "#2a2a4e" : "#1a1a2e"}`,
borderRadius: 16, overflow: “hidden”, cursor: “pointer”,
transition: “all 0.2s ease”,
transform: hovered ? “translateY(-2px)” : “none”,
boxShadow: hovered ? “0 12px 40px #000a” : “0 4px 16px #0006”,
}}>
<div style={{
height: 140, background: “linear-gradient(135deg, #0a0a18, #161630)”,
display: “flex”, alignItems: “center”, justifyContent: “center”,
fontSize: 52, position: “relative”,
}}>
{listing.img}
<div style={{ position: “absolute”, top: 12, left: 12 }}>
<TypeBadge type={listing.type} />
</div>
<div style={{ position: “absolute”, top: 12, right: 12 }}>
{zone && <HeatBadge heat={zone.heat} />}
</div>
{listing.type === “used” && (
<div style={{
position: “absolute”, bottom: 0, left: 0, right: 0,
background: “linear-gradient(transparent, #0e0e1a88)”,
padding: “20px 14px 8px”,
}}>
<div style={{ fontSize: 11, color: “#a855f7”, fontWeight: 700 }}>
⟳ Tenant vacating · Available {listing.available}
</div>
</div>
)}
</div>

```
  <div style={{ padding: "16px 18px" }}>
    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", lineHeight: 1.3 }}>
      {listing.title}
    </div>
    <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>{listing.area}, {listing.city}</div>

    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10 }}>
      <span style={{ fontSize: 22, fontWeight: 900, color: "#00e099" }}>${listing.rent.toLocaleString()}</span>
      <span style={{ fontSize: 12, color: "#555" }}>/mo</span>
    </div>

    <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "#666" }}>
      <span>🛏 {listing.beds === 0 ? "Studio" : `${listing.beds} bed`}</span>
      <span>🚿 {listing.baths} bath</span>
      <span>📐 {listing.sqft} sqft</span>
    </div>

    <InterestedBar count={listing.interestedCount} />

    <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
      {listing.tags.map(t => (
        <span key={t} style={{
          fontSize: 10, padding: "3px 9px", borderRadius: 20,
          background: "#1a1a2e", color: "#777", border: "1px solid #2a2a3e",
        }}>{t}</span>
      ))}
    </div>
  </div>
</div>
```

);
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ listing, onClose, onInterest }) {
const [interested, setInterested] = useState(false);
const [msgOpen, setMsgOpen] = useState(false);
const [msg, setMsg] = useState(””);
const zone = DEMAND_ZONES.find(z => z.area === listing.area);

return (
<div style={{
position: “fixed”, inset: 0, background: “#000000cc”, zIndex: 900,
display: “flex”, alignItems: “center”, justifyContent: “center”,
backdropFilter: “blur(10px)”, padding: 20,
}}>
<div style={{
background: “#0e0e1a”, border: “1px solid #2a2a3e”,
borderRadius: 24, width: “100%”, maxWidth: 560,
maxHeight: “90vh”, overflow: “auto”,
boxShadow: “0 40px 80px #000b”,
}}>
<div style={{
height: 180, background: “linear-gradient(135deg, #0a0a18 0%, #161640 50%, #0e0e1a 100%)”,
display: “flex”, alignItems: “center”, justifyContent: “center”,
fontSize: 72, position: “relative”,
borderRadius: “24px 24px 0 0”,
}}>
{listing.img}
<button onClick={onClose} style={{
position: “absolute”, top: 16, right: 16,
background: “#0008”, border: “none”, color: “#aaa”,
width: 36, height: 36, borderRadius: 10, cursor: “pointer”, fontSize: 16,
}}>✕</button>
<div style={{ position: “absolute”, top: 16, left: 16, display: “flex”, gap: 8 }}>
<TypeBadge type={listing.type} />
{zone && <HeatBadge heat={zone.heat} />}
</div>
</div>

```
    <div style={{ padding: 28 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
        {listing.title}
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>📍 {listing.area}, {listing.city} (approximate)</div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14 }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: "#00e099" }}>${listing.rent.toLocaleString()}</span>
        <span style={{ fontSize: 13, color: "#555" }}>/mo</span>
        {listing.available !== "Now" && (
          <span style={{
            marginLeft: "auto", fontSize: 12, color: "#a855f7",
            background: "#a855f715", padding: "4px 12px", borderRadius: 20,
            border: "1px solid #a855f740",
          }}>Available {listing.available}</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
        {[
          { icon: "🛏", label: listing.beds === 0 ? "Studio" : `${listing.beds} Bed` },
          { icon: "🚿", label: `${listing.baths} Bath` },
          { icon: "📐", label: `${listing.sqft} sqft` },
        ].map(item => (
          <div key={item.label} style={{
            background: "#131320", border: "1px solid #1e1e2e",
            borderRadius: 12, padding: "12px 0", textAlign: "center",
          }}>
            <div style={{ fontSize: 20 }}>{item.icon}</div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4, fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: "16px", borderRadius: 12, background: "#131320", border: "1px solid #1e1e2e" }}>
        <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>{listing.desc}</div>
      </div>

      {listing.tenantNote && (
        <div style={{ marginTop: 14, padding: "16px", borderRadius: 12, background: "#a855f710", border: "1px solid #a855f740" }}>
          <div style={{ fontSize: 11, color: "#c084fc", fontWeight: 800, marginBottom: 6, letterSpacing: "0.08em" }}>
            💬 NOTE FROM CURRENT TENANT
          </div>
          <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.7 }}>"{listing.tenantNote}"</div>
        </div>
      )}

      <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 12, background: "#ff6b6b10", border: "1px solid #ff6b6b30" }}>
        <div style={{ fontSize: 11, color: "#ff9999", fontWeight: 800, marginBottom: 6, letterSpacing: "0.08em" }}>
          👥 DEMAND SIGNAL
        </div>
        <InterestedBar count={listing.interestedCount} />
        <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
          {listing.interestedCount} people are actively watching this area. Act fast.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        {listing.tags.map(t => (
          <span key={t} style={{
            fontSize: 12, padding: "5px 12px", borderRadius: 20,
            background: "#1a1a2e", color: "#888", border: "1px solid #2a2a3e",
          }}>{t}</span>
        ))}
      </div>

      {!msgOpen ? (
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={() => { setInterested(true); onInterest(listing.id); }} style={{
            flex: 1, padding: "13px 0", borderRadius: 12, cursor: "pointer",
            background: interested ? "#00e09922" : "transparent",
            border: `1px solid ${interested ? "#00e099" : "#2a2a3e"}`,
            color: interested ? "#00e099" : "#888",
            fontSize: 13, fontWeight: 700,
            transition: "all 0.2s",
          }}>{interested ? "✓ Watching" : "👀 Watch Listing"}</button>
          <button onClick={() => setMsgOpen(true)} style={{
            flex: 2, padding: "13px 0", borderRadius: 12, cursor: "pointer",
            background: "linear-gradient(135deg, #00e099, #00c4b4)",
            border: "none", color: "#000",
            fontSize: 13, fontWeight: 800,
          }}>📨 Message Anonymously</button>
        </div>
      ) : (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, color: "#00e099", fontWeight: 700, marginBottom: 8, letterSpacing: "0.08em" }}>
            🔒 ENCRYPTED ANONYMOUS MESSAGE
          </div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Hi! I'm interested in your place. When can I schedule a viewing?"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              background: "#131320", border: "1px solid #2a2a3e",
              color: "#ccc", fontSize: 13, resize: "none", height: 90,
              outline: "none", boxSizing: "border-box", lineHeight: 1.6,
            }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setMsgOpen(false)} style={{
              flex: 1, padding: "11px 0", borderRadius: 10, cursor: "pointer",
              background: "transparent", border: "1px solid #2a2a3e", color: "#666", fontSize: 13,
            }}>Cancel</button>
            <button onClick={() => setMsgOpen(false)} style={{
              flex: 2, padding: "11px 0", borderRadius: 10, cursor: "pointer",
              background: "linear-gradient(135deg, #00e099, #00c4b4)",
              border: "none", color: "#000", fontSize: 13, fontWeight: 800,
            }}>Send Message 🔒</button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
```

);
}

// ─── DEMAND MAP ───────────────────────────────────────────────────────────────
function DemandMap() {
const heatColors = { fire: “#ff3b3b”, hot: “#ff9000”, warm: “#ffe066”, cool: “#3bcfff” };
const positions = {
“Upper West Side”: { cx: 130, cy: 80 },
Midtown:           { cx: 150, cy: 115 },
SoHo:              { cx: 140, cy: 160 },
Brooklyn:          { cx: 175, cy: 200 },
“Financial District”: { cx: 148, cy: 185 },
Astoria:           { cx: 200, cy: 90 },
};
return (
<div style={{ background: “#0a0a16”, border: “1px solid #1e1e2e”, borderRadius: 16, padding: 20, overflow: “hidden” }}>
<div style={{ fontSize: 13, fontWeight: 800, color: “#fff”, marginBottom: 16, display: “flex”, alignItems: “center”, gap: 8 }}>
<span style={{ color: “#ff6b6b” }}>🔥</span> Live Demand Heatmap
</div>
<svg viewBox=“0 0 300 280” style={{ width: “100%”, height: “auto” }}>
{[60, 80, 100, 120, 140, 160].map(y => (
<line key={y} x1={60} y1={y} x2={240} y2={y} stroke="#1a1a2e" strokeWidth={0.5} />
))}
{[80, 120, 160, 200, 240].map(x => (
<line key={x} x1={x} y1={40} x2={x} y2={240} stroke="#1a1a2e" strokeWidth={0.5} />
))}
{DEMAND_ZONES.map(zone => {
const pos = positions[zone.area];
if (!pos) return null;
const r = Math.sqrt(zone.count / 3) * 4;
const color = heatColors[zone.heat];
return (
<g key={zone.area}>
<circle cx={pos.cx} cy={pos.cy} r={r + 18} fill={color} opacity={0.04} />
<circle cx={pos.cx} cy={pos.cy} r={r + 8} fill={color} opacity={0.08} />
<circle cx={pos.cx} cy={pos.cy} r={r} fill={color} opacity={0.3} />
<circle cx={pos.cx} cy={pos.cy} r={6} fill={color} opacity={0.9} />
<text x={pos.cx} y={pos.cy - r - 8} textAnchor=“middle” fill={color} fontSize={9} fontWeight={700} opacity={0.9}>
{zone.area}
</text>
<text x={pos.cx} y={pos.cy - r - 20} textAnchor=“middle” fill={color} fontSize={8} opacity={0.7}>
{zone.count} looking
</text>
</g>
);
})}
</svg>
<div style={{ display: “flex”, gap: 12, flexWrap: “wrap”, marginTop: 4 }}>
{Object.entries(heatColors).map(([k, v]) => (
<div key={k} style={{ display: “flex”, alignItems: “center”, gap: 5, fontSize: 10, color: “#666” }}>
<div style={{ width: 8, height: 8, borderRadius: “50%”, background: v }} />
{k.charAt(0).toUpperCase() + k.slice(1)}
</div>
))}
</div>
</div>
);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function RoomRadar() {
const [tab, setTab] = useState(“browse”);
const [filter, setFilter] = useState(“all”);
const [selected, setSelected] = useState(null);
const [showPost, setShowPost] = useState(false);
const [listings, setListings] = useState(LISTINGS);
const [search, setSearch] = useState(””);
const [toast, setToast] = useState(null);

const showToast = msg => {
setToast(msg);
setTimeout(() => setToast(null), 3000);
};

const filtered = listings.filter(l => {
if (filter !== “all” && l.type !== filter) return false;
if (search && !l.title.toLowerCase().includes(search.toLowerCase()) &&
!l.area.toLowerCase().includes(search.toLowerCase())) return false;
return true;
});

const handlePost = (form) => {
const newListing = {
id: Date.now(), type: form.type,
title: form.title || “New Listing”,
area: form.area || “Unknown”, city: “New York”,
rent: parseInt(form.rent) || 2000,
beds: parseInt(form.beds) || 1, baths: parseInt(form.baths) || 1,
sqft: parseInt(form.sqft) || 700,
available: form.available || “Soon”, img: “🏠”,
tags: [], interestedCount: 0,
desc: “Newly posted listing.”,
tenantNote: form.note || null,
};
setListings(ls => [newListing, …ls]);
showToast(“✓ Your notice has been posted!”);
};

const handleInterest = (id) => {
setListings(ls => ls.map(l => l.id === id ? { …l, interestedCount: l.interestedCount + 1 } : l));
showToast(“👀 You’re now watching this listing”);
};

useEffect(() => {
const link = document.createElement(“link”);
link.rel = “preconnect”;
link.href = “https://fonts.googleapis.com”;
document.head.appendChild(link);
const link2 = document.createElement(“link”);
link2.rel = “stylesheet”;
link2.href = “https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap”;
document.head.appendChild(link2);
}, []);

return (
<div style={{
minHeight: “100vh”, background: “#080810”,
fontFamily: “‘DM Sans’, sans-serif”, color: “#ddd”,
position: “relative”,
}}>
<div style={{
position: “fixed”, inset: 0, pointerEvents: “none”, zIndex: 0,
background: “radial-gradient(ellipse 800px 600px at 20% 0%, #00e09906 0%, transparent 70%), radial-gradient(ellipse 600px 400px at 80% 100%, #a855f706 0%, transparent 70%)”,
}} />

```
  {toast && (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      background: "#00e09922", border: "1px solid #00e09955",
      color: "#00e099", padding: "10px 22px", borderRadius: 40,
      fontSize: 13, fontWeight: 700, zIndex: 2000,
      backdropFilter: "blur(12px)",
    }}>{toast}</div>
  )}

  <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
    <div style={{ padding: "28px 0 20px", borderBottom: "1px solid #1a1a2e" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{
            fontSize: 28, fontWeight: 900, fontFamily: "'Syne', sans-serif",
            background: "linear-gradient(135deg, #00e099, #00c4d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}>RoomRadar</div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
            Find homes before they hit the market
          </div>
        </div>
        <button onClick={() => setShowPost(true)} style={{
          padding: "10px 20px", borderRadius: 12, cursor: "pointer",
          background: "linear-gradient(135deg, #00e099, #00c4b4)",
          border: "none", color: "#000",
          fontSize: 13, fontWeight: 800,
          boxShadow: "0 4px 20px #00e09930",
        }}>+ Post Notice</button>
      </div>

      <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
        {[
          { id: "browse", label: "🏠 Browse" },
          { id: "demand", label: "🔥 Demand Map" },
          { id: "alerts", label: "🔔 Alerts" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 10, cursor: "pointer",
            background: tab === t.id ? "#00e09918" : "transparent",
            border: `1px solid ${tab === t.id ? "#00e09955" : "transparent"}`,
            color: tab === t.id ? "#00e099" : "#666",
            fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>
    </div>

    {tab === "browse" && (
      <>
        <div style={{ padding: "20px 0 16px", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or area..."
            style={{
              flex: 1, minWidth: 200, padding: "11px 16px", borderRadius: 12,
              background: "#0e0e1a", border: "1px solid #1e1e2e",
              color: "#ddd", fontSize: 13, outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "all", label: "All" },
              { id: "fresh", label: "✦ Fresh" },
              { id: "used", label: "⟳ Pre-Vacate" },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                background: filter === f.id ? "#00e09918" : "#0e0e1a",
                border: `1px solid ${filter === f.id ? "#00e09955" : "#1e1e2e"}`,
                color: filter === f.id ? "#00e099" : "#666",
                fontSize: 12, fontWeight: filter === f.id ? 700 : 400,
                transition: "all 0.2s",
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{
          display: "flex", gap: 20, padding: "12px 16px",
          background: "#0a0a14", borderRadius: 12,
          border: "1px solid #1a1a2e", marginBottom: 20,
          fontSize: 12, color: "#555",
        }}>
          <span><span style={{ color: "#00e099", fontWeight: 700 }}>{listings.filter(l => l.type === "fresh").length}</span> fresh listings</span>
          <span><span style={{ color: "#a855f7", fontWeight: 700 }}>{listings.filter(l => l.type === "used").length}</span> pre-vacate notices</span>
          <span><span style={{ color: "#ff6b6b", fontWeight: 700 }}>{listings.reduce((a, b) => a + b.interestedCount, 0)}</span> active searchers</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 18, paddingBottom: 40,
        }}>
          {filtered.map(l => (
            <ListingCard key={l.id} listing={l} onClick={setSelected} />
          ))}
          {filtered.length === 0 && (
            <div style={{
              gridColumn: "1/-1", textAlign: "center",
              padding: "60px 0", color: "#444", fontSize: 14,
            }}>No listings found</div>
          )}
        </div>
      </>
    )}

    {tab === "demand" && (
      <div style={{ padding: "24px 0 40px" }}>
        <div style={{
          fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.7,
          padding: "14px 16px", borderRadius: 12,
          background: "#ff6b6b08", border: "1px solid #ff6b6b20",
        }}>
          🔥 <strong style={{ color: "#ff9999" }}>Demand signals</strong> show how many people are actively searching in each area.
        </div>
        <DemandMap />
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12, marginTop: 20,
        }}>
          {DEMAND_ZONES.sort((a, b) => b.count - a.count).map(zone => (
            <div key={zone.area} style={{
              background: "#0e0e1a", border: "1px solid #1a1a2e",
              borderRadius: 14, padding: "16px 18px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#131320", border: "1px solid #1e1e2e",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                {zone.heat === "fire" ? "🔥" : zone.heat === "hot" ? "⚡" : zone.heat === "warm" ? "👀" : "✦"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{zone.area}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{zone.count} active searchers</div>
                <InterestedBar count={zone.count} />
              </div>
              <HeatBadge heat={zone.heat} />
            </div>
          ))}
        </div>
      </div>
    )}

    {tab === "alerts" && (
      <div style={{ padding: "24px 0 40px" }}>
        <div style={{
          background: "#0e0e1a", border: "1px solid #1e1e2e",
          borderRadius: 16, padding: 28, textAlign: "center",
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔔</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
            Match Alerts
          </div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
            Get notified the moment a listing that matches your criteria hits RoomRadar — before it's publicly posted.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380, margin: "0 auto" }}>
            {[
              { label: "Area", placeholder: "e.g. Brooklyn, SoHo..." },
              { label: "Max Rent ($/mo)", placeholder: "e.g. 2500" },
              { label: "Min Beds", placeholder: "e.g. 1" },
            ].map(f => (
              <div key={f.label} style={{ textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6 }}>{f.label}</div>
                <input placeholder={f.placeholder} style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  background: "#131320", border: "1px solid #2a2a3e",
                  color: "#ccc", fontSize: 13, outline: "none", boxSizing: "border-box",
                }} />
              </div>
            ))}
            <button style={{
              padding: "13px 0", borderRadius: 12, cursor: "pointer",
              background: "linear-gradient(135deg, #00e099, #00c4b4)",
              border: "none", color: "#000",
              fontSize: 14, fontWeight: 800, marginTop: 6,
              boxShadow: "0 4px 20px #00e09930",
            }}>🔔 Create Alert</button>
          </div>
        </div>
      </div>
    )}
  </div>

  {showPost && <PostNoticeModal onClose={() => setShowPost(false)} onPost={handlePost} />}
  {selected && <DetailPanel listing={selected} onClose={() => setSelected(null)} onInterest={handleInterest} />}
</div>
```

);
}
