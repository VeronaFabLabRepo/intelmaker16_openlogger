# OpenLogger #

OpenLogger is a service made of python, read and save the values coming from several sensors at regular times.
OpenLogger has a web interface, you configure the sensors connected to the board with your browser, very fast and easy, no line of code is required.
OpenLogger can view the measures realtime and create reports, charts, statistics and export the database for future processing.

## Hardware ##

OpenLogger can support different embedded linux boards.

* Raspberry Pi
* Banana Pi/Pro
* Beaglebone Black
* Arietta
* Galileo
* Intel Edison

## Deploy ##

For IntelEdison see [OpenLogger with IntelEdison](http://www.instructables.com)

```bash
$ git clone https://github.com/VeronaFabLabRepo/intelmaker16_openlogger

$ pip install enum

$ pip install tornado

$ pip install psutil

$ python openlogger.py  --help
usage: openlogger.py [-h] [--machine MACHINE] [--daemonize DAEMONIZE]

optional arguments:
  -h, --help            show this help message and exit
  --machine MACHINE     Arietta, BoardMRAA(Rasberry,Banana,Intel,Beagle,etc..), IntelEdison, X86Test
  --daemonize DAEMONIZE
                        Run daemon

```

## License ##
Read License Folder

## Contact ##

[Associazione Verona FabLab](http://www.veronafablab.it)