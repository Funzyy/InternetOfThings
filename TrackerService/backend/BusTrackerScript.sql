-- Schema
drop database if exists BusTracker;
create database if not exists BusTracker;
use BusTracker;
-- ----------
-- Tabellen erstellen
-- Bus Stops
create table BusStops (
    id int primary key not null auto_increment,
    stop_name varchar(50),
    lat varchar(45),
    lon varchar(45)
);
-- Bus Line
create table BusLine (
	id int primary key not null auto_increment,
    line_name varchar(45),
    is_loop bool
);
-- Bus
create table Bus (
	id int primary key not null auto_increment,
    fk_line_id int not null,
    prev_stop int,
    next_stop int
);
-- Bus position
create table BusPosition  (
	id int primary key not null auto_increment,
    fk_bus_id int not null,
	lat varchar(45),
    lon varchar(45),
    gps_send_at timestamp
);
-- Line stop order
create table LineStops (
	id int primary key not null auto_increment,
    fk_line_id int not null,
    fk_stop_id int not null,
    sequenc_order int
);
-- Person Test GPS-Data
create table PersonGPS (
	id int primary key not null auto_increment,
    lat varchar(45),
    lon varchar(45)
);
-- ----------
-- Tabellen verknüpfen
-- Bus
alter table Bus add constraint fk_line_id_bus foreign key (fk_line_id) references BusLine (id);
-- Bus Poosition
alter table BusPosition add constraint fk_bus_id_bus_position foreign key (fk_bus_id) references Bus (id);
-- line stop order
alter table LineStops add constraint fk_line_id_line_stops foreign key (fk_line_id) references BusLine (id);
alter table LineStops add constraint fk_stop_id_line_stops foreign key (fk_stop_id) references BusStops (id);
-- ----------
-- Linien einfügen
-- Stops
 insert into BusStops(stop_name, lat, lon) values
	("Schorkendorf", "50.23605188563923", "10.918835978891142"),
    ("Scheuerfeld Helbich-Platz", "50.25169297881586", "10.9254782511896"),
    ("Scheuerfeld Nicolaus-Zech-Str.", "50.25441910023787", "10.926130684406784"),
    ("Scheuerfeld Friedrich-Lutter-Str.", "50.256128173519116", "10.929415372164554"),
    ("Scheuerfeld Dr.-Otto-Str.", "50.25813798040043", "10.933599618167575"),
    ("Coburg Tiefenstein", "50.2585151078772", "10.93806350251357"),
    ("Coburg Schaumberger-Schule", "50.25938954523232", "10.946048568040672"),
    ("Coburg Pommernstr.", "50.25901120978342", "10.949235029329696"),
    ("Coburg Plattenäcker", "50.25905236460176", "10.950576133851884"),
    ("Coburg Weimarer Str.", "50.26132268347709", "10.953403182135121"),
    ("Coburg Hochschule", "50.262752118551916", "10.95090556500626"),
    ("Coburg Thüringer Str.", "50.26297828493032", "10.949117301931786"),
    ("Coburg Realschule 2", "50.26335610901752", "10.947681967150755"),
    ("Coburg Heimatring", "50.26500946869019", "10.944062371925298"),
    ("Coburg Baltenweg", "50.26542541826579", "10.941938030364666"),
    ("Coburg Hochhaus", "50.265912480758956", "10.93843149823776"),
    ("Coburg Schlesierweg", "50.26785529296442", "10.940688564535508"),
    ("Coburg Heimatring Schule", "50.268225477402765", "10.944409055217564"),
    ("Coburg Kantstr.", "50.26864751534832", "10.945126738167932"),
    ("Coburg Falkenegg", "50.27146002688304", "10.946501741653622"),
    ("Coburg Sonnenleite", "50.27038778854725", "10.942420104847486"),
    ("Coburg Hörnleinsgrund", "50.2678572032965", "10.947515930531072"),
    ("Coburg Geleitstr.", "50.26848490802891", "10.95302175964809"),
    ("Coburg ZOB", "50.26160107624805", "10.958334237390288"),
    ("Coburg Mohrenbrücke", "50.261980487919296", "10.96110873399226"),
    ("Coburg Mohrenstr.", "50.26040900588221", "10.96415986243021"),
    ("Coburg Theaterplatz", "50.259911444756405", "10.966577656514794"),
    ("Coburg Ehrenburg", "50.257631569481724", "10.967349564468439"),
    ("Coburg Contakt am Glockenberg", "50.256572764911986", "10.969870954197802"),
    ("Coburg Friedhof", "50.25562748126766", "10.972070954719456"),
    ("Coburg Eckardtsberg", "50.253466650078984", "10.977118872072513"),
    ("Coburg Seidmannsdorfer Str.", "50.25108233010105", "10.979419238191754"),
    ("Coburg Röntgenweg", "50.25028046219784", "10.97734421505688"),
    ("Coburg Tagesklinik", "50.248795469916466", "10.974384455149382"),
    ("Coburg Klinikum", "50.247510652397985", "10.970964297842556"),
    ("Coburg Neue Heimat Schule", "50.245010874601384", "10.974161747959295"),
    ("Coburg Neue Heimat Mitte", "50.24514415829744", "10.978049748543189"),
    ("Coburg Neue Heimat", "50.245744784203254", "10.982215342573383"),
    ("Coburg Lukaskirche", "50.247693476409786", "10.979678416489486"),
    ("Coburg Sauerbruchstr.", "50.25013666804821", "10.982660134504295"),
    ("Coburg Albrecht-Dürer-Str.", "50.24863096145733", "10.987017683130489"),
    ("Coburg Lucas-Cranach-Weg", "50.24879816583444", "10.990663044513127"),
    ("Seidmannsdorf Am Flecken", "50.24804427204249", "10.997213882884434"),
    ("Seidmannsdorf", "50.2491472368789", "11.000830348133373"),
    ("Lützelbuch Haaresgrund", "50.25461459295575", "11.012828655800417"),
    ("Lützelbuch", "50.25609231206172", "11.011514390167775"),
    ("Lützelbuch Laurentiushaus", "50.25807295450559", "11.0122594055127"),
    ("Rögen", "50.260107984932695", "11.013363814963268"),
    ("Coburg Schloss Neuhof", "50.26550053454727", "11.033468856010867"),
    ("Coburg Neershof", "50.268492871756166", "11.041957981160332");
-- Linie 1407
insert into BusLine(line_name, is_loop) values
	("1407", false);
-- line stops order 1407
insert into LineStops(fk_line_id, fk_stop_id, sequenc_order) values
	(1, 1, 1),
	(1, 2, 2),
    (1, 3, 3),
    (1, 4, 4),
    (1, 5, 5),
    (1, 6, 6),
    (1, 9, 7),
    (1, 10, 8),
    (1, 11, 9),
    (1, 14, 10),
    (1, 15, 11),
	(1, 16, 12),
    (1, 17, 13),
    (1, 18, 14),
    (1, 20, 15),
    (1, 21, 16),
    (1, 22, 17),
    (1, 23, 18),
    (1, 24, 19),
    (1, 25, 20),
    (1, 26, 21),
	(1, 27, 22),
    (1, 28, 23),
    (1, 29, 24),
    (1, 30, 25),
    (1, 31, 26),
    (1, 32, 27),
    (1, 33, 28),
    (1, 34, 29),
    (1, 35, 30),
    (1, 36, 31),
	(1, 37, 32),
    (1, 38, 33),
    (1, 39, 34),
    (1, 40, 35),
    (1, 41, 36),
    (1, 42, 37),
    (1, 43, 38),
    (1, 44, 39),
    (1, 45, 40),
    (1, 46, 41),
    (1, 47, 42),
    (1, 48, 43),
    (1, 49, 44),
    (1, 50, 45);
-- Test Daten einfügen
insert into Bus(fk_line_id, prev_stop, next_stop) values
	(1, 6, 9), -- test one !set!
    (1, 20, 21), -- test two !set!
	(1, 1, 2); -- test three !set!
insert into BusPosition(fk_bus_id, lat, lon, gps_send_at) values
	(1, "50.25901833333334", "10.948544", now()), -- test one !set! Schaumberger Schule (Judenberg) !!!MUSS VERSCHOBEN WERDEN!!!
	(2, "50.27074883333333", "10.941947333333333", now()), -- test two !set! Fallkeneggstraße
	(3, "50.23982416666666", "10.923143000000001", now()); -- test three !set! zw. Schorkendorf/Scheuerfeld
insert into PersonGPS(lat, lon) values
	("50.26018915790565", "10.949023738101772"), -- test one !set! Spielplatz
    ("50.26541412201662", "10.96084777541769"), -- test two !set! Edeka
    ("50.265427844087085", "10.924621794138677"); -- test three !set! Trim dich pfad !!!MUSS AUF WYDR GEÄNDERT WERDEN!!!
-- ---------
-- Test ausgaben
-- select * from BusLine;
-- select * from BusStops;