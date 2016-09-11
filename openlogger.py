#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
OpenLogger - 2016 - Verona Fablab LinuxGroup Team
Author: Andrea Zambon - zamby.ing @ gmail.com 
Author: Federico Ciresola
Author: Angelo Camesasca
License: CC BY-NC-SA
'''

import os
import sys
from lib import Hardware
from lib import SqliteConnection as sqlc
from lib import IOConfig
import datetime
import time
import thread
import Queue
import sqlite3
import argparse
import tornado.ioloop
from tornado import web
from lib import webserver as ws
import threading
import signal
import copy as cp
#from daemon import runner


# WebServer
class webserver(threading.Thread):
    def __init__(self, machine, openlogger):
        threading.Thread.__init__(self)
        self.daemon = True
        self.machine = machine
        self.openlogger = openlogger

    def run(self):
        self.startWebServer()

    def startWebServer(self):
        self.app = ws.makeApp(self.machine, self.openlogger)
        self.app.listen(80)
        tornado.ioloop.IOLoop.current().start()

    def stop(self):
        tornado.ioloop.IOLoop.current().stop()

# Writer in Sqlite
class start_write(threading.Thread):

    def __init__(self,queue):
        threading.Thread.__init__(self)
        self.daemon = True
        self.q = queue
        self.work = True

    def run(self):
        self.sqliteWriter()

    def sqliteWriter(self):
        while(self.work):
            print "Read from Queue"
            c_db = sqlc.connessione_DB()
            query = self.get_all_queue_result()
            print len(query)
            c_db.exeinsertlist(query)
            c_db.close()
            #self.q.task_done()
            time.sleep(5)

    def stop(self):
        self.work = False

    # Return all queue value
    def get_all_queue_result(self):
            result_list = []
            while not self.q.empty():
                result_list.append(self.q.get())
            return result_list

# Read from pin analog
class analog_read(threading.Thread):
    def __init__(self,ioconfig,queue,machine):
        threading.Thread.__init__(self)
        self.daemon = True
        self.ioconfig = ioconfig
        self.q = queue
        self.machine = machine
        self.running = True

    def run(self):
        while(self.running):
            self.analogRead()
            time.sleep(self.ioconfig.ciclo/1000.0)

    def analogRead(self):        
        value = self.machine.getAnalog(self.ioconfig)
        #valueFinal = self.ioconfig.calculateValue(value)
        self.q.put("insert into misure(valore,idio,t_timestamp) VALUES ("+str(value)+","+str(self.ioconfig.idio)+",\""+ str(datetime.datetime.now()) +"\")")



# Read from digital pin
class digital_read(threading.Thread):

    def __init__(self,ioconfig,queue,machine):
        threading.Thread.__init__(self)
        self.daemon = True
        self.ioconfig = ioconfig
        self.q = queue
        self.machine = machine
        self.running = True

    def run(self):
        while(self.running):
            self.digitalRead()
            time.sleep(self.ioconfig.ciclo/1000.0)

    def digitalRead(self):        
        value = self.machine.getDigital(self.ioconfig)
        #valueFinal = self.ioconfig.calculateValue(value)
        self.q.put("insert into misure(valore,idio,t_timestamp) VALUES ("+str(value)+","+str(self.ioconfig.idio)+",\""+ str(datetime.datetime.now()) +"\")")

class OpenLogger():
    def __init__(self):
        # Buffer value for writer task
        self.q = Queue.Queue()
        # Thread Web Server
        self.wb = None
        # Thread Sqlite Writer
        self.sr = None
        # Pool of Thread for readers
        self.pool = {}
        # Board definition
        self.machine = None
        self.argsmachine = None
        self.daemon = False

    def start(self):

        # Get type machine from args, using abstract class
        self.machine = Hardware.GetMachine(self.argsmachine)
        print self.machine.getInfo()

        # Load all thread for value readers
        self.LoadAllThread()


        # Start web server
        self.wb = webserver(self.machine,self)
        self.wb.start()

        # start thread writer into sqlite
        self.sr = start_write(self.q)
        self.sr.start()

        # No exit in daemon mode
        if (self.daemon == "True"):
            self.sr.join()


    def LoadAllThread(self):
        for idio,th in self.pool.items():
            th.running = False
            self.pool.clear()

        # Load configuration from table ioconfig
        c_db = sqlc.connessione_DB()
        rows = c_db.exe('SELECT * FROM ioconfig')
        c_db.close()
        
        # For each config pin start the thread correct
        for row in rows:
			ioconfig = IOConfig.IOConfig(row)
			if ioconfig.enable == 1 or ioconfig.enable == "TRUE":
				print "Init thread... " + str(ioconfig.idio)
				self.CreateThread(ioconfig)

        '''
        for idio,th in self.pool.items():
            th.running = True
            th.start()
        '''

    def KillThread(self,idio):
        if self.pool.get(int(idio)) is not None:
            print ("Thread killed")
            self.pool[int(idio)].running = False
            self.pool.pop(int(idio))


    def SetStatusThread(self,idio):
        self.KillThread(idio[0])
        c_db = sqlc.connessione_DB()
        rows = c_db.exe('SELECT * FROM ioconfig WHERE id=' + str(idio[0]))
        c_db.close()
        ioconfig = IOConfig.IOConfig(rows[0])
        if ioconfig.enable == 1 or ioconfig.enable == "TRUE":
            print("New thread")
            self.CreateThread(ioconfig)

    def CreateThread(self,ioconfig):
        if ioconfig.tipo == "A":
            thread_a = analog_read(ioconfig,self.q,self.machine)
            thread_a.start()
            self.pool[ioconfig.idio] = thread_a
        elif ioconfig.tipo == "D":
            thread_d = digital_read(ioconfig,self.q,self.machine)
            thread_d.start()
            self.pool[ioconfig.idio] = thread_d
        elif ioconfig.tipo == 'i2c':
            # TODO
            #bus = smbus.SMBus(porta_bus) # 0 = /dev/i2c-0 (port I2C0), 1 = /dev/i2c-1 
                            #(port I2C1)
            #adr = int(adr, 16)
            #reg = int(reg, 16)
            #thread.start_new_thread ( i2cRead, (adr,id,ciclo,porta_bus,code,reg) )
            pass
        elif ioconfig.tipo == 'modbusTCP':
            # TODO
            #thread.start_new_thread ( modbusTCP, (adr,id,ciclo,porta_bus,reg) ) 
                    #di defautl la porta TCPmodbus e' 502
            pass
        else:
            print "Error on type sensor"




#------------------------------------ Main


pid = str(os.getpid())
pidfile = "/var/run/openlogger.pid"

# Lettura parametri da console
parser = argparse.ArgumentParser()
parser.add_argument("--machine", help="Arietta, BoardMRAA (Rasberry,Banana,Intel,Beagle,etc..), IntelEdison, X86Test", default="X86Test")
parser.add_argument("--daemonize", help="Run daemon", default="False")
args = parser.parse_args()

if os.path.isfile(pidfile):
    print "%s already exists, exiting" % pidfile
    sys.exit()
file(pidfile, 'w').write(pid)

if (args.daemonize == "False"):
    print "Start Console"
    try:
        openlogger = OpenLogger()
        openlogger.argsmachine = args.machine
        openlogger.start()
        user_input = input()
    except KeyboardInterrupt:
        print "End Openlogger"
        if os.path.exists(pidfile):
            os.remove(pidfile)
        sys.exit(0)

elif (args.daemonize == "True"):
    print "Start Daemon"
    openlogger = OpenLogger()
    openlogger.argsmachine = args.machine
    openlogger.daemon = "True"
    openlogger.start()

