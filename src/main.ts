// src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { setupRouter } from './router/index.ts';

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);

setupRouter().then((router) => {
    app.use(router);
    app.mount('#app');
});
