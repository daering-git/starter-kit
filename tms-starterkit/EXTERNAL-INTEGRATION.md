# External Integration Plan — JIRA & Slack

> Phase 8 implementation plan for TMS Starter Kit.
> This document covers architecture, data flow, API design, and UI for JIRA and Slack integrations.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [1. JIRA Integration](#1-jira-integration)
- [2. Slack Integration](#2-slack-integration)
- [3. Database Schema Changes](#3-database-schema-changes)
- [4. API Routes](#4-api-routes)
- [5. UI — Settings Page](#5-ui--settings-page)
- [6. UI — Contextual Actions](#6-ui--contextual-actions)
- [7. Environment Variables](#7-environment-variables)
- [8. File Structure](#8-file-structure)
- [9. Security Considerations](#9-security-considerations)
- [10. Future Enhancements](#10-future-enhancements)

---

## Overview

TMS integrates with **JIRA** and **Slack** to close the feedback loop between test failures and team action:

| Integration | Purpose |
|-------------|---------|
| **JIRA** | Auto-create bug tickets from failed test cases |
| **Slack** | Send run summary notifications to team channels |

Both integrations are **opt-in per workspace** and configured through the `/settings` page.

---

## Prerequisites

| Dependency | Version | Purpose |
|------------|---------|---------|
| `jira.js` | ^4.x | Atlassian JIRA REST API client |
| `@slack/web-api` | ^7.x | Slack Web API client |

```bash
npm install jira.js @slack/web-api
```

---

## 1. JIRA Integration

### 1.1 Authentication

Use **JIRA API Token** (Atlassian Cloud) authentication:

```
JIRA_HOST=https://<workspace>.atlassian.net
JIRA_EMAIL=automation@rebellions.ai
JIRA_API_TOKEN=<token>
JIRA_PROJECT_KEY=QA
```

The `jira.js` client is initialized server-side only:

```typescript
// src/features/integrations/lib/jira-client.ts
import { Version3Client } from "jira.js";

export function createJiraClient() {
  return new Version3Client({
    host: process.env.JIRA_HOST!,
    authentication: {
      basic: {
        email: process.env.JIRA_EMAIL!,
        apiToken: process.env.JIRA_API_TOKEN!,
      },
    },
  });
}
```

### 1.2 Feature: Create Bug from Failed Test

**Trigger:** User clicks "Create JIRA Issue" on a failed test case in the run detail page (`/runs/[id]`).

**Flow:**

```
User clicks "Create Issue"
  → POST /api/integrations/jira
  → Server validates session + request body (Zod)
  → jira.js creates issue in configured project
  → Returns issue key (e.g., QA-123)
  → UI shows toast with link to JIRA issue
  → TestCase.metadata stores { jiraKey: "QA-123" }
```

**JIRA Issue Template:**

```typescript
{
  fields: {
    project: { key: process.env.JIRA_PROJECT_KEY },
    issuetype: { name: "Bug" },
    summary: `[TMS] Test Failed: ${testCase.name}`,
    description: {
      type: "doc",
      version: 1,
      content: [
        // ADF (Atlassian Document Format)
        paragraph(`Suite: ${suite.name}`),
        paragraph(`Run: ${run.name} (${run.startedAt})`),
        paragraph(`Host: ${run.host || "N/A"}`),
        codeBlock(testCase.message || "No error message"),
        paragraph(`TMS Link: ${appUrl}/runs/${run.id}`),
      ],
    },
    labels: ["tms-auto", "test-failure"],
    priority: { name: "High" },
  },
}
```

### 1.3 Feature: Bulk Create Issues

**Trigger:** User selects multiple failed tests in run detail → "Create JIRA Issues" bulk action.

**Flow:**

```
User selects N failed tests → clicks "Create Issues"
  → POST /api/integrations/jira/bulk
  → Server creates N issues sequentially (JIRA rate limit: ~10 req/s)
  → Returns array of { testCaseId, jiraKey }
  → Batch update TestCase.metadata with jiraKeys
  → UI shows summary toast: "Created 5 JIRA issues"
```

### 1.4 Feature: Link Existing Issue

Allow manually linking an existing JIRA issue to a test case without creating a new one:

```
User enters "QA-456" in link dialog
  → PATCH /api/integrations/jira/link
  → Server validates issue exists via jira.js
  → Updates TestCase.metadata.jiraKey
```

---

## 2. Slack Integration

### 2.1 Authentication

Use **Slack Bot Token** (OAuth scopes: `chat:write`, `chat:write.public`):

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_DEFAULT_CHANNEL=C0123456789
```

```typescript
// src/features/integrations/lib/slack-client.ts
import { WebClient } from "@slack/web-api";

export function createSlackClient() {
  return new WebClient(process.env.SLACK_BOT_TOKEN);
}
```

### 2.2 Feature: Run Completion Notification

**Trigger:** Automatic — when XML upload processing completes (BullMQ job `onCompleted`).

**Flow:**

```
XML upload processed → BullMQ job completes
  → Worker calls notifySlack(runId)
  → Fetches run summary from DB
  → Posts formatted message to configured channel
```

**Slack Message Template (Block Kit):**

```typescript
{
  channel: process.env.SLACK_DEFAULT_CHANNEL,
  blocks: [
    // Header
    { type: "header", text: { type: "plain_text", text: "🧪 Test Run Completed" } },
    // Summary section
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Run:* ${run.name}` },
        { type: "mrkdwn", text: `*Host:* ${run.host || "N/A"}` },
        { type: "mrkdwn", text: `*Total:* ${run.total}` },
        { type: "mrkdwn", text: `*Pass Rate:* ${passRate}%` },
        { type: "mrkdwn", text: `*✅ Passed:* ${run.passed}` },
        { type: "mrkdwn", text: `*❌ Failed:* ${run.failed}` },
      ],
    },
    // Status bar (visual indicator)
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: passRate === 100
          ? "✅ All tests passed!"
          : `⚠️ ${run.failed} test(s) failed`,
      },
    },
    // Action button
    {
      type: "actions",
      elements: [{
        type: "button",
        text: { type: "plain_text", text: "View in TMS" },
        url: `${appUrl}/runs/${run.id}`,
      }],
    },
  ],
}
```

### 2.3 Feature: Manual Notification

**Trigger:** User clicks "Send to Slack" button on run detail page.

**Flow:**

```
User clicks "Send to Slack"
  → POST /api/integrations/slack
  → Server posts Block Kit message to configured channel
  → Returns { ok: true, ts: "message timestamp" }
  → UI shows toast: "Sent to #qa-automation"
```

### 2.4 Feature: Failure Alert (Optional)

When pass rate drops below a configurable threshold:

```
Run completes with passRate < threshold (default: 80%)
  → Post alert message with @channel mention
  → Include top 5 failed test names
  → Include comparison with previous run
```

---

## 3. Database Schema Changes

Add an `IntegrationConfig` model to store per-workspace settings:

```prisma
// prisma/schema.prisma

model IntegrationConfig {
  id        String   @id @default(cuid())
  type      String   // "jira" | "slack"
  enabled   Boolean  @default(false)
  config    Json     // encrypted settings blob
  createdBy String   @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([type])
  @@map("integration_configs")
}
```

**`config` JSON shape:**

```typescript
// JIRA
{
  host: string;
  email: string;       // stored, not in env for multi-tenant
  projectKey: string;
  issueType: string;   // default: "Bug"
  labels: string[];
}

// Slack
{
  defaultChannel: string;   // channel ID
  channelName: string;      // display name (for UI)
  notifyOnComplete: boolean;
  failureThreshold: number; // 0-100, alert when passRate below this
}
```

> **Note:** API tokens (`JIRA_API_TOKEN`, `SLACK_BOT_TOKEN`) remain in environment variables for security — never stored in DB.

---

## 4. API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/integrations/config` | Get all integration configs |
| `PUT` | `/api/integrations/config` | Update integration config |
| `POST` | `/api/integrations/jira` | Create single JIRA issue |
| `POST` | `/api/integrations/jira/bulk` | Create multiple JIRA issues |
| `PATCH` | `/api/integrations/jira/link` | Link existing JIRA issue |
| `POST` | `/api/integrations/slack` | Send Slack notification |
| `POST` | `/api/integrations/slack/test` | Send test message to verify setup |

**Request/Response examples:**

```typescript
// POST /api/integrations/jira
// Request
{
  testCaseId: string;
  runId: string;
}
// Response
{
  jiraKey: "QA-123";
  jiraUrl: "https://workspace.atlassian.net/browse/QA-123";
}

// POST /api/integrations/slack
// Request
{
  runId: string;
  channel?: string;  // override default channel
}
// Response
{
  ok: true;
  channel: "C0123456789";
  ts: "1234567890.123456";
}
```

**Validation (Zod schemas):**

```typescript
// src/lib/schemas.ts
export const createJiraIssueSchema = z.object({
  testCaseId: z.string().cuid(),
  runId: z.string().cuid(),
});

export const sendSlackNotificationSchema = z.object({
  runId: z.string().cuid(),
  channel: z.string().optional(),
});

export const updateIntegrationConfigSchema = z.object({
  type: z.enum(["jira", "slack"]),
  enabled: z.boolean(),
  config: z.record(z.unknown()),
});
```

---

## 5. UI — Settings Page

`/settings` page with two tabs: **JIRA** and **Slack**.

### JIRA Settings Tab

```
┌─────────────────────────────────────────────┐
│  JIRA Integration                    [Toggle]│
│                                              │
│  Host URL:     [https://xxx.atlassian.net  ] │
│  Email:        [automation@rebellions.ai   ] │
│  Project Key:  [QA                         ] │
│  Issue Type:   [Bug           ▾            ] │
│  Labels:       [tms-auto] [test-failure] [+] │
│                                              │
│  [Test Connection]            [Save Settings]│
└─────────────────────────────────────────────┘
```

- "Test Connection" calls JIRA API to verify credentials → shows success/error toast
- API token is set via env var (shown as masked hint in UI)

### Slack Settings Tab

```
┌─────────────────────────────────────────────┐
│  Slack Integration                   [Toggle]│
│                                              │
│  Default Channel:  [#qa-automation  ▾      ] │
│  ☑ Notify on run completion                  │
│  ☑ Alert on failure (threshold: [80]%)       │
│                                              │
│  [Send Test Message]          [Save Settings]│
└─────────────────────────────────────────────┘
```

- "Send Test Message" posts a sample notification to verify setup
- Channel dropdown fetched via `conversations.list` (if bot token has scope)

---

## 6. UI — Contextual Actions

### Run Detail Page (`/runs/[id]`)

Add action buttons in the run header:

```
┌──────────────────────────────────────────────┐
│  Run: smoke-test-20240115       COMPLETED    │
│  Pass: 45  Fail: 3  Skip: 2                 │
│                                              │
│  [📋 Send to Slack]  [🔗 Create JIRA Issues]│
└──────────────────────────────────────────────┘
```

### Failed Test Case Row

Add JIRA action in the test case table:

```
┌────────────────────────────────────────────────────┐
│ Name                │ Status │ Duration │ Actions  │
│─────────────────────│────────│──────────│──────────│
│ Login_Valid_User     │ ✅ PASS │ 1.2s    │          │
│ Login_Invalid_Pass   │ ❌ FAIL │ 0.8s    │ [JIRA ▾] │
│   └─ QA-123 linked  │        │          │          │
│ Checkout_Flow        │ ❌ FAIL │ 2.1s    │ [JIRA ▾] │
└────────────────────────────────────────────────────┘

JIRA dropdown:
  - Create Issue
  - Link Existing Issue (QA-XXX)
  - View QA-123 (if already linked)
```

---

## 7. Environment Variables

Add to `.env.example`:

```bash
# ─── JIRA Integration (Optional) ───
JIRA_HOST=https://yourworkspace.atlassian.net
JIRA_EMAIL=automation@company.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=QA

# ─── Slack Integration (Optional) ───
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_DEFAULT_CHANNEL=C0123456789
```

---

## 8. File Structure

```
src/
├── features/
│   └── integrations/
│       ├── lib/
│       │   ├── jira-client.ts          # JIRA API client factory
│       │   ├── jira-templates.ts       # ADF document builders
│       │   ├── slack-client.ts         # Slack API client factory
│       │   └── slack-templates.ts      # Block Kit message builders
│       ├── components/
│       │   ├── jira-settings-form.tsx  # JIRA config form
│       │   ├── slack-settings-form.tsx # Slack config form
│       │   ├── jira-issue-button.tsx   # Create/link JIRA from test case
│       │   └── slack-notify-button.tsx # Send run to Slack
│       └── types.ts                    # Integration type definitions
├── app/
│   └── (app)/
│       ├── settings/
│       │   └── page.tsx                # Settings page with integration tabs
│       └── api/
│           └── integrations/
│               ├── config/route.ts     # GET/PUT integration configs
│               ├── jira/route.ts       # POST create issue
│               ├── jira/bulk/route.ts  # POST bulk create
│               ├── jira/link/route.ts  # PATCH link existing
│               ├── slack/route.ts      # POST send notification
│               └── slack/test/route.ts # POST test message
└── lib/
    └── schemas.ts                      # + integration Zod schemas
```

---

## 9. Security Considerations

| Concern | Mitigation |
|---------|------------|
| API tokens in DB | **Never store tokens in DB.** Use environment variables only. |
| JIRA/Slack access control | Only users with `admin` role can modify integration settings. |
| Rate limiting | JIRA: max 10 issues/request in bulk. Slack: respect `retry_after` headers. |
| Input validation | All API inputs validated with Zod schemas before external calls. |
| Error exposure | Never return raw JIRA/Slack error messages to client — log server-side, return generic errors. |
| Token rotation | Document token rotation procedure in ops runbook. |

---

## 10. Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| **Webhook-based Slack** | Replace bot token with incoming webhook for simpler setup |
| **JIRA bidirectional sync** | Update test case status when JIRA issue is resolved |
| **Slack interactive messages** | Add "Rerun" / "Assign" buttons in Slack notifications |
| **Multiple channels** | Route notifications to different channels by host or suite |
| **PagerDuty integration** | Alert on critical failure patterns |
| **Microsoft Teams** | Teams webhook support for non-Slack teams |
