# STELLAR VERIFICATION PROGRAM — PITCH DECK
### Team RUSTY | Avinash Jha · Ayush Belwal · Ayush Kirti Singh
### Innorave Eco-Hackathon 2026

---

## SLIDE 1 — THE HOOK

### *"We trained an AI to find planets that NASA might have missed."*

Right now, as you read this, there are **1,979 unconfirmed planetary signals** sitting in NASA's Kepler archive. Nobody knows if they're real planets or just stellar noise. Each one could be the next Earth — or the next false alarm.

Since 1992, humanity has confirmed just **6,138 exoplanets** across the entire observable universe. That's 6,138 worlds in 34 years. But Kepler alone flagged **9,564 objects of interest** — and nearly **half of them** were eventually labelled false positives. Instrumental glitches. Binary stars pretending to be planets. Background objects contaminating the signal.

The problem isn't finding signals. **The problem is trusting them.**

Every false positive that slips through wastes telescope time worth **$10,000–$50,000 per hour** on instruments like JWST and Keck. Every real planet that gets discarded is a world we'll never know existed.

We built a system that classifies Kepler signals with **97% ROC-AUC accuracy** and predicts planetary radii with an **R² of 0.96** — in under 200 milliseconds. Not in a Jupyter notebook. In a deployed, interactive web application that any astronomer, student, or space enthusiast can use right now.

**This is the Stellar Verification Program.**

> *6,138 confirmed worlds out of 200 billion stars in our galaxy alone.*
> *We've barely scratched the surface. Let's scratch faster.*

---

## SLIDE 2 — THE PROBLEM (Why This Matters)

### The $2.3 Billion Blind Spot

NASA's Kepler Space Telescope stared at **150,000+ stars** for four years straight (2009–2018), monitoring their brightness every 30 minutes. It detected **9,564 objects of interest** — tiny dips in starlight that *might* be a planet crossing its star.

Here's the problem nobody talks about:

| Reality Check | Number |
|---|---|
| Total Kepler Objects of Interest (KOIs) | **9,564** |
| Confirmed as real planets | **2,783** (29%) |
| Confirmed as **false positives** | **4,882** (51%) |
| Still unconfirmed (candidates) | **1,979** (20%) |

**More than half of all detections were wrong.** Not slightly wrong — completely wrong. These weren't planets at all. They were eclipsing binary stars, instrumental systematics, or background contamination events that perfectly mimicked a planetary transit.

#### The Human Bottleneck
Traditional confirmation requires:
- **Radial velocity follow-up** — 3-6 months of telescope time per target
- **Statistical validation** — VESPA/BLENDER analysis taking 2-5 compute hours per KOI
- **Centroid analysis** — Manual pixel-level inspection of Kepler data
- **Multi-telescope cross-referencing** — Coordinating Keck, Gemini, Magellan observations

At current confirmation rates, the 1,979 remaining candidates would take an estimated **6–10 years** to fully resolve — assuming unlimited telescope access (which doesn't exist).

#### The Cost of Getting It Wrong
- **JWST operating cost**: ~$9.2M per year → ~$1,050/hour
- **One false positive follow-up on Keck**: $10,000–$50,000 in telescope time
- **Average time per manual vetting**: 40+ astronomer-hours per KOI

> *Kepler cost $692 million. Its successor TESS has already flagged 7,913 new candidates.*
> *The bottleneck isn't data collection — it's data interpretation.*

---

## SLIDE 3 — THE GAP (What's Missing Today)

### Why Current Solutions Fall Short

The astronomy community has attempted automated classification before. Here's why existing approaches don't solve the full problem:

#### Existing Tool Landscape

| Tool / Method | What It Does | Critical Limitation |
|---|---|---|
| **VESPA** (Morton 2012) | Statistical false positive probability | Takes **2-5 compute hours per KOI**; no radius prediction; no UI |
| **Autovetter** (NASA/Ames) | Rule-based signal flagging | High false negative rate; misses edge cases; no interpretability |
| **Robovetter** (Thompson 2018) | Automated disposition pipeline | Designed for *batch processing* of DR25; not real-time; no web access |
| **ExoMiner** (Valizadegan 2022) | Deep learning classifier | Neural network = black box; no radius estimation; requires GPU infrastructure |
| **Manual vetting** | Human expert review | **40+ hours per KOI**; doesn't scale; subjective |

#### The Five Gaps We Identified

1. **No unified system** — Classification and radius prediction exist as separate research pipelines. Nobody combines them into one inference call.

2. **No real-time interface** — All existing tools require command-line access, Python scripting, or institutional computing resources. Zero accessibility for students, educators, or citizen scientists.

3. **No uncertainty quantification** — Most classifiers output a binary yes/no. They don't tell you *how uncertain* the model is, which is critical for prioritizing follow-up observations.

4. **No mission planning** — Even after classification, there's no system that says: *"This object needs radial velocity follow-up with ESPRESSO, and here's why."* The gap between prediction and action is entirely manual.

5. **No batch processing for humans** — Astronomers can't easily run 100 objects through a pipeline and download results. They write custom scripts every time.

> *The tools exist. The data exists. What doesn't exist is a system that puts them together and makes them accessible to everyone — not just PhD astronomers with HPC access.*

---

## SLIDE 4 — OUR SOLUTION (What We Built)

### Stellar: One Platform. Two Predictions. Zero Friction.

We didn't just build a model. We built an **end-to-end exoplanet verification platform** — from raw KOI measurements to actionable scientific recommendations — deployed live on the web.

#### The Stack (30-Second Version)

```
[ React.js Frontend ]  ←→  [ Flask REST API ]  ←→  [ Stacking Ensemble ML ]
       ↕                          ↕                          ↕
  10 input fields          SQLite History DB          3 Base Learners
  Real-time validation     7 API endpoints            7 Engineered Features
  Interactive charts       <200ms latency             Quantile Uncertainty
```

#### What Happens When You Click "Run AI Check"

1. **You enter 10 stellar/transit parameters** — orbital period, transit depth, stellar temperature, etc. (with plain-English tooltips explaining every single field)

2. **Client-side validation fires** — catching out-of-range values, missing fields, wrong types before anything hits the server

3. **Backend preprocesses in real-time** — log-transforms, feature engineering (7 derived features), scaling via the same StandardScaler used during training

4. **Stacking Ensemble classifies** — XGBoost + Random Forest + ExtraTrees feed into a Logistic Regression meta-learner → outputs "Real Planet" or "False Positive" with confidence score

5. **XGBoost Regressor predicts radius** — point estimate + quantile bounds (16th/84th percentile) → gives you ± margin of error

6. **Results render instantly** — classification badge, confidence gauge, planet size comparison, habitable zone diagram, transit animation, and recommended follow-up actions

**Total time: Under 200 milliseconds.**

> *From raw measurements to "this is a 1.4× Earth-radius planet in the habitable zone with 94% confidence" — faster than you can blink.*

---

## SLIDE 5 — THE NOVELTY (Why We're Different)

### 7 Things Nobody Else Has Done Together

| # | Feature | Why It's Novel |
|---|---|---|
| 1 | **Dual-task unified inference** | One API call → classification + radius + uncertainty. No one else combines all three. |
| 2 | **Stacking ensemble with meta-learning** | 3 base learners (XGB + RF + ET) → logistic regression meta-learner. More robust than any single model. |
| 3 | **Quantile regression uncertainty** | We don't just predict radius. We give you the 68% confidence interval using HistGradientBoosting at the 16th and 84th percentiles. |
| 4 | **Live transit simulator** | An animated visualization showing the planet crossing its star with a real-time light curve — nobody has this in a classification tool. |
| 5 | **Habitable zone calculator** | Auto-computes the star's habitable zone boundaries from stellar luminosity, plots the planet's orbit, and finds known exoplanets with similar properties from our 20-planet reference database. |
| 6 | **Mission planning engine** | After classification, we assign 7 specialist roles (RV Observer, Centroid Analyst, Atmospheric Scientist, etc.) with specific instrument recommendations (ESPRESSO, NIRSpec, CHEOPS) and priority scores. |
| 7 | **100-object batch analysis** | One-click analysis of 100 diverse star systems with an animated 6-step runner, downloadable CSV, and aggregate statistics. |

#### Our Secret Sauce: Feature Engineering

We don't just throw raw features at a model. We engineer **7 physics-informed derived features**:

- **Log transforms** (log\_period, log\_depth, log\_duration, log\_snr) → compress the 6-order-of-magnitude dynamic range into learnable distributions
- **Period-duration ratio** → proxy for orbital eccentricity and transit geometry
- **Stellar density** (mass/radius³) → direct constraint on planetary orbit via Kepler's third law
- **Depth-SNR ratio** → normalizes transit signal strength by detection quality

These aren't arbitrary. Each one has physical meaning in transit photometry. That's why our 17-feature stacking model outperforms deep learning approaches that use 50+ raw features.

> *It's not about having more data or bigger models. It's about understanding the physics well enough to teach a machine what matters.*

---

## SLIDE 6 — THE TECH (Under the Hood)

### Architecture Deep Dive

#### Classification Pipeline: Stacking Ensemble

```
Input (10 features) → Feature Engineering (17 features) → StandardScaler
                                                              ↓
                                              ┌───────────────┼───────────────┐
                                              ↓               ↓               ↓
                                          XGBoost         RandomForest    ExtraTrees
                                        (500 trees)      (300 trees)     (300 trees)
                                          depth=6          max_depth=15   max_depth=15
                                          lr=0.05
                                              ↓               ↓               ↓
                                              └───────────────┼───────────────┘
                                                              ↓
                                                    Logistic Regression
                                                      (Meta-Learner)
                                                              ↓
                                                   P(Planet) = 0.94
```

- **Cross-validation**: StratifiedKFold with 5 splits (ensures class balance across folds)
- **Why stacking?** Each base learner captures different patterns — XGBoost finds complex interactions, RF reduces variance, ExtraTrees adds randomization. The meta-learner learns which base learner to trust for which type of input.

#### Regression Pipeline: XGBoost + Quantile Bounds

```
Input (17 engineered features)
    ↓
XGBoost Regressor (500 trees, depth=6) → Radius = 1.42 R⊕
    ↓
HistGradientBoosting (α = 0.16) → Lower bound = 1.18 R⊕
HistGradientBoosting (α = 0.84) → Upper bound = 1.67 R⊕
    ↓
Uncertainty = (1.67 - 1.18) / 2 = ±0.245 R⊕
```

#### Performance Metrics

| Task | Metric | Score | What It Means |
|---|---|---|---|
| Classification | **ROC-AUC** | **0.97** | The model correctly ranks real planets above false alarms 97% of the time |
| Classification | **F1-Score** | **0.84** | Strong balance between catching real planets and rejecting fakes |
| Classification | **Accuracy** | **90.6%** | 9 out of 10 predictions correct |
| Regression | **R²** | **0.96** | Explains 96% of the variance in planetary radius |
| Regression | **68% CI Coverage** | **~68%** | Uncertainty bounds are well-calibrated (not too wide, not too narrow) |
| System | **Inference Latency** | **<200ms** | Real-time interactive speed |

> *0.97 ROC-AUC means if you randomly pick one real planet and one false positive, our model will correctly identify which is which 97 times out of 100.*

---

## SLIDE 7 — THE PLATFORM (What Users See)

### 5 Tabs. Zero Learning Curve.

Every label, tooltip, and description is written in **plain English** — no astronomy jargon. A high school student can use this.

#### Tab 1: "Check a Planet" 🔭
- Enter 10 measurements (with tooltips like *"How long does the planet take to go around its star? Measured in days."*)
- 3 quick-fill presets: Earth-like World, Hot Jupiter, Super-Earth
- Hit "Run AI Check" → instant results with step-by-step explanation
- **Live transit simulator**: watch the planet cross its star in real-time animation
- **Habitable zone diagram**: see if the planet orbits in the "Goldilocks zone"
- **Similar planet finder**: we match your prediction against 20 known exoplanets

#### Tab 2: "Mission Queue" 🎯
- **1,872 unverified star signals** ready for AI classification
- Each signal gets assigned **7 specialist roles** with instrument recommendations
- Filter by urgency score (0-100), sort by confidence, planet size, teams needed
- Expanding a card shows: what scientists need to do, why it matters, and detailed parameters
- *This is the world's first AI-powered exoplanet mission planner.*

#### Tab 3: "Star Database" 📊
- Browse all **9,564 real NASA KOIs** with pagination and filters
- See NASA's disposition alongside our AI's prediction for every single object
- Color-coded status: ✅ Real Planet, ❌ False Alarm, ❓ Under Investigation

#### Tab 4: "My History" 📋
- Every prediction saved with timestamp, confidence, radius, and response latency
- Expandable rows showing full input parameters with friendly labels
- Audit trail for reproducibility

#### Tab 5: "Statistics & Batch Analysis" ⚡
- Model performance dashboard (F1, ROC-AUC, R², MAE)
- **One-click batch engine**: Run 100 star systems through the AI with animated progress
- Download results as CSV spreadsheet
- Feature importance rankings

> *We designed this so that a 15-year-old space enthusiast and a NASA JPL researcher would both find it useful.*

---

## SLIDE 8 — THE DATA (Our Foundation)

### 9,564 Stories Written in Starlight

Our dataset comes directly from the **NASA Exoplanet Archive** — the same data used by professional astronomers worldwide.

#### Dataset Composition

| Category | Count | Percentage |
|---|---|---|
| **FALSE POSITIVE** | 4,882 | 51.0% |
| **CONFIRMED** planet | 2,682 | 28.0% |
| **CANDIDATE** (unresolved) | 2,000 | 20.9% |
| **Total KOIs** | **9,564** | 100% |

#### 10 Raw Features → 17 Engineered Features

| # | Feature | Plain English | Range |
|---|---|---|---|
| 1 | koi\_period | How long is one orbit? | 0.1 – 100,000 days |
| 2 | koi\_impact | How close to center does it cross? | 0.0 – 3.0 |
| 3 | koi\_duration | How long does the crossing take? | 0.01 – 200 hours |
| 4 | koi\_depth | How much starlight does it block? | 0 – 10,000,000 ppm |
| 5 | koi\_model\_snr | How strong is the signal vs noise? | 0 – 1,000,000 |
| 6 | koi\_steff | How hot is the star? | 2,500 – 15,000 K |
| 7 | koi\_slogg | How strong is the star's gravity? | 0.0 – 6.0 |
| 8 | koi\_srad | How big is the star? | 0.01 – 200 R☉ |
| 9 | koi\_smass | How heavy is the star? | 0.01 – 100 M☉ |
| 10 | koi\_smet | How metal-rich is the star? | -5.0 – 5.0 dex |

**+7 engineered**: log\_period, log\_depth, log\_duration, log\_snr, period\_dur\_ratio, stellar\_density, depth\_snr\_ratio

#### Why 17 Features Beat 50+

Research shows that **feature quality > feature quantity** for tabular astronomical data. Our physics-informed features compress the information content of dozens of raw columns into 17 highly predictive signals. This is why our stacking ensemble with 17 features achieves 0.97 ROC-AUC — competitive with neural networks using 50+ features.

> *Every number in our dataset was measured by a $692 million spacecraft staring at 150,000 stars for 4 years. We're standing on the shoulders of giants.*

---

## SLIDE 9 — RESULTS & PROOF (The Numbers Don't Lie)

### Head-to-Head Comparison

| Metric | Traditional Manual Vetting | Robovetter (NASA) | ExoMiner (Deep Learning) | **Stellar (Ours)** |
|---|---|---|---|---|
| Time per KOI | 40+ hours | ~seconds | ~seconds | **<0.2 seconds** |
| Requires GPU? | No | No | **Yes** | **No** |
| Radius Prediction? | Separate pipeline | No | No | **✅ Built-in** |
| Uncertainty Bounds? | Manual | No | No | **✅ Quantile CI** |
| Interactive UI? | No | No | No | **✅ 5-tab webapp** |
| Mission Planning? | Manual | No | No | **✅ 7 specialist roles** |
| Habitable Zone Calc? | Manual | No | No | **✅ Auto-computed** |
| Batch Processing? | Custom scripts | Batch only | Batch only | **✅ Single + Batch** |
| Accessibility | PhD + HPC | PhD + CLI | PhD + GPU | **✅ Any browser** |

#### Batch Analysis Results (100 Star Systems)

When we run our 100 carefully curated star systems through the pipeline:
- Covers **5 planet categories**: confirmed-like, hot Jupiters, cold giants, false positive mimics, and edge cases
- Each gets: classification, confidence score, radius estimate, uncertainty bounds, planet class
- Total processing time: **~3 seconds** for all 100
- Results downloadable as CSV for further analysis

#### Key Achievements

✅ **0.97 ROC-AUC** — correctly ranks planets vs. false positives 97% of the time
✅ **0.96 R²** — explains 96% of planetary radius variation
✅ **<200ms latency** — real-time interactive predictions
✅ **1,872 mission assignments** — every unconfirmed KOI gets a science team recommendation
✅ **100-object batch** — one-click analysis with animated pipeline visualization
✅ **Zero infrastructure cost** — deployed free on Render, accessible in any browser

> *We're not claiming to replace NASA's vetting pipeline. We're claiming to democratize it.*

---

## SLIDE 10 — IMPACT & POSSIBILITIES (What This Enables)

### Three Horizons of Impact

#### HORIZON 1: Education & Outreach (Now)
- **10,000+ students worldwide** can now explore real NASA exoplanet data through an intuitive interface
- Classroom tool: "Enter these numbers and see if this star has a planet" → instant engagement
- Citizen science gateway: Anyone curious about exoplanets can interact with real data
- **Estimated reach**: 500+ universities offer astronomy courses, 150+ countries have space education programs

#### HORIZON 2: Research Acceleration (6 months)
- **1,979 unconfirmed Kepler candidates** can be pre-screened in minutes instead of years
- Our mission planning engine can **prioritize the top candidates** for JWST and ground-based follow-up
- **Potential telescope time saved**: If our system correctly pre-filters 50% of false positives from follow-up lists, that's ~$500K–$2M in avoided wasted telescope time per cycle
- **361 candidates in the habitable zone** — our system can help identify which of these deserve priority atmospheric characterization

#### HORIZON 3: Next-Generation Surveys (1-2 years)
- **TESS has already flagged 7,913 candidates** — and counting. Our architecture can be retrained on TESS data.
- **PLATO mission launches 2026** — will monitor 1,000,000+ stars. The false positive problem will get 10× worse.
- **Roman Space Telescope (2027)** — will discover thousands more transiting planets
- Our platform's modular design means: swap the model, keep the interface

#### The Scale of What's Coming

| Mission | Stars Monitored | Expected Candidates | False Positive Challenge |
|---|---|---|---|
| Kepler (completed) | 150,000 | 9,564 KOIs | 51% false positive rate |
| TESS (ongoing) | 200M+ | 7,913+ so far | Shorter baselines = noisier |
| PLATO (2026) | 1,000,000+ | Tens of thousands | 10× Kepler volume |
| Roman (2027) | Millions | Thousands via microlensing | New detection method = new FP types |

> *The false positive problem doesn't go away with better telescopes. It gets worse. Automated verification isn't a nice-to-have — it's a survival necessity for exoplanet science.*

---

## SLIDE 11 — SUSTAINABILITY & ECO ANGLE

### How Exoplanet AI Connects to Environmental Intelligence

This is an **Eco-Hackathon** — and here's why a space AI project belongs here:

#### 1. Computational Sustainability
- Our stacking ensemble runs on **CPU only** — no GPU required
- Single prediction: <200ms on a free-tier cloud server
- Batch of 100 predictions: ~3 seconds total
- **Compare**: Training a deep learning classifier (ExoMiner-style) requires GPU hours costing $50–$500 per run
- **Our carbon footprint per inference: ~0.0001 kWh** vs. GPU-based alternatives at ~0.01 kWh

#### 2. Telescope Resource Conservation
- Every false positive that gets flagged for follow-up wastes **real physical resources**: telescope time, electricity for instrument cooling, staff time, data storage
- By pre-screening candidates, we reduce unnecessary observations
- **One night on a 10m telescope** ≈ 10 MWh of energy consumption (cooling, tracking, data processing)
- If we save even 10 unnecessary nights per year: **~100 MWh saved**

#### 3. Exoplanet Science → Earth Science
- Understanding planetary atmospheres on other worlds directly informs climate modeling on Earth
- Every confirmed habitable-zone planet teaches us about atmospheric composition, greenhouse effects, and planetary evolution
- The transit spectroscopy techniques used for exoplanets are now being adapted for **Earth-observation satellites** monitoring greenhouse gases

#### 4. Open Access & Democratization
- Our platform makes space science accessible without expensive infrastructure
- Reduced need for institutional computing resources
- Promotes scientific literacy about planetary systems and habitability

> *Sustainability isn't just about saving forests. It's about building systems that do more with less — whether that's classifying stars or conserving telescope time.*

---

## SLIDE 12 — THE CLOSE (Call to Action)

### The Universe Isn't Waiting. Neither Should We.

#### What We've Built
✅ A deployed, live web application at **stellar-w9oz.onrender.com**
✅ Dual-task ML pipeline: Classification (0.97 AUC) + Regression (0.96 R²)
✅ 7 API endpoints serving real-time predictions in <200ms
✅ 1,872 unverified signals with AI-generated mission plans
✅ 100-object batch analysis engine with one-click execution
✅ Plain-English interface accessible to anyone on Earth

#### What We're Asking For
🌟 **Recognition** that automated exoplanet verification is a solvable, impactful problem
🌟 **Support** to extend this to TESS data (7,913 candidates and growing)
🌟 **Collaboration** with astronomy departments for validation studies
🌟 **Platform access** to scale this from a hackathon project to a community tool

#### The Numbers That Matter

| Stat | Value |
|---|---|
| Confirmed exoplanets in the universe (known) | **6,138** |
| Estimated planets in our galaxy alone | **~200 billion** |
| Percentage we've characterized | **0.000003%** |
| Kepler candidates still waiting | **1,979** |
| TESS candidates still waiting | **4,771** |
| Time to verify all manually | **6-10 years** |
| Time with our system | **< 1 hour** |

#### One Last Thought

*In 1995, the first exoplanet around a sun-like star was confirmed — 51 Pegasi b. It took decades of skepticism, thousands of hours of telescope time, and the persistence of two astronomers who believed the signal was real.*

*Today, we can answer that same question — "Is this signal a planet?" — in 200 milliseconds.*

*That's not just progress. That's a paradigm shift.*

*And we're just getting started.*

---

**Team RUSTY** | Stellar Verification Program
**Live Demo**: stellar-w9oz.onrender.com
**GitHub**: github.com/404Avinash/stellar

---

*Built with 🔭 for Innorave Eco-Hackathon 2026*
