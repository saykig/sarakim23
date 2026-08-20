# Memory content

Memory collections live under `content/memories/<collection>/`. Public assets use
the matching `public/memories/<collection>/` path, so the production site never
depends on a migration source at runtime.

The Europe collection is imported from Sara's public VSCO journal with:

```sh
pnpm memories:import:europe
pnpm memories:validate:europe
```

The importer needs a local Chrome or Chromium installation. Set
`VSCO_CHROME_PATH` or pass `--chrome-path` if it is not in a standard location.
If VSCO presents an automated-browser challenge, rerun with `--headed`.

## Schema

`europe/index.json` preserves journal provenance, location order, counts, and the
import image policy. Every location has its own `index.json` with optional future
`lat`, `lng`, `year`, and `years` fields and a heterogeneous `entries` array.
Supported entry types can grow without changing the location model; the initial
import uses `photo` and `prose`, and can later add poems, quotations, scans, and
other ephemera.

Every photo records its location, source journal/page, chosen migration source,
original VSCO source and responsive candidates, local path, global and local
order, dimensions, MIME type, byte size, and SHA-256 digest. Captions and alt text
are included only when VSCO supplies meaningful source text.

VSCO does not provide coordinates in the journal. `coordinates-review.json`
therefore lists every location with null coordinates for later manual enrichment.
