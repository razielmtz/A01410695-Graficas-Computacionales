function addMouseHandler(canvas, group)
{
    $("#slider").on("slide", (e, u) => modifyDuration(u.value) );
}



function initControls()
{
    $("#slider").slider({min: 1, max: 30, value: 15, step: 1, animate: false});

}