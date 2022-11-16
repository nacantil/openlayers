import './App.css';

// react
import React, { useState, useEffect } from 'react';

// openlayers
import GeoJSON from 'ol/format/GeoJSON'
import Feature from 'ol/Feature';

// components
import MapWrapper from './components/MapWrapper'
import WMSComponent from './components/WMSComponent'

function App() {
  
  // set intial state
  const [ features, setFeatures ] = useState([])

  // initialization - retrieve GeoJSON features from Mock JSON API get features from mock 
  //  GeoJson API (read from flat .json file in public directory)
  useEffect( () => {

    fetch('/mock-geojson-api.json')
      .then(response => response.json())
      .then( (fetchedFeatures) => {

        // parse fetched geojson into OpenLayers features
        //  use options to convert feature from EPSG:4326 to EPSG:3857
        const wktOptions = {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }
        const parsedFeatures = new GeoJSON().readFeatures(fetchedFeatures, wktOptions)

        // set features into state (which will be passed into OpenLayers
        //  map component as props)
        setFeatures(parsedFeatures)

      })

  },[])
  
  
  	let divStyle = {
  		display: "flex"
	}

	let mapDivStyle = {
		height: "100%",
		width: "80%",
	} 

	let wmsDivStyle = {
		width: "20%",
	} 
  
  return (
    	<div style = {divStyle}>
    		<div style = {mapDivStyle}>
    			<MapWrapper features={features} />
    		</div>
    		<div style={wmsDivStyle}>
    			<WMSComponent />
    		</div>
    	</div>
  )
}

export default App
