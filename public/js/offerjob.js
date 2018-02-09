$(document).on('click', '.job-offer-btn', function(e) {
    // get data from hidden fields in rendered page
    var data = $(this).next('.hide');
    var companyName = data.children('.company').text();
    var description = data.children('.description').text();
    var userId = data.children('.userId').text();

    // send post request to backend to post a broadcast request
    $.post('/offerjob',  {companyName, description, userId});

    // Visually indicate job offer has been sent
    $(this).text('Offer sent!');
    $(this).removeClass('job-offer-btn');
});