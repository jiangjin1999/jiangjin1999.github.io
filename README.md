# Jin Jiang — Academic Homepage

Personal academic homepage: [jiangjin1999.github.io](https://jiangjin1999.github.io/).

The reviewed website is in `docs/`. Configure GitHub Pages to deploy from the `main` branch and the `/docs` directory.

`docs/` is a static site with no build step. For a local preview:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory docs
```

The homepage includes research interests, research experience, selected publications, and MapMyVisitors statistics. Analytics run only on the HTTPS production hostname; local previews are excluded.

The legacy files at the repository root are not part of the Pages publishing directory.
