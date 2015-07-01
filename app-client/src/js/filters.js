/////////////////////////////////////////////////////////////////////
//app filters
//////////////////////////////////
//datetime filter
app.filter('datetz', function() {
    return function(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    };
});