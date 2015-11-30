$(function() {
    var socket = io();
    var activityData;

    var reset = $('#reset');
    var table = $('#data-table tbody');
    var alert = $('#data-cleared-alert');
    var alertClose = $('#data-cleared-alert button');

    socket.on('ACTIVITIES_EXECUTED', function(data) {
        activityData = data;

        table.html('');
        $.each(activityData, function(key, val) {
            var tr = $('<tr></tr>');
            var index = $('<td></td>');
            index.html(data.indexOf(val)+1);
            var timestamp = $('<td></td>');
            timestamp.html(moment(val.timestamp).format('MMMM Do YYYY, h:mm:ss a'));
            var interaction = $('<td></td>');
            interaction.html(val.interaction);
            tr.append(index).append(timestamp).append(interaction);
            table.append(tr);
        });

        $('.total-executed span').html(data.length);
    });

    reset.click(function() {
        socket.emit('resetActivitiesExecuted');
        alert.fadeIn();
    });

    alertClose.click(function() {
        alert.hide();
    });

    $("#logCsv").click(function() {
        var csv = JSON2CSV(activityData);
        console.log(csv);
    });

    $("#export").click(function() {
        var csv = JSON2CSV(activityData);

        var downloadLink = document.createElement("a");
        var blob = new Blob(["\ufeff", csv]);
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "JB_Activity_Data_" + moment().format() + ".csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    // Get initial list
    socket.emit('getActivitiesExecuted');

    alert.hide();

    function JSON2CSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

        var str = '';
        var line = '';

        var head = array[0];
        if ($("#quote").is(':checked')) {
            for (var index in array[0]) {
                var value = index + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[0]) {
                line += index + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';

        for (var i = 0; i < array.length; i++) {
            var line = '';

            if ($("#quote").is(':checked')) {
                for (var index in array[i]) {
                    var value = array[i][index] + "";
                    line += '"' + value.replace(/"/g, '""') + '",';
                }
            } else {
                for (var index in array[i]) {
                    line += array[i][index] + ',';
                }
            }

            line = line.slice(0, -1);
            str += line + '\r\n';
        }
        return str;

    }
});