var valore_json;
window.flag = false;
$(document).ready(function () {
    $('#dati_raw').bootstrapSwitch();
    $('#filtro_sw').bootstrapSwitch();

    $('#filtro_sw').on('switchChange.bootstrapSwitch',function(event,state){
        if(state == true && window.flag == false){
            create_switch_pin();
            window.flag=true;
        }
        else if(window.flag ==true){
            if(state == true){
                document.getElementById("container_pin").style.display = 'block';
            }
            else{
                document.getElementById("container_pin").style.display = 'none';
            }
        }
    });

    function create_switch_pin(){
        $.ajax({
            url:'switch_pin',
            type: 'GET',
            success:function (json_response) {
                num_pin = json_response['num_pin'];
                window.num_pin=num_pin;
                for(var i = 1;i <= num_pin;i++){
                    $('#container_pin').append('<div class="col-md-3"><label>Pin '+i+'</label><input type="checkbox" id="sw_pin_'+i+'"></div>');
                    $('#sw_pin_'+i).bootstrapSwitch();
                }

            }

        });
    }

    document.getElementById("reset").onclick = function () {
        bootbox.confirm({
            title: "ATTENZIONE!",
            size:"small",
            message: "Sicuro di eliminare tutti i dati della tabella?",
            callback: function (result) {
                if (result) {
                    $.ajax({
                        url: '/reset_value_table',
                        type: 'GET'
                    });
                }
            }
        });
    }

    document.getElementById("csv").onclick = function () {
        var data_start = document.getElementById("data_start").value;
        var hour_start = document.getElementById("hour_start").value;
        var data_end = document.getElementById("data_end").value;
        var hour_end = document.getElementById("hour_end").value;

        $.ajax({
            url: "get_csv",
            type: 'GET',
            data: {
                "data_start": data_start,
                "hour_start": hour_start,
                "data_end": data_end,
                "hour_end": hour_end
            },
            success: function (json) {
                window.location.href = "../static/CSV.csv"
            }
        });
    }

    document.getElementById("db").onclick = function () {
        window.location.href = "../static/db/openlogger.db"
    }
    
    document.getElementById("but_24").onclick = function(){
        var dataOld = new Date();
        var dataNow = new Date();
        dataOld.setDate((dataNow.getDate()-1));

        format_date(dataOld,dataNow);

    }

    document.getElementById("but_1w").onclick = function(){
        var dataOld = new Date();
        var dataNow = new Date();
        dataOld.setDate((dataNow.getDate()-7));

        format_date(dataOld,dataNow);
    }

    document.getElementById("but_1m").onclick = function(){
        var dataOld = new Date();
        var dataNow = new Date();
        dataOld.setMonth((dataNow.getMonth()-1));

        format_date(dataOld,dataNow);

    }
    function format_date(dataOld,dataNow){
        if((dataOld.getMonth()+1)>=10 && (dataOld.getDate())>=10) {
            var data_start = dataOld.getFullYear() + "-" + (dataOld.getMonth() + 1) + "-" +(dataOld.getDate());
        }
        else if((dataOld.getMonth()+1)<10 && (dataOld.getDate())>=10){
            var data_start = dataOld.getFullYear() + "-0" + (dataOld.getMonth() + 1) + "-" + (dataOld.getDate());
        }
        else if((dataOld.getMonth()+1)>=10 && (dataOld.getDate())<10){
            var data_start = dataOld.getFullYear() + "-" + (dataOld.getMonth() + 1) + "-0" + (dataOld.getDate());
        }
        else{
            var data_start = dataOld.getFullYear() + "-0" + (dataOld.getMonth() + 1) + "-0" + (dataOld.getDate());
        }


        if(dataOld.getHours()>=10 && dataOld.getMinutes()>=10) {
            var hour_start = dataOld.getHours()+":"+dataOld.getMinutes();
        }
        else if(dataOld.getHours()<10 && dataOld.getMinutes()>=10){
            var hour_start = "0"+dataOld.getHours()+":"+dataOld.getMinutes();
        }
        else if(dataOld.getHours()>=10 && dataOld.getMinutes()<10){
            var hour_start = dataOld.getHours()+":0"+dataOld.getMinutes();
        }
        else{
            var hour_start = "0"+dataOld.getHours()+":0"+dataOld.getMinutes();
        }


        if((dataNow.getMonth()+1)>=10 && (dataNow.getDate())>=10) {
            var data_end = dataNow.getFullYear() + "-" + (dataNow.getMonth() + 1) + "-" + (dataNow.getDate());
        }
        else if((dataNow.getMonth()+1)<10 && (dataNow.getDate())>=10){
            var data_end = dataNow.getFullYear() + "-0" + (dataNow.getMonth() + 1) + "-" + (dataNow.getDate())
        }
        else if((dataNow.getMonth()+1)>=10 && (dataNow.getDate())<=10){
            var data_end = dataNow.getFullYear() + "-" + (dataNow.getMonth() + 1) + "-0" + (dataNow.getDate());
        }
        else{
            var data_end = dataNow.getFullYear() + "-0" + (dataNow.getMonth() + 1) + "-0" + (dataNow.getDate());
        }

        if(dataNow.getHours()>=10 && dataNow.getMinutes()>=10) {
            var hour_end = dataNow.getHours()+":"+dataNow.getMinutes();
        }
        else if(dataNow.getHours()<10 && dataNow.getMinutes()>=10){
            var hour_end = "0"+dataNow.getHours()+":"+dataNow.getMinutes();
        }
        else if(dataNow.getHours()>=10 && dataNow.getMinutes()<10){
            var hour_end = dataNow.getHours()+":0"+dataNow.getMinutes();
        }
        else{
            var hour_end = "0"+dataNow.getHours()+":0"+dataNow.getMinutes();
        }

        document.getElementById("data_start").value = data_start;
        document.getElementById("hour_start").value = hour_start;
        document.getElementById("data_end").value = data_end;
        document.getElementById("hour_end").value = hour_end;

        impost_query(data_start,hour_start,data_end,hour_end);

    }

    document.getElementById("reload").onclick = function () {
        var data_start = document.getElementById("data_start").value;
        var hour_start = document.getElementById("hour_start").value;
        var data_end = document.getElementById("data_end").value;
        var hour_end = document.getElementById("hour_end").value;

        impost_query(data_start,hour_start,data_end,hour_end);
    }

    function impost_query(data_start,hour_start,data_end,hour_end){
        query = "select idio,t_timestamp,valore from misure where t_timestamp>=\"" + data_start + " " + hour_start + "\" and t_timestamp<= \"" + data_end + " " + hour_end + "\"";
        set_query(query)
    }

    function set_query(query){
        //var query="select idio,t_timestamp,valore from misure where t_timestamp>=\"" + data_start + " " + hour_start + "\" and t_timestamp<= \"" + data_end + " " + hour_end + "\""  ;
        var part_query="0";

        if($('#filtro_sw').bootstrapSwitch('state') == true) {
            console.log(window.num_pin);
            for (var i = 1; i < window.num_pin; i++) {
                if ($('#sw_pin_' + i).bootstrapSwitch('state') == true) {
                    part_query+=(","+i);
                }
            }
            query+=(" and idio in ("+part_query+")");
        }
        else {
            //query = "select idio,t_timestamp,valore from misure where t_timestamp>=\"" + data_start + " " + hour_start + "\" and t_timestamp<= \"" + data_end + " " + hour_end + "\"";
        }
        
        call_combo(query);
    }
    function call_combo(query) {
        $.ajax({
            url:"/dati_table_misure",
            type:'GET',
            data:{
                "elaborazione_raw":$('#dati_raw').bootstrapSwitch('state'),
                "query":query
            },
            success: function (jsonResponse) {
                var valore = jsonResponse;
                //libreria scarica da quà https://datatables.net/examples/styling/bootstrap.html
                $("#table").DataTable({
                    "destroy":true,
                    "data": valore["misure"],
                    "columns": [
                        {"data": "idio"},
                        {"data": "t_time"},
                        {"data": "valore"}
                    ]
                });
                console.log("ready!");
            }
        });
    }
});