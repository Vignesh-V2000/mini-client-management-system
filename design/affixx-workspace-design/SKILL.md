---
name: affixx-workspace-design
description: "Use when the user explicitly asks for Affixx Workspace style, Affixx Workspace design, /affixx-workspace-design, or asks to apply the Affixx Workspace design system. NEVER trigger automatically for generic UI or design tasks."
version: 1.0.0
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Affixx Workspace

Build a client workspace with the order of a paper ledger and the contrast of a charcoal navigation rail. Put the client name, status, and next action first. Keep the accent limited to primary actions, focus, and navigation cues.

Read `design-model.yaml` before changing the interface. `client/src/styles/index.css` maps the tokens to the live React screens, which serve as the visual reference.

- Use Manrope for headings and metrics. Use DM Sans for controls, labels, and record data.
- Give each page one main action. Keep supporting actions outlined or text-based.
- Put status names beside their markers. Use real client counts for the dashboard chart and legend.
- Keep client records in a table on desktop and reflow the same records into stacked cards on phones.
- Keep fields visibly labeled, attach validation messages to the relevant inputs, and confirm deletion in a keyboard-accessible dialog.
- Use a static grid and geometric illustration on sign-in. Keep data surfaces flat, with borders for separation.
- Verify keyboard focus, empty states, and long contact values at desktop and phone widths.
