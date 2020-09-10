const BLOG_DEV_MODE = false;
const BLOG_DEV_RELOAD_TIME = 3000;

if (BLOG_DEV_MODE) {
  setTimeout(() => {
    location.reload();
  }, BLOG_DEV_RELOAD_TIME);
}
