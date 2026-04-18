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
The matching logic is built on a spatiotemporal constrained scheduling framework, ensuring that tasks only reach \bringers\ who can fulfill them with minimal deviation.

### I. Spatial Feasibility (Path Deviation)
We use a deviation ratio (\\(\\Delta\\)) to ensure the task fits within the bringer's space-time prism:
\\[
\\Delta = \\frac{\\operatorname{Dist}(A,P)+\\operatorname{Dist}(P,D)+\\operatorname{Dist}(D,B)-\\operatorname{Dist}(A,B)}{\\operatorname{Dist}(A,B)}
\\]
*Constraint: \\(\\Delta \\le 0.15\\)* (Maximum 15% path deviation).

### II. Temporal Modeling (Dynamic ETA)
The system estimates the extra time (\\(T_{extra}\\)) required, accounting for both detour distance and pickup latency (\\(P_{density}\\)):
\\[
T_{extra} = \\frac{\\operatorname{Distance}}{\\operatorname{Speed}} + P_{density}
\\]
*Constraint: \\(T_{extra} \\le T_{tolerance}\\)*

### III. Context-Aware Routing
The routing algorithm utilizes a multi-layer weighted graph that adapts to Minnesota's extreme weather by adjusting weights for indoor vs. outdoor edges:
\\[
w(e)=w_0(e)\\cdot\\gamma(e,\\mathrm{weather})
\\]
- **Severe Weather**: Outdoor weight (\\(\\gamma\\)) = 1.5 | Indoor weight (\\(\\gamma\\)) = 0.8
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

### Contact
**Yajing Ren**  
Minnesota State University, Mankato  
[yajing.ren@mnsu.edu](mailto:yajing.ren@mnsu.edu)

---
*Note: Math notations in this document follow LaTeX standards (inline: \\( ... \\), display: \\[ ... \\]). Member of the ACM Twin Cities Chapter.*
