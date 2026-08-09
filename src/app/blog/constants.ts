// Plain (non-"use client") module so both the server page and the client listing can
// import these values. Importing a *value* from a "use client" module into a server
// component yields a client-reference proxy rather than the value itself — doing that
// with the page size sent `limit=[proxy]` to the blog API, which answered 422.

/** Posts per page, shared so the server pre-fetch and the client fetch request the same page. */
export const BLOG_POSTS_PER_PAGE = 12;
