var Moodbile = {'user': null, 'modules': {},  'init': {}, 'behaviors': {}, 'events': {}, 'aux': {}, 'i18n': {}, 'alert': { 'error':[], 'warning':[], 'success':[] }, 'fx' : {}};
//Moodbile.wsurl = "dummie/ws.dum.php";
Moodbile.wsurl = "http://localhost/~index02/moodbile/moodle/webservice/json/server.php";
Moodbile.serverLocation = "http://localhost/~index02/moodbile/moodle";
Moodbile.location =  location.href;
Moodbile.tStrings = null;
Moodbile.currentJson = null;
Moodbile.queueJson = [];
Moodbile.processedData = []; //Array con datos JSON ya procesados o filtrados
Moodbile.enroledCourses = []; //Array donde dentro se guardan los ids de los cursos del cual el usuario esta enrolado
Moodbile.intervalDelay = 25;
Moodbile.actualDate = new Date();
Moodbile.ExpireTimes = [];//in minutes
Moodbile.ExpireTimes['requestJSON'] = 5;
Moodbile.enableFx = true;

//Funcion que ejecuta los comportamientos de los js de cada modulo
Moodbile.startClient = function(context) {
    var context = context || document;
    
    //Attach general purpouse behaviours     
    jQuery.each(Moodbile.behaviors, function() {
        this(context);
    });
    
    //Attach modules behaviours
    Moodbile.showMask(true);
    
    var userCheck = setInterval(function(){
        if(Moodbile.user != null) {
            clearInterval(userCheck);
            
            jQuery.each(Moodbile.modules, function(i, module) {
                if(module.initBehavior != null) {
                    module.initBehavior(context);
                }
      
                if(module.dependency != null){
                    var depend = Moodbile.modules[module.dependency], behavior = module.depBehavior;
        
                    var depInterval = setInterval(function() {
                        if(depend.status.dataLoaded) {
                            behavior(context);
                            clearInterval(depInterval);
                        }
                    }, Moodbile.intervalDelay);
                }
                
                if (Moodbile.modules.length == i+1) {
                    alert(true);
                }
            });
        }
    }, Moodbile.intervalDelay);
    
    Moodbile.showMask(false);
}

//Site header (logo) behavior
Moodbile.behaviors.sitename = function(context) {
    $('a.sitename').live('click', function() {
        window.location = Moodbile.location;
    });
}

//Loading & other mask
Moodbile.behaviors.createMask = function(context) {
    $('#container').after('<div id="mask"><div>'+Moodbile.t('Loading')+'...</div></div>');
}

//Info-viewer behaviors
Moodbile.behaviors.infoViewer = function() {
    var callback = function() {
        $('.moodbile-info-view').attr('id', 'info-viewer');
        $('#info-viewer').find('.back').find('.moodbile-icon').append(Moodbile.t('Back'));
        $('#info-viewer').find('.close').find('.moodbile-icon').append(Moodbile.t('Close'));
        $('#info-viewer').hide();
        $('.back').hide(); 
    }
    
    Moodbile.cloneTemplate('info-viewer', '#container', callback);
    
    $('.back').live('click', function(){
        Moodbile.fx.SlideRigthLeft('#info-viewer .content:visible');

        var intervalToRemove = setTimeout(function() {
            $('#info-viewer .content:last-child').remove();
            $('#info-viewer .content:last-child').show();
            
            if ($('#info-viewer').find('.content').length == 1) {
               $('.back').hide(); 
            }
        }, Moodbile.intervalDelay*15);
    });
    
    //Habilitamos el boton de cerrar
    $('.close').live('click', function(){
        Moodbile.fx.SlideUpDown('#info-viewer');
        
        if ($('#info-viewer').find('.content').length != 0) {
            $('#info-viewer').find('.content:gt(0)').remove();
            $('#info-viewer').find('.content:last-child').show();
            $('.back').hide(); 
        }
    });
}

Moodbile.behaviors.collapsible = function() {
    $(".collapse").live('click', function(){
        $(this).next('.collapsible').toggle().toggleClass('collapsed');
        
        return false;
    });
}

//Show mask
Moodbile.showMask = function(op) {
    if(op == true){
        if($('#mask').is(':hidden')) {
            $('#mask').show();
        }
    } else {
        $('#mask').hide();
    }
}

//Internacionalization
Moodbile.t = function(stringToTranslate) {
    if(Moodbile.i18n[stringToTranslate] != null) {
        var string = Moodbile.i18n[stringToTranslate];
    } else {
        var string = "STRING!";
    }
    return string;
}

//Info-viewer
Moodbile.infoViewer = function(header, type, info) {
    $('#info-viewer .moodbile-info-view-title').find('h1').html(header.title);
    $('#info-viewer .moodbile-info-view-title').find('h2').html(header.subtitle);
    
    //Añadimos info
    if ($('#info-viewer').is(':hidden')) {
        $('#info-viewer').find('.content').removeClass().addClass('content');
        $('#info-viewer').find('.content').addClass(type).html(info);
    } else {
        var length = $('#info-viewer').find('.content').length;
        
        $('#info-viewer').find('.content:last-child').clone().appendTo('.moodbile-info-view-content');
        $('#info-viewer').find('.content:last-child').removeClass().addClass('content');
        $('#info-viewer').find('.content:last-child').addClass(type).html(info).hide();
        $('#info-viewer').find('.content:lt('+length+')').hide();
        
        $('.back').show();
        
        Moodbile.fx.SlideRigthLeft('#info-viewer .content:last-child');
    }
    
    //Habilitamos el callback
    if (Moodbile.infoViewer.arguments[3] != null){
        var callback = Moodbile.aux.infoViewer.arguments[3];
        callback();
    }
    
    //Subimos el scroll hasta arriba y mostramos infoViewer
    $('#info-viewer').css({"min-height": $(document).height()-10+"px"});
    if ($('#info-viewer').is(':hidden')) {
        Moodbile.fx.SlideUpDown('#info-viewer');
    }
}

//INDEPENDIZAR FUNCIONES
Moodbile.time = {
    'getDate' : function (unixTimestamp) {
        var date = new Date();
        date.setTime(unixTimestamp*1000);
    
        return date.toLocaleDateString();
    },
    'getTime' : function (unixTimestamp) {
        var date = new Date();
        date.setTime(unixTimestamp*1000);
        
        return date.toLocaleTimeString();
    },
    'getDateTime' : function (unixTimestamp) {
        var date = new Date();
        date.setTime(unixTimestamp*1000);
        
        return date.toLocaleString();
    },
    'convertTimestamp' : function(unixTimestamp) {
        return unixTimestamp*1000;
    }
}

Moodbile.userAvatarUrl = function(userid) {
    return Moodbile.serverLocation+'/user/pix.php/'+userid+'/f2.jpg';
}

$(window).ready(function() { 
    Moodbile.startClient(this);
});