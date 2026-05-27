---
name: calendar-analysis
description: Analyze a Google Calendar and produce an interactive HTML dashboard with a weekly heatmap, event breakdown by category, conflict detection, and actionable optimization flags. Use this skill whenever the user asks to analyze their calendar, check for scheduling conflicts, get a calendar overview or heatmap, optimize their schedule, or generate a weekly/monthly calendar report. Always trigger this skill — do not attempt to do a calendar analysis without it.
---

# Skill: Calendar Analysis Dashboard

## Purpose
Fetch Google Calendar events over a configurable time window and produce a self-contained interactive HTML report covering: event categorization, weekly heatmap, conflict detection, and ranked action items.

## Prerequisites
- Google Calendar connector must be active (`Google Calendar:gcal_list_events`)
- Default time range: today → today + 35 days (5 weeks)

---

## Execution steps

### 1. Fetch events
```
Google Calendar:gcal_list_events(
  timeMin: <today>,
  timeMax: <today + 35 days>,
  timeZone: "Europe/Amsterdam",
  maxResults: 250,
  condenseEventDetails: false
)
```

### 2. Categorize events
Map each **non-all-day** event to one category (first match wins):

| Category | Keywords / patterns |
|----------|---------------------|
| Fitness  | CrossFit, SVV, sport, gym, training, yoga, voetbal |
| Work     | client/project names, meeting, call, standup, demo, review, NowNation, CIS, exam |
| Admin    | gemeente, paspoort, RDW, monteur, afspraak, aangifte, belasting |
| Finance  | BTW, boekhouder, belasting, factuur, payday |
| Social   | drinks, borrel, verjaardag party, dinner, lunch, meet, borrelen |
| Travel   | weekend, motor, vakantie, trip, fly, train, BERRT, allroad |
| Personal | date night, jarig (self), bubbletent, camper, birthday |
| Planning | prep and plan, weekly review, planning |

> All-day events (birthdays, markers) are excluded from counts and heatmap unless multi-day travel blocks.

### 3. Detect issues — flag automatically

- **Conflicts**: two non-all-day events with overlapping time on the same day → 🔴
- **Timezone artifacts**: events scheduled 00:00–05:00 local time → 🟡
- **Dense stretches**: 3+ consecutive days with 3+ events each → 🟡
- **No deep work**: Work events < 2 in any active work week → 🟡
- **Missing logistics**: long-distance event (RDW, BERRT, motor) followed by an early-start event next day with no overnight plan → 🟡

### 4. Build HTML dashboard
Single self-contained file, dark theme, inline CSS only (no external dependencies).

#### Required sections
1. **Header**: title, date range, timezone, total events
2. **Stats row** (3 cards): total events, avg/week, work event count
3. **Category bar chart**: horizontal bars, color-coded, count labels
4. **5-week heatmap**: Mon–Sun grid, event pills per day, inline conflict warnings (⚠️)
5. **Observations panel**: ranked 🔴 / 🟡 / 🟢, plain language, one insight per item
6. **Action items list**: one actionable sentence per flag

#### Color palette
```
background:  #0f1117    card: #1e2130    border: #2d3148    text: #e2e8f0

fitness:   bg #1a3a2a  text #4ade80  accent #22c55e
social:    bg #2a1f3a  text #c084fc  accent #a855f7
admin:     bg #3a2a1a  text #fb923c  accent #f97316
work:      bg #1a2a3a  text #60a5fa  accent #3b82f6
personal:  bg #3a1a2a  text #f472b6  accent #ec4899
travel:    bg #3a3a1a  text #facc15  accent #eab308
planning:  bg #1a2a2a  text #2dd4bf  accent #14b8a6
finance:   bg #2a1a1a  text #f87171  accent #ef4444
```

### 5. Output
- Save HTML to `/mnt/user-data/outputs/calendar_analysis.html`
- Call `present_files` to share it
- List top 3 flags as plain text below the file link

---

## Configuration (accept from user)
| Parameter     | Default           | Notes                                |
|---------------|-------------------|--------------------------------------|
| time_range    | today → +35 days  | Accepts "this week", "next month"    |
| timezone      | Europe/Amsterdam  | IANA format                          |
| work_keywords | ask if unclear    | Client/project names for Work match  |
| output_format | HTML dashboard    | Can produce plain text on request    |

---

## Notes
- Recurring event instances are counted individually
- If Google Calendar connector unavailable: inform user and stop
- Conflict check: compare start/end of every pair of same-day events
- BTW/belasting at 00:00–05:00 = almost always a timezone import artifact, always flag
