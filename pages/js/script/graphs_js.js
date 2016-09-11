window.flag = false;
window.cont =0;
$(document).ready(function () {
    //struttura del grafico
    set_leggenda();
    create_graphics();
    setInterval(update_graphics,1000);
    function structure_grafico() {
        $('#container').highcharts('StockChart', {
            chart: {
                zoomType: 'x,y',
            },
            rangeSelector: {

                buttons: [{
                    type: 'day',
                    count: 1,
                    text: '1d'
                }, {
                    type: 'week',
                    count: 1,
                    text: '1w'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                selected: 3
            },

            yAxis: {
                title: {
                    text: 'Um'
                }
            },

            title: {
                text: 'Grafico'
            },
            exporting: {
                enabled: false
            },
            legend: {
                enabled: true,
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            }
        });
    }

    function create_graphics() {
        $.ajax({
            url: '/get_row_tab_conf',
            type: 'GET',
            success: function (jsonResponse) {
                for (var i = 0; i < jsonResponse.num_conf; i++) {
                    $('#graphic_real-time').append('<div id="container_ghaphs_' + i + '" style="min-width: 400px; height: 400px; margin: 0 auto"></div>');
                    //console.log('<div id="container_ghaphs_' + i + '" style="min-width: 400px; height: 400px; margin: 0 auto"></div>');
                    structure_graphics(i,jsonResponse.config[i].descr,jsonResponse.config[i].iopin,jsonResponse.config[i].um);
                }
            }
        });
    }

    function update_graphics() {
        $.ajax({
            url:'/update_graphics',
            type:'GET',
            success:function (jsonResponse) {
                for (var i = 0; i < jsonResponse.num_conf; i++) {
                    var riga = jsonResponse.last_value[i];

                    var chart = $('#container_ghaphs_'+i).highcharts();
                    var shift = window.cont >20*jsonResponse.num_conf;
                    if(window.cont <=20*jsonResponse.num_conf) {
                        window.cont ++;
                    }
                    //console.log(toDate(riga[2])));
                    var date= riga[2].substr(0,10);
                    var time = riga[2].substr(11,8)
                    chart.series[0].addPoint([to_date_utc(date,time,1),riga[3]],true,shift);

                }
            }
        });
    }
    function structure_graphics(i,description,iopin,um) {
        $('#container_ghaphs_' + i).highcharts('StockChart', {
            chart: {
                zoomType: 'x,y'
            },
            rangeSelector: {

                buttons: [{
                    type: 'day',
                    count: 1,
                    text: '1d'
                }, {
                    type: 'week',
                    count: 1,
                    text: '1w'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                selected: 3
            },
            yAxis: {
                title: {
                    text: ''+um
                }
            },
            title: {
                text: 'Grafico Pinout '+iopin+' '+description
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                valueSuffix: ''+um
            },
            legend: {
                enabled: true,
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: ''+description,
                data: []
            }]
        });
    }

    function set_leggenda() {
        $.ajax(
            {
                url: '/get_row_tab_conf',
                type: 'GET',
                success: function (json_response) {
                    var resp = json_response["config"];
                    var leggenda = $('#leggenda').DataTable({
                        "paging": false,
                        "ordering": false,
                        "info": false,
                        "searching": false,
                        "destroy": true
                    });

                    for (var i = 0; i < json_response.num_conf; i++) {
                        leggenda.row.add([
                            resp[i].id,
                            resp[i].iopin,
                            resp[i].descr
                        ]).draw();
                    }
                }
            }
        );
    }

    function only_one_create_graph() {
        if (window.flag == false) {
            document.getElementById('grafico').innerHTML =
                '<div class="col-md-12"><div class="panel panel-primary">' +
                '<div class="panel-body">' +
                '<div id="container" style="min-width: 400px; height: 400px; margin: 0 auto">' +
                '</div></div></div></div>'
            structure_grafico();
            window.flag = true;
        }
    }

    document.getElementById("reload").onclick = function () {
        var data_start = document.getElementById('data_start').value;
        var data_end = document.getElementById('data_end').value;
        var hour_start = document.getElementById('hour_start').value;
        var hour_end = document.getElementById('hour_end').value;
        only_one_create_graph();
        call_data_graph(data_start, data_end, hour_start, hour_end);
    }


    document.getElementById("but_24").onclick = function () {
        var dataOld = new Date();
        var dataNow = new Date();
        dataOld.setDate((dataNow.getDate() - 1));

        format_date(dataOld, dataNow);
    }

    document.getElementById("but_1w").onclick = function () {
        var dataOld = new Date();
        var dataNow = new Date();
        dataOld.setDate((dataNow.getDate() - 7));

        format_date(dataOld, dataNow);
    }

    document.getElementById("but_1m").onclick = function () {
        var dataOld = new Date();
        var dataNow = new Date();
        dataOld.setMonth((dataNow.getMonth() - 1));
        format_date(dataOld, dataNow);
    }

    function format_date(dataOld, dataNow) {

        if ((dataOld.getMonth() + 1) >= 10 && (dataOld.getDate() + 1) >= 10) {
            var data_start = dataOld.getFullYear() + "-" + (dataOld.getMonth() + 1) + "-" + (dataOld.getDate());
        }
        else if ((dataOld.getMonth() + 1) < 10 && (dataOld.getDate()) >= 10) {
            var data_start = dataOld.getFullYear() + "-0" + (dataOld.getMonth() + 1) + "-" + (dataOld.getDate());
        }
        else if ((dataOld.getMonth() + 1) >= 10 && (dataOld.getDate()) < 10) {
            var data_start = dataOld.getFullYear() + "-" + (dataOld.getMonth() + 1) + "-0" + (dataOld.getDate());
        }
        else {
            var data_start = dataOld.getFullYear() + "-0" + (dataOld.getMonth() + 1) + "-0" + (dataOld.getDate());
        }


        if (dataOld.getHours() >= 10 && dataOld.getMinutes() >= 10) {
            var hour_start = dataOld.getHours() + ":" + dataOld.getMinutes();
        }
        else if (dataOld.getHours() < 10 && dataOld.getMinutes() >= 10) {
            var hour_start = "0" + dataOld.getHours() + ":" + dataOld.getMinutes();
        }
        else if (dataOld.getHours() >= 10 && dataOld.getMinutes() < 10) {
            var hour_start = dataOld.getHours() + ":0" + dataOld.getMinutes();
        }
        else {
            var hour_start = "0" + dataOld.getHours() + ":0" + dataOld.getMinutes();
        }


        if ((dataNow.getMonth() + 1) >= 10 && (dataNow.getDate()) >= 10) {
            var data_end = dataNow.getFullYear() + "-" + (dataNow.getMonth() + 1) + "-" + (dataNow.getDate());
        }
        else if ((dataNow.getMonth() + 1) < 10 && (dataNow.getDate()) >= 10) {
            var data_end = dataNow.getFullYear() + "-0" + (dataNow.getMonth() + 1) + "-" + (dataNow.getDate())
        }
        else if ((dataNow.getMonth() + 1) >= 10 && (dataNow.getDate()) <= 10) {
            var data_end = dataNow.getFullYear() + "-" + (dataNow.getMonth() + 1) + "-0" + (dataNow.getDate());
        }
        else {
            var data_end = dataNow.getFullYear() + "-0" + (dataNow.getMonth() + 1) + "-0" + (dataNow.getDate());
        }

        if (dataNow.getHours() >= 10 && dataNow.getMinutes() >= 10) {
            var hour_end = dataNow.getHours() + ":" + dataNow.getMinutes();
        }
        else if (dataNow.getHours() < 10 && dataNow.getMinutes() >= 10) {
            var hour_end = "0" + dataNow.getHours() + ":" + dataNow.getMinutes();
        }
        else if (dataNow.getHours() >= 10 && dataNow.getMinutes() < 10) {
            var hour_end = dataNow.getHours() + ":0" + dataNow.getMinutes();
        }
        else {
            var hour_end = "0" + dataNow.getHours() + ":0" + dataNow.getMinutes();
        }

        document.getElementById("data_start").value = data_start;
        document.getElementById("hour_start").value = hour_start;
        document.getElementById("data_end").value = data_end;
        document.getElementById("hour_end").value = hour_end;
        only_one_create_graph();
        call_data_graph(data_start, data_end, hour_start, hour_end)
    }

    function call_data_graph(data_start, data_end, hour_start, hour_end) {
        $.ajax({
            url: "/set_graph",
            type: 'GET',
            data: {
                "data_start": data_start,
                "data_end": data_end,
                "hour_start": hour_start,
                "hour_end": hour_end
            },
            dataType: "JSON",
            success: function (json_response) {
                popolate_graph(json_response);
            }

        });
    }

    function popolate_graph(json_response) {
        var chart = $("#container").highcharts();

        var name_linee = json_response.iopin;
        var linee = json_response.conf;

        var valori_linee = [];
        for (var i = 0; i < name_linee.length; i++) {
            valori_linee[i] = [];
        }

        var cont_linee = 0;

        //cancella tutte le serie precendentemente create
        while (chart.series.length > 0) {
            chart.series[0].remove(true);
        }

        //crea le nuove serie dai dati ricavati dal json
        name_linee.forEach(function (valore) {
            chart.addSeries({
                name: valore,
                data: valori_linee[cont_linee],
                turboThreshold:10000
            });
            cont_linee++;
        });


        //---------------aggiungere controllo che non ci sono dati da aggiungere---------------------//

        //mi ricavo i dati di ogni riga e poi la aggiungo alla lista di ogni serie
        //che ho già fatto riferimento prima
        var cont = 0;
        linee.forEach(function (righe) {
            righe.forEach(function (riga) {
                data_time = riga[1].split(" ");
                valori_linee[cont].push([to_date_utc(JSON.stringify(data_time[0]), JSON.stringify(data_time[1]),0), parseFloat(riga[2])]);
            });
            cont++;
        });
        cont = 0;


        //aggiorno tutti i valori di ogni serie
        for (var i = 0; i < cont_linee; i++) {
            chart.series[i].update({data: valori_linee[i]}, true);
        }
        cont_linee = 0;
    }
    //serve per impostare la data in modo giusto da visualizzare
    function to_date_utc(date, time,flag) {
        var b = date.split(/\D+/);

        var c = time.split(/\D+/);
        //il --b[2] serve perche il calendario viene considerato da 00 e non da 01
        if(flag){
            var date = Date.UTC(b[0], --b[1], b[2], c[0], c[1], c[2]);
        }
        else{
            var date = Date.UTC(b[1], --b[2], b[3], c[1], c[2], c[3]);
        }
        return date;
    }

});