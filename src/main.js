import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vue-toastification/dist/index.css';
import Toast from 'vue-toastification';
import './assets/styles.css';

// Load Google Maps script
const API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;
const loadGoogleMapsScript = () => {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
  script.defer = true;
  script.async = true;

  script.onload = () => {
    // The Google Maps API has loaded, you can now use it in your app
    app.mount('#app');
  };

  document.head.appendChild(script);
};

// Create Vue app
const app = createApp(App);

// Use router and Toast plugin
app.use(router);
app.use(Toast);

// Wait for the Google Maps script to load before mounting the app
loadGoogleMapsScript();
