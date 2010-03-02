Moodbile.behaviorsPatterns.grade = function(context){
    var context = context || document;
    
    var loadInterval = setInterval(function(){
        if(Moodbile.enroledCoursesid.length > 0) {
            Moodbile.aux.grade(context, Moodbile.enroledCoursesid); 
            clearInterval(loadInterval);
        }
    }, Moodbile.intervalDelay);    
}

Moodbile.behaviorsPatterns.gradeViewMoreInfo = function(context){
    var context = context || document;
    
    $('.grade a').live('click', function(){
        var id = $(this).parent().attr('class');
        id = id.split(' ');
        id = id[1];
        
        var title = $(this).text();
        
        var petitionOpts = {'op':'grade', 'gradeid':id};
        
        Moodbile.json(context, petitionOpts, function(json){
            var content = json.title;
            Moodbile.aux.infoViewer(title, petitionOpts.op, content);
        });
    });
}

Moodbile.aux.grade = function(context, courseids) {
    $.each(courseids, function(){
        $('#wrapper').append('<div class="grade-'+ this +'"></div>');
        $('.grade-'+ this).hide();
    });
    
    var petitionOpts = {'op':'grades'};
    Moodbile.json(context, petitionOpts, Moodbile.templates.grade);
}

Moodbile.templates.grade = function(json){
    $.each(json, function(i, json){
        var courseid = json.courseid;
        var grades = json.grades;
        
        $('#wrapper .grade-'+ courseid).append('<section class="user-grades-'+json.id+'"></section>');
        $('#wrapper .grade-'+ courseid).find('.user-grades-'+json.id).append('<span class="avatar"></span><div class="arrow"><h6><a href="#" class="user '+json.id+' fx">'+json.name+' '+json.lastname+'</a></h6></div>');
        $('#wrapper .grade-'+ courseid).find('.user-grades-'+json.id).find('.avatar').css({'background-image' : 'url('+json.avatar+')'});
        
        $.each(grades, function(i, grades){
            $('#wrapper .grade-'+ courseid).find('.user-grades-'+json.id).append('<div class="grade ' + grades.id + '"><a href="#" class="fx"><span class="icon-'+grades.type+'"></span>' + grades.title + '</a><div class="info collapsed"></div></div>');
            $('#wrapper .grade-'+ courseid).find('.user-grades-'+json.id).find('.' + grades.id).find('.info').append('<span class="more visible"><a href="#" class="collapsible"><span class="icon-info"></span></a></span>');
            $('#wrapper .grade-'+ courseid).find('.user-grades-'+json.id).find('.' + grades.id).find('.info').append('<div class="data">Calificación: <em>'+ grades.grade +'</em></div>');
            $('#wrapper .grade-'+ courseid).find('.user-grades-'+json.id).find('.' + grades.id).find('.info').append('<div class="description">'+ grades.description +'</div>');
        });
    });
}