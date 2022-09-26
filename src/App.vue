<template>
  <v-app>
    <!-- this layout to make double navigation drawer -->
    <v-layout fill-height>    <!-- to fill all the height of the app -->
      <v-navigation-drawer class="left-menu" dark width="150" permanent>    <!-- first nav drawer -->
        <v-list>
          <v-list-item-group>
            <v-list-item v-for="item in items" :key="item.title" link> <!-- loop all the items for first nav drawer -->
              <div class="wrapper">
                <v-icon size="50">{{ item.icon }}</v-icon>
                <v-list-item-title class="title-icon">{{
                  item.title
                }}</v-list-item-title>
              </div>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
      <v-navigation-drawer class="right-menu" dark width="250" permanent>   <!-- second nav drawer -->
        <v-list flat>   <!-- to make non active list -->
          <v-list-item-group>
            <v-list-item v-for="location in locations" :key="location.name" link>   <!-- loop all the items for second nav drawer -->
              <v-list-item-title
                @click="clickMarker( location.id - 1, {lat: location.lat, lng: location.lng,})">    <!-- list item with click event -->
                  {{ location.name }}     <!-- get location name -->
                </v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
      <!-- this content for app bar and maps because there are 2 nav drawer -->
      <v-content>
        <v-app-bar>
          <v-app-bar-title class="title">
            TOP-RATED TOURIST ATTRACTION IN SINGAPORE
          </v-app-bar-title>
          <v-spacer></v-spacer>
          <v-icon>mdi-cog</v-icon>
          <v-icon>mdi-help-circle</v-icon>
          <v-icon @click="closeMarker(showByIndex)">mdi-close-circle</v-icon>   <!-- first nav drawer -->
        </v-app-bar>
        <!-- use Gmap component for easy use -->
        <GmapMap
          :center="center"
          :zoom="zoom"
          style="width: 100%; height: 91.5%"
          ref="map"
        >
          <!-- Marker component and label -->
          <GmapMarker
            :key="index"
            v-for="(m, index) in markers"
            :position="m.position"
            :icon="m.icon"
            :label="m.label"
            @click="clickMarker(index, m.position)"
            @mouseover="hoverMarker(index)"
            @mouseout="outMarker(index)"
          >
            <gmap-info-window
              :opened="showByIndex === index"
              :closeclick="true"
              @closeclick="closeMarker(index)"
            >
              <h2>{{ locations[index].name }}</h2>
              <p>{{ locations[index].address }}</p>
            </gmap-info-window>
          </GmapMarker>
        </GmapMap>
      </v-content>
      <div id="description">    <!-- description part that will appear after marker clicked -->
        <img id="desc-img" width="300" />
        <h2 v-if="opened" class="desc-title">
          {{ locations[showByIndex].name }}
        </h2>
        <p v-if="opened" class="desc-subtitle">
          {{ locations[showByIndex].description }}
          <br /><br />
          <v-icon color=#72cdd2>mdi-map-marker</v-icon>{{ locations[showByIndex].address }}
          <br /><br />
          <v-icon color=#98ca32>mdi-web</v-icon>{{ locations[showByIndex].website }}
        </p>
      </div>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data() {
    return {
      center: { lat: 1.292489, lng: 103.85223 },
      zoom: 15,
      locations: [],
      markers: [],
      items: [
        { title: "Browse", icon: "mdi-earth" },
        { title: "Suggest Attraction", icon: "mdi-comment-edit-outline" },
        { title: "Videos", icon: "mdi-youtube-tv" },
        { title: "Blog", icon: "mdi-forum-outline" },
        { title: "About", icon: "mdi-information" },
      ],
      opened: false,
      showByIndex: null,
    };
  },

  async created() {     //i use async to wait for fetch to be commited first, and then the other command
    await fetch("/locations.json")    //fetching data from local json file, i use fetch because easy and don't need to install (ex: Axios)
      .then((response) => response.json())
      .then((data) => (this.locations = data))
      .catch((err) => console.log(err));

    this.createMarker();

    // to remove poi and transit train, i use refs promise to make changes to the vue2-google-map maps. 
    // vue2-google-map doesn't have parameter to change the feature type.
    this.$refs.map.$mapPromise.then((map) => {
      map.setOptions({
        clickableIcons: false,
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
    });
  },

  methods: {
    createMarker() {    //function to make marker at the first time the page is created
      for (var i = 0; i < this.locations.length; i++) {
        this.markers.push({
          position: { lat: this.locations[i].lat, lng: this.locations[i].lng },
          label: {
            text: this.locations[i].name,
            fontWeight: "bold"
          },
          icon: {
            url: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
            scaledSize: { width: 50, height: 50 },
            labelOrigin: {
              x: this.locations[i].labelx,
              y: this.locations[i].labely,
            },
          },
        });
      }
    },

    clickMarker(index, position) {    //function to change several data for zooming, icon scale, infowindow, and description when click marker
      if (this.opened == false) {
        this.center = position;
        this.zoom = 17;
        this.showByIndex = index;
        this.opened = true;
        this.markers[index].icon = {
          url: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
          scaledSize: { width: 100, height: 100 },
          labelOrigin: {
            x: this.locations[index].labelx + 40,
            y: this.locations[index].labely + 20,
          },
        };
        this.renderImage();
        document.getElementById("description").style.display = "block";
      }
    },

    hoverMarker(index) {    //function to change several data for icon scale and infowindow when mouse hover to the marker
      if (this.opened == false) {
        this.showByIndex = index;
        this.markers[index].icon = {
          url: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
          scaledSize: { width: 100, height: 100 },
          labelOrigin: {
            x: this.locations[index].labelx + 40,
            y: this.locations[index].labely + 20,
          },
        };
      }
    },

    outMarker(index) {    //function to change several data for icon scale and infowindow when mouse leaving to the marker
      if (this.opened == false) {
        this.showByIndex = null;
        this.markers[index].icon = {
          url: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
          scaledSize: { width: 50, height: 50 },
          labelOrigin: {
            x: this.locations[index].labelx,
            y: this.locations[index].labely,
          },
        };
      }
    },

    closeMarker(index) {    //function to change several data for zooming, icon scale, infowindow, and description when close marker
      this.opened = false;
      this.showByIndex = null;
      this.zoom = 15;
      this.markers[index].icon = {
        url: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
        scaledSize: { width: 50, height: 50 },
        labelOrigin: {
          x: this.locations[index].labelx,
          y: this.locations[index].labely,
        },
      };
      document.getElementById("description").style.display = "none";
    },

    renderImage() {
      var url = this.showByIndex + 1 + ".jpg";
      var img = document.getElementById("desc-img");
      img.src = url;
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  padding: 20px;
  .title-icon {
    white-space: normal;
    text-align: center;
  }
}

.title {
  width: 500px;
}

#description {
  max-width: 300px;
  display: none;
  background-color: #313541;
}

.desc-title {
  padding: 1rem;
  margin-top: -3%;
  background-color: #72cdd2;
  color: white;
}

.desc-subtitle {
  padding: 1rem;
  font-size: 12px;
  color: white;
}
</style>
