import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

pb.autoCancellation(false);

// Sync auth store with cookies for middleware access
if (typeof window !== 'undefined') {
  pb.authStore.onChange(() => {
    const cookie = pb.authStore.isValid
      ? `pb_auth=${encodeURIComponent(JSON.stringify({ token: pb.authStore.token, model: pb.authStore.model }))}; path=/; max-age=604800; SameSite=Lax`
      : 'pb_auth=; path=/; max-age=0';
    document.cookie = cookie;
  });

  // Initialize cookie on load if auth exists
  if (pb.authStore.isValid) {
    document.cookie = `pb_auth=${encodeURIComponent(JSON.stringify({ token: pb.authStore.token, model: pb.authStore.model }))}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export default pb;
