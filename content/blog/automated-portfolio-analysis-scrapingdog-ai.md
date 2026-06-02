---
title: "Automated Weekly Portfolio Analysis with ScrapingDog and AI"
slug: "automated-portfolio-analysis-scrapingdog-ai"
date: "2026-06-02"
excerpt: "Every week, a full market analysis lands in the investor's inbox automatically — live prices, macro context, risk signals, and a clear recommendation per position. Here is how the workflow is built."
tags:
  - automation
  - AI agents
  - finance
  - n8n
coverImage: "Portfolio analysis automation workflow"
published: true
---

Every week, this email lands in the investor's inbox automatically. A full market analysis of every position — bull signals, risk alerts, and a clear AI recommendation. No manual research. No wasted morning.

Here is how it is built.

## The problem with manual market research

Staying on top of a portfolio means checking multiple sources every week. Google Finance for prices and fundamentals. News sites for company headlines. Macro calendars for Fed decisions, CPI releases, rate moves.

That is an hour of work, every single week, pulling data that is already going stale by the time you finish.

Most investors either skip the research or do it inconsistently. Both are expensive habits.

## The workflow

The automation runs on a weekly schedule in n8n. It starts with a Google Sheets watchlist — a simple list of active positions. One trigger fires, reads every row, and immediately hands the symbols to ScrapingDog.

### ScrapingDog as the data engine

ScrapingDog is integrated directly as a native n8n node. No scraping setup. No brittle CSS selectors. No proxies to manage.

For each symbol in the watchlist, it hits Google Finance and returns clean JSON — live price, key financials, and market stats. One node, one call, structured output ready for the next step.

At the same time, two Google News queries run in parallel.

The first captures the week's macro picture — Fed decisions, CPI data, interest rate moves, anything that affects the whole market.

The second scans for systemic risk — breaking news, contagion signals, emergency events.

Then for each individual position, a separate call pulls the week's headlines from Reuters, Bloomberg, and the Wall Street Journal. One call per symbol.

### The AI layer

Now all that data flows into a single AI agent — portfolio positions, Google Finance fundamentals, macro context, risk signals, and per-symbol news.

The agent processes everything at once and returns a structured weekly report. For each position: a summary of bull catalysts, a summary of bear risks, and a clear recommendation — Hold, Add, Trim, or Exit.

Not a generic summary. A structured decision framework, applied consistently to every position, every week.

### Delivery

The report renders as a clean HTML email and goes straight to Gmail. The investor opens it on Monday morning, reads the analysis, and makes the call.

ScrapingDog feeds the data. The AI writes the analysis. The investor decides.

## Why this architecture works

The usual approach to market research automation breaks down in two places.

First, the data layer. Scraping financial sites is fragile. Sites change layouts, block bots, and return inconsistent formats. ScrapingDog removes that problem entirely — it handles the scraping infrastructure and returns clean, predictable JSON.

Second, the analysis layer. Most automations stop at data delivery. They give you a dashboard or a spreadsheet. That still requires the investor to do the synthesis.

This workflow goes further. The AI agent does not just aggregate — it reasons. It connects the macro picture to the individual position, weighs the risk signals, and produces a recommendation with an explanation. The human reviews and decides. The machine does the preparation.

## What makes it reliable in production

Three things keep this workflow stable week after week.

**Structured output.** The AI agent is constrained to return a fixed JSON schema for each position. No free-form responses that require parsing. The email renderer always gets the same shape of data.

**Parallel processing.** The macro and risk news queries run simultaneously, not sequentially. The per-symbol calls are batched. The total runtime stays short even as the watchlist grows.

**Single source of truth.** The Google Sheets watchlist is the only place that needs to be updated. Add a position, it is covered in the next run. Remove one, it disappears from the report. No workflow editing required.

## The broader pattern

This workflow is a specific application of a pattern that works across many domains — automated research, synthesis, and structured delivery.

The same architecture applies to competitor monitoring, customer feedback analysis, supply chain alerts, or any domain where the bottleneck is not the decision but the preparation that leads to it.

The decision still belongs to the human. The preparation no longer has to.
