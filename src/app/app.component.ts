import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from '../environments/environment';
import * as turf from '@turf/turf';

import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'map2';
  storeData: any;
  map: mapboxgl.Map;
  selectedLink: number;
  DATA;

  constructor(private D:DataService) {
    this.DATA=D.getData();

  }

  ngOnInit() {
    this.storeData = this.DATA.features;
    mapboxgl.accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: [-77.034084, 38.909671], // [lng, lat]
      zoom: 14, // starting zoom
      scrollZoom: true,
    });
    this.map.on('load', (e) => {
        this.map.addLayer({
          id: 'locations',
          type: 'symbol',
          // Add a GeoJSON source containing place coordinates and information.
          source: {
            type: 'geojson',
            data: this.DATA
          },
          layout: {
            'icon-image': 'restaurant-15',
            'icon-allow-overlap': true,
          }
          });

          const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken
          });

          this.map.addControl(geocoder, 'top-left');

          this.map.addSource('single-point', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          this.map.addLayer({
            id: 'point',
            source: 'single-point',
            type: 'circle',
            paint: {
              'circle-radius': 10,
              'circle-color': '#007cbf',
            },
          });

      // evt handler to select search result from search box

          geocoder.on('result', (ev) => {
            const searchResult = ev.result.geometry;
            this.map.getSource('single-point').setData(searchResult);
            this.buildLocationList(searchResult);
            this.sortLonLat(0, searchResult);
            this.createPopUp(this.storeData[0]);
          });
    });
  }

  sortLonLat(storeIdentifier, searchResult) {
    const lats = [
      this.storeData[storeIdentifier].geometry.coordinates[1],
      searchResult.coordinates[1],
    ];
    const lngs = [
      this.storeData[storeIdentifier].geometry.coordinates[0],
      searchResult.coordinates[0],
    ];

    const sortedLngs = lngs.sort(function(a, b){
      if (a > b) { return 1; }
      if (a.distance < b.distance) { return -1; }
      return 0;
    });
    const sortedLats = lats.sort(function(a, b){
      if (a > b) { return 1; }
      if (a.distance < b.distance) { return -1; }
      return 0;
    });

    this.map.fitBounds([
      [sortedLngs[0], sortedLats[0]],
      [sortedLngs[1], sortedLats[1]],
    ], {
      padding: 100,
    });
  }

  buildLocationList(searchResult) {
    // add distance property in dataset
    this.storeData.forEach((DATA) => {
      Object.defineProperty(DATA.properties, 'distance', {

        value:turf.distance(searchResult,DATA.geometry),
        writable: true,
        enumerable: true,
        configurable: true
      });
      DATA.properties['distance'] = this.roundValue(DATA.properties['distance']);
    });
    // sort the location list
    this.storeData.sort((a, b) => {
      if (a.properties.distance > b.properties.distance) {
        return 1;
      }
      if (a.properties.distance < b.properties.distance) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
  }

  private roundValue(val) {
    return Math.round(val * 100) / 100;
  }

  flyToStore(currentFeature) {
    this.map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 15,
    });
  }

  createPopUp(currentFeature) {
    const popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) {
      popUps[0].remove();
    }
    // const popup = new mapboxgl.Popup({ closeOnClick: false })
    new mapboxgl.Popup()
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(
        `<h4>${currentFeature.properties.address}</h4>
        <h5>${currentFeature.properties.distance} miles away<\h5>`
      )
      .addTo(this.map);
  }

  moveAndShowInfo(currentFeature) {
    this.flyToStore(currentFeature);
    this.createPopUp(currentFeature);
  }

}
