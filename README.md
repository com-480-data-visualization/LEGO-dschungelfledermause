# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Kian Hampson-Bahia | 416892 |
| Altu Bozyaka | 416420 |
| Daniel Sura | 415266 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

### Dataset

>
We are using the LEGO Sets dataset sourced from Maven Analytics, originally compiled from Brickset, the community-maintained LEGO encyclopedia. The dataset contains 18,457 records across 14 fields: ```set_id```, ```name```, ```year```, ```theme```, ```subtheme```, ```themeGroup```, ```category```, ```pieces```, ```minifigs```, ```agerange_min```, ```US_retailPrice```, ```bricksetURL```, ```thumbnailURL```, and ```imageURL```, covering every official LEGO product released between 1970 and 2022.
The dataset includes a category field that distinguishes regular building sets (Normal, n=12,757) from non-set products such as Gear, Books, and Promotional items. Our visualizations will primarily focus on the 12,757 Normal sets, where data quality is substantially better.
The main data quality challenges are concentrated in three fields. ```US_retailPrice``` is missing for 59.5% of Normal sets, almost entirely pre-2000 records where historical pricing was not catalogued. ```agerange_min``` is missing for 54.6% and ```minifigs``` for 40.5%, again skewed toward older sets. ```pieces``` is nearly complete with only 1.7% missing. ```subtheme``` is absent for 27.1% of records, as many early themes had no formal subtheme structure.
Preprocessing will involve: filtering to ```category == Normal``` for the primary view; excluding Gear/Books/Promotional from theme counts; handling missing prices and piece counts with clearly labelled "data unavailable" states rather than imputation; and consolidating very small themes (fewer than 5 sets) where appropriate. Each record includes a direct ```imageURL``` which we will use as a visual element throughout the interface.

### Problematic

LEGO is one of the most recognised toy brands in the world, with a catalogue spanning over 50 years and 150+ distinct themes. Its history mirrors shifts in popular culture, from classic Castle and Space sets in the 1970s, to the explosion of licensed properties (Star Wars, Harry Potter, Marvel) in the 2000s, to the rise of premium adult-targeted sets in the 2020s. Yet this evolution is rarely explored in a way that is both visually engaging and data-grounded.
Our project, LEGO Island, presents this history as an interactive top-down island map, directly inspired by the 1997 video game LEGO Island, where each geographic district represents a major theme. Users explore the island, click into districts, and discover the sets, subthemes, timelines, and statistics within. The spatial metaphor gives the data a sense of place: districts vary in size by set count, and the visual character of each area reflects its theme.
Within each district, users can explore how the theme evolved year by year, how piece count and pricing changed over time, which subthemes were most prolific, and what individual sets look like through their official box imagery along with key sales statistic graphs.
The target audience is broad: LEGO enthusiasts and collectors, parents researching sets, and anyone curious about how a toy product line reflects five decades of culture. No prior data literacy is assumed, the visualization rewards casual exploration as much as focused analysis. The primary goal is to make navigating LEGO's history feel immersive and playful, while still grounding every interaction in real data.

### Exploratory Data Analysis

Our analysis focuses on the 12,757 Normal-category sets. Key findings:
Scale and growth. The dataset spans 52 years across 154 themes and 895 subthemes. Annual set releases grew from roughly 65/year in the 1970s to over 500/year by 2015–2021, reflecting LEGO's dramatic commercial expansion. The 2010s alone account for over 7,400 sets, which is more than all previous decades combined.
Piece count. The mean piece count across Normal sets is 238 pieces (median: 79), with a strong right skew driven by large collector sets. The maximum is 11,695 pieces (2021 World Map). Crucially, average complexity has increased every decade: from ~99 pieces per set in the 1980s to ~472 in the 2020s, reflecting the growth of the adult collector market.
Pricing. Among the 5,164 Normal sets with known price and piece count, retail price correlates strongly with pieces (r = 0.867). The median price is $19.99. The most expensive sets are Star Wars UCS models ($849.99 for both the Millennium Falcon and AT-AT).
Themes. The largest themes by set count are Duplo (1,220), Star Wars (651), Collectable Minifigures (639), Town (628), and City (619). Star Wars and Duplo also lead in subtheme variety (42 and 52 subthemes respectively).
Missing data pattern. Missingness in price, age, and minifig fields is strongly correlated with year, with over 90% of pre-1990 sets lack pricing data. This will be handled transparently in the UI rather than imputed.

### Related work

The Brickset community and Maven Analytics have both used this dataset for dashboard-style analyses, primarily bar charts of set counts by theme, price-vs-pieces scatter plots, and year-on-year trend lines. A number of Kaggle notebooks explore similar ground. The Maven LEGO Challenge (2023) produced several strong Tableau and Power BI submissions focused on the dataset's quantitative story. These are effective analytical tools, but they share a common limitation: they treat LEGO's history as a data problem rather than a cultural one, and the resulting interfaces feel clinical.
Our approach is original in three ways. First, the island map metaphor gives the data a spatial and playful identity, where users inhabit a LEGO world rather than read a report. The geographic layout encodes theme relationships and set volume simultaneously. Second, we use official set box images (available via imageURL for ~95% of sets) as primary visual content, so the interface looks unmistakably like LEGO. Third, the drill-down structure: island → district → subtheme → individual set, creates a narrative journey through 50 years of sets that no existing visualisation offers.
Key inspirations: the 1997 game LEGO Island for the world aesthetic; Mini Metro and Townscaper for spatial, toy-like data interfaces; and Stefanie Posavec and Giorgia Lupi's Dear Data project for the idea that cultural datasets deserve bespoke visual languages. This dataset has not been used in any prior course project by our group.

## Milestone 2 (17th April, 5pm)

### Milestone 2 report
https://github.com/com-480-data-visualization/LEGO-dschungelfledermause/blob/master/milestone2-report.pdf


## Milestone 3 (29th May, 5pm)

### Milestone 3 report / Process Book


### Live Site
https://com-480-data-visualization.github.io/LEGO-dschungelfledermause/index.html

**Recommended local setup (avoids CORS issues with the CSV):**
```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```
Any other static server (`npx serve`, VS Code Live Server, etc.) works equally well.

---

### Screencast
https://github.com/com-480-data-visualization/LEGO-dschungelfledermause/blob/master/milestone3/DataVisScreencast.mp4


### File Structure

```
LEGO-dschungelfledermause/
├── index.html          # Main island map page
├── story.html          # Linear data story page
├── LEGO+Sets/
│   ├── lego_sets.csv           # Primary dataset (18 457 rows, 14 fields)
│   └── lego_sets_data_dictionary.csv
├── css/
│   ├── variables.css   # Design tokens (colours, fonts, spacing)
│   ├── reset.css       # Box-model reset
│   ├── layout.css      # Page scaffold, title, year slider
│   ├── island.css      # District markers and bubble styles
│   ├── panel.css       # Slide-in detail panel
│   ├── charts.css      # D3 chart containers and set-card grid
│   └── animations.css  # Keyframes (loading, easter egg, etc.)
├── js/
│   ├── districts.js    # District & IP sub-district configuration (coords, colours, matchers)
│   ├── data.js         # CSV loading (PapaParse), filtering, aggregation → global `store`
│   ├── island.js       # District bubble rendering, click → zoom, IntersectionObserver
│   ├── panel.js        # Detail panel open/close, district vs IP folder views
│   ├── charts.js       # All four D3 charts (timeline, histogram, price line, bar)
│   ├── water.js        # Animated water-ripple canvas (WebGL-free, 2D canvas)
│   ├── parallax.js     # Mouse-parallax on island and district layers
│   ├── main.js         # Boot sequence: loads data, wires slider, initialises everything
│   ├── easter-egg.js   # Konami code easter egg (try find the easter egg!!)
│   ├── jetski.js       # Periodic jetski animation across ocean corners
│   └── story.js        # Data story page: D3 charts, scroll-reveal, animated counters
└── location_images/    # District photos, logos, island PNG, jetski sprites, favicon
```

---

### Technical Architecture

#### Data pipeline (`data.js`)
The CSV is fetched and parsed at runtime by [PapaParse](https://www.papaparse.com/). The pipeline:
1. Filters to `category === "Normal"` (12 757 sets).
2. Applies the active year-range slider window.
3. Groups rows by district using each district's `matcher` function (defined in `districts.js`).
4. Computes aggregated statistics per district (total sets, avg pieces, price range, year span) and stores everything in a global `store` object consumed by `panel.js` and `charts.js`.

Re-aggregation runs on every slider change; charts re-render without a page reload.

#### Island map (`island.js`, `districts.js`)
Eight districts are defined in `districts.js`, each with:
- SVG coordinate centre (`cx`, `cy`) in a 1100 × 720 viewBox
- A `matcher` function that assigns CSV rows to the district by `themeGroup`, `theme`, or custom logic
- Colour, label, description, and optional image/logo assets

The island is a PNG image (`lego_island.png`) rendered inside the SVG. District bubbles (circles with photos and logos) are positioned absolutely over the SVG using the same coordinate space, converted to percentages so they scale with the viewport.

The **IP Partnerships** district is a special "folder" node. Clicking it opens a sub-panel with franchise cards (Star Wars, Harry Potter, Marvel, etc.) rather than charts directly.

#### Year slider
A dual-thumb range slider (two overlapping `<input type="range">`) controls the active year window (1970–2022). Moving either thumb triggers a full re-aggregation and re-render of all open charts.

#### Charts (`charts.js`)
All charts are built with [D3 v7](https://d3js.org/) and rendered into containers injected by `panel.js`. Four chart types per district:
| Chart | Description |
|---|---|
| **Timeline** | Bar chart — sets released per year |
| **Histogram** | Piece count distribution (log-scale bins) |
| **Price line** | Average retail price over time (only years with data) |
| **Top subthemes** | Horizontal bar chart of the 8 most prolific subthemes |

Charts are cleared (`clearCharts()`) and rebuilt each time a panel opens, keeping the DOM lean.

#### Data story (`story.html`, `story.js`)
A separate, self-contained linear narrative page with five chapters, each containing a full-page D3 visualisation:

| Chapter | Chart | Key insight |
|---|---|---|
| 1 | **Heatmap** | Set count per theme group × 5-year period |
| 2 | **Nightingale Rose** | Relative size of each theme group (petal length = √set count) |
| 3 | **Treemap** | Theme hierarchy — click to drill from group → individual theme |
| 4 | **Chord diagram** | Relationship between theme groups and piece-size tiers |
| 5 | **Sunburst** | Two-ring radial view of all theme groups and their constituent themes |

The page uses an `IntersectionObserver` to trigger CSS fade-in animations as sections scroll into view, and a second observer to drive the active-state highlight on the fixed left-sidebar navigation.

---

### Intended Usage

#### Island map (index.html)
1. **Explore freely** — pan around the island with mouse or touch; the water canvas ripples in real time.
2. **Filter by era** — drag the year-range slider at the bottom to narrow the dataset to any window between 1970 and 2022. District bubble sizes update to reflect the filtered set count.
3. **Click a district** — the island zooms toward the chosen district and a detail panel slides up from the bottom. The panel shows four charts plus a scrollable grid of up to 24 set images sorted by piece count.
4. **IP Partnerships folder** — click the district to open a franchise selector. Pick a franchise (Star Wars, Harry Potter, etc.) to see charts and sets for that licence specifically.
5. **Close the panel** — click the × button or the backdrop to zoom back out and return to the full island view.

#### Data story (story.html)
1. Arrive at the hero section and use the five coloured chapter-tile buttons to jump directly to any visualisation, or scroll continuously top-to-bottom.
2. The **left sidebar** shows a coloured LEGO brick per chapter; the active brick highlights as you scroll. Click any brick to jump to that chapter. Hover for the chapter name. The back-arrow at the top returns to the island.
3. Each chapter has an interactive chart — hover for tooltips, click to drill down (treemap / sunburst), or use the dropdown controls (chord diagram).

#### Easter egg
Enter the Konami code — **↑ ↑ ↓ ↓ ← → ← → B A** — on the island page to find the secret easter egg.

---

### Dependencies

All loaded from CDN — no `npm install` required.

| Library | Version | Used for |
|---|---|---|
| [D3.js](https://d3js.org/) | v7 | All charts on both pages |
| [PapaParse](https://www.papaparse.com/) | v5 | CSV parsing |
| [Google Fonts](https://fonts.google.com/) | — | Fredoka One, Nunito, Inter |


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

