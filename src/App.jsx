import { useState, useEffect, useRef } from "react";
import { supabase } from './supabaseClient';
import {
  sanitize, sanitizeObject, isValidEmail, isValidPhone,
  validateTeamForm, validatePlayerForm, validatePhoto,
  PHOTO_MAX_SIZE_MB,
} from './validation';

const C = {
  green: "#00843d",
  gold: "#fdb913",
  red: "#e03c31",
  navy: "#1a1f3d",
  white: "#ffffff",
  bg: "#f8f9fb",
  card: "#ffffff",
  border: "#e8eaef",
  text: "#1a1f3d",
  textMid: "#4a5068",
  textLight: "#8b90a0",
  textFaint: "#b4b8c5",
};

function FlagStripe({ height = 4, style }) {
  return (
    <div style={{
      height, width: "100%",
      background: `linear-gradient(90deg, ${C.green} 33%, ${C.gold} 33% 66%, ${C.red} 66%)`,
      ...style,
    }} />
  );
}

function Button({ children, onClick, variant = "primary", disabled, style, type = "button" }) {
  const [h, setH] = useState(false);
  const styles = {
    primary: {
      background: h ? "#006b31" : C.green,
      color: C.white,
      boxShadow: h ? `0 6px 20px ${C.green}30` : `0 2px 8px ${C.green}20`,
    },
    gold: {
      background: h ? "#e5a611" : C.gold,
      color: C.navy,
      boxShadow: h ? `0 6px 20px ${C.gold}30` : `0 2px 8px ${C.gold}20`,
    },
    ghost: {
      background: h ? "#f0f1f4" : "transparent",
      color: C.text,
      border: `1.5px solid ${C.border}`,
    },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "13px 28px", borderRadius: "10px", border: "none",
        fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "14px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        transform: h && !disabled ? "translateY(-1px)" : "none",
        opacity: disabled ? 0.5 : 1, letterSpacing: "0.2px",
        ...styles[variant], ...style,
      }}
    >{children}</button>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required, options, style }) {
  const [f, setF] = useState(false);
  const base = {
    width: "100%", padding: "12px 16px", borderRadius: "10px",
    border: `1.5px solid ${f ? C.green : C.border}`,
    background: C.white, color: C.text,
    fontFamily: "'Outfit', sans-serif", fontSize: "14px",
    outline: "none", transition: "all 0.2s ease",
    boxShadow: f ? `0 0 0 3px ${C.green}12` : "none",
    boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: "18px", ...style }}>
      {label && (
        <label style={{
          display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600,
          color: C.textMid, fontFamily: "'Outfit', sans-serif",
        }}>
          {label} {required && <span style={{ color: C.red }}>*</span>}
        </label>
      )}
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{
            ...base, cursor: "pointer", appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238b90a0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
          }}>
          <option value="">{placeholder || "Select..."}</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          placeholder={placeholder} rows={3}
          style={{ ...base, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          placeholder={placeholder} required={required} style={base} />
      )}
    </div>
  );
}

function Section({ title, color = C.green }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "28px 0 16px" }}>
      <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: color }} />
      <span style={{
        fontSize: "14px", fontWeight: 700, color: C.text,
        fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "1px",
      }}>{title}</span>
    </div>
  );
}

function Card({ children, style, hover, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
      style={{
        background: C.card, borderRadius: "16px",
        border: `1px solid ${h ? C.green + "40" : C.border}`,
        boxShadow: h
          ? `0 12px 40px rgba(0,0,0,0.08), 0 0 0 1px ${C.green}15`
          : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        transition: "all 0.3s ease",
        transform: h ? "translateY(-3px)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >{children}</div>
  );
}

function Nav({ page, setPage }) {
  return (
    <>
      <FlagStripe height={3} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 101 }} />
      <nav style={{
        position: "fixed", top: 3, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto", padding: "8px 16px", minHeight: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            onClick={() => setPage("home")}>
            <img src="/assets/ffsa-logo.jpg" alt="FFSA Logo" style={{ height: "36px", borderRadius: "6px" }} />
            <span style={{
              fontSize: "11px", color: C.textLight, fontFamily: "'Outfit', sans-serif",
              borderLeft: `1.5px solid ${C.border}`, paddingLeft: "10px", marginLeft: "2px",
            }}>Flag Football South Africa</span>
          </div>
          <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { key: "home", label: "Home" },
              { key: "team", label: "Teams" },
              { key: "player", label: "Players" },
              { key: "admin", label: "Admin" },
            ].map(item => (
              <button key={item.key} onClick={() => setPage(item.key)}
                style={{
                  padding: "8px 16px", borderRadius: "8px", border: "none",
                  background: page === item.key ? `${C.green}0d` : "transparent",
                  color: page === item.key ? C.green : C.textLight,
                  fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: "13px",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

function Home({ setPage }) {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 80); }, []);

  return (
    <div style={{
      minHeight: "100vh", padding: "110px 16px 80px", background: C.bg,
      opacity: v ? 1 : 0, transform: v ? "none" : "translateY(20px)",
      transition: "all 0.6s ease",
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <img src="/assets/ffsa-logo.jpg" alt="FFSA Logo" style={{ width: "96px", height: "96px", borderRadius: "16px", margin: "0 auto 24px", display: "block", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
        <div style={{
          display: "inline-flex", padding: "5px 14px", borderRadius: "100px",
          background: `${C.green}0a`, border: `1px solid ${C.green}20`,
          fontFamily: "'Outfit', sans-serif", fontSize: "12px", fontWeight: 600,
          color: C.green, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px",
        }}>Registration Open</div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 800, color: C.navy, margin: "0 0 16px", lineHeight: 1.15,
        }}>
          Flag Football<br />South Africa
        </h1>
        <p style={{
          fontFamily: "'Outfit', sans-serif", fontSize: "16px", color: C.textMid,
          maxWidth: "460px", margin: "0 auto 48px", lineHeight: 1.7,
        }}>
          Official registration portal for teams and players. Join the growing flag football community.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", maxWidth: "640px", margin: "0 auto" }}>
          <Card hover onClick={() => setPage("team")} style={{ padding: "36px 28px", textAlign: "left" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px", marginBottom: "18px",
              background: `${C.green}0c`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
            }}>🏈</div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700,
              color: C.navy, margin: "0 0 8px",
            }}>Team Registration</h3>
            <p style={{
              fontFamily: "'Outfit', sans-serif", fontSize: "13px",
              color: C.textLight, lineHeight: 1.6, margin: "0 0 20px",
            }}>Register your team for the FFSA league. Includes PayFast payment.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "20px", color: C.green }}>R2,650</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "13px", color: C.green }}>Register →</span>
            </div>
          </Card>

          <Card hover onClick={() => setPage("player")} style={{ padding: "36px 28px", textAlign: "left" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px", marginBottom: "18px",
              background: `${C.gold}15`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
            }}>👤</div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700,
              color: C.navy, margin: "0 0 8px",
            }}>Player Registration</h3>
            <p style={{
              fontFamily: "'Outfit', sans-serif", fontSize: "13px",
              color: C.textLight, lineHeight: 1.6, margin: "0 0 20px",
            }}>Register as an individual player with photo and position details.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "20px", color: C.gold }}>Free</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "13px", color: C.gold }}>Register →</span>
            </div>
          </Card>
        </div>

        <div style={{
          display: "flex", justifyContent: "center", gap: "40px", marginTop: "56px",
          padding: "20px 0", borderTop: `1px solid ${C.border}`, flexWrap: "wrap",
        }}>
          {[
            { label: "Division", value: "Adult Mixed" },
            { label: "Season Fee", value: "R2,650" },
            { label: "Sport", value: "Flag Football" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "16px", color: C.navy }}>{s.value}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: C.textFaint, textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamReg({ onSubmit }) {
  const [f, setF] = useState({
    teamName: "", managerName: "", managerEmail: "", managerPhone: "",
    numPlayers: "", homeGround: "", notes: "", terms: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [teamDbId, setTeamDbId] = useState(null);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = async () => {
    const errors = validateTeamForm(f);
    if (errors.length > 0) return alert(errors.join('\n'));
    const sanitized = sanitizeObject(f);
    const result = await onSubmit({ ...sanitized, status: "Pending Payment", date: new Date().toISOString() });
    if (result?.id) {
      setTeamDbId(result.id);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", padding: "110px 16px 80px", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card style={{ maxWidth: "520px", width: "100%", overflow: "hidden" }}>
          <FlagStripe height={4} />
          <div style={{ padding: "48px 40px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto 20px",
              background: `${C.green}10`, display: "flex", alignItems: "center", justifyContent: "center",
              color: C.green, fontSize: "24px", fontWeight: 800,
            }}>✓</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 800, color: C.navy, margin: "0 0 10px" }}>
              Registration Saved
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "14px", color: C.textMid, lineHeight: 1.7, margin: "0 0 28px" }}>
              <strong>{f.teamName}</strong> has been registered. Complete payment below to confirm.
            </p>
            <form name="PayFastPayNowForm" action="https://payment.payfast.io/eng/process" method="POST" target="_blank">
              <input type="hidden" name="cmd" value="_paynow" readOnly />
              <input type="hidden" name="receiver" value="33250683" readOnly />
              <input type="hidden" name="m_payment_id" value={teamDbId || ""} readOnly />
              <input type="hidden" name="return_url" value="https://www.ffsa.co.za" readOnly />
              <input type="hidden" name="notify_url" value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-itn`} readOnly />
              <input type="hidden" name="amount" value="2650" readOnly />
              <input type="hidden" name="item_name" maxLength="255" value={`FFSA Team Registration - ${sanitize(f.teamName)}`} readOnly />
              <input type="hidden" name="item_description" maxLength="255" value={`FFSA registration payment - ${sanitize(f.managerName)}`} readOnly />
              <Button type="submit" variant="gold" style={{ width: "100%", padding: "16px", fontSize: "15px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                <img src="https://my.payfast.io/images/buttons/PayNow/Primary-Large-PayNow.png" alt="Pay Now" style={{ height: "24px" }} />
                <span>Pay R2,650</span>
              </Button>
            </form>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: C.textFaint, marginTop: "12px" }}>
              Secure payment via PayFast
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "110px 16px 80px", background: C.bg }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>
            Team Registration
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "14px", color: C.textLight }}>
            Adult Mixed Division · R2,650 registration fee
          </p>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <FlagStripe height={3} />
          <div style={{ padding: "32px" }}>
            <Section title="Team Information" color={C.green} />
            <Input label="Team Name" value={f.teamName} onChange={v => s("teamName", v)} required placeholder="e.g. Joburg Jaguars" />
            <Input label="Home Ground / Venue" value={f.homeGround} onChange={v => s("homeGround", v)} placeholder="e.g. Wanderers Stadium" />
            <Input label="Expected Number of Players" type="number" value={f.numPlayers} onChange={v => s("numPlayers", v)} placeholder="e.g. 12" />

            <Section title="Manager / Contact" color={C.gold} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 14px" }}>
              <Input label="Full Name" value={f.managerName} onChange={v => s("managerName", v)} required placeholder="John Smith" />
              <Input label="Email" type="email" value={f.managerEmail} onChange={v => s("managerEmail", v)} required placeholder="john@example.com" />
              <Input label="Phone" type="tel" value={f.managerPhone} onChange={v => s("managerPhone", v)} required placeholder="+27 82 123 4567" />
            </div>

            <Section title="Additional" color={C.textLight} />
            <Input label="Notes" type="textarea" value={f.notes} onChange={v => s("notes", v)} placeholder="Anything else we should know..." />

            <div style={{
              display: "flex", alignItems: "flex-start", gap: "10px", margin: "20px 0",
              padding: "14px", borderRadius: "10px", background: "#f8f9fb",
            }}>
              <input type="checkbox" checked={f.terms} onChange={e => s("terms", e.target.checked)}
                style={{ marginTop: "2px", accentColor: C.green, width: "16px", height: "16px" }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: C.textMid, lineHeight: 1.6 }}>
                I agree to the FFSA rules, regulations, and code of conduct. I confirm all information provided is accurate and I am authorized to register this team.
              </span>
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 20px", borderRadius: "10px", margin: "20px 0",
              background: `${C.green}06`, border: `1px solid ${C.green}15`,
            }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", fontWeight: 600, color: C.textMid }}>Registration Fee</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 800, color: C.green }}>R2,650</span>
            </div>

            <Button variant="primary" onClick={submit} style={{ width: "100%", padding: "16px", fontSize: "15px" }}>
              Continue to Payment →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PlayerReg({ onSubmit, teams }) {
  const OFFPOS = ["Quarterback (QB)", "Wide Receiver (WR)", "Center (C)"];
  const DEFPOS = ["Cornerback (CB)", "Safety (S)", "Rusher", "Middle Linebacker (MLB)"];

  const [f, setF] = useState({
    firstName: "", lastName: "", dob: "", gender: "", nationality: "",
    idNumber: "", email: "", phone: "", emergencyName: "", emergencyPhone: "",
    team: "", offPos: "", defPos: "", medical: "", terms: false,
  });
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef();
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const age = (dob) => {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = validatePhoto(file);
    if (!result.valid) {
      alert(result.error);
      e.target.value = '';
      return;
    }
    const r = new FileReader();
    r.onload = (ev) => setPhoto(ev.target.result);
    r.readAsDataURL(file);
  };

  const submit = () => {
    const errors = validatePlayerForm(f, photo);
    if (errors.length > 0) return alert(errors.join('\n'));
    const sanitized = sanitizeObject(f);
    onSubmit({ ...sanitized, photo, age: age(f.dob), id: Date.now(), status: "Registered", date: new Date().toISOString() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", padding: "110px 16px 80px", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card style={{ maxWidth: "440px", width: "100%", overflow: "hidden" }}>
          <FlagStripe height={4} />
          <div style={{ padding: "48px 40px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto 20px",
              background: `${C.green}10`, display: "flex", alignItems: "center", justifyContent: "center",
              color: C.green, fontSize: "24px",
            }}>✓</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 800, color: C.navy, margin: "0 0 8px" }}>
              Player Registered
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "14px", color: C.textMid, margin: "0 0 28px" }}>
              Welcome to FFSA, {f.firstName}!
            </p>
            <div style={{
              width: "240px", margin: "0 auto", borderRadius: "14px", overflow: "hidden",
              border: `1px solid ${C.border}`, background: C.white,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}>
              <FlagStripe height={4} />
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                {photo && (
                  <img src={photo} alt="Player" style={{
                    width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover",
                    border: `3px solid ${C.gold}40`, margin: "0 auto 14px", display: "block",
                  }} />
                )}
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: C.navy }}>
                  {f.firstName} {f.lastName}
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: C.gold, fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {f.team || "Free Agent"}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
                  {f.offPos && (
                    <span style={{
                      padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 600,
                      background: `${C.green}10`, color: C.green, fontFamily: "'Outfit', sans-serif",
                    }}>OFF · {f.offPos.split("(")[0].trim()}</span>
                  )}
                  {f.defPos && (
                    <span style={{
                      padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 600,
                      background: `${C.red}10`, color: C.red, fontFamily: "'Outfit', sans-serif",
                    }}>DEF · {f.defPos.split("(")[0].trim()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "110px 16px 80px", background: C.bg }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>
            Player Registration
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "14px", color: C.textLight }}>
            Adult Mixed Division · Photo required for player card
          </p>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <FlagStripe height={3} />
          <div style={{ padding: "32px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div onClick={() => ref.current?.click()} style={{
                width: "100px", height: "100px", borderRadius: "50%", margin: "0 auto",
                border: `2px dashed ${photo ? C.gold : C.border}`,
                overflow: "hidden", cursor: "pointer", transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: photo ? "none" : "#f8f9fb",
              }}>
                {photo ? (
                  <img src={photo} alt="Player" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", marginBottom: "2px" }}>📷</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "9px", color: C.textFaint }}>Upload</div>
                  </div>
                )}
              </div>
              <input ref={ref} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: C.textFaint, marginTop: "6px" }}>
                Headshot for player card * (JPG/PNG, max {PHOTO_MAX_SIZE_MB}MB)
              </div>
            </div>

            <Section title="Personal Details" color={C.green} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 14px" }}>
              <Input label="First Name" value={f.firstName} onChange={v => s("firstName", v)} required placeholder="John" />
              <Input label="Last Name" value={f.lastName} onChange={v => s("lastName", v)} required placeholder="Smith" />
              <Input label="Date of Birth" type="date" value={f.dob} onChange={v => s("dob", v)} required />
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: C.textMid, fontFamily: "'Outfit', sans-serif" }}>Age</label>
                <div style={{
                  padding: "12px 16px", borderRadius: "10px", border: `1.5px solid ${C.border}`,
                  background: "#f8f9fb", color: f.dob ? C.green : C.textFaint,
                  fontFamily: "'Outfit', sans-serif", fontSize: "14px", fontWeight: f.dob ? 600 : 400,
                }}>
                  {f.dob ? `${age(f.dob)} years old` : "Auto-calculated"}
                </div>
              </div>
              <Input label="Gender" type="select" value={f.gender} onChange={v => s("gender", v)} required options={["Male", "Female", "Non-binary", "Prefer not to say"]} />
              <Input label="Nationality" value={f.nationality} onChange={v => s("nationality", v)} placeholder="South African" />
            </div>
            <Input label="ID / Passport Number" value={f.idNumber} onChange={v => s("idNumber", v)} placeholder="9501015800083" />

            <Section title="Contact" color={C.gold} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 14px" }}>
              <Input label="Email" type="email" value={f.email} onChange={v => s("email", v)} required placeholder="john@email.com" />
              <Input label="Phone" type="tel" value={f.phone} onChange={v => s("phone", v)} required placeholder="+27 82 123 4567" />
              <Input label="Emergency Contact" value={f.emergencyName} onChange={v => s("emergencyName", v)} placeholder="Jane Smith" />
              <Input label="Emergency Phone" type="tel" value={f.emergencyPhone} onChange={v => s("emergencyPhone", v)} placeholder="+27 82 987 6543" />
            </div>

            <Section title="Playing Details" color={C.red} />
            <Input label="Team" type="select" value={f.team} onChange={v => s("team", v)}
              options={[...teams.map(t => t.teamName), "Free Agent / Looking for a team"]}
              placeholder="Select your team..." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 14px" }}>
              <Input label="Offensive Position" type="select" value={f.offPos} onChange={v => s("offPos", v)} options={OFFPOS} placeholder="Select..." />
              <Input label="Defensive Position" type="select" value={f.defPos} onChange={v => s("defPos", v)} options={DEFPOS} placeholder="Select..." />
            </div>

            <Section title="Medical" color={C.textLight} />
            <Input label="Medical Conditions / Allergies" type="textarea" value={f.medical} onChange={v => s("medical", v)} placeholder="Anything we should be aware of..." />

            <div style={{
              display: "flex", alignItems: "flex-start", gap: "10px", margin: "20px 0",
              padding: "14px", borderRadius: "10px", background: "#f8f9fb",
            }}>
              <input type="checkbox" checked={f.terms} onChange={e => s("terms", e.target.checked)}
                style={{ marginTop: "2px", accentColor: C.green, width: "16px", height: "16px" }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: C.textMid, lineHeight: 1.6 }}>
                I agree to the FFSA rules and code of conduct. I confirm all information is accurate and consent to my photo being used for player identification.
              </span>
            </div>

            <Button variant="gold" onClick={submit} style={{ width: "100%", padding: "16px", fontSize: "15px" }}>
              Complete Registration →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Admin({ teams, players }) {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState("teams");
  const [search, setSearch] = useState("");

  // Check for existing Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setAuth(true);
    });
  }, []);

  const handleLogin = async () => {
    if (!isValidEmail(email)) { setAuthError("Please enter a valid email."); return; }
    if (!pw) { setAuthError("Please enter your password."); return; }
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: sanitize(email), password: pw });
    setAuthLoading(false);
    if (error) {
      setAuthError("Invalid credentials. Contact FFSA admin for access.");
    } else {
      setAuth(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuth(false);
    setEmail("");
    setPw("");
  };

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", padding: "110px 16px 80px", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card style={{ maxWidth: "380px", width: "100%", overflow: "hidden" }}>
          <FlagStripe height={3} />
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>🔒</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>Admin Access</h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: C.textLight, margin: "0 0 24px" }}>Sign in with your admin account</p>
            {authError && (
              <div style={{
                padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
                background: `${C.red}10`, border: `1px solid ${C.red}30`,
                fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: C.red, textAlign: "left",
              }}>{authError}</div>
            )}
            <Input type="email" value={email} onChange={setEmail} placeholder="admin@ffsa.co.za" label="Email" />
            <Input type="password" value={pw} onChange={setPw} placeholder="Password" label="Password" />
            <Button variant="primary" onClick={handleLogin} disabled={authLoading} style={{ width: "100%" }}>
              {authLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const ft = teams.filter(t => t.teamName.toLowerCase().includes(search.toLowerCase()) || t.managerName.toLowerCase().includes(search.toLowerCase()));
  const fp = players.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) || (p.team || "").toLowerCase().includes(search.toLowerCase()));

  const thStyle = {
    padding: "12px 18px", textAlign: "left", fontFamily: "'Outfit', sans-serif",
    fontSize: "11px", fontWeight: 700, color: C.textFaint,
    textTransform: "uppercase", letterSpacing: "1px", borderBottom: `1px solid ${C.border}`,
  };
  const tdStyle = { padding: "12px 18px", fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: C.textMid };

  return (
    <div style={{ minHeight: "100vh", padding: "110px 16px 80px", background: C.bg }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>Dashboard</h1>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "14px", color: C.textLight }}>Manage registrations</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} style={{ fontSize: "13px", padding: "8px 18px" }}>
            Sign Out
          </Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "28px" }}>
          {[
            { label: "Teams", value: teams.length, color: C.green },
            { label: "Players", value: players.length, color: C.gold },
            { label: "Pending", value: teams.filter(t => t.status === "Pending Payment").length, color: C.red },
            { label: "Revenue", value: `R${(teams.length * 2650).toLocaleString()}`, color: C.navy },
          ].map((st, i) => (
            <Card key={i} style={{ padding: "22px" }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: C.textFaint, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>{st.label}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 800, color: st.color }}>{st.value}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", gap: "4px", background: "#f0f1f4", borderRadius: "10px", padding: "3px", flexWrap: "wrap" }}>
            {["teams", "players"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 20px", borderRadius: "8px", border: "none",
                background: tab === t ? C.white : "transparent",
                color: tab === t ? C.navy : C.textLight,
                fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "13px",
                cursor: "pointer", transition: "all 0.2s ease",
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                textTransform: "capitalize",
              }}>{t} ({t === "teams" ? teams.length : players.length})</button>
            ))}
          </div>
          <div style={{ width: "260px" }}>
            <Input value={search} onChange={setSearch} placeholder="Search..." style={{ marginBottom: 0 }} />
          </div>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            {tab === "teams" ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Team", "Manager", "Email", "Phone", "Players", "Status", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {ft.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...tdStyle, padding: "48px", textAlign: "center", color: C.textFaint }}>No teams registered yet</td></tr>
                  ) : ft.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 ? "#fafbfc" : C.white }}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: C.navy }}>{t.teamName}</td>
                      <td style={tdStyle}>{t.managerName}</td>
                      <td style={tdStyle}>{t.managerEmail}</td>
                      <td style={tdStyle}>{t.managerPhone}</td>
                      <td style={tdStyle}>{t.numPlayers || "—"}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                          background: t.status === "Confirmed" ? `${C.green}10` : `${C.gold}15`,
                          color: t.status === "Confirmed" ? C.green : "#c08a00",
                          fontFamily: "'Outfit', sans-serif",
                        }}>{t.status}</span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: "12px", color: C.textFaint }}>{new Date(t.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Player", "Age", "Gender", "Team", "Offense", "Defense", "Email", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {fp.length === 0 ? (
                    <tr><td colSpan={8} style={{ ...tdStyle, padding: "48px", textAlign: "center", color: C.textFaint }}>No players registered yet</td></tr>
                  ) : fp.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 ? "#fafbfc" : C.white }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {p.photo && <img src={p.photo} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />}
                          <span style={{ fontWeight: 600, color: C.navy }}>{p.firstName} {p.lastName}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>{p.age}</td>
                      <td style={tdStyle}>{p.gender}</td>
                      <td style={{ ...tdStyle, color: C.green, fontWeight: 600 }}>{p.team || "Free Agent"}</td>
                      <td style={tdStyle}>
                        {p.offPos && <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", background: `${C.green}10`, color: C.green, fontWeight: 600 }}>{p.offPos.split("(")[0].trim()}</span>}
                      </td>
                      <td style={tdStyle}>
                        {p.defPos && <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", background: `${C.red}10`, color: C.red, fontWeight: 600 }}>{p.defPos.split("(")[0].trim()}</span>}
                      </td>
                      <td style={tdStyle}>{p.email}</td>
                      <td style={{ ...tdStyle, fontSize: "12px", color: C.textFaint }}>{new Date(p.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: t, error: tErr } = await supabase.from('teams').select('*');
        if (tErr) throw tErr;
        if (t) setTeams(t);
      } catch {
        // Silently fail - data will load when admin authenticates
      }
      try {
        const { data: p, error: pErr } = await supabase.from('players').select('*');
        if (pErr) throw pErr;
        if (p) setPlayers(p);
      } catch {
        // Silently fail - data will load when admin authenticates
      }
    })();
  }, []);

  const handleTeamReg = async (t) => {
    t.status = "Pending Payment";
    const { terms, ...teamData } = t;
    try {
      const { data, error } = await supabase.from('teams').insert([teamData]).select();
      if (error) { alert("Registration failed. Please try again."); return null; }
      if (data) {
        setTeams(p => [...p, data[0]]);
        return data[0]; // Return the record so TeamReg gets the database UUID
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
    return null;
  };

  const handlePlayerReg = async (p) => {
    p.status = "Registered";
    const { terms, ...playerData } = p;
    try {
      const { data, error } = await supabase.from('players').insert([playerData]).select();
      if (error) { alert("Registration failed. Please try again."); return; }
      if (data) setPlayers(prev => [...prev, data[0]]);
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        ::selection { background: ${C.green}20; }
      `}</style>
      <Nav page={page} setPage={setPage} />
      {page === "home" && <Home setPage={setPage} />}
      {page === "team" && <TeamReg onSubmit={handleTeamReg} />}
      {page === "player" && <PlayerReg onSubmit={handlePlayerReg} teams={teams} />}
      {page === "admin" && <Admin teams={teams} players={players} />}
    </div>
  );
}
