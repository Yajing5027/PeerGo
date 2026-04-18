# MavSide: A Campus Micro-Logistics Network Built on Spare Capacity, Circular Economy, and Cross-Subsidized Inclusion


This project was selected for presentation at the CADSCOM 2026 Student Showcase, organized by the Twin Cities ACM Chapter.

Prototype (GitHub Pages): https://yajing5027.github.io/MavSide/

### Problem Statement & Project Objectives

- Spatiotemporal & Physical Constraints
	- Time crunch
	- Mobility restricted
	- Winter exacerbates

- Work-Study Imbalance
	- Scarce jobs
	- Rigid shifts
	- No zero-threshold income

- Spatiotemporal Mismatch
	- Urgent need
	- Someone walking by
	- Never connected

Central proposition: Incidental Foot Traffic + Spare Capacity

Activation goals shown on poster:

- Activate Secondary Value
	- Footsteps → Dispatchable Capacity
	- Deviation ≤ 15%

- Inclusive Micro-Economy
	- Zero-threshold flexible income
	- Commission → MavPoints pool; fee waiver for students with disabilities

- Trust-Based Community
	- mnsu.edu trust network
	- Low transaction friction

- Accessible Campus
	- Commission feeds MavPoints; de-stigmatized inclusion

### Theoretical Foundations

I. Secondary Economy & Asset Activation

- Zero Marginal Cost Tendency — incremental service cost approaches zero.
- Proximity-Based Efficiency — geographic closeness eliminates intermediaries.
- Secondary Economy — captures residual value of existing activities.

II. Circular Economy & Inclusive Growth

- Labor Fragmentation & Hyper-Flexibility — campus micro-job positions with no fixed schedule constraints.
- Cross-Subsidization — commercial profit subsidizes welfare; commission funds injected into MavPoints pool.
- Circular Economy — closed-loop resource circulation retains value on campus.

III. Synchronized Dispatching in Hybrid Spaces

- Unified indoor-outdoor modeling (multi-layer weighted graph).
- Context-aware algorithm that adjusts path weights based on weather and environment.
- Dynamic ETA estimation using queuing theory and dynamic traffic assignment.

### Algorithm — Spatiotemporal Constrained Scheduling Framework

I. Foundational Implementation Modules

- Module 1: Path Deviation Ratio (Spatial Feasibility)

\[
\Delta = \frac{\operatorname{Dist}(A,P)+\operatorname{Dist}(P,D)+\operatorname{Dist}(D,B)-\operatorname{Dist}(A,B)}{\operatorname{Dist}(A,B)}
\]

Constraint: \[\Delta \le 0.15\]

- Module 2: Dynamic ETA Estimation (Temporal Modeling)

\[
T_{extra} = T_{detour} + T_{pickup}
\]

Constraint: \[T_{extra} \le T_{tolerance}\]

Example: \[T_{detour} = \frac{\operatorname{Distance}}{\operatorname{Speed}} + P_{density}\]

- Module 3: Unified Indoor-Outdoor Routing (Context-Awareness)

\[
w(e)=w_0(e)\cdot\gamma(e,\mathrm{weather})
\]

\[
\gamma(\mathrm{outdoor})=\begin{cases}1.5, & \text{severe weather}\\1.0, & \text{otherwise}\end{cases}
\]

\[
\gamma(\mathrm{indoor})=\begin{cases}0.8, & \text{severe weather}\\1.0, & \text{otherwise}\end{cases}
\]

Path selection minimizes total cost under the deviation constraint.

### Algorithm Core (short)

Three-stage constraint screening:

1. Spatial constraint (deviation) — accept when \(\Delta \le 0.15\).
2. Temporal constraint (ETA) — accept when \(T_{extra} \le T_{tolerance}\).
3. Context-aware reweighting — adjust weights for severe weather and recompute models before dispatch.

Action: Push task to verified bringer when all constraints pass.

### Evolutionary Roadmap (summary)

| Phase | Objective | Key Technology |
|---|---|---|
| Prototype | Haversine Deviation + Static ETA | Full-stack Interaction |
| Network Match | Real Walking Path Distance | Mapbox / OSRM Integration |
| Smart Dispatch | Multi-layer Graph + Climate-Adaptive | Custom Campus Graph API |

### System Architecture & Current Baseline

- Current baseline: fully functional frontend prototype (static JSON), mnsu.edu authentication, task posting and claiming, merchant pre-order, order tracking, MavPoints simulation, ARIA accessibility, component-based architecture.

Target architecture highlights:

- Frontend Layer: Vue 3 (component-driven iteration, reactive task streaming)
- Service Layer: Node.js + Express (path computation, BullMQ task decoupling, WebSocket real-time push)
- Data Layer: PostgreSQL + PostGIS (spatial indexing) and Redis (real-time caches)
- External: Self-hosted campus routing, Weather API, Campus SSO (OAuth2)

### MavAccess: Inclusive Access (flows)

1. Identity Verification — verified via mnsu.edu email and Student Affairs whitelist; certified accounts receive monthly MavPoints.
2. ARIA Accessibility Annotations — full ARIA support for assistive tech.
3. MavPoints Shipping Fee Waiver — MavAccess status deducts shipping from MavPoints; UI shows "Campus Access Subsidy." 
4. Bringer Incentives & Campus Economic Loop — redeemable points, volunteer certificates, merchant coupons.

### Slogans (from poster)

"Paths cross. Things arrive. Campus, closer."  
"Unlocking the hidden value of every Maverick's trip."  
MavSide — One campus, one stride.

### Prototype access & contact

- Live prototype (GitHub Pages): https://yajing5027.github.io/MavSide/
- Poster file: `poster/poster-36x48-static.html`

---
