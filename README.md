# HTTP hanging bug in Bun 1.3.9 on Windows

Note: this issue was noticed with a vite proxy when running "bun run --bun vite dev", and a number
of requests hanging, along with browser HTTP/1.1 request thread starvation.

This repo is for the issue https://github.com/oven-sh/bun/issues/27010

## Versions

This appears to only be a Windows issue. All version work on Ubuntu 24.04 in WSL (and much faster too).
It also appears to be introduced in 1.3.0, and remains in the latest version & latest canary.

- Microsoft Windows NT 10.0.26200.0 x64
- Works: 1.2.23
- Errors: 1.3.0 - 1.3.9, canary 1.3.10: 993be3f93

## Testing Steps
1. Run the mini file server with in one tab:

    $ `bun file_server.js`

2. Run the "downloader" with node in another tab:

    $ `node test_large_multi_download.mjs`

this will complete fine in all cases, and each request takes 700ms or so.

3. Run the "downloader" with bun:

    $ `bun test_large_multi_download.mjs`

this will hang on some of the later requests, and hit the 5 second timeout. This may need to be
run several times to trigger the behaviour. Note that without the timeout, it will hang indefinitely
waiting for more data.