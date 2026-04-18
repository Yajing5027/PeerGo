# MavSide: A Campus Micro-Logistics Network

This project was selected for presentation at the CADSCOM 2026 Student Showcase, organized by the Twin Cities ACM Chapter.

MavSide is an innovative campus micro-logistics solution designed to bridge the spatiotemporal gap in student needs by leveraging **incidental foot traffic** and **spare capacity**. By transforming routine campus trajectories into a dispatchable logistics network, MavSide creates a self-sustaining, circular economy that prioritizes flexibility and inclusive access.

---

## 🚀 Live Prototype
**Experience the project here:** [https://yajing5027.github.io/MavSide/](https://yajing5027.github.io/MavSide/)

---

## 💡 The Core Vision
The  MavSide concept addresses three primary campus challenges:
- **Spatiotemporal Mismatch**: Connecting people who need assistance with those already walking the same route.
- **Secondary Economy**: Capturing the residual value of existing travel costs (steps already being taken).
- **Inclusive Growth**: Providing zero-threshold flexible income for students and subsidized access for students with disabilities (MavAccess).

## 🧠 Scheduling Framework (Technical)
The matching logic is built on a spatiotemporal constrained scheduling framework, ensuring that tasks only reach "bringers" who can fulfill them with minimal deviation.

### I. Spatial Feasibility (Path Deviation)
We use a deviation ratio (Δ) to ensure the task fits within the bringer's space-time prism:

<p align="center">
<img src="https://latex.codecogs.com/svg.latex?%5CDelta%20%3D%20%5Cfrac%7B%5Coperatorname%7BDist%7D%28A%2CP%29%2B%5Coperatorname%7BDist%7D%28P%2CD%29%2B%5Coperatorname%7BDist%7D%28D%2CB%29%2D%5Coperatorname%7BDist%7D%28A%2CB%29%7D%7B%5Coperatorname%7BDist%7D%28A%2CB%29%7D" alt="\\Delta = (Dist(A,P)+...-Dist(A,B))/Dist(A,B)"/>
</p>

*Constraint: Δ ≤ 0.15* (Maximum 15% path deviation).

### II. Temporal Modeling (Dynamic ETA)
The system estimates the extra time (T_{extra}) required, accounting for both detour distance and pickup latency (P_{density}):

<p align="center">
<img src="https://latex.codecogs.com/svg.latex?T_%7Bextra%7D%20%3D%20%5Cfrac%7B%5Coperatorname%7BDistance%7D%7D%7B%5Coperatorname%7BSpeed%7D%7D%20%2B%20P_%7Bdensity%7D" alt="T_{extra} = Distance/Speed + P_density"/>
</p>

*Constraint: T_{extra} ≤ T_{tolerance}*

### III. Context-Aware Routing
The routing algorithm utilizes a multi-layer weighted graph that adapts to Minnesota's extreme weather by adjusting weights for indoor vs. outdoor edges:

<p align="center">
<img src="https://latex.codecogs.com/svg.latex?w%28e%29%3Dw_0%28e%29%5Ccdot%5Cgamma%28e%2C%5Cmathrm%7Bweather%7D%29" alt="w(e)=w0(e)*gamma(e,weather)"/>
</p>

- **Severe Weather**: Outdoor weight (γ) = 1.5 | Indoor weight (γ) = 0.8
- **Normal Weather**: All weights = 1.0

## 🛠️ System Architecture
- **Frontend Layer**: A responsive prototype utilizing ARIA accessibility standards and component-based design.
- **Service Layer (Target)**: Node.js + Express for path computation and real-time task streaming via WebSockets.
- **Data Layer**: PostGIS for spatial indexing and Redis for high-frequency location caching.

## 🤝 MavAccess: De-stigmatized Inclusion
MavSide is built with accessibility as a core tenant, not an afterthought:
1. **Identity Integration**: Verified status links to Student Affairs records for automated eligibility.
2. **Cross-Subsidization**: 20% of commercial commissions are redirected into a **MavPoints pool**.
3. **Fee Waivers**: Students with disabilities use MavPoints for shipping, appearing as a \Campus Access Subsidy\ to maintain dignity and privacy.

---

## 📂 Project Structure
- index.html, dashboard.html, delivery.html, dd.html — core user views.
- style/theme.css — centralized design tokens and branding.
- ssets/js/ — frontend logic (routing, task matching, state management).
- poster/ — academic assets for the CADSCOM showcase.

---
