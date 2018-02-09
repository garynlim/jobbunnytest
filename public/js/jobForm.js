$(document).ready(function() {
  $('.clockpicker').clockpicker();
  //- default is Full-time
  initFullTimeForm();
});

var partTimeIndustryList = ["Events", "Sales", "Data Entry", "Food & Beverage", "Logistics", "Retail"];
var fullTimeIndustryList = ["Accounting / Finance", "Admin / HR", "Sales / Marketing", "Arts Design Media", "Computer/Technology", "Training & education", "Engineering", "Service / Logistics"];
var partTimeExpirationList = ["At the start of working period", "At the end of working period"];
var fullTimeExpirationList = ["At the start of working period", "After 2 months"];

function buildOptionsList(targetSelectMenuId, listOfItems) {
  listOfItems.forEach(function(item) {
    $('#'+targetSelectMenuId).append($("<option></option>").attr("value", item).text(item));
  });
}

function initFullTimeForm() {
  // hide end-date for full time
  $('#end-date-wrapper').hide();
  $('#total-hours-wrap').hide();
}

//- conditional job-type trigger job-industry, job-expiration change
//- default is Full-time
$('#job-type').change(function() {
  var selectedOption = $(this).val();
  $('#job-industry').html('');
  $('#job-expiration').html('');
  if (selectedOption === 'Full-time') {
    buildOptionsList('job-industry', fullTimeIndustryList);
    buildOptionsList('job-expiration', fullTimeExpirationList);
    //- hide end-date field
    $('#end-date-wrapper').hide();
    $('#total-hours-wrap').hide();
    $('#working-hours-wrap').show();
  } else if (selectedOption === 'Part-time') {
    buildOptionsList('job-industry', partTimeIndustryList);
    buildOptionsList('job-expiration', partTimeExpirationList);
    //- show end-date field
    $('#end-date-wrapper').show();
    $('#working-hours-wrap').hide();
    $('#total-hours-wrap').show();
  } else { // Freelancer
    buildOptionsList('job-industry', $.unique(fullTimeIndustryList.concat(partTimeIndustryList)) );
    buildOptionsList('job-expiration', $.unique(partTimeExpirationList.concat(fullTimeExpirationList)) );
    //- show end-date field
    $('#end-date-wrapper').show();
    $('#working-hours-wrap').hide();
    $('#total-hours-wrap').show();
  }
});
