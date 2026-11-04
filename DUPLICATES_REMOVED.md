# Duplicate removal audit — November 5, 2026

A project now appears **once across service-page project lists**, based on normalized website URL and title. Different client pages previously linked to the same site root have been consolidated into a single site-level card.
Homepage featured work may link to the same project, since it is a navigation preview, not a second service-page listing.
The Webflow page intentionally retains the hanging gallery and lower sticky showcase requested by the owner; those are two visual sections rather than separate entries in a project list.
Published CMS records are deduplicated so admin/API content cannot reinsert the same websites into future listings. An unpublished test SXS Parts USA record was removed in favor of the published one. Shopify-to-CMS migration and HYRA retain the record matching their Other CMS listing.

## Page results
- **wordpress:** 18 → 8 unique entries
- **shopify:** 12 → 8 unique entries
- **wix:** 12 → 12 unique entries
- **other-cms:** 16 → 8 unique entries
- **selected-sites:** 14 → 14 unique entries
- **CMS project database:** 74 → 49 unique entries

## Removed duplicate / overlapping items
- `wordpress`: IES — Project Library — Website already represented by wordpress: IES — Innovative Engineering Solutions
- `wordpress`: Naomi Amram — Press & Media — Website already represented by wordpress: Naomi Amram Design
- `wordpress`: Naomi Amram — Portfolio Galleries — Website already represented by wordpress: Naomi Amram Design
- `wordpress`: IES — Website Redesign — Website already represented by wordpress: IES — Innovative Engineering Solutions
- `wordpress`: Naomi Amram Design — Sands Point — Website already represented by wordpress: Naomi Amram Design
- `wordpress`: Naomi Amram Design — Daviault — Website already represented by wordpress: Naomi Amram Design
- `wordpress`: Naomi Amram Design — De la Commune — Website already represented by wordpress: Naomi Amram Design
- `wordpress`: Naomi Amram Design — Notre Dame — Website already represented by wordpress: Naomi Amram Design
- `wordpress`: Naomi Amram Design — Dupont — Living Room + Den — Website already represented by wordpress: Naomi Amram Design
- `wordpress`: Naomi Amram Design — Stanstead — Kitchen + Powder Room + Master Bath + Glencoe — Website already represented by wordpress: Naomi Amram Design
- `shopify`: LD Featured Products Grid — Overlapping component case study
- `shopify`: WooCommerce to Shopify Migration — Migration also belongs to Other CMS page
- `shopify`: CTM-style Product Cards — Overlapping component case study
- `shopify`: Palace Main Product Page — Overlapping component case study
- `other-cms`: IES — WordPress Content Import — Website already represented by wordpress: IES — Innovative Engineering Solutions
- `other-cms`: Naomi Amram — Gallery Integration — Website already represented by wordpress: Naomi Amram Design
- `other-cms`: Naomi Amram — Press & PDF Viewer — Website already represented by wordpress: Naomi Amram Design
- `other-cms`: IES — 77 Project Record Imports — Website already represented by wordpress: IES — Innovative Engineering Solutions
- `other-cms`: Naomi Amram — Gallery System — Website already represented by wordpress: Naomi Amram Design
- `other-cms`: OnyxDigital — Agency Website — Website already represented by other-cms: OnyxDigital — Admin CMS
- `other-cms`: Naomi Amram — Responsive Navigation — Website already represented by wordpress: Naomi Amram Design
- `other-cms`: IES — Project Content Audit — Website already represented by wordpress: IES — Innovative Engineering Solutions
- `CMS project database`: SXS Performance Part
- `CMS project database`: IES — WordPress Content Import
- `CMS project database`: Naomi Amram — Website Updates
- `CMS project database`: IES — Project Content Audit
- `CMS project database`: IES — Project Library
- `CMS project database`: Naomi Amram — Press & Media
- `CMS project database`: Naomi Amram — Portfolio Galleries
- `CMS project database`: IES — Website Redesign
- `CMS project database`: Naomi Amram Design — Sands Point
- `CMS project database`: Naomi Amram Design — Daviault
- `CMS project database`: Naomi Amram Design — De la Commune
- `CMS project database`: Naomi Amram Design — Notre Dame
- `CMS project database`: Naomi Amram Design — Dupont — Living Room + Den
- `CMS project database`: Naomi Amram Design — Stanstead — Kitchen + Powder Room + Master Bath + Glencoe
- `CMS project database`: LD Featured Products Grid
- `CMS project database`: CTM-style Product Cards
- `CMS project database`: Palace Main Product Page
- `CMS project database`: WooCommerce to Shopify Migration
- `CMS project database`: Naomi Amram — Gallery Integration
- `CMS project database`: HYRA — Cortisol Balancing Drink Mix
- `CMS project database`: Naomi Amram — Press & PDF Viewer
- `CMS project database`: IES — 77 Project Record Imports
- `CMS project database`: Naomi Amram — Gallery System
- `CMS project database`: OnyxDigital — Agency Website
- `CMS project database`: Naomi Amram — Responsive Navigation

## Notes
- No services, images or other original assets have been deleted; only repeated project-card entries and CMS records were removed.
- WordPress and Other CMS have fewer than 10 cards now because the original 10+ counts were inflated with repeats. No imaginary client sites were added to replace duplicates.
- Existing project details and media can still be edited through the site files or CMS admin.
