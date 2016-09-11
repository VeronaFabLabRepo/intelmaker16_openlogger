from abc import ABCMeta, abstractmethod
from enum import Enum

#Classe astratta, rappresentauna generica scheda hardware
class Hardware(object):
	__metaclass__ = ABCMeta

	@abstractmethod
	def getInfo(self):
		pass

	@abstractmethod
	def getData(self):
		return

	@abstractmethod
	def setData(self,data):
		pass

	@abstractmethod
	def getSizeDb(self):
		pass

	@abstractmethod
	def getCpuLoad(self):
		pass

	@abstractmethod
	def getMemLoad(self):
		pass

	@abstractmethod
	def getDiskLoad(self):
		pass

	@abstractmethod
	def getDigital(self,ioconfig):
		pass
		
	@abstractmethod
	def getAnalog(self,ioconfig):
		pass



#Espone i tipi di schede supportate
class Machine(Enum):
	Arietta=1
	BoardMRAA=2
	IntelEdison=3
	X86Test=4
	
# Ritorna la macchina a seconda del tipo
def GetHardware(machine):
	if machine==Machine.Arietta:
		from Arietta import Arietta
		return Arietta()
	if machine==Machine.IntelEdison:
		from IntelEdison import IntelEdison
		return IntelEdison()
	if machine==Machine.BoardMRAA:
		from BoardMRAA import BoardMRAA
		return BoardMRAA()
	if machine==Machine.X86Test:
		from X86Test import X86Test
		return X86Test()

# Ritorna la macchina da una stringa
def GetMachine(m):
	if m == "X86Test":
		return GetHardware(Machine.X86Test)
	elif m == "Arietta":
		return GetHardware(Machine.Arietta)
	elif m == "IntelEdison":
		return GetHardware(Machine.IntelEdison)
	elif m == "BoardMRAA":
		return GetHardware(Machine.BoardMRAA)
	else:
		#TODO
		return None 


			
			
