# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Kian Hampson-Bahia | 416892 |
| Altu Bozyaka | 416420 |
| Daniel Sura | 415266 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

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

**10% of the final grade**


## Milestone 3 (29th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

