BEGIN TRANSACTION;

CREATE TABLE 'ioconfig' (	'id' INTEGER PRIMARY KEY NOT NULL, 
				'iopin' TEXT NOT NULL, 
				'descrizione' TEXT NOT NULL, 
				'tipo' TEXT NOT NULL, 
				'moltiplicatore' REAL, 
				'additore' REAL, 
				'deviazione' REAL, 
				'ciclo' REAL, 
				'um' TEXT,
				"adr" NUMERIC DEFAULT (null),
				"porta_bus" INTEGER DEFAULT (0),
				"code" CHAR DEFAULT (null),
				"reg" NUMERIC DEFAULT (null), 
				'enable' BOOL NOT NULL DEFAULT 1 );
  
CREATE TABLE 'misure' (		'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
				'idio' INTEGER NOT NULL, 
				't_timestamp' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
				'valore' REAL NOT NULL);

CREATE TABLE 'param' (		'id' INTEGER  PRIMARY KEY NOT NULL,
				'key' TEXT,
				'value' TEXT);

CREATE TABLE 'log' (		'id' INTEGER PRIMARY KEY NOT NULL,
				't_timestamp' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				'eccezione' TEXT);

COMMIT;
