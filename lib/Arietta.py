import Hardware
from ablib import Pin
import smbus
from pymodbus.client.sync import ModbusTcpClient
#from pymodbus.transaction import ModbusRtuFramer

#Implementazione dell'hardware Arietta
class Arietta(Hardware.Hardware):
	def getInfo(self):
		return "Arietta"

	def setData(self,data):
		# data = "2016/08/2 21:45:00"
		os.system("date +%T -s " + ('"'+str(data)+'"'))
		os.system("hwclock -w")


	def getDigital(self):
		return 12
		
	def getAnalog(self,iopin):
		fd = open(iopin,"r")
		sample = int(fd.read())
		fd.close()
		return sample





