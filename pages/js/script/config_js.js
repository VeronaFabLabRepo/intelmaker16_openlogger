var currentTab;
// solo se viene cambiato il nome della tab come reference. La lunghezza copre tutto il nome con il primo numero
var LUNGH_NAME_TAB = 4; //parlare con zambo
var num_tab;
var nameTabCurrent;

var lung = 0;

var iopin = [];
var text = [];
var molt = [];
var addit = [];
var deviat = [];
var ciclo = [];
var um = [];
var andress = [];
var bus = [];
var reg = [];
var tipo = [];
var code = [];

var tab_canc = [];

$(document).ready(function () {
    //inizio
    start_page();

    $("#tabs").click(function (events) {
        events.preventDefault();
        $(this).tab('show');
        window.currentTab = events.target;
        window.num_tab = String($(currentTab).attr("href")).substring(LUNGH_NAME_TAB);

    });

    //capire meglio come funziona e sentire il zambo se va bene
    //http://jsfiddle.net/vinodlouis/pb6EM/1/
    //evento che cancella le tabelle
        $('#tabs').on('click', '#del', function () {
            var  object = this;
            bootbox.confirm({
                title: "WARNING!",
                size: 'small',
                message: "Sure to delete this configuration?",
                callback: function (result) {
                    if (result) {
                        window.tab_canc.push(String($(object).parent().attr("href")).substring(LUNGH_NAME_TAB));
                        var tabContentId = $(object).parent().attr("href");
                        $(object).parent().parent().remove(); //remove li of tab
                        $(tabContentId).remove(); //remove respective tab content
                        get_dati(false);
                        send_conf();
                        get_row_tab();
                    }
                }
            });
        });


    //evento che salva tutte le configurazioni
    $('#tabs').on('click', '#save_tab', function () {
        setTimeout(function () {
            get_dati();
            send_conf();
            //location.reload();
            alert("saved configuration");
            get_row_tab();
        }, 250); //controllare se va bene il tempo messo
    });

    document.select = function (value) {
        var selectOption = value;
        var val_ref = String($(window.currentTab).attr("href"));
        var num = val_ref.substring(4);
        if (selectOption == "i2c") {
            var textarea_display = document.getElementById('code_' + num).style.visibility;
            if (textarea_display == "hidden") {
                document.getElementById('l_' + num).style.visibility = "visible";
                document.getElementById('code_' + num).style.visibility = "visible";
            }
        }
        else {
            document.getElementById('l_' + num).style.visibility = "hidden";
            document.getElementById('code_' + num).style.visibility = "hidden";
        }
    }

    function start_page() {
        //popolazione tabella di config
        get_row_tab();
        //popolazione configurazioni
        get_dati_start();
        //setta l'immagine della board
        set_board();

    }


    //funzione che popola la tabella di configurazione
    function get_row_tab(){
        $.ajax({
            url: '/get_row_tab_conf',
            type:'GET',
            success: function(json_response){
                $("#table_conf").DataTable({
                    "paging":   false,
                    "ordering": false,
                    "info":     false,
                    "searching": false,
                    "destroy": true,
                    "data": json_response["config"],
                    "columns": [
                        {"data": "iopin"},
                        {"data": "descr"},
                        {"data": "tipo"},
                        {"data": "molt"},
                        {"data": "addit"},
                        {"data": "ciclo"},
                        {"data": "um"},
                        {"data": "adr"},
                        {"data": "porta_bus"},
                        {"data": "reg"},
                        {"data": "enable"},
                    ]
                });
            }
        });
    }
    
    //funzione che ricava dati dal webserver per inizializzare le tab della pagina di configurazione
    function get_dati_start() {
        $.ajax({
            url: '/getConf',
            type: 'GET',
            success: function (json_response) {
                set_conf_start(json_response);
            }
        });

    }
    /***
     * Arietta=1
     * Raspberry3=2
     * IntelEdison=3
     * X86Test=4
    ***/
    function set_board() {
        $.ajax({
            url:'/get_board',
            type: 'GET',
            success: function (json_response) {
                board = json_response.board;
                console.log(board);
                switch(board) {
                    case "Arietta":
                        board_image="Arietta_pinout"
                        break;
                    case "Raspberry3":
                        board_image="Rasp_2_B_pinout"
                        break;
                    case "IntelEdison":
                        board_image="IntelEdison_pinout"
                        break;
                    case "X86Test":
                        board_image="X86Test_pinout"
                        break;
                }
                console.log(board_image);
                document.getElementById("img_board").src = ("image/"+board_image+".png");

            }
        });
    }

    //passo un valore di tipo json e popolo le tabelle con i loro valori presi dal database
    function set_conf_start(resp_json) {
        //setto le tabelle all'inizio
        for (var i = 0; i < resp_json.num_tab; i++) {
            new_tab();
            document.getElementById('iopin_' + (i + 1)).value = resp_json.iopin[i];
            document.getElementById('descrizione_' + (i + 1)).value = resp_json.descrizione[i];
            document.getElementById('moltiplicatore_' + (i + 1)).value = resp_json.moltiplicatore[i];
            document.getElementById('aditore_' + (i + 1)).value = resp_json.aditore[i];
            document.getElementById('deviatore_' + (i + 1)).value = resp_json.deviatore[i];
            document.getElementById('ciclo_' + (i + 1)).value = resp_json.ciclo[i];
            document.getElementById('um_' + (i + 1)).value = resp_json.um[i];
            document.getElementById('address_' + (i + 1)).value = resp_json.adr[i];
            document.getElementById('porta_bus_' + (i + 1)).value = resp_json.porta_bus[i];
            document.getElementById('reg_' + (i + 1)).value = resp_json.registro[i];
            document.getElementById('el_' + (i + 1)).value = resp_json.tipo[i];
            if (resp_json.tipo[i] == 'i2c') {
                document.getElementById('l_' + (i + 1)).style.visibility = "visible";
                document.getElementById('code_' + (i + 1)).style.visibility = "visible";
                document.getElementById('code_' + (i + 1)).value = resp_json.code[i];
            }
            document.getElementById('a_tab_' + (i + 1)).innerHTML = ' <button id="del" class="close closeTab" type="button" ><img src="/image/icon_delete.png" class="img-responsive" ></button> <button id="save_tab" class="close closeTab" type="button" ><img src="/image/icon_save.png" class="img-responsive" ></button>' + resp_json.descrizione[i];
        }

    }

    //funzione che mi permette di creare una nuova tabella
    function new_tab() {
        var nextTab = $('#tabs li').size() + 1;
        window.num_tab = nextTab;
        // create the tab
        $('<li><a id="a_tab_' + nextTab + '" href="#tab' + nextTab + '" role="tab" data-toggle="tab"><button class="close closeTab" type="button" ><img src="/image/icon_delete.png" class="img-responsive"></button> <button id="save_tab" class="close closeTab" type="button" ><img src="/image/icon_save.png" class="img-responsive" ></button>Tab ' + nextTab + '</a></li>').appendTo('#tabs');
        //crea il contenuto
        $('<div role="tabpanel" class="tab-pane" id="tab' + nextTab + '">'
            + '<table class="table  table-bordered">'
            + '<tr><td><p>IOpin</p></td><td><input type="text" id="iopin_' + nextTab + '" style="width:100%" ></td></tr>'
            + '<tr><td><p>Description</p></td><td><input type="text" id="descrizione_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>Multiplier</p></td><td><input type="text" id="moltiplicatore_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>Sum</p></td><td><input type="text" id="aditore_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>Deviator</p></td><td><input type="text" id="deviatore_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>Cycle</p></td><td><input type="number" min="1" value="1" id="ciclo_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>UM</p></td><td><input type="text" id="um_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>Address </p></td><td><input type="text" id="address_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>Bus port</p></td><td><input type="text" id="porta_bus_' + nextTab + '" style="width:100%"></td></tr>'
            + '<tr><td><p>Register</p></td><td><input type="text" id="reg_' + nextTab + '" style="width:100%"></td></tr>'
            + '</table>'
            + '<select class="form-control" id="el_' + nextTab + '" onchange="select(this.value)">'
            + '<option selected="selected">Select...</option>'
            + '<option value="A">Analog</option>'
            + '<option value="D">Digital</option>'
            + '<option value="i2c">i2c</option>'
            + '<option value="spi">spi</option>'
            + '<option value="1wire">1wire</option>'
            + '<option value="modBus">modBusEthernet</option>'
            + '</select>'
            + '<label id="l_' + nextTab + '">code</label><div><textarea id="code_' + nextTab + '"  class="form-control" rows="20"></textarea></div>'
            + '</div>').appendTo('.tab-content');

        document.getElementById('l_' + nextTab + '').style.visibility = "hidden";
        document.getElementById('code_' + nextTab + '').style.visibility = "hidden";

    }

    //ricavo i dati dalle varie tabelle e memorizzate nei corrispettivi array
    function get_dati(flag) {
        var lung_realy = $('#tabs li').size() + window.tab_canc.length;
        console.log($("#tabs li").size());
        var cont = 0;
        var i = 1;
        for (i = 1; i <= lung_realy; i++) {
                dati(i);
        }

        //se una tabella viene cancella viene passato il suo valore numerico
        //che la identifica e viene ignorata quando vengono tirati su i dati
        //invece se nessuna tabella viene cancella allora si passa 0 che non identifica
        //nessuna tabella
        function dati(i) {
            if (control_value(i)) {
                iopin[cont] = document.getElementById('iopin_' + i).value;
                text[cont] = document.getElementById('descrizione_' + i).value;
                molt[cont] = document.getElementById('moltiplicatore_' + i).value;
                addit[cont] = document.getElementById('aditore_' + i).value;
                deviat[cont] = document.getElementById('deviatore_' + i).value;
                ciclo[cont] = document.getElementById('ciclo_' + i).value;
                um[cont] = document.getElementById('um_' + i).value;
                andress[cont] = document.getElementById('address_' + i).value;
                bus[cont] = document.getElementById('porta_bus_' + i).value;
                reg[cont] = document.getElementById('reg_' + i).value;
                tipo[cont] = document.getElementById('el_' + i).value;
                code[cont] = document.getElementById('code_' + i).value;
                cont++;
            }
        }

        //controllo che la tabella che sto per salvare non sia una di quelle da cancellare
        function control_value(val) {

            var flag = false;
            var cont_flag = 0;
            if(val != -1) {
                window.tab_canc.forEach(function (canc) {
                    if (val != canc) {
                        cont_flag += 1;
                    }
                });

                if (cont_flag == window.tab_canc.length) {
                    flag = true;
                }
                else {
                    flag = false;
                }
                cont_flag = 0;
            }
            return flag;
        }
        if(flag==true){
            window.tab_canc = [];
        }
        cont = 0;
    }


    //invio i dati al webserer che ho ricavato dalle tabelle
    function send_conf() {
        $.ajax({
            url: '/set_conf',
            type: 'GET',
            data: {
                'num_tab': JSON.stringify((lung = $('#tabs li').size())),
                'iopin': JSON.stringify(iopin),
                'text': JSON.stringify(text),
                'molt': JSON.stringify(molt),
                'addit': JSON.stringify(addit),
                'deviat': JSON.stringify(deviat),
                'ciclo': JSON.stringify(ciclo),
                'um': JSON.stringify(um),
                'address': JSON.stringify(andress),
                'bus': JSON.stringify(bus),
                'reg': JSON.stringify(reg),
                'tipo': JSON.stringify(tipo),
                'code': JSON.stringify(code)
            },
            dataType: "JSON"
        });
    }

    function reset_value_tab() {
        $.ajax(
            {
                url: '/reset_tab_config',
                type: 'GET'
            }
        );
    }

    //quando premo il tasto reset
    //chiamo le funzioni per inviare una chiamata ajax verso il webserver
    document.getElementById("reset").onclick = function () {
        var ret = bootbox.confirm("Sicuro di eliminare tutte le configurazioni?", function (result) {
            reset_value_tab();
            location.reload();
        });
    }

    //quando premo il tasto invio 
    //chiamo le funzioni per ricavare i dati e inviarli al webserver
    $("#load").click(function () {
        setTimeout(function () {
            get_dati();
            send_conf(true);
            location.reload();
        }, 250); //controllare se va bene il tempo messo
    });

    document.getElementById("add").onclick = function () {
        new_tab();
    }
});


