/**
 * Visual icon picker for the Tina admin. Lets editors browse the Phosphor
 * icon set and pick one — the field stores the selected icon's name string,
 * which is what the runtime PhosphorIcon component already expects.
 *
 * Wire up via `ui.component: IconPicker` on any `type: "string"` field.
 */

import { useMemo, useState } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { wrapFieldsWithMeta } from "tinacms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Icons = PhosphorIcons as unknown as Record<string, any>;

// Build the catalog once. Phosphor exports each icon under both its base
// name (e.g. `Acorn`) and a legacy `*Icon` alias — keep only the base names.
const ALL_ICON_NAMES: string[] = Object.keys(Icons)
  .filter(
    (name) =>
      /^[A-Z]/.test(name) &&
      !name.endsWith("Icon") &&
      name !== "IconContext"
  )
  .sort();

const MAX_RESULTS = 240;

interface IconPickerProps {
  input: {
    value: string;
    onChange: (value: string) => void;
  };
}

function IconPickerInner({ input }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const value = input.value || "";
  const Selected = value ? Icons[value] : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICON_NAMES.slice(0, MAX_RESULTS);
    return ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(q)).slice(
      0,
      MAX_RESULTS
    );
  }, [query]);

  return (
    <div style={{ width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "8px 10px",
          border: "1px solid var(--tina-color-grey-3, #d4d4d8)",
          borderRadius: 6,
          background: "white",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f4f4f5",
            borderRadius: 4,
            color: "#1f2937",
          }}
        >
          {Selected ? <Selected size={20} weight="regular" /> : null}
        </span>
        <span
          style={{
            flex: 1,
            textAlign: "left",
            color: value ? "#111827" : "#9ca3af",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
          }}
        >
          {value || "Select an icon"}
        </span>
        <span style={{ color: "#9ca3af", fontSize: 12 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            border: "1px solid var(--tina-color-grey-3, #d4d4d8)",
            borderRadius: 6,
            background: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <input
              type="text"
              placeholder="Search Phosphor icons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                padding: "6px 10px",
                border: "1px solid #d4d4d8",
                borderRadius: 4,
                fontSize: 13,
                outline: "none",
              }}
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  input.onChange("");
                }}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #d4d4d8",
                  borderRadius: 4,
                  background: "white",
                  fontSize: 12,
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
              gap: 4,
              maxHeight: 320,
              overflowY: "auto",
              padding: 2,
            }}
          >
            {filtered.map((name) => {
              const Icon = Icons[name];
              if (!Icon) return null;
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    input.onChange(name);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{
                    aspectRatio: "1 / 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${
                      isSelected ? "#2563eb" : "transparent"
                    }`,
                    background: isSelected ? "#eff6ff" : "transparent",
                    borderRadius: 4,
                    cursor: "pointer",
                    color: "#1f2937",
                    transition: "background 80ms",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f4f4f5";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                  }}
                >
                  <Icon size={20} weight="regular" />
                </button>
              );
            })}
          </div>

          {filtered.length === MAX_RESULTS && !query && (
            <p
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              Showing first {MAX_RESULTS} of {ALL_ICON_NAMES.length} icons —
              search to find more.
            </p>
          )}
          {filtered.length === 0 && (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              No icons match &quot;{query}&quot;.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const IconPicker = wrapFieldsWithMeta(IconPickerInner);
