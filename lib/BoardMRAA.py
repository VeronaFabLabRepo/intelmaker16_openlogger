import Hardware
import mraa
import psutil
import os
import time
#Implementazione dell'hardware Intel Edison
class BoardMRAA(Hardware.Hardware):
	def getInfo(self):
		return "IntelEdison"

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
		return {"size_db":(os.path.getsize('db/openlogger.db')/(1024*1024))} #ritorna in mb

	def getCpuLoad(self):
		return {"cpu":psutil.cpu_percent(interval=None,percpu=False)}

	def getMemLoad(self):
		return {"percent":psutil.virtual_memory().percent}

	def getDiskLoad(self):
		return {"percent":psutil.disk_usage('/').percent}


	def getDigital(self,ioconfig):
		x = mraa.Gpio(int(ioconfig.pin))
		x.dir(mraa.DIR_IN)
		return x.read()  

	def getAnalog(self,ioconfig):
		x = mraa.Aio(int(ioconfig.pin))
		return x.read()
