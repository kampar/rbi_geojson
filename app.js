// script ini butuh LeafletJS untuk polygon 
// dan butuh FileSaver untuk save file untuk download ke harddisk (saveas) dari browser
	
//warning: rbi harus dalam format integer, bukan oktal
// di javascript 0100 tidak sama dengan 100
function rbi250toBounds(rbi){
	return {
		"_southWest":{
			"lat":rbi % 100 -16
			,"lng": (Math.round(rbi/100)-1)*1.5+ 90
		}
		,"_northEast":{
			"lat":rbi % 100 -15
			,"lng":(Math.round(rbi/100)-1)*1.5+ 91.5
		}
	};
}

function rbi250toNEWS(rbi){
	return {
		"north":rbi % 100 -15
		,"south":rbi % 100 -16
		,"west": (Math.round(rbi/100)-1)*1.5+ 90
		,"east":(Math.round(rbi/100)-1)*1.5+ 91.5
	};
}

//input rbi, hasilkan leaflet polygon
function rbi250toPolygon(rbi){
	var _bb = rbi250toNEWS(rbi);
	return new L.Polygon([[_bb.north,_bb.west],[_bb.north,_bb.east],[_bb.south,_bb.east],[_bb.south,_bb.west]]);

}

function rbi250toGeoJSON(rbi){
	var g= rbi250toPolygon(rbi).toGeoJSON()
	var bb = rbi250toNEWS(rbi);
	
	//populate attribute table
	g.properties={
		// untuk nama rbi, sepertinya harus kita padding dengan nol di depan, dan agar bisa dipadding, harus diconvert dulu ke string, lalu gunakan fungsi padStart
		rbi250:(''+rbi).padStart(4,'0'),
		n:bb.north,
		w:bb.west,
		s:bb.south,
		e:bb.east,
	};
	return g;
}

//FileSaver untuk download semua RBI 250.000 ke harddisk dengan format geojson
function downloadRBI250Indonesia(){
	// Create an empty GeoJSON collection
	var collection = {
		"type": "FeatureCollection",
		"features": []
	};
	
	//sekarang loop 
	for(x=1;x<=37;x++){
		for(y=1;y<=25;y++){
			g= rbi250toGeoJSON(x*100+y)
			collection.features.push(g);
		}
	}
	saveAs(
		new Blob([JSON.stringify(collection)], {
			type: "text/plain;charset=utf-8"
		}),'rbi250Indonesia.geojson'
	);

}


// nah sekarang yang lebih susah, adalah RBI 100
// adalah RBI 250 dibagi 6, masing-masingnya adalah
// setengah derjat x setengah derjat
// dan nomornya adalah dari 1 sampai 6 
// dari kiribawah ke kanan lalu ke atas
// 4 5 6
// 1 2 3

function rbi100toNEWS(rbi){
	//cek dulu rbi kecil dari 1000, karena kalau langsung bagi bisa bahaya :D
	var myRBI250 = rbi250toNEWS(Math.floor(rbi/10)); // parent RBI
	// waduh, tadi pakai Math.round hasilnya malah error, makanya stelah saya log ke console, keliatan round nya error, kita pake floor saja ya
	//console.log('myRBI250='+JSON.stringify(myRBI250));
	
	//sekarang baru check digit terakhir, 1 sd 6
	var digitakhir = rbi % 10;
	
	//console.log('digitakhir='+digitakhir);
	
	
	// 1 2 3 maka south nya sama dengan induk
	//            north nya adalah south induk tambah 0.5 derjat
	// 4 5 6 maka north nya sama dengan north induk
	//            south nya adalah north induk kurang 0.5 ataupun boleh juga south induk tambah 0.5, karena sama saja
	
	// 1 dan 4 west nya sama dengan induk, east nya west induk tambah 0.5
	// 2 dan 5, west nya adalah west induk + 0.5
	// 3 dan 6, west nya adalah west induk tambah 1 derjat
	
	// 1 dan 4, east adalah west induk + 0.5
	// 2 dan 5, east adalah west induk + 1
	// 3 dan 6, east nya adalah east induk
	
	var tmp = {}; // untuk direturn nanti
	
	//south and north
	switch(digitakhir){
		case 1: case 2: case 3:
			tmp.south = myRBI250.south; 
			tmp.north = myRBI250.south + 0.5; 
			break;
		case 4: case 5: case 6:
			tmp.south = myRBI250.south + 0.5; 
			tmp.north = myRBI250.north; 
			break;
		
	}
	
	switch(digitakhir){
		case 1: case 4:
			tmp.west = myRBI250.west;
			tmp.east = myRBI250.west + 0.5;
			break;
		case 2: case 5:
			tmp.west = myRBI250.west + 0.5;
			tmp.east = myRBI250.west + 1;
			break;
		case 3: case 6:	
			tmp.west = myRBI250.west + 1;
			tmp.east = myRBI250.east;
			break;
	}
	
	//now return tmp
	return tmp;

}

//input rbi, hasilkan leaflet polygon
function rbi100toPolygon(rbi){
	var _bb = rbi100toNEWS(rbi);
	return new L.Polygon([[_bb.north,_bb.west],[_bb.north,_bb.east],[_bb.south,_bb.east],[_bb.south,_bb.west]]);

}
function rbi100toGeoJSON(rbi){
	var g= rbi100toPolygon(rbi).toGeoJSON()
	var bb = rbi100toNEWS(rbi);
	
	//populate attribute table
	g.properties={
		// untuk nama rbi, sepertinya harus kita padding dengan nol di depan, dan agar bisa dipadding, harus diconvert dulu ke string, lalu gunakan fungsi padStart
		rbi100:(''+Math.floor(rbi/10)).padStart(4,'0')+'-'+(rbi%10),
		n:bb.north,
		w:bb.west,
		s:bb.south,
		e:bb.east,
	};
	return g;
}

function downloadRBI100Indonesia(){
	// Create an empty GeoJSON collection
	var collection = {
		"type": "FeatureCollection",
		"features": []
	};
	
	//sekarang loop 
	for(x=1;x<=37;x++){
		for(y=1;y<=25;y++){
			for(z=1;z<=6;z++){
			g= rbi100toGeoJSON(x*1000+y*10+z)
			collection.features.push(g);
			}
		}
	}
	//FileSaver JS
	saveAs(
		new Blob([JSON.stringify(collection)], {
			type: "text/plain;charset=utf-8"
		}),'rbi100Indonesia.geojson'
	);

}


// sekarang kita coba pake Object
// cara pakenya nanti: x = new RBI50(91361)
function RBI50(rbi){
	this.rbi=rbi;
	this.parentRBI=Math.floor(this.rbi/10);
	this.parentNEWS = rbi100toNEWS(this.parentRBI);
	
	//local variable
	this.getNEWS = function(){
		var digitakhir = this.rbi % 10;
		// 3 4
		// 1 2
		var tmp = {}; // untuk direturn nanti
	
		//south and north
		switch(digitakhir){
			case 1: case 2: 
				tmp.south = this.parentNEWS.south; 
				tmp.north = this.parentNEWS.south + 0.25; 
				break;
			case 3: case 4: 
				tmp.south = this.parentNEWS.south + 0.25; 
				tmp.north = this.parentNEWS.north; 
				break;
		}
	
		switch(digitakhir){
			case 1: case 3:
				tmp.west = this.parentNEWS.west;
				tmp.east = this.parentNEWS.west + 0.25;
				break;
			case 2: case 4:
				tmp.west = this.parentNEWS.west + 0.25;
				tmp.east = this.parentNEWS.east;
				break;
		}
	
		//now return tmp
		return tmp;
	
	};
	
	this.NEWS = this.getNEWS();

	this.toPolygon = function(){
		return new L.Polygon([[this.NEWS.north,this.NEWS.west],[this.NEWS.north,this.NEWS.east],[this.NEWS.south,this.NEWS.east],[this.NEWS.south,this.NEWS.west]]);
	
	};
	this.polygon = this.toPolygon();
	
	this.toGeoJSON = function (){
		var g = this.polygon.toGeoJSON(); //call toGeoJSON from LeafletJS
	
		//populate attribute table
		g.properties={
			// untuk nama rbi, sepertinya harus kita padding dengan nol di depan, dan agar bisa dipadding, harus diconvert dulu ke string, lalu gunakan fungsi padStart
			rbi50:(''+Math.floor(rbi/100)).padStart(4,'0')+'-'+(rbi%100),
			n:this.NEWS.north,
			w:this.NEWS.west,
			s:this.NEWS.south,
			e:this.NEWS.east,
		};
		return g;
	};
	
	this.geoJSON = this.toGeoJSON();
	
};


//RBI50.prototype.parent = function(){
//		return rbi100toNEWS(Math.floor(this.rbi/10));
//};

function downloadRBI50Indonesia(){
	// Create an empty GeoJSON collection
	var collection = {
		"type": "FeatureCollection",
		"features": []
	};
	
	//sekarang loop 
	for(x=1;x<=37;x++){
		for(y=1;y<=25;y++){
			for(z=1;z<=6;z++){
				for(a=1;a<=4;a++){
					g= new RBI50(x*10000+y*100+z*10+a).geoJSON
					collection.features.push(g);
				}
			}
		}
	}
	//FileSaver JS
	saveAs(
		new Blob([JSON.stringify(collection)], {
			type: "text/plain;charset=utf-8"
		}),'rbi50Indonesia.geojson'
	);

}



