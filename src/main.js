import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {    //use vue2-google-map to display maps with some feature (marker, infowindow, etc)
  load: {
    key: 'your-google-maps-api',     //the key generated when register project free trial on google maps JS API
  },
}),

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
