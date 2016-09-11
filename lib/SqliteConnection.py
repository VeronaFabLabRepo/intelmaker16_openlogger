import sqlite3
import threading

DBNAME = './db/openlogger.db'
#classe per la comunicazione con il database

class connessione_DB_old():

	def __init__(self,dbname=DBNAME):
		global connection,cursor
		connection = sqlite3.connect(dbname)
		cursor = connection.cursor()

	def exe(self,stringa):
		cursor.execute(stringa)
		dati = cursor.fetchall()
		return dati

	def close(self):
		connection.commit()
		connection.close()


def synchronized_method(method):
    
    outer_lock = threading.Lock()
    lock_name = "__"+method.__name__+"_lock"+"__"
    
    def sync_method(self, *args, **kws):
        with outer_lock:
            if not hasattr(self, lock_name): setattr(self, lock_name, threading.Lock())
            lock = getattr(self, lock_name)
            with lock:
                return method(self, *args, **kws)  

    return sync_method


class connessione_DB():

	def __init__(self,dbname=DBNAME):
		self.connstring= dbname

	@synchronized_method
	def exe(self,stringa):
		connection = sqlite3.connect(self.connstring)
		cursor = connection.cursor()
		cursor.execute(stringa)
		dati = cursor.fetchall()
		connection.commit()
		connection.close()
		return dati
		
	@synchronized_method
	def exeinsertlist(self,list):
		connection = sqlite3.connect(self.connstring)
		cursor = connection.cursor()
		for qs in list:
			cursor.execute(qs)
		connection.commit()
		connection.close()
	
	def close(self):
		pass
