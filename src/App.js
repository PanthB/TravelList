import './App.css';
import $ from 'jquery'; 
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoicGFudGhiIiwiYSI6ImNreGR1OXdscjFuMHYydW9jeDM1dHl3OWsifQ.qzVgM9nZ4eGv9FqhonyAng';
//yourlist is global so that items can be pushed to it with the Button react component
var yourlist = JSON.parse(localStorage.getItem('yourlist')) || [];
var yourlist_codes = JSON.parse(localStorage.getItem('yourlist_codes')) || [];
var temp = JSON.parse(localStorage.getItem('temp')) || '';

const Button = ({name, visited}) => {

  const handleClick = (e) => {
    //Check if the user's list already contains the country they are trying to add
    if (yourlist.includes(e)) {
      alert("Country is already in list")
    }
    else {
      yourlist.push(e);
      console.log(yourlist);
      localStorage.setItem('yourlist', JSON.stringify(yourlist));
        const fetchdata = () => {
          const url="http://battuta.medunes.net/api/country/search/?country="+e+"&key=937ef4d25573a70b715de1af60794d5d&callback=?"
          $.getJSON(url, function(nations) {
            yourlist_codes.push((nations[0]["code"]).toUpperCase());
          });      
        }    
          fetchdata();
          console.log(yourlist_codes);
          //bug with updating yourlist_codes to localstorage
          localStorage.setItem('yourlist_codes', JSON.stringify(yourlist_codes));
        }
    }

  return (
    <button className = "add" value={name} onClick = {(e) => handleClick(e.target.value)}>Add</button>
  );
}

const App = () => {
  const [countries, updateCountries] = useState([])
  const [filter, updateFilter] = useState('')
  const [visited, updateVisited] = useState([])
  console.log(filter);

  useEffect(() => {
    const fetchdata = () => {
      const url = "https://geo-battuta.net/api/country/search/?country="+filter+"&key=937ef4d25573a70b715de1af60794d5d&callback=?"
      let destinationsList = [];  
      $.getJSON(url, function(nations) {
          for (let i in nations) {
              destinationsList.push(nations[i]);
      }
      });
      updateCountries(destinationsList)
      console.log(countries);

    }
    fetchdata();
    updateVisited(yourlist); 
    },[filter]);
  
    return (
      <div>
        <SearchBar filterQuery = {(input) => updateFilter(input)}/>
        <List1 countries1={countries} visited={visited}/>
        <Title/>
        <YourList visited={visited}/>
        <Map/>
      </div>
    );

}
//MapboxGL docs react
const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(2.5);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
    map.current.on('load', function() {
      map.current.addLayer(
        {
          id: 'country-boundaries',
          source: {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1',
          },
          'source-layer': 'country_boundaries',
          type: 'fill',
          paint: {
            'fill-color': '#d2361e',
            'fill-opacity': 0.5,
          },
        },
        'country-label'
      );
      var filtered = ["in", "iso_3166_1"];
      for (let i in yourlist_codes) {
        filtered.push(yourlist_codes[i]);
      }
      map.current.setFilter('country-boundaries', filtered);
    });
  });
  return (
    <div>
    <div ref={mapContainer} className="map-container" />
    </div>
  );
}

const SearchBar = ({filterQuery}) => {
  const [text, updateText] = useState('')

  const handleChange = (e) => {
    updateText(e)
    filterQuery(e)
  }

  return (<input value = {text} onChange = {e => handleChange(e.target.value)} id = "search" name = "search" autoComplete= "off" placeholder = "Search Destinations" type="search" autoFocus style={{float:"left"}}/>);

}
const Title = () => {
  return (<h1 class = "title">Visited Countries</h1>)
}

const ListItem = ({name, visited}) => {
  return (
    <div>
      <li className="item">{name} <Button name={name} visited={visited}/></li>
    </div>
  );
}


const Delete = ({index}) => {
  
  const handleDelete = (e) => {
    //remove country from yourlist array and update to localstorage
    yourlist.splice(e, 1);
    localStorage.setItem('yourlist', JSON.stringify(yourlist));
    //remove code from yourlist_codes array and update to localstorage
    yourlist_codes.splice(e, 1);
    localStorage.setItem('yourlist_codes', JSON.stringify(yourlist_codes));
  }

  return (
    <button type="button" className = "delete" value={index} onClick = {(e) => handleDelete(e.target.value)}>
        Remove
    </button>
  )
}

const List1 = ({countries1, visited}) => {
  const [nationsList, updateNations] = useState([])
  useEffect(() => {
    const mapped = countries1.map((country, name) => {
      return (
        <ListItem key={name} name={country.name} visited={visited}/>
      );
    });

    updateNations(mapped);

    
  }, [countries1, nationsList]);

    return (
      <ul className="nationsList"> {nationsList} </ul>
    );
  }


//Take in updated list of visited countries and map it with React components for item list, then display as <ul>
const YourList = ({visited}) => {
  const [visitedList, updateYourList] = useState([])

  useEffect(() => {
    const added = visited.map((country, position) => {
      return (
        <YourItem key={position} name={country} index={position} />
      );
    });

    updateYourList(added);
  }, [visitedList, visited])
    return (
      <ul className="YourList"> {visitedList} </ul>
    );
}

//Each country in yourlist takes in a name and index and returns list item as <li>
const YourItem = ({name, index}) => {
  return (
    <div>
      <li className="youritem" >{name} <Delete index={index}/></li>
    </div>
  );
}

// const Map = () => {
//   mapboxgl.accessToken = ''
//   var map = mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v11',
//     center: [5, 46],
//     zoom: 1
//   });

// }

export default App;
