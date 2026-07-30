# india-states.geojson

Source: Natural Earth `ne_10m_admin_1_states_provinces` dataset (1:10m Admin-1
states/provinces), filtered to India's 36 states/UTs, `iso_a2 === "IN"`.

Natural Earth data is public domain — no permission or attribution required
for any use, commercial included (https://www.naturalearthdata.com/about/terms-of-use/).

Fetched from the maintainer's GitHub mirror:
https://github.com/nvkelso/natural-earth-vector (`geojson/ne_10m_admin_1_states_provinces.geojson`)

Trimmed to `{ properties: { name }, geometry }` per feature — only the state
name is needed for the point-in-polygon lookup in `../../utils/statePolygonLookup.js`.
Current as of a 2026-07-30 fetch: includes Telangana as its own state and the
merged "Dadra and Nagar Haveli and Daman and Diu" UT, matching the keys
already used in `../../utils/stateLanguageMap.js`.
