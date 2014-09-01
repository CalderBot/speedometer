

var speedometer;

function loadGauge(){
    WIDTH=$(window).width();
    HEIGHT=$(window).height();
    $('#ridingViewContainer').css({'width':WIDTH,'height':HEIGHT}); 
    speedometer = new Gauge('speedometer','mph', WIDTH, HEIGHT, 0, 40,0,0,0,1000);
}


$(document).ready(function () {

    loadGauge()
    window.setInterval( function(){ speedometer.update() }, 1000 );

    $(window).resize(function(){
        $("#speedometer").empty();
        loadGauge();
    })

    $('.reset').click( function(){ speedometer.reset() } );

});


