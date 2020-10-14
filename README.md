# leonardschuetz.ch

Below are the requirements and instructions to run this site.

## Requirements

Make sure the following tools are installed:

- `node`, `npm`
- `sass`
- `pandoc`
- `inotifywait`

## Running the local server

- `npm install`
- `./watch.sh` (auto-compile scss and markdown files)
- `./serve.sh` (runs HTTP server)

## New blog article checklist

- 'article-id' set to directory name? (for disqus)
- Markdown compiled?
- Add entry to `blog.html`
- Add entry to `rss.xml`
