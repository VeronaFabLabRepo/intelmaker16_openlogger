# -*- coding: utf-8 -*-

'''
OpenLogger - 2016 - Verona Fablab LinuxGroup Team
Author: Federico Ciresola
Author: Andrea Zambon - zamby.ing @ gmail.com 
Author: Angelo Camesasca
License: CC BY-NC-SA
'''


import tornado.ioloop
from tornado import web
import sqlite3
import json
import csv
from lib import IOConfig
from lib import SqliteConnection as sqlc


#setta le confiurazioni nel database
#viene chiama dalla pagina delle configurazioni
class set_conf(tornado.web.RequestHandler):
	def get(self):
		global currentOpenlogger
		dati = []
		valori = ["id","iopin","descrizione","tipo","moltiplicatore","additore","deviazione","ciclo","adr","porta_bus","enable"]
		num_tab = int(("".join(self.request.arguments['num_tab'])))
		dati.append(("".join(self.request.arguments['iopin']))) #ioconfig
		dati.append(("".join(self.request.arguments['text'])))  #descrizione
		dati.append(("".join(self.request.arguments['tipo']))) #tipo
		dati.append(("".join(self.request.arguments['molt'])))  #molt
		dati.append(("".join(self.request.arguments['addit']))) #addit
		dati.append(("".join(self.request.arguments['deviat']))) #deviat
		dati.append(("".join(self.request.arguments['ciclo'])))  #ciclo
		dati.append(("".join(self.request.arguments['um'])))  #um
		dati.append(("".join(self.request.arguments['address']))) #adr
		dati.append(("".join(self.request.arguments['bus']))) #porta_nus
		dati.append(("".join(self.request.arguments['code'])))#code
		dati.append(("".join(self.request.arguments['reg'])))#reg
		cont =0
		for dato in dati:
			dati[cont]= json.loads(dato)
			cont+=1

		c_db = sqlc.connessione_DB()
		iopin = c_db.exe("select iopin,id from ioconfig")
		c_db.exe('delete from ioconfig')

		for pin in iopin:
			if not (pin[0] in dati[0]):
					id = c_db.exe('select id from ioconfig where iopin=\"'+str(pin[0])+'\"')
					c_db.exe('delete from misure where idio=\"'+str(id)+'\"')



		cont = 0
		for val in range(num_tab):
			c_db.exe("insert into ioconfig values (\""+str((cont+1))+"\",\""+dati[0][cont]+"\",\""+dati[1][cont]+"\",\""+
			dati[2][cont]+"\",\""+dati[3][cont]+"\",\""+dati[4][cont]+"\",\""+dati[5][cont]+"\",\""+
			dati[6][cont]+"\",\""+dati[7][cont]+"\",\""+dati[8][cont]+"\",\""+dati[9][cont]+"\",\""+dati[10][cont]+"\",\""+dati[11][cont]+"\",1)")
			cont+=1

		num_conf = c_db.exe("select max(id) from ioconfig")
		conf = c_db.exe("select * from ioconfig")

		c_db.close()

		cont=1
		num_conf = num_conf[0]
		while(cont<=num_conf[0]):
			currentOpenlogger.KillThread(cont)
			cont+=1
			print(cont)


		for row in conf:
			ioconfig = IOConfig.IOConfig(row)
			currentOpenlogger.CreateThread(ioconfig)




#restituisce tutte le configurazioni che ci sono nella tabella ioconfig
#viene chiamata quando si accede alla pagina di configurazione degli I/O
class get_conf(tornado.web.RequestHandler):
	def get(self):
		col = ["iopin","descrizione","tipo","moltiplicatore","additore","deviazione","ciclo","um","adr","porta_bus","code","reg"]

		c_db = sqlc.connessione_DB()

		get_dati= []
		dati_for_json=[]
		cont = 0

		for rig in col:
			riga= c_db.exe("select "+rig+" from ioconfig")

			for val in riga:
				for dato in val:
					get_dati.append(dato)
			dati_for_json.append(get_dati)
			get_dati= []

		tab = c_db.exe("select * from ioconfig")
		for num in tab:
			cont+=1
		c_db.close()

		self.write({
			'num_tab':cont,
			'iopin':dati_for_json[0],
			'descrizione':dati_for_json[1],
			'tipo':dati_for_json[2],
			'moltiplicatore':dati_for_json[3],
			'aditore':dati_for_json[4],
			'deviatore':dati_for_json[5],
			'ciclo':dati_for_json[6],
			'um':dati_for_json[7],
			'adr':dati_for_json[8],
			'porta_bus':dati_for_json[9],
			'code':dati_for_json[10],
			'registro':dati_for_json[11]
		})

#cancella tutte le configurazioni della tabella ioconfig
class reset_config (tornado.web.RequestHandler):
	def get(self):
		c_db = sqlc.connessione_DB()
		c_db.exe('delete from ioconfig')
		c_db.close()

#cancella tutte i valori della tabella misure
class reset_value_table(tornado.web.RequestHandler):
	def get(self):
		c_db = sqlc.connessione_DB()
		c_db.exe('delete from misure')
		c_db.close()

#crea un csv con i dati che stanno dentro alla finestra
#temporale impostata
class get_csv(tornado.web.RequestHandler):
	def get(self):
		query = self.request.arguments["query"]

		c_db = sqlc.connessione_DB()
		#val = c_db.exe("select * from misure where t_timestamp>=\""+data_start[0]+" "+hour_start[0]+"\" and t_timestamp<= \""+data_end[0]+" "+hour_end[0]+"\"")
		val = c_db.exe(query[0])
		c_db.close()

		if(len(val)>0):
			with open('CSV.csv', 'w+') as fcsv:
				fcsv.write('idio,t_timestamp,valore\n')
				file = csv.writer(fcsv , delimiter=',')
				file.writerows(val)
				fcsv.close()

#restituisce i valori per la tabella nella finestra
#temporale selezionata
#viene chiamata quando si cerca di creare il grafico
class set_graph(tornado.web.RequestHandler):
	def get(self):
		line_iopin, linee_grafico = useful_def.create_graph(self.request)

		self.write({
			"iopin":line_iopin,
			"conf":linee_grafico
		})

#rispondo con che board e'
class get_board(tornado.web.RequestHandler):
	def get(self):
		global currentMachine
		self.write({
			"board": currentMachine.getInfo()
		})

#rispondo
class get_row_tab(tornado.web.RequestHandler):
	def get(self):
		c_db = sqlc.connessione_DB()
		query = c_db.exe("select iopin,descrizione,tipo,moltiplicatore,additore,deviazione,ciclo,um,adr,porta_bus,reg,enable,id from ioconfig")
		c_db.close()

		num_conf = 0
		val = []
		for x in query:
			riga = {
				"iopin":x[0],
				"descr":x[1],
				"tipo":x[2],
				"molt":x[3],
				"addit":x[4],
				"dev":x[5],
				"ciclo":x[6],
				"um":x[7],
				"adr":x[8],
				"porta_bus":x[9],
				"reg":x[10],
				"enable":x[11],
				"id":x[12]
			}
			val.append(riga)
			num_conf+=1

		self.write({
			"num_conf": num_conf,
			"config":val
		})

class update_state_conf(tornado.web.RequestHandler):
	def get(self):
		
		
		id = self.request.arguments["id"]
		value = self.request.arguments["value"]

		if(str(value[0]) == "true"):
			state=1
		else:
			state=0

		c_db = sqlc.connessione_DB()
		c_db.exe("update ioconfig set enable="+str(state)+" where id="+str(id[0])+"")
		c_db.close()

		currentOpenlogger.SetStatusThread(id)
		

class dati_table_misure(tornado.web.RequestHandler):
	def get(self):
		query = self.request.arguments["query"]
		flag_raw= self.request.arguments["elaborazione_raw"]

		c_db = sqlc.connessione_DB()
		righe = c_db.exe(str(query[0]))
		operator = c_db.exe("select id,additore,moltiplicatore from ioconfig")
		c_db.close()

		dict = []
		if(flag_raw[0] == 'true'):

			for x in righe :
				rigajs={
					"idio" :  x[0],
					"t_time" : x[1],
					"valore" : useful_def.calc(operator,x[0],x[2])
				}
				dict.append(rigajs)
		else:
			for x in righe :
				rigajs={
					"idio" :  x[0],
					"t_time" : x[1],
					"valore" : x[2]
				}
				dict.append(rigajs)


		self.write({
			"misure" :dict
		})

#rispondo con tutte le informazioni della board
class get_info_hardware_thread (tornado.web.RequestHandler):
	def get(self):
		global currentMachine
		list_value_io = []
		c_db=sqlc.connessione_DB()

		num_conf = (c_db.exe("select max(id) from ioconfig"))[0]
		idio=1
		while(idio<=num_conf[0]):
			row = (c_db.exe("select * from misure where id=(select max(id) from misure where idio="+str(idio)+") and idio="+str(idio)))[0]
			list_value_io.append(row)
			idio+=1
		c_db.close()

		self.write({
			"valori_thread":list_value_io,
			"cpu": currentMachine.getCpuLoad() ,
			"ram": currentMachine.getMemLoad(),
			"disk": currentMachine.getDiskLoad(),
			"size_db": currentMachine.getSizeDb(),
			"datetime":currentMachine.getData()
		})

class set_time_machine(tornado.web.RequestHandler):
	def get(self):
		global currentMachine
		datetime = self.request.arguments["datetime"]
		currentMachine.setData(datetime[0])

class switch_pin(tornado.web.RequestHandler):
	def get(self):
		c_db = sqlc.connessione_DB()
		num_pin = c_db.exe("select max(id) from ioconfig")
		c_db.close()

		self.write({
			"num_pin": num_pin
		})

class update_graphics(tornado.web.RequestHandler):
	def get(self):
		list_value_io = []
		c_db=sqlc.connessione_DB()
		num_conf = (c_db.exe("select max(id) from ioconfig"))[0]
		idio=1

		while(idio<=num_conf[0]):
			row = (c_db.exe("select * from misure where id=(select max(id) from misure where idio="+str(idio)+") and idio="+str(idio)))[0]
			list_value_io.append(row)
			idio+=1
		c_db.close()

		self.write({
			'num_conf':num_conf,
			'last_value':list_value_io
		});

class useful_def():
	@staticmethod
	def create_graph(request):
		data_start_g = request.arguments["data_start"]
		data_end_g = request.arguments["data_end"]
		hour_start_g = request.arguments["hour_start"]
		hour_end_g = request.arguments["hour_end"]


		c_db = sqlc.connessione_DB()
		query = c_db.exe("select id from ioconfig")

		operator = c_db.exe("select id,additore,moltiplicatore from ioconfig")

		line_iopin=[]
		for x in query:
			line_iopin.append(x[0])

		linea_grafico=[]
		linee_grafico=[]
		#cp = list(line_iopin)

		for val_iopin in line_iopin:
			#val = c_db.exe("select idio,substr(t_timestamp,0,17) || ':00' as ts,avg(valore) as vl from misure where idio=\""+str(val_iopin)+"\" and ts>=\""+data_start_g[0]+" "+hour_start_g[0]+"\" and ts<= \""+data_end_g[0]+" "+hour_end_g[0]+"\"  GROUP BY idio,ts     ")
			val = c_db.exe("select idio,t_timestamp,valore from misure where idio=\""+str(val_iopin)+"\" and t_timestamp>=\""+data_start_g[0]+" "+hour_start_g[0]+"\" and t_timestamp<= \""+data_end_g[0]+" "+hour_end_g[0]+"\"")
			#in questo modo non inserisco array vuoti
			if(len(val) > 0):
				#modifica il valore row
				for row in val:
					row = list(row)
					row[2]=str(useful_def.calc(operator,row[0],row[2]))
					linea_grafico.append(row)

				linee_grafico.append(linea_grafico)
				linea_grafico = []
			else:
				line_iopin.remove(val_iopin)

		c_db.close()
		return line_iopin, linee_grafico

	#elabora il valore row
	@staticmethod
	def calc(op,id,val):
		for i in op:
			if(i[0]==id):
				if(not (i[2] == '' or i[2] == '') ):
					val = val*float(i[2])
				if(not (i[1] == '' or i[1] == '')):
					val = val+float(i[1])

		return val

def makeApp(machine,openlogger):
	global currentMachine,currentOpenlogger
	currentOpenlogger = openlogger
	currentMachine = machine
	return tornado.web.Application([
		(r"/update_graphics",update_graphics),
		(r"/switch_pin",switch_pin),
		(r"/set_time_machine",set_time_machine),
		(r"/get_info_hardware",get_info_hardware_thread),
		(r"/dati_table_misure",dati_table_misure),
		(r"/update_state_conf",update_state_conf),
		(r"/get_row_tab_conf",get_row_tab),
		(r"/get_board",get_board),
		(r"/set_graph",set_graph),
		(r"/get_csv",get_csv),
		(r"/reset_value_table", reset_value_table),
		(r"/reset_tab_config",reset_config),
		(r"/getConf",get_conf),
		(r"/set_conf",set_conf),
		(r"/static/(.*)",tornado.web.StaticFileHandler, {"path":"/home/toshi/openlogger/OpenLogger"}),
		(r'/(.*)', tornado.web.StaticFileHandler, {"path": './pages',"default_filename": "index.html"})
	])

