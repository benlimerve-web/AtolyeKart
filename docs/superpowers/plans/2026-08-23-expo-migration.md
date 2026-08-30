# Expo (React Native) Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a standalone Expo (React Native, JavaScript) app in `mobile/` that reproduces AtolyeKart's catalog + order + stock-notify flow, talking to the existing `/api/order` backend over a full URL (not a relative path).

**Architecture:** New, independent Expo project at `mobile/` inside the existing repo (not a monorepo tool — just a sibling folder with its own `package.json`). Components are ported 1:1 from `src/components/*.jsx` to React Native primitives (`View`/`Text`/`TextInput`/`Pressable`), same state machine (`idle|sending|success|error`), same webhook payload contracts. The existing web app and `api/order.js` backend are untouched.

**Tech Stack:** Expo SDK (`create-expo-app`, blank JS template), React Native core components only — no navigation library, no UI kit, no new form/checkbox/picker packages (custom `Pressable`-based checkbox and product-chip picker instead). Node's built-in `node:test` for the one pure-logic module (`webhook.js`) — zero added test dependencies.

**Spec:** `docs/superpowers/specs/2026-08-23-expo-migration-design.md`

## Global Constraints

- JavaScript only (`.js`), no TypeScript — matches root `CLAUDE.md` convention.
- No new dependency beyond what `npx expo install react-dom react-native-web @expo/metro-runtime` adds for web export support (Task 1). Do not add `@react-native-picker/picker`, `@react-native-community/checkbox`, `react-native-qrcode-svg`, or any navigation library — out of scope per spec.
- `CatalogQrCode` and `PrivacyPolicy` are **not** ported in this plan (spec: kapsam dışı). `OrderForm`'s consent checkbox text is ported, but with **no** privacy-policy link.
- Webhook calls use the **full URL** `${EXPO_PUBLIC_API_BASE_URL}/api/order`, never a relative path — the Expo app does not share an origin with the Vercel deployment.
- Env vars use the `EXPO_PUBLIC_` prefix (client-exposed, Expo's equivalent of Vite's `VITE_` prefix): `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_TOKEN`.
- No automated UI/component tests (project convention carried over from the web app — see spec's Doğrulama section). Verification for every component task is `npx expo export --platform web` exiting 0 with no bundling error. The one exception is `mobile/src/lib/webhook.js`, pure logic with no RN rendering — it gets real automated tests via Node's built-in `node --test`.
- Webhook payload contracts (unchanged from web, see `.claude/skills/atolyekart-conventions/SKILL.md`): `{ type: "order", name, product, phone }` and `{ type: "stock_notify", name, email, product }`.
- RN has no native equivalent of HTML's `required` attribute. Where the web version relied on it (name/phone/email non-empty), the RN forms add an explicit non-empty check before submitting, mirroring the existing `EMAIL_PATTERN` check style already used in the web `StockNotifyForm`.

---

## Task 1: Scaffold the Expo project with web export support

**Files:**
- Create: `mobile/` (entire Expo project scaffold, via CLI)

**Interfaces:**
- Produces: a runnable Expo project at `mobile/` whose `npx expo export --platform web` succeeds. All later tasks run their commands with `mobile/` as the working directory.

- [ ] **Step 1: Scaffold the project**

Run from the repo root (`C:\Users\HP\AtolyeKart`):

```bash
npx create-expo-app@latest mobile --template blank
```

This creates `mobile/App.js`, `mobile/package.json`, `mobile/app.json`, `mobile/.gitignore`, `mobile/node_modules/`, etc. It's plain JavaScript (`blank` template, not `blank-typescript`).

- [ ] **Step 2: Add web export support**

```bash
cd mobile
npx expo install react-dom react-native-web @expo/metro-runtime
```

- [ ] **Step 3: Verify the default scaffold builds for web**

```bash
npx expo export --platform web
```

Expected: exits 0, prints a `dist/` output summary, no errors. (Ignore the default "Open up App.js" placeholder screen — it will be replaced in Task 9.)

- [ ] **Step 4: Confirm `.env`/`.env.example` will be tracked/ignored correctly**

```bash
cd ..
echo "test" > mobile/.env
echo "test" > mobile/.env.example
git status --short mobile/
```

Expected: `mobile/.env` does **not** appear (root `.gitignore`'s `.env*` pattern matches it), `mobile/.env.example` appears as untracked (root `.gitignore`'s `!.env.example` un-ignores it). Then remove the throwaway files:

```bash
rm mobile/.env mobile/.env.example
```

- [ ] **Step 5: Commit**

```bash
git add mobile/
git commit -m "chore(mobile): scaffold Expo project with web export support"
```

---

## Task 2: Foundation files — theme, product data, env template

**Files:**
- Create: `mobile/src/theme.js`
- Create: `mobile/src/data/products.js`
- Create: `mobile/.env.example`
- Create: `mobile/.env` (local only, not committed)

**Interfaces:**
- Produces: `theme.colors` object with keys `background, cardBackground, text, textMuted, accent, accentDark, border, white, error` (all hex strings). `products` array of `{ id, name, category, price, description, icon }`, identical content to `src/data/products.js` in the web app.
- Consumes: nothing.

- [ ] **Step 1: Create the theme file**

`mobile/src/theme.js`:

```js
// Web (`src/index.css`) ile aynı renk paleti, RN StyleSheet'lerinde kullanmak için.
export const theme = {
  colors: {
    background: "#f7f1e8",
    cardBackground: "#fffaf2",
    text: "#3b2a1e",
    textMuted: "#7a6a58",
    accent: "#b5651d",
    accentDark: "#6b4226",
    border: "#e4d5c1",
    white: "#ffffff",
    error: "#a13d3d",
  },
};
```

- [ ] **Step 2: Create the product data file**

`mobile/src/data/products.js`:

```js
// Web projesindeki src/data/products.js ile birebir aynı içerik (elle
// senkronize edilen kopya — bkz. docs/superpowers/specs/2026-08-23-expo-migration-design.md).
export const products = [
  {
    id: "seramik-kupa",
    name: "Seramik Kupa",
    category: "seramik",
    price: 450,
    description: "Elde şekillendirilmiş, sırlı seramikten günlük kullanım kupası.",
    icon: "🏺",
  },
  {
    id: "ceviz-kesme-tahtasi",
    name: "Ceviz Kesme Tahtası",
    category: "ahsap",
    price: 620,
    description: "Doğal ceviz ağacından, özenle işlenmiş mutfak kesme tahtası.",
    icon: "🪵",
  },
  {
    id: "gumus-kolye",
    name: "Gümüş Kolye",
    category: "taki",
    price: 780,
    description: "925 ayar gümüşten, el işçiliğiyle üretilmiş özgün kolye.",
    icon: "💍",
  },
];
```

- [ ] **Step 3: Create the env template**

`mobile/.env.example`:

```
# Sipariş Ver ve Stok Bildirimi Iste formlarının POST ettiği backend'in tam adresi
# (relative path DEĞİL — Expo app aynı origin'de çalışmıyor).
EXPO_PUBLIC_API_BASE_URL=

# api/order.js'in doğruladığı Authorization: Bearer <token> — web'deki
# VITE_API_TOKEN ile aynı değer kullanılabilir.
EXPO_PUBLIC_API_TOKEN=
```

- [ ] **Step 4: Create the local `.env` with real values**

`mobile/.env` (not committed — confirmed ignored in Task 1 Step 4):

```
EXPO_PUBLIC_API_BASE_URL=https://atolyekart-three.vercel.app
EXPO_PUBLIC_API_TOKEN=<web'deki .env dosyasındaki VITE_API_TOKEN değerini buraya kopyala>
```

- [ ] **Step 5: Verify nothing broke**

```bash
cd mobile
npx expo export --platform web
```

Expected: exits 0 (these are plain data/constant files, nothing imports them yet, so this just re-confirms the baseline still builds).

- [ ] **Step 6: Commit**

```bash
cd ..
git add mobile/src/theme.js mobile/src/data/products.js mobile/.env.example
git commit -m "feat(mobile): add theme palette, product data, and env template"
```

(`mobile/.env` is intentionally not staged — it's gitignored.)

---

## Task 3: `webhook.js` with automated tests

**Files:**
- Create: `mobile/src/package.json`
- Create: `mobile/src/lib/webhook.js`
- Create: `mobile/src/lib/webhook.test.js`

**Interfaces:**
- Produces: `sendToWebhook(payload)` — async function, `payload` is a plain object (`{ type, name, product, phone }` or `{ type, name, email, product }`). Returns `Promise<{ ok: true } | { ok: false, error: string }>`. Reads `process.env.EXPO_PUBLIC_API_BASE_URL` and `process.env.EXPO_PUBLIC_API_TOKEN` at call time (not at module load time — needed so tests can vary them per-test).
- Consumes: nothing (this is the leaf dependency `OrderForm`/`StockNotifyForm` will consume in later tasks).

- [ ] **Step 1: Scope this directory to ES modules for Node's native test runner**

`mobile/src/package.json` (this does **not** affect Metro/Expo bundling — Metro transpiles all `.js` via Babel regardless of this file; it only tells Node's own module loader, used by `node --test`, how to parse files under `src/`):

```json
{
  "type": "module"
}
```

- [ ] **Step 2: Write the failing tests**

`mobile/src/lib/webhook.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { sendToWebhook } from "./webhook.js";

function setEnv() {
  process.env.EXPO_PUBLIC_API_BASE_URL = "https://example.test";
  process.env.EXPO_PUBLIC_API_TOKEN = "test-token";
}

test("sendToWebhook: env değişkenleri eksikse ok:false döner", async () => {
  delete process.env.EXPO_PUBLIC_API_BASE_URL;
  delete process.env.EXPO_PUBLIC_API_TOKEN;

  const result = await sendToWebhook({ type: "order" });

  assert.deepEqual(result, {
    ok: false,
    error: "Bağlantı hatası, lütfen tekrar deneyin.",
  });

  setEnv();
});

test("sendToWebhook: başarılı istekte tam URL'e POST eder ve ok:true döner", async () => {
  setEnv();
  let calledUrl;
  let calledOptions;
  global.fetch = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return { ok: true, json: async () => ({ ok: true }) };
  };

  const result = await sendToWebhook({ type: "order", name: "Ada", product: "Seramik Kupa", phone: "555" });

  assert.equal(calledUrl, "https://example.test/api/order");
  assert.equal(calledOptions.method, "POST");
  assert.equal(calledOptions.headers.Authorization, "Bearer test-token");
  assert.equal(calledOptions.headers["Content-Type"], "application/json");
  assert.equal(
    calledOptions.body,
    JSON.stringify({ type: "order", name: "Ada", product: "Seramik Kupa", phone: "555" })
  );
  assert.deepEqual(result, { ok: true });
});

test("sendToWebhook: backend ok:false dönerse ok:false döner", async () => {
  setEnv();
  global.fetch = async () => ({ ok: true, json: async () => ({ ok: false }) });

  const result = await sendToWebhook({ type: "order" });

  assert.deepEqual(result, {
    ok: false,
    error: "Bağlantı hatası, lütfen tekrar deneyin.",
  });
});

test("sendToWebhook: HTTP hatası (response.ok false) durumunda ok:false döner", async () => {
  setEnv();
  global.fetch = async () => ({ ok: false, json: async () => ({}) });

  const result = await sendToWebhook({ type: "order" });

  assert.deepEqual(result, {
    ok: false,
    error: "Bağlantı hatası, lütfen tekrar deneyin.",
  });
});

test("sendToWebhook: fetch throw ederse ok:false döner", async () => {
  setEnv();
  global.fetch = async () => {
    throw new Error("network down");
  };

  const result = await sendToWebhook({ type: "order" });

  assert.deepEqual(result, {
    ok: false,
    error: "Bağlantı hatası, lütfen tekrar deneyin.",
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
cd mobile
node --test src/lib/webhook.test.js
```

Expected: FAIL — `webhook.js` doesn't exist yet, import error.

- [ ] **Step 4: Write the implementation**

`mobile/src/lib/webhook.js`:

```js
// Sipariş Ver ve Stok Bildirimi Iste formlarının gönderim yaptığı ortak endpoint.
// Web sürümünden farklı olarak burada TAM URL kullanılır (EXPO_PUBLIC_API_BASE_URL +
// /api/order) — Expo uygulaması Vercel ile aynı origin'de çalışmıyor.
// Payload formatı için bkz. .claude/skills/atolyekart-conventions/SKILL.md
export async function sendToWebhook(payload) {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const apiToken = process.env.EXPO_PUBLIC_API_TOKEN;

  if (!apiBaseUrl || !apiToken) {
    console.error(
      "EXPO_PUBLIC_API_BASE_URL veya EXPO_PUBLIC_API_TOKEN tanımlı değil. .env dosyasını kontrol edin (bkz. .env.example)."
    );
    return { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
    }

    const result = await response.json();
    return result.ok
      ? { ok: true }
      : { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
  } catch {
    return { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
node --test src/lib/webhook.test.js
```

Expected: all 5 tests PASS.

- [ ] **Step 6: Verify the RN/Metro bundle still builds** (this file will be unused until Task 5, but confirm Babel parses it fine standalone)

```bash
npx expo export --platform web
```

Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
cd ..
git add mobile/src/package.json mobile/src/lib/webhook.js mobile/src/lib/webhook.test.js
git commit -m "feat(mobile): add sendToWebhook with automated tests (node --test)"
```

---

## Task 4: `ProductImage` component

**Files:**
- Create: `mobile/src/components/ProductImage.js`

**Interfaces:**
- Consumes: `theme.colors` from `mobile/src/theme.js`.
- Produces: default export `ProductImage({ icon, category })` — renders a circular `View` with the `icon` emoji centered as `Text`. `Image` is intentionally not used — `icon` is an emoji string, not an image asset (see spec).

- [ ] **Step 1: Write the component**

`mobile/src/components/ProductImage.js`:

```jsx
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme";

export default function ProductImage({ icon, category }) {
  return (
    <View
      style={styles.circle}
      accessibilityRole="image"
      accessibilityLabel={category}
    >
      <Text style={styles.icon}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  icon: {
    fontSize: 40,
  },
});
```

- [ ] **Step 2: Verify the bundle still builds**

```bash
cd mobile
npx expo export --platform web
```

Expected: exits 0, no errors mentioning `ProductImage.js`. (It isn't imported by anything yet, so this only checks Babel can parse the file — Metro would still error on syntax problems even in an unreferenced file if it happens to scan it, but the authoritative check comes in Task 7 once `ProductCard` imports it.)

- [ ] **Step 3: Commit**

```bash
cd ..
git add mobile/src/components/ProductImage.js
git commit -m "feat(mobile): add ProductImage component"
```

---

## Task 5: `OrderForm` component

**Files:**
- Create: `mobile/src/components/OrderForm.js`

**Interfaces:**
- Consumes: `sendToWebhook(payload)` from `../lib/webhook.js` (Task 3). `theme.colors` from `../theme.js`.
- Produces: default export `OrderForm({ productName })`. Internal state machine `idle|sending|success|error` identical to the web version. Calls `sendToWebhook({ type: "order", name, product: productName, phone })`.

- [ ] **Step 1: Write the component**

`mobile/src/components/OrderForm.js`:

```jsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { sendToWebhook } from "../lib/webhook";
import { theme } from "../theme";

export default function OrderForm({ productName }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setStatus("error");
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setStatus("sending");
    setError("");

    const result = await sendToWebhook({
      type: "order",
      name,
      product: productName,
      phone,
    });

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "success") {
    return <Text style={styles.success}>Talebiniz alındı, teşekkürler!</Text>;
  }

  const canSubmit = status !== "sending" && consent;

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Ürün</Text>
      <Text style={styles.readOnlyValue}>{productName}</Text>

      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ad Soyad"
      />

      <Text style={styles.label}>Telefon</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Telefon"
        keyboardType="phone-pad"
      />

      <Pressable
        style={styles.consentRow}
        onPress={() => setConsent((prev) => !prev)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consent }}
      >
        <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
          {consent ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={styles.consentText}>
          Adım, telefon numaram ve sipariş bilgilerimin bu talebi işlemek
          amacıyla işlenmesini kabul ediyorum.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.buttonText}>
          {status === "sending" ? "Gönderiliyor..." : "Gönder"}
        </Text>
      </Pressable>

      {status === "error" && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 16,
    gap: 8,
    width: "100%",
  },
  label: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  readOnlyValue: {
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 14,
    lineHeight: 14,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  success: {
    marginTop: 16,
    color: theme.colors.accentDark,
    fontWeight: "bold",
  },
  error: {
    color: theme.colors.error,
    fontSize: 13,
  },
});
```

- [ ] **Step 2: Verify the bundle still builds**

```bash
cd mobile
npx expo export --platform web
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
cd ..
git add mobile/src/components/OrderForm.js
git commit -m "feat(mobile): add OrderForm component"
```

---

## Task 6: `StockNotifyForm` component

**Files:**
- Create: `mobile/src/components/StockNotifyForm.js`

**Interfaces:**
- Consumes: `sendToWebhook(payload)` from `../lib/webhook.js` (Task 3). `theme.colors` from `../theme.js`. Prop `products` — array of `{ id, name, category, price, description, icon }` (same shape as `mobile/src/data/products.js`).
- Produces: default export `StockNotifyForm({ products })`. Calls `sendToWebhook({ type: "stock_notify", name, email, product })`.

- [ ] **Step 1: Write the component**

`mobile/src/components/StockNotifyForm.js`:

```jsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { sendToWebhook } from "../lib/webhook";
import { theme } from "../theme";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StockNotifyForm({ products }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState(products[0]?.name ?? "");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) {
      setStatus("error");
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus("error");
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setStatus("sending");
    setError("");

    const result = await sendToWebhook({
      type: "stock_notify",
      name,
      email,
      product,
    });

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "success") {
    return <Text style={styles.success}>Talebiniz alındı, teşekkürler!</Text>;
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Ürün</Text>
      <View style={styles.chipRow}>
        {products.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.chip, product === p.name && styles.chipActive]}
            onPress={() => setProduct(p.name)}
          >
            <Text
              style={[
                styles.chipText,
                product === p.name && styles.chipTextActive,
              ]}
            >
              {p.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ad Soyad"
      />

      <Text style={styles.label}>E-posta</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="E-posta"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Pressable
        style={[styles.button, status === "sending" && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={status === "sending"}
      >
        <Text style={styles.buttonText}>
          {status === "sending" ? "Gönderiliyor..." : "Gönder"}
        </Text>
      </Pressable>

      {status === "error" && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 16,
    gap: 8,
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
  },
  label: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.cardBackground,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.accentDark,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  success: {
    marginTop: 16,
    color: theme.colors.accentDark,
    fontWeight: "bold",
  },
  error: {
    color: theme.colors.error,
    fontSize: 13,
  },
});
```

- [ ] **Step 2: Verify the bundle still builds**

```bash
cd mobile
npx expo export --platform web
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
cd ..
git add mobile/src/components/StockNotifyForm.js
git commit -m "feat(mobile): add StockNotifyForm component"
```

---

## Task 7: `ProductCard` component

**Files:**
- Create: `mobile/src/components/ProductCard.js`

**Interfaces:**
- Consumes: `ProductImage` (Task 4, default export, props `{ icon, category }`). `OrderForm` (Task 5, default export, props `{ productName }`). `theme.colors`. Prop `product` — `{ id, name, category, price, description, icon }`.
- Produces: default export `ProductCard({ product })`. Local `showOrderForm` boolean state toggles between a "Sipariş Ver" button and `<OrderForm productName={product.name} />`.

- [ ] **Step 1: Write the component**

`mobile/src/components/ProductCard.js`:

```jsx
import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import ProductImage from "./ProductImage";
import OrderForm from "./OrderForm";
import { theme } from "../theme";

export default function ProductCard({ product }) {
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <View style={styles.card}>
      <ProductImage icon={product.icon} category={product.category} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price} TL</Text>
      <Text style={styles.desc}>{product.description}</Text>

      {showOrderForm ? (
        <OrderForm productName={product.name} />
      ) : (
        <Pressable style={styles.button} onPress={() => setShowOrderForm(true)}>
          <Text style={styles.buttonText}>Sipariş Ver</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.accentDark,
    marginTop: 12,
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.accent,
    marginTop: 4,
  },
  desc: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
});
```

- [ ] **Step 2: Verify the bundle still builds** (this is the first task where `ProductImage`/`OrderForm` are actually imported — the authoritative check that Tasks 4–5's syntax is correct)

```bash
cd mobile
npx expo export --platform web
```

Expected: exits 0, no import errors for `./ProductImage` or `./OrderForm`.

- [ ] **Step 3: Commit**

```bash
cd ..
git add mobile/src/components/ProductCard.js
git commit -m "feat(mobile): add ProductCard component"
```

---

## Task 8: `ProductList` component

**Files:**
- Create: `mobile/src/components/ProductList.js`

**Interfaces:**
- Consumes: `products` from `../data/products.js` (Task 2). `ProductCard` (Task 7, default export, props `{ product }`). `theme.colors`.
- Produces: default export `ProductList()` — no props. Local `activeCategory` state (`"all" | "seramik" | "ahsap" | "taki"`), filters `products` and renders a `ProductCard` per visible product.

**Note (deliberate spec deviation):** the design spec describes the product list as rendered "inside a `ScrollView`". This component uses a plain `View` instead — the actual scrolling `ScrollView` lives in `App.js` (Task 9), wrapping the whole screen. Nesting a second `ScrollView` inside it here would trigger RN's "VirtualizedLists should never be nested" warning and fight the outer scroll. One outer `ScrollView` achieves the same scrollable-catalog behavior the spec intends.

- [ ] **Step 1: Write the component**

`mobile/src/components/ProductList.js`:

```jsx
import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { products } from "../data/products";
import ProductCard from "./ProductCard";
import { theme } from "../theme";

const categories = [
  { id: "all", label: "Tümü" },
  { id: "seramik", label: "Seramik" },
  { id: "ahsap", label: "Ahşap" },
  { id: "taki", label: "Takı" },
];

export default function ProductList() {
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <View>
      <View style={styles.filters}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.filterChip,
              category.id === activeCategory && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text
              style={[
                styles.filterText,
                category.id === activeCategory && styles.filterTextActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterText: {
    fontSize: 13,
    color: theme.colors.accentDark,
  },
  filterTextActive: {
    color: theme.colors.white,
  },
});
```

- [ ] **Step 2: Verify the bundle still builds**

```bash
cd mobile
npx expo export --platform web
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
cd ..
git add mobile/src/components/ProductList.js
git commit -m "feat(mobile): add ProductList component"
```

---

## Task 9: Wire up `App.js`

**Files:**
- Modify: `mobile/App.js` (replace the scaffold's default placeholder content entirely)

**Interfaces:**
- Consumes: `ProductList` (Task 8, default export, no props). `StockNotifyForm` (Task 6, default export, props `{ products }`). `products` from `./src/data/products.js` (Task 2). `theme.colors`.
- Produces: default export `App()` — the app's root component. No consumers (this is the entry point).

- [ ] **Step 1: Replace `App.js`**

`mobile/App.js`:

```jsx
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import ProductList from "./src/components/ProductList";
import StockNotifyForm from "./src/components/StockNotifyForm";
import { products } from "./src/data/products";
import { theme } from "./src/theme";

export default function App() {
  const [showStockForm, setShowStockForm] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Kilden</Text>
          <Text style={styles.subtitle}>
            El Yapımı Seramik ve Doğal Malzeme Atölyesi
          </Text>
        </View>

        <ProductList />

        <View style={styles.stockSection}>
          {showStockForm ? (
            <StockNotifyForm products={products} />
          ) : (
            <Pressable
              style={styles.stockButton}
              onPress={() => setShowStockForm(true)}
            >
              <Text style={styles.stockButtonText}>Stok Bildirimi Iste</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.footer}>Kilden © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.accentDark,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  stockSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: "center",
  },
  stockButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  stockButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
```

- [ ] **Step 2: Verify the full app bundle builds**

```bash
cd mobile
npx expo export --platform web
```

Expected: exits 0, no import errors anywhere in the tree (`App.js` → `ProductList` → `ProductCard` → `ProductImage`/`OrderForm`, and `App.js` → `StockNotifyForm`).

- [ ] **Step 3: Commit**

```bash
cd ..
git add mobile/App.js
git commit -m "feat(mobile): wire up App.js with ProductList and StockNotifyForm"
```

---

## Task 10: Final verification and quick-start docs

**Files:**
- Create: `mobile/README.md`

**Interfaces:**
- Consumes: nothing new — this task only verifies the assembled app and documents how to run it.
- Produces: nothing consumed by other tasks (terminal task).

- [ ] **Step 1: Run the full pure-logic test suite**

```bash
cd mobile
node --test src/lib/webhook.test.js
```

Expected: all 5 tests PASS (same as Task 3, re-confirmed after all later changes).

- [ ] **Step 2: Run Expo's project health check**

```bash
npx expo-doctor
```

Expected: no failing checks related to project structure/config. (Advisory only — if it reports something outside this plan's control, e.g. a newer SDK being available, note it but don't block on it.)

- [ ] **Step 3: Run the comprehensive export (default platforms: ios, android, web)**

```bash
npx expo export
```

Expected: exits 0, produces `dist/` with bundles for all three platforms, no errors.

- [ ] **Step 4: Write the quick-start README**

`mobile/README.md`:

```markdown
# AtolyeKart — Mobile (Expo)

Kilden atölyesinin katalog/sipariş/stok-bildirimi akışının Expo (React Native) karşılığı. Web sürümüyle (`../src/`) aynı `/api/order` backend'ini kullanır — tam URL üzerinden (bkz. `src/lib/webhook.js`), çünkü bu uygulama web sitesiyle aynı origin'de çalışmaz.

## Kurulum

\`\`\`bash
cd mobile
npm install
cp .env.example .env
# .env içine EXPO_PUBLIC_API_BASE_URL ve EXPO_PUBLIC_API_TOKEN değerlerini gir
# (web projesinin .env dosyasındaki VITE_API_TOKEN ile aynı değer kullanılabilir)
\`\`\`

## Geliştirme

\`\`\`bash
npx expo start
\`\`\`

QR kodu Expo Go uygulamasıyla (iOS/Android) okutarak cihazda çalıştırabilirsiniz.

## Test

\`\`\`bash
node --test src/lib/webhook.test.js
\`\`\`

## Kapsam Dışı (bu sürümde yok)

- Katalog QR kodu ekranı (web'de var, `react-native-qrcode-svg` ile taşınabilir)
- Gizlilik Politikası ekranı (Sipariş Ver formundaki rıza metni var, ama linki yok)

Detaylar için: `../docs/superpowers/specs/2026-08-23-expo-migration-design.md`
```

- [ ] **Step 5: Commit**

```bash
cd ..
git add mobile/README.md
git commit -m "docs(mobile): add quick-start README"
```

- [ ] **Step 6: Push**

```bash
git push origin master
```
