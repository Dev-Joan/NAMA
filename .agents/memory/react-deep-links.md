---
name: React deep links
description: Deep-link behavior for hash anchors in React-rendered pages with smooth scrolling.
---

React pages that render hash targets after the initial document parse should explicitly hand off an initial URL hash after mount. When the page uses global smooth scrolling, make that startup handoff immediate and account for fixed navigation so deep links settle on the intended section instead of capturing midway through the scroll.

**Why:** The browser can attempt native hash restoration before React has mounted the target element, and smooth-scroll CSS can make a later programmatic correction appear offset or incomplete.

**How to apply:** Keep normal clicked anchor navigation smooth, but use a one-time post-mount hash correction with a header offset and temporary instant scrolling for direct deep links.