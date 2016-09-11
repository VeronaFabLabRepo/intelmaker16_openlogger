import Hardware
import random
import psutil
import os
import time

# Implementazione di una hardware generico per test 
class X86Test(Hardware.Hardware):
	def getInfo(self):
		return "X86Test"

	def getData(self):
		return {
			"date":time.strftime("%x"),
			"time":time.strftime("%X")
		}

	def setData(self,data):
		# data = "2016/08/2 21:45:00"
		os.system("date +%T -s " + ('"'+str(data)+'"'))
		os.system("hwclock -w")

	def getSizeDb(self):
		return {"size_db":(os.path.getsize('db/openlogger.db')/(1024*1024))}

	def getCpuLoad(self):
		return {"cpu":psutil.cpu_percent(interval=None,percpu=False)}

	def getMemLoad(self):
		return {"percent":psutil.virtual_memory().percent}

	def getDiskLoad(self):
		return {"percent":psutil.disk_usage('/').percent}

	def getDigital(self,pin):
		return random.getrandbits(1)

	def getAnalog(self,pin):
		return random.random()


