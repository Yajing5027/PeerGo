# MavSide: Campus Micro-Logistics Network

This project was selected for presentation at the CADSCOM 2026 Student Showcase, organized by the Twin Cities ACM Chapter.

Overview

MavSide is a prototype micro‑logistics system designed for campus environments. It efficiently matches routine pedestrian trajectories with on‑demand task requests, lowers barriers to service access, improves on‑campus resource circulation, and—through inclusive design—ensures accessibility and dignity for disadvantaged users.

---

## Live Demo

Prototype (GitHub Pages): https://yajing5027.github.io/MavSide/

---

## Project Overview

MavSide combines lightweight path matching with context‑aware routing to support short‑distance pickups, deliveries, and errands on campus in a safe, verifiable, and scalable way. Core objectives include:

- Converting existing pedestrian trips into dispatchable capacity, increasing the value of routine travel.
- Enabling inclusive income and service subsidies with minimal participation barriers.
- Improving matching timeliness and accuracy while preserving user privacy and minimizing intrusiveness.

## Key Value Propositions

- Spatiotemporal matching: identify and leverage pedestrians whose routes highly overlap with tasks, minimizing deviation.
- Inclusive subsidies: support no‑threshold participation and targeted assistance via internal points and subsidy mechanisms.
- Context awareness: adapt routing preferences based on environment and weather to improve accessibility and user experience.
- Scalability: modular architecture facilitates integration with campus SSO, merchant booking, and mapping services.

## Core Features

- Task posting & workflow: structured task descriptions, delivery windows, and optional merchant booking integration.
- Path feasibility screening: evaluate candidate couriers for spatial deviation and temporal tolerance to ensure reasonable task assignments.
- Real‑time matching & notifications: low‑latency channels for task dispatch and confirmations to maintain delivery flow.
- Context‑aware routing: incorporate indoor/outdoor, weather, and access constraints into routing weights.
- Points & subsidy mechanism: allocate a portion of revenue from commercial partners to a MavPoints pool to support subsidized services for disadvantaged users.
- Accessibility & privacy: interfaces follow accessibility standards and apply data‑minimization to protect user privacy.

## Technical Architecture Plan

The system uses a layered modular design:

- Frontend: responsive, component‑based implementation following accessibility standards for diverse contexts.
- Service layer: horizontally scalable services for task matching, path computation, and scheduling; supports real‑time messaging.
- Data layer: spatial indexing and time‑series caching components to accelerate deviation calculations and location updates.
- Integration points: interfaces for campus identity systems, third‑party mapping services, and merchant systems.

---