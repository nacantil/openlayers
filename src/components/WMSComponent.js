import axios from 'axios'
import Dropdown from 'react-dropdown';
import ImageWMS from 'ol/source/ImageWMS';
import React, { useState, useEffect } from "react";
import 'react-dropdown/style.css';
import {olMap} from "./MapWrapper"
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

// Keeps the currently selected WMSCap ...
var wmsCapabilities = null;

// Used to parse the WMS Capabilities response ...
var xmlParser = new DOMParser();

// FNMOC will do a credential check via the CAC ...
var axiosInstance = axios.create(
{
	withCredentials: true	
});

export default function WMSComponent() {
	// React hooks 
	var [layers, setLayers] = useState([]);

	var layer = null;
	
	var loadedLayers = [];

	var buttons = new Set();

	// hard-coded ...
	let urls = [
		"https://portal.fnmoc.navy.mil/geoserver/NAVGEM/wms?service=WMS&version=1.3.0&request=GetCapabilities",
		"https://portal.fnmoc.navy.mil/geoserver/NCEP_GFS/wms?service=WMS&version=1.3.0&request=GetCapabilities",
		"https://portal-alpha.fnmoc.navy.mil/geoserver/imagery/wms?service=WMS&version=1.3.0&request=GetCapabilities",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/NAVGEM/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/WW3_GLOBAL/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://portal.fnmoc.navy.mil/geoserver/imagery/wms?SERVICE=WMS&REQUEST=GetCapabilities&version=1.3.0",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/AMBIENT_NOISE?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/COAMPS/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/CBLUG?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/HFBL?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/GDEM-V_3.0.2/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/HYCOM/?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/SAFE?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS",
		"https://geointdev.nrlssc.org/metocserver/ogc/wms/ACAF?REQUEST=GetCapabilities&VERSION=1.3.0&SERVICE=WMS"
	];

	let unselectedButtonStyle = {
		padding: "15px 15px",
		//textAlign: "center",
		fontSize: "13px",
		margin: "4px 2px",
		cursor: "pointer"
	}
	
	const generateUUID = () =>
	{
		return "" + crypto.randomUUID();	
	}

	const clearAllButtonState = () =>
	{
		for (const buttonName of buttons)
		{
			var button = document.getElementById(buttonName);
			if (button)
			{
				button.style.backgroundColor = '';	
			}
		}	
	}

	const ToggleButton = (props) => {
		// I just want to keep track of the buttons that are loaded, that's all ...
		buttons.add(props.item);
		
		return (
			<button key={props.item} id={props.item} style={unselectedButtonStyle} name={props.item} onClick={props.onClick}>{props.item}</button>
		);
	}

	const removeAllLoadedLayers = () => {
		for (var i = 0; i < loadedLayers.length; i++)
		{
			olMap.removeLayer(loadedLayers[i]);	
		}
		loadedLayers = [];
	}
	
	const process = (data) => {
		layers = [];
		
		// Use XPATH to extract all the layer names we need ...
		var xml = xmlParser.parseFromString(data, 'application/xml');
		var xpath = '//*[local-name()="Layer"][not(.//*[local-name()="Layer"])]/*[local-name()="Name"]';
		var nodes = xml.evaluate(xpath, xml, null, XPathResult.ANYType, null);

        var result = nodes.iterateNext();
        while (result)
        {
			layers.push(result.textContent);
       		result = nodes.iterateNext(); 
        }

		setLayers(layers);
	}
	
	const onChange = (e) => {
		buttons.clear();
		removeAllLoadedLayers();
		layers = [];	
		setLayers(layers);
		
		wmsCapabilities = e.value;
		
		axiosInstance.get(e.value).then(resp=>
			process(resp.data)
		);
	}
	
	const onClick = (e) => {
		clearAllButtonState();
		var button = document.getElementById(e.target.name);
		if (button)
		{
			button.style.backgroundColor = "darkGray";
		}

		removeAllLoadedLayers();
		layer =	new TileLayer(
		{
    		source: new TileWMS(
    		{
      			url: wmsCapabilities,
      			params: {'LAYERS': e.target.name},
      			serverType: 'geoserver',
      			transition: 0,
    		})
  		});
  		
  		/**
  		// Or use this ...
  		layer = new ImageLayer(
  		{
    		source: new ImageWMS(
    		{
      			url: wmsCapabilities,
      			params: {'LAYERS': e.target.name},
      			ratio: 1,
      			serverType: 'geoserver',
    		}),
  		})
  		**/
		
		olMap.addLayer(layer, 0);	
		loadedLayers.push(layer);
	}
	
	let divStyle = { 
		display: "grid",
		maxHeight: "800px",
		width: "100%",
  		overflowY: "scroll",	
  		overflowX: "hidden"	
  	}

	return (
		<div key={generateUUID()}>
			<Dropdown options={urls} onChange={onChange} value={wmsCapabilities} placeholder="Select an option" />
			<div style={divStyle}>
				{layers.map(item => (<ToggleButton key={generateUUID()} item={item} onClick={onClick}/>))}
			</div>
		</div>
	);
}

export {wmsCapabilities}