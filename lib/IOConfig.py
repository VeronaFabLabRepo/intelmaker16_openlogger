class IOConfig:

    def __init__(self,row):
        self.idio = row [0]
        self.pin = row [1]
        self.desc = row [2]
        self.tipo = row [3]
        self.molt = (1, row[4])[isinstance(row[4], float)]
        self.add  = (0, row[5])[isinstance(row[5], float)]
        self.dev  = (0, row[6])[isinstance(row[6], float)]
        self.ciclo = (1, row[7])[isinstance(row[7], float)]
        self.um = row [8]
        self.adr = row [9]
        self.porta_bus = row [10]
        self.code = row [11]
        self.reg = row [12]
        self.enable = row[13]

    def calculateValue(self,originalValue):
        return originalValue * self.molt + self.add;