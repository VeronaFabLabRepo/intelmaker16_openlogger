window.status_popover_time=false;
window.check_value = 0;
$(document).ready(function(){
    $("#set_time_b").popover({
        html:true,
        content: '<input id="set_time_i" type="datetime-local" class="form-control" value="2016-09-08T12:18:58.001">' +
                    '<br><button id="conf_time" type="button" class="btn btn-primary btn-sm">SET</button>',
        template:  '<div class="popover" role="tooltip" style="width: 250px;">' +
                    '<div class="arrow"></div><h3 class="popover-title"></h3>' +
                    '<div class="popover-content"></div></div>'
    }).parent().delegate('button#conf_time', 'click', function() {
        var datetime = document.getElementById("set_time_i").value;
        var date = datetime.substring(0,10);
        var time = datetime.substring(11,19);
        datetime = date.substring(0,4)+'/'+date.substring(5,7)+'/'+date.substring(8,10)+ " "+time;
        console.log(datetime);
        $.ajax({
            'url':'set_time_machine',
            'type':'GET',
            'data':{
                "datetime":datetime
            }
        });
        $("#set_time_b").popover('hide');//quando si clicca il bottone set si chiude il popover
    });

    $("#set_time_b").on('show.bs.popover',function(){
        window.status_popover_time=true;
    }).on('hide.bs.popover',function(){
        window.status_popover_time=false;
        window.check_value=0;
    });

    get_row_tab();

    setInterval(set_bar,1000);

    function set_bar(){
        $.ajax({
            'url':'/get_info_hardware',
            'type':'GET',
            success:function(json_response) {
                $("#bar_cpu").css('width',json_response["cpu"].cpu+'%');
                $("#bar_cpu").html("CPU:"+json_response["cpu"].cpu+'%');
                $("#bar_ram").css('width',json_response["ram"].percent+'%');
                $("#bar_ram").html("RAM:"+json_response["ram"].percent+'%');
                $("#bar_db").css('width',json_response["size_db"].size_db+'%');
                $("#bar_db").html("Size DB:"+json_response["size_db"].size_db+"MB");
                $("#bar_disk").css('width',json_response["disk"].percent+'%');
                $("#bar_disk").html("Disk:"+json_response["disk"].percent+'%');
                $("#data_ora_now").html(""+json_response["datetime"].date+" "+json_response["datetime"].time);
                if(window.status_popover_time != true || window.check_value == 0) {
                    if(window.status_popover_time==true) {
                        window.check_value = 1;
                    }
                    $("#set_time_b").popover().parent().find("#set_time_i").val("" + format_date() + "T" + json_response["datetime"].time + ".001");
                }
                var table = $("#table").DataTable();
                valori = json_response["valori_thread"]
                for(var i =0; i<valori.length;i++){
                    row = valori[i]
                    table.cell(i,3, { order: 'original' }).data(row[2]);
                    table.cell(i,4, { order: 'original' }).data(row[3]);
                }
            }
        });

    }

    function format_date(){
        var data = new Date();
        if((data.getMonth()+1)>=10 && (data.getDate()+1)>=10) {
            var curr_date = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" +(data.getDate());
        }
        else if((data.getMonth()+1)<10 && (data.getDate())>=10){
            var curr_date = data.getFullYear() + "-0" + (data.getMonth() + 1) + "-" + (data.getDate());
        }
        else if((data.getMonth()+1)>=10 && (data.getDate())<10){
            var curr_date = data.getFullYear() + "-" + (data.getMonth() + 1) + "-0" + (data.getDate());
        }
        else{
            var curr_date = data.getFullYear() + "-0" + (data.getMonth() + 1) + "-0" + (data.getDate());
        }
        return curr_date
    }


    function get_row_tab(){
        $.ajax({
            url: '/get_row_tab_conf',
            type:'GET',
            success: function(json_response){
                var resp= json_response["config"];
                var table = $("#table").DataTable({
                    "paging": false,
                    "ordering": false,
                    "info": false,
                    "searching": false,
                    "destroy": true
                });
                for(var i=0;i<json_response.num_conf;i++){
                    table.row.add([resp[i].iopin,
                        resp[i].descr,
                        resp[i].tipo,
                        "x",
                        "x",
                        "<input type='checkbox' id='id_"+resp[i].id+"' data-checkbox='VALUE1' class='alert-status'>"
                    ]).draw();
                }

                for(var i=1; i<(json_response.num_conf+1);i++) {
                    $('[id="id_' + i + '"]').bootstrapSwitch('state', resp[i-1].enable, true);
                }
            }
        });
    }
    
    $('#table').on( 'switchChange.bootstrapSwitch', '.alert-status', function (event, state) {
        var id = (this.id).substring(3);
        update(id,state);
    });

    function update(id,value){
        $.ajax({
            url:'/update_state_conf',
            type:'GET',
            data:{
                "id":id,
                "value":value
            }
        });
    }
});

