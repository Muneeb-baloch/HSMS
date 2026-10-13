/** Enterprise landing — replace for white-label deployments. */
export const LANDING_PRODUCT_NAME = "SocietySphere" as const;
export const LANDING_COMPANY_NAME = "SocietySphere Technologies" as const;
export const LANDING_SUPPORT_EMAIL = "support@societysphere.com" as const;
export const LANDING_SALES_EMAIL = "sales@societysphere.com" as const;
/** Used for Book a Demo until a scheduling URL exists */
export const LANDING_DEMO_MAILTO = `mailto:${LANDING_SALES_EMAIL}?subject=Demo%20request%20%E2%80%94%20${LANDING_PRODUCT_NAME}` as const;
