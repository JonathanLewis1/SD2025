// PayPal configuration
export const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "AbB9yXK6_FVewUUjcPXsjP5esLRkLCAp8n8v5mPx1K7XOBN8jO2MgGHzUMl-yAxLlAfh3iMjmiRIcrYB";

// PayPal configuration options
export const PAYPAL_CONFIG = {
  currency: "USD",
  intent: "capture",
  components: "buttons"
}; 