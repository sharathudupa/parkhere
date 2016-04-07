var geocoder;
var map;
var infowindow;

function geocoder_initialize() {
  geocoder = new google.maps.Geocoder();  
}

function maps_initialize(location) {
  var mapOptions = {
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos
      });

      map.setCenter(pos);
    }, function() {
      
    });
  }

  $.getJSON(
  'public.txt',
  function (data) {
    for (var i = 0; i < data.length; i++) {
      var myLatlng = new google.maps.LatLng(data[i], data[i + 1]);
      var icon = new google.maps.MarkerImage("p.jpg", null, null, null, new google.maps.Size(32, 32));
      var image = 'p.jpg';
      var beachMarker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        icon: icon
      });
    }
  });

  $.getJSON(
    'parkings.txt',
    function (data) {
      for (var i = 0; i < data.length; i++) {
        var item = data[i];

        var color;

        if (item.category == 'RP' || item.category == 'NP') {
          color = '#FF0000';
        } else if (item.category == 'UP') {
          color = '#3ADF00';
        } else if (item.category == 'PP') {
          color = '#2E64FE';
        }

        var polyOptions = {
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 3,
          map: map
        };

        if (getDistanceFromLatLonInKm(item.from_lat, item.from_lng, item.to_lat, item.to_lng) < 0.5) {
          //var result = shiftCoordinates(item.from_lat, item.from_lng, item.to_lat, item.to_lng);
          var fromLatLng = new google.maps.LatLng(item.from_lat, item.from_lng); //result.from;
          var toLatLng = new google.maps.LatLng(item.to_lat, item.to_lng);//result.to;
          var inBetween = google.maps.geometry.spherical.interpolate(fromLatLng, toLatLng, 0.5);

          var poly = new google.maps.Polyline(polyOptions);
          var path = poly.getPath();
          path.push(fromLatLng);
          path.push(toLatLng);

          //google.maps.event.addListener(poly, 'click', function (event) {
          //  infowindow.context = "infowindow text";
          //  infowindow.position = event.latLng; ;
          //  infowindow.open(map);
          //});
        }
      }
    })
}

function show_location(location) {
  var marker = new google.maps.Marker({
    map: map,
    position: location
  });
  map.setCenter(location);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function shiftCoordinates(x1, y1, x2, y2)
{
  var slope = (y2 - y1)/(x2-x1);
  var angle = Math.atan(slope);
  var shift = 0.00002;
  var newx1 = x1 - shift*Math.sin(angle);
  var newy1 = y1 + shift*Math.cos(angle);
  var newx2 = x2 - shift*Math.sin(angle);
  var newy2 = y2 + shift*Math.cos(angle);
  
  return { from: new google.maps.LatLng(newx1, newy1), to: new google.maps.LatLng(newx2, newy2) };    
}

function geocode() {
    var address = $('#location').val();
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        show_location(results[0].geometry.location);
      }
    });
}
$(function () {
  //google.maps.event.addDomListener(window, 'load', maps_initialize);

  //initial state
  //$('#where-to-go').css('display', 'block');
  geocoder_initialize();
  maps_initialize();

  //action
  $('#drive-to').click(geocode());
  $('#location').keypress(function (e) {
    if (e.which == 13) {
      geocode();
    }
  });

});