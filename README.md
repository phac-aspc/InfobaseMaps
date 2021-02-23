# InfobaseMaps
Johic Mes - 2021
A few basic maps to fork at the start of a project

This section is useful as a template for a simple health regions map based on d3.js v4.

It has a color scale and some data all inserted in a GOC looking page.

The folder substructure should be organized the same way as on the production server for simple dev:

-- HealthRegions         -> Where the project HTML lives
-- SRC                  -> Source files
    -- ajax
    -- assets
    -- css
    -- data
        -- HealthRegionsData -> Where the project CSV lives
    -- fonts
    -- js
        -- i18n
        -- HealthRegionsJs   -> Where the projects JS lives
    -- topojson        -> when making a map the map topographic data is here
