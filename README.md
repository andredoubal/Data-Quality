# ZATCA Data Quality Academy

A React learning portal that teaches the team how data quality works for ZATCA's **Customs (FASAH), Tax and E-Invoicing (FATOORA)** data, end to end: the mindset, the framework, the roles, every building block, where issues come from, and the tools we use to run the process.

## What's inside

| Section | Pages |
|---|---|
| Start here | Overview with the storyline, the three data domains and the program roadmap (foundational → activation → BAU) |
| Foundations | Proactive DQ · Reactive DQ · DQ Framework (framework cycle, six standards, delivery methodology, use-case assessment approach, DQ request lifecycle, BAU remediation lifecycle, end-to-end swimlane) · Roles & Responsibilities (role cards + RACI) |
| Building blocks | CDEs · Dimensions · Rules & Thresholds · Profiling & Baselining · Issue Identification & Prioritization · Root Cause Analysis · Remediation & Plans · Monitoring & Reporting. Each has **Process**, **Framework** and **Example** tabs |
| Where issues come from | Six sources along the data journey (business & regulatory change, data entry & submission, source systems & integrations, warehouse & pipelines, BI queries, migration & reference data), each with an example and ways to detect, prevent and fix it |
| Workbench | DQ Dashboard · Issue Registry (filter, sort, detail drawer, log an issue, CSV export) · Templates (16 templates with field guide, sample row, fill-in mode and CSV export) · Glossary & quiz |

Interactive teaching aids include a per-dimension scoring calculator, a rule library by dimension, a value-vs-effort request matrix, a threshold roadmap, a CDE scoring calculator, a "dimension lab" that highlights defects in sample e-invoices, a threshold explorer, a priority calculator, a step-by-step 5 Whys exercise and a weighted DQ score calculator.

Tooling references use Informatica IDMC (Cloud Data Quality, Cloud Data Profiling, Cloud Data Governance & Catalog). All people, numbers and issues are illustrative.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build in dist/
npm run preview    # serve dist/
```

`npm run build:single` produces one self-contained HTML file (`dist-single/index.html`) you can share or host anywhere.

## Project layout

```
src/
  App.jsx              navigation shell, hash routing (#dashboard, #registry, ...), theme switch
  styles.css           design tokens (light + dark) and components
  components/          shared UI, swimlane renderer, charts, building-block layout
  data/                roles & RACI, rules, issues, workflows, templates, priority model
  pages/               one file per page; building blocks in pages/blocks/
```

Content lives in `src/data/*.js`, so you can update rules, issues or templates without changing page code.
