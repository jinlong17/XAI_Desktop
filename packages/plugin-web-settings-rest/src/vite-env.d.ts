interface ImportMetaEnv { readonly VITE_WEB_AUTH_MODE?: string; readonly VITE_STRIPE_PAYMENT_LINK_URL?: string; readonly VITE_STRIPE_CHECKOUT_URL?: string; readonly VITE_STRIPE_PORTAL_URL?: string; }
interface ImportMeta { readonly env: ImportMetaEnv; }
