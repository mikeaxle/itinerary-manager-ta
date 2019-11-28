import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { CountryService } from './country.service';
import { saveAs } from 'file-saver';
import { MoneyPipe } from '../filter/money.pipe';
import { MatDialog, MatDialogRef } from '@angular/material';
import { PdfDialogComponent } from '../shared/pdf-dialog/pdf-dialog.component';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SavePdfService {
  private averageCost = 0;
  private updatedAt: any;
  constructor(private data: DataService, private http: HttpClient, public dialog: MatDialog) {
    // get countries
    this.data.firestore.collection('countries')
      .snapshotChanges()
      .subscribe(res => {
        this.countries = [];
        this.regions = [];
        res.forEach(doc => {
          const country = doc.payload.doc.data();
          country[`key`] = doc.payload.doc.id;
          this.countries.push(country);

          country[`regions`].forEach(region => {
            this.regions.push(region);
          });
        });
      });

  }

  filter = new MoneyPipe();
  headers = new Headers();

  // html string
  html = '';
  save;
  req;
  itinerary: any;
  days;
  comments;
  payments;
  inventory;
  phoneNumbers;
  totalPayments = 0;
  totalDays = 0;
  usedDays = 0;
  accommodation = [];
  regions = [];
  countries = [];
  destinations = [];
  // variable to store height threshold for itinerary page
  heightThreshold = 0;
  logo: any;
  headerLogoSrc: any;
  headerLogoWidth: any;
  logoFull: any;
  date_months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
  ];
  agent: any;
  private dialogRef: MatDialogRef<PdfDialogComponent>;
  countries$;
  regions$;

  getLiveDoc(html, mode, type) {

    // show dialog
    this.dialogRef = this.dialog.open(PdfDialogComponent, {
      data: {
        title: this.itinerary.title,
        type: 'Live URL'
      },
      disableClose: true,
      width: '300px',
    });

    // this.http.post('http://localhost:8000/liveUrl', {
    this.http.post('https://planet-africa-print-server-dev.herokuapp.com/liveUrl', {
      html,
      title: `${this.itinerary.key}-${mode}-${type}`
    }, {
      responseType: 'text'
    }).subscribe((res) => {

      // close ref
      this.dialogRef.close();
      Swal.fire({
        confirmButtonText: 'Open Live Url',
        html: `${res}`,
        title: 'Live Url available at:',
        type: 'success',
      })
        .then(result => {
          if (result.value) {
            window.open(res);
          }
        });
    }
      , (err) => {
        console.log(err);
        Swal.fire('Generate Live Url', err.message, 'error')
          .then(_ => {
            // close ref
            this.dialogRef.close();
          });
      }
    );

  }

  // function to communicate with print api
  getPDF(html: string) {
    this.dialogRef = this.dialog.open(PdfDialogComponent, {
      data: {
        title: this.itinerary.title,
        type: 'PDF'
      },
      disableClose: true,
      width: '300px',
    });
    this.http.post('https://planet-africa-print-server-dev.herokuapp.com/print-pdf', {
      //  this.http.post('https://planet-africa-print-server.herokuapp.com/print-pdf', {
      //  this.http.post('http://localhost:8000/print-pdf', {
      html
    }, {
      responseType: 'arraybuffer'
    }).subscribe((res) => {
      // create pdf from blob
      const file = new Blob([res], { type: 'application/pdf' });

      // save pdf
      saveAs(file, `${this.itinerary.title} ${Date.now()}.pdf`);

      console.log('pdf generated');

      // close ref
      this.dialogRef.close();
    }
      , (err) => {
        console.log(err);
        Swal.fire('Generating PDF', err.message, 'error')
          .then(_ => {
            // close ref
            this.dialogRef.close();
          });
      }
    );
  }

  // function to save pdf
  savePDF(itineraryData: any, mode: number, type: number, usedDays: any) {

    // console.log(itineraryData)

    // get itinerary
    this.itinerary = itineraryData.itinerary;

    // get averages
    this.averageCost = (itineraryData.averageCost).toFixed(2);

    // get updated at
    this.updatedAt = itineraryData.updatedAt;

    // get days
    this.days = itineraryData.days;

    // get comments
    this.comments = itineraryData.comments;

    // payments
    this.payments = itineraryData.payments;

    this.totalPayments = itineraryData.totalPayments;

    // phone numbers associated with itinerary
    this.phoneNumbers = itineraryData.contactDetails;

    // assign used days
    this.usedDays = usedDays;

    // get agent
    this.agent = itineraryData.agent;


    // get inventory list
    this.data.firestore.collection('inventory')
      .valueChanges()
      .subscribe(res => {
        this.inventory = res;
      });

    // get accommodation
    this.days.forEach(day => {
      // check if accommodation is preset for day
      if (day.accommodation !== undefined) {
        // iterate accommodation
        day.accommodation.forEach((a) => {
          // add accommodation
          this.accommodation.push(a);

          // add destination to destinations array
          if (!this.destinations.includes(this.showDestination(a.destination))) {
            this.destinations.push(this.showDestination(a.destination));
          }
        });
      }
    });

    // filter accommodation to only have unique values
    this.accommodation = removeDuplicates(this.accommodation, 'imageUrl');

    // get exclusions
    if (this.itinerary.exclusions === undefined) {
      this.itinerary.exclusions = 'International travel, Tourist visas, Drinks and meals unless specified in inclusions, General Travel Insurance (it is strongly recommended not to travel without comprehensive travel and medical insurance), Tipping and gratuities (please read the Important Information for your Safari document for more info).';
    }

    // get logos
    this.getLogo();
    this.getHeaderLogo();

    // check pdf print mode type
    if (type === 1) {
      this.html = this.getHtmlHalf();
    }

    if (type === 2) {
      this.html = this.getHtmlFullNoCost();
    }

    if (type === 3) {
      this.html = this.getHtmlFull();
    }

    // mode 1 is live url
    if (mode === 1) {
      this.getLiveDoc(this.html, mode, type);
    }

    if (mode === 2) {
      // mode 2 is get pdf
      this.getPDF(this.html);
    }

    // reset certain objects
    this.destinations = [];
    this.accommodation = [];
  }

  // function to get PDF HTML without costs
  getHtmlFullNoCost() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" type="text/css" href="${this.getStyleSheet()}">
  <title>Document</title>
  <style>

  /* HEADER */
  header{
    height: 90px;
  }
  header img {
    display: block;
    margin: auto;
    padding-top: 35px
  }

  header h1.page-header {
    position: relative;
    margin: 12px 0px 0px 0px;
    color: #373737;
    font-family: 'old_standard_ttitalic';
    font-size: 24px;
    font-weight: normal;
    text-align: center;
  }
  header h1.page-header:after {
    content: "";
    position: absolute;
    width: 73px;
    height: 1px;
    background-color: #e0e0e0;
    left: 272px;
    bottom: -9px;
  }

  header p.subtitle {

    font-weight: normal;
    text-align: center;
    font-family: "montserratregular";
    font-size: 10px;
    letter-spacing: 0.8px;
    color: #373737;
    text-transform: uppercase;
    margin: 19px 0px 0px 0px;
  }

footer {
  height: 50px;
  border-top: 1px solid ${this.data.color};
  width: 550px;
  left: 31px;
  text-align: center;
  display: block;
  margin: auto;
}
footer p{
  display: inline-block;
  color: #373737;
  font-family: "montserratregular";
  font-size: 7px;
  font-weight: 300;
  border-right: 0.5px solid #a3a3a3;
  margin-top: 15px;
  padding-right: 5px;
  padding-left: 5px;
  margin-right: -4px;
}
footer p:last-of-type{
  border-right: none;
}
.add-ons p b {
  font-family: 'montserratsemibold';
  font-weight: 400;
}
.add-ons b {
  font-family: 'montserratsemibold';
  font-weight: 400;
}
.add-ons span {
  font-family: 'montserratsemibold';
  font-weight: 400;
}


  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js"></script>
</head>
<body>

<!-- FIRST PAGE -->
<header id="pageHeader">
  <img src="${this.headerLogoSrc}" width="${this.headerLogoWidth}"/>
</header>
<div class="page front-page" id="pageContent">
  <header>
    <div class="logo">
      <!-- <img src="assets/logo-icon@2x.png" width="16"> -->
      <img src="${this.logo}" alt="" width="200">
    </div>
  </header>

  <main style="background-image:url('${this.itinerary.coverImageTile.imageUrl}')">
    <div class="overlay">
      <p class="pretext">SAFARI ITINERARY</p>
      <h1 class="heading" style="font-family: georgiaitalic !important;">${this.itinerary.title}</h1>
      <p class="date">${this.itinerary.startDate} – ${this.itinerary.endDate}</p>
    </div>
  </main>

  <footer>
    <p class="quote">“I never knew of a morning in Africa when I woke up that I was not happy.”</p>
    <p class="author">ERNEST HEMINGWAY</p>
  </footer>
</div>


<!-- SECOND PAGE -->
<div class="page destinations">
  <h1 class="page-header">Your Destinations</h1>
  <p class="subtitle">${this.getDestinations()}</p>
  <main>
    <div class="container">
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[0].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[0].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[1].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[1].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[2].imageUrl}')">
        <div class="gradient">
        <p class="caption">${this.itinerary.gridImageTiles[2].caption}</p>
      </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[3].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[3].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[4].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[4].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[5].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[5].caption}</p>
        </div>
      </div>
    </div>
  </main>
</div>


<!-- THIRD PAGE -->
<div class="page itenerary first">

  <h1 class="page-header">Your Itinerary</h1>
  <p class="subtitle">${this.usedDays} DAYS</p>
  <div class="line"></div>

  <main>
    <div class="container">

      <!-- SIDEBAR -->
      <ul class="sidebar">
        <li>
          <p class="title">Itinerary</p>
          <p class="field">${this.itinerary.title}</p>
        </li>
        <li>
          <p class="title">Safari Specialist</p>
          <p class="field">${this.agent.firstName} ${this.agent.lastName}</p>
        </li>
        <li>
          <p class="title">Travel Dates</p>
          <p class="field">${this.itinerary.startDate} - ${this.itinerary.endDate}</p>
        </li>
        <li>
          <p class="title">Adults</p>
          <p class="field">${ this.itinerary.adults.length > 0 ? this.getAdultDetails('adults') : this.itinerary.adults.length}</p>
        </li>
        <li>
        <p class="title">Children</p>
        <p class="field">${ this.itinerary.children.length > 0 ? this.getAdultDetails('children') : this.itinerary.children.length}</p>
        </li>

        <li>
          <p class="title">Status</p>
          <p class="field">${this.itinerary.status}</p>
        </li>
        <li>
          <p class="title">Modified</p>
          <p class="field">${this.updatedAt.toLocaleString()}</p>
        </li>
      </ul>

      <!-- ITNERARY ITEMS -->
      <ul class="itenerary-items">
        ${this.getDays()}
      </ul>
      <!-- end Itenerary items -->

    </div>
  </main>

</div>

<!-- Accomodation-->
<div class="page accomodation first">
  <h1 class="page-header">Your Accommodation</h1>
  <main>
    <div class="container">
    <div class="accom">

    <div class="accom-list">
      ${this.getAccommodation(this.accommodation)}
    </div>
    </div>
      <div class="add-ons">
        <h2>Inclusions</h2>

        ${this.getInclusions(this.accommodation)}


        <h2>General Inclusions</h2>
        <p class="exclusion-item">${this.itinerary.generalInclusions}</p>

        <h2>Exclusions</h2>
        <p class="exclusion-item">${this.itinerary.exclusions}</p>

      </div>
    </div>
  </main>
</div>

<!-- Contact-->

<div class="page contact">
  <h1 class="page-header">Contact Information</h1>
  <main>
    <div class="container">
    ${this.getContacts()}

    ${this.getTravelInsuranceBox()}

      <div class="info-block">
        <img src="${this.getInfoIcon()}" alt="" width="24" height="24">
        <p>Please read your <em>Important Info for your Safari</em> brochure for further information about tipping, weather, visas, vaccines, what to pack and more.</p>
      </div>

    </div>
  </main>
</div>
<footer id="pageFooter">
  ${this.getFooter()}
</footer>
<div id="pageFooter-first"></div>


<script>
$(function(){
// itenerary-items
// -------------------------
var height = 0;
var heightThreshold = ${this.heightThreshold};
var count = 0;
$( ".itenerary-items li" ).each(function( index ) {
  height =  height + $(this).outerHeight();
  if (count > 0) heightThreshold = ${this.heightThreshold + 50};

  if (height > heightThreshold) {
    count ++;

    // select and remove li's that don't fit
    var copied = $(this).nextAll().addBack().detach();

    // select whole first itenerary page
    var ul =  $('.page.itenerary.first');

    // clone first itenerary page,
    // remove the 'page' and 'first' classes,
    // empty it and append the copied li's
    // Q: not sure why we doing all this when we're creating a whole new page below
    // REMOVED: var copyUl = ul.clone().removeClass('page first').empty().append(copied);

    // create new itenerary page
    var test = $('<div class="page itenerary appended-' + count + '"><main><div class="container border-break"><div class="spacer"></div><ul class="itenerary-items copy-here'+ count +'"></ul></div></div></main></div>');

    // place new page after previous
    $('.page.itenerary').last().after(test);

    // insert clone page with the copied li's
    // Q: instead of appending cloned page, we just append li's to new itenerary page
    // REMOVED: $('.copy-here'+ count).append(copyUl.removeClass('first'));

    // ADDED: just append the li's
    $('.copy-here'+ count).append(copied);

    // append quote after itenerary items
    // Q: no quote for this page surely?
    // REMOVED: $('.itenerary-quote').insertAfter($('.copy-here'+ count).last());

    // reset height to that of current item
    height = $(this).outerHeight();
  }

});


// Accomodation
// -------------------------
var accomCount = 0;

var accomHeight = 0;

// every 4th element
$( ".accom-list .wrapper" ).each(function( index ) {
  accomHeight = accomHeight + $(this).height() ;

  if (accomHeight > 500) {
    accomCount++;
  var copied = $(this).nextAll().detach();
  var ul =  $('.page.accomodation.first');
  var copyUl = ul.clone().removeClass('page first').empty().append(copied);
  var test = $('<div class="page accomodation appended-' + accomCount + '"><main><div class="container"><div class="accom-list accom-copy-here'+ accomCount +'"></div></div></div></main>');

  $('.page.accomodation').last().after(test);
  $('.accom-copy-here'+ accomCount).append(copyUl.removeClass('accomodation.first'));
  accomHeight = 0;
  }


console.log(accomCount);

});

$('.add-ons').insertAfter($('.accom-copy-here'+ accomCount).last());

// if inclusion + exclusions are too big
// ---------------------------------
console.log(accomHeight);
var addOnsHeight = $('.add-ons').height();
var pageAccomLast = $('.page.accomodation').last().height();
var lastaccomPage = $('.page.accomodation ').last();
var addonsThreshold = 610;
if( lastaccomPage.hasClass('first') ) addonsThreshold = 570;
if (accomHeight + addOnsHeight > addonsThreshold) {
  // create new page
  var newAddonPage = $('<div class="page accomodation"><main><div class="container "><div class="spacer"></div><div class="move-addons-here"></div></div></main></div>');
  // Move to new page
  var addOns = $('.add-ons').detach();
  lastaccomPage.after(newAddonPage);
  $('.move-addons-here').append(addOns);
}


// If QUOTE + ITENERary ARE TOO big
// REMOVED: (unnecessary as no quote)
/* ---------------------------------

var lastIteneraryPage = $('.page.itenerary').last();
var quoteThreshold = 610;
if( lastIteneraryPage.hasClass('first') ) quoteThreshold = 570;
var lastIteneraryItemsHeight = lastIteneraryPage.find('.itenerary-items').height();
var quotHeight = $('.itenerary-quote').outerHeight();
var pageHeight = 661;
var newPage = $('<div class="page itenerary quote-append"><main><div class="container border-break"><div class="spacer"></div><div class="move-quote-here"></div></div></main></div>');

if (lastIteneraryItemsHeight + quotHeight > quoteThreshold) {

    var quote = $('.itenerary-quote').detach();
    lastIteneraryPage.after(newPage);
    $('.move-quote-here').append(quote);
}
*/
});
</script>


</body>
</html>
`;
  }

  // function to get PDF HTML
  getHtmlFull() {

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" type="text/css" href="${this.getStyleSheet()}">
  <title>Document</title>
  <style>

  /* HEADER */
  header{
    height: 90px;
  }
  header img {
    display: block;
    margin: auto;
    padding-top: 35px
  }

  header h1.page-header {
    position: relative;
    margin: 12px 0px 0px 0px;
    color: #373737;
    font-family: 'old_standard_ttitalic';
    font-size: 24px;
    font-weight: normal;
    text-align: center;
  }
  header h1.page-header:after {
    content: "";
    position: absolute;
    width: 73px;
    height: 1px;
    background-color: #e0e0e0;
    left: 272px;
    bottom: -9px;
  }

  header p.subtitle {

    font-weight: normal;
    text-align: center;
    font-family: "montserratregular";
    font-size: 10px;
    letter-spacing: 0.8px;
    color: #373737;
    text-transform: uppercase;
    margin: 19px 0px 0px 0px;
  }

footer {
  height: 50px;
  border-top: 1px solid ${this.data.color};
  width: 550px;
  left: 31px;
  text-align: center;
  display: block;
  margin: auto;
}
footer p{
  display: inline-block;
  color: #373737;
  font-family: "montserratregular";
  font-size: 7px;
  font-weight: 300;
  border-right: 0.5px solid #a3a3a3;
  margin-top: 15px;
  padding-right: 5px;
  padding-left: 5px;
  margin-right: -4px;
}
footer p:last-of-type{
  border-right: none;
}

.add-ons p b {
  font-family: 'montserratsemibold';
  font-weight: 400;
}
.add-ons b {
  font-family: 'montserratsemibold';
  font-weight: 400;
}
.add-ons span {
  font-family: 'montserratsemibold';
  font-weight: 400;
}


  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js"></script>
</head>
<body>

<!-- FIRST PAGE -->
<header id="pageHeader">
  <img src="${this.headerLogoSrc}" width="${this.headerLogoWidth}"/>
</header>
<div class="page front-page" id="pageContent">
  <header>
    <div class="logo">
      <img src="${this.logo}" alt="" width="200">
    </div>
  </header>

  <main style="background-image:url('${this.itinerary.coverImageTile.imageUrl}')">
    <div class="overlay">
      <p class="pretext">SAFARI ITINERARY</p>
      <h1 class="heading" style="font-family: georgiaitalic !important;">${this.itinerary.title}</h1>
      <p class="date">${this.itinerary.startDate} – ${this.itinerary.endDate}</p>
    </div>
  </main>

  <footer>
    <p class="quote">“I never knew of a morning in Africa when I woke up that I was not happy.”</p>
    <p class="author">ERNEST HEMINGWAY</p>
  </footer>
</div>


<!-- SECOND PAGE -->
<div class="page destinations">
  <h1 class="page-header">Your Destinations</h1>
  <p class="subtitle">${this.getDestinations()}</p>
  <main>
    <div class="container">
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[0].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[0].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[1].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[1].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[2].imageUrl}')">
        <div class="gradient">
        <p class="caption">${this.itinerary.gridImageTiles[2].caption}</p>
      </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[3].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[3].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[4].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[4].caption}</p>
        </div>
      </div>
      <div class="img-block" style="background-image:url('${this.itinerary.gridImageTiles[5].imageUrl}')">
        <div class="gradient">
          <p class="caption">${this.itinerary.gridImageTiles[5].caption}</p>
        </div>
      </div>
    </div>
  </main>
</div>


<!-- THIRD PAGE -->
<div class="page itenerary first">

<h1 class="page-header">Your Itinerary</h1>
<p class="subtitle">${this.usedDays} DAYS</p>
<div class="line"></div>

<main>
  <div class="container">

    <!-- SIDEBAR -->
    <ul class="sidebar">
      <li>
        <p class="title">Itinerary</p>
        <p class="field">${this.itinerary.title}</p>
      </li>
      <li>
        <p class="title">Safari Specialist</p>
        <p class="field">${this.agent.firstName} ${this.agent.lastName}</p>
      </li>
      <li>
        <p class="title">Travel Dates</p>
        <p class="field">${this.itinerary.startDate} - ${this.itinerary.endDate}</p>
      </li>
      <li>
        <p class="title">Adults</p>
        <p class="field">${ this.itinerary.adults.length > 0 ? this.getAdultDetails('adults') : this.itinerary.adults.length}</p>
      </li>
      <li>
      <li>
      <p class="title">Children</p>
      <p class="field">${ this.itinerary.children.length > 0 ? this.getAdultDetails('children') : this.itinerary.children.length}</p>
      </li>

      </li>

      <li>
        <p class="title">Status</p>
        <p class="field">${this.itinerary.status}</p>
      </li>
              <li>
          <p class="title">Modified</p>
          <p class="field">${this.updatedAt.toLocaleString()}</p>
        </li>
    </ul>

    <!-- ITENERARY ITEMS -->
		<ul class="itenerary-items">
			${this.getDays()}
    </ul>
		<!-- end Itenerary items -->

    <!-- quote -->
    <div class="itenerary-quote">
      <h2>Quote</h2>

      <table class="quoting" cellspacing="0">

        <!-- Price -->
        <tr>
          <td class="description">Average price per person, per day of service</td>
          <td class="currency">USD</td>
          <td class="amount"/>${(this.averageCost / this.usedDays).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="description">Average price per person</td>
          <td class="currency">USD</td>
          <td class="amount">${this.averageCost}</td>
        </tr>
        <tr class="total-price">
          <td class="description">Total Price</td>
          <td class="currency">USD</td>
          <td class="amount">${this.filter.transform(this.itinerary.total)}</td>
        </tr>

          ${this.showDiscountAndDeposit()}

        <!-- payments -->
        ${this.getPayments()}

      <!-- BALANCE -->
        <tr class="balance-due">
          <td class="description">Balance Due</td>
          <td class="currency">USD</td>
          <td class="amount">${this.balanceCalculator()}</td>
        </tr>
      </table>
    </div>
    </div>
  </main>
</div>

<!-- Accomodation-->
<div class="page accomodation first">

  <h1 class="page-header">Your Accommodation</h1>

  <main>
    <div class="container">
    <div class="accom">

    <div class="accom-list">
      ${this.getAccommodation(this.accommodation)}
    </div>
    </div>
      <div class="add-ons">
        <h2>Inclusions</h2>

        ${this.getInclusions(this.accommodation)}

        <h2>General Inclusions</h2>
        <p class="exclusion-item">${this.itinerary.generalInclusions}</p>

        <h2>Exclusions</h2>
        <p class="exclusion-item">${this.itinerary.exclusions}</p>

      </div>
    </div>
  </main>
</div>

<!-- Contact-->

<div class="page contact">
  <h1 class="page-header">Contact Information</h1>
  <main>
    <div class="container">
    ${this.getContacts()}

    ${this.getTravelInsuranceBox()}

      <div class="info-block">
        <img src="${this.getInfoIcon()}" alt="" width="24" height="24">
        <p>Please read your <em>Important Info for your Safari</em> brochure for further information about tipping, weather, visas, vaccines, what to pack and more.</p>
      </div>

    </div>
  </main>
</div>

<footer id="pageFooter">
  ${this.getFooter()}
</footer>
<div id="pageFooter-first"></div>


<script>
$(function(){

// itenerary-items
// -------------------------
var height = 0;
var heightThreshold = ${this.heightThreshold};
var count = 0;
var quoteHeightfirst = $('.itenerary-quote').height();

$( ".itenerary-items li" ).each(function( index ) {
  height =  height + $(this).outerHeight() ;
  if (count > 0) heightThreshold = ${this.heightThreshold + 50};

  // REMOVED: if (height + quoteHeightfirst > 540) {
  // Q: we check for the quote height and split it up later tho
  if (height  > heightThreshold) {
    count ++;

    var copied = $(this).nextAll().addBack().detach();
    var ul =  $('.page.itenerary.first');
    //var copyUl = ul.clone().removeClass('page first').empty().append(copied);
    var test = $('<div class="page itenerary appended-' + count + '"><main><div class="container border-break"><div class="spacer"></div><ul class="itenerary-items copy-here'+ count +'"></ul></div></div></main>');

    $('.page.itenerary').last().after(test);
    //$('.copy-here'+ count).append(copyUl.removeClass('first'));
    $('.copy-here'+ count).append(copied);

    // append quote to end
     $('.itenerary-quote').insertAfter($('.copy-here'+ count).last());

     // reset height to that of current item
     height = $(this).outerHeight();
  }

});




// Accomodation
// -------------------------
var accomCount = 0;

var accomHeight = 0;

// every 4th element
$( ".accom-list .wrapper" ).each(function( index ) {
  accomHeight = accomHeight + $(this).height() ;

  if (accomHeight > 500) {
    accomCount++;
  var copied = $(this).nextAll().detach();
  var ul =  $('.page.accomodation.first');
  var copyUl = ul.clone().removeClass('page first').empty().append(copied);
  var test = $('<div class="page accomodation appended-' + accomCount + '"><main><div class="container"><div class="accom-list accom-copy-here'+ accomCount +'"></div></div></div></main>');

  $('.page.accomodation').last().after(test);
  $('.accom-copy-here'+ accomCount).append(copyUl.removeClass('accomodation.first'));
  accomHeight = 0;
  }


console.log(accomCount);

});

$('.add-ons').insertAfter($('.accom-copy-here'+ accomCount).last());

// if inclusion + exclusions are too big
// ---------------------------------
console.log(accomHeight);
var addOnsHeight = $('.add-ons').height();
var pageAccomLast = $('.page.accomodation').last().height();
var lastaccomPage = $('.page.accomodation ').last();
var addonsThreshold = 610;
if( lastaccomPage.hasClass('first') ) addonsThreshold = 570;
if (accomHeight + addOnsHeight > addonsThreshold) {
  // create new page
  var newAddonPage = $('<div class="page accomodation"><main><div class="container "><div class="spacer"></div><div class="move-addons-here"></div></div></main></div>');
  // Move to new page
  var addOns = $('.add-ons').detach();
  lastaccomPage.after(newAddonPage);
  $('.move-addons-here').append(addOns);
}

// if quote + itenerary are too big
// ---------------------------------
var lastIteneraryPage = $('.page.itenerary').last();
var quoteThreshold = 610;
if( lastIteneraryPage.hasClass('first') ) quoteThreshold = 570;
var lastIteneraryItemsHeight = lastIteneraryPage.find('.itenerary-items').height();
var quotHeight = $('.itenerary-quote').outerHeight();
var pageHeight = 661;
var newPage = $('<div class="page itenerary quote-append"><main><div class="container border-break"><div class="spacer"></div><div class="move-quote-here"></div></div></main></div>');

if (lastIteneraryItemsHeight + quotHeight > quoteThreshold) {

    var quote = $('.itenerary-quote').detach();
    lastIteneraryPage.after(newPage);
    $('.move-quote-here').append(quote);
}

});
</script>


</body>
</html>
`;
  }

  // function to get PDF HTML with only itinerary and costs
  getHtmlHalf() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <link rel="stylesheet" type="text/css" href="${this.getStyleSheet()}">
      <title>Document</title>
      <style>

      /* HEADER */
      header{
        height: 90px;
      }
      header img {
        display: block;
        margin: auto;
        padding-top: 35px
      }

      header h1.page-header {
        position: relative;
        margin: 12px 0px 0px 0px;
        color: #373737;
        font-family: 'old_standard_ttitalic';
        font-size: 24px;
        font-weight: normal;
        text-align: center;
      }
      header h1.page-header:after {
        content: "";
        position: absolute;
        width: 73px;
        height: 1px;
        background-color: #e0e0e0;
        left: 272px;
        bottom: -9px;
      }

      header p.subtitle {

        font-weight: normal;
        text-align: center;
        font-family: "montserratregular";
        font-size: 10px;
        letter-spacing: 0.8px;
        color: #373737;
        text-transform: uppercase;
        margin: 19px 0px 0px 0px;
      }

    footer {
      height: 50px;
      border-top: 1px solid ${this.data.color};
      width: 550px;
      left: 31px;
      text-align: center;
      display: block;
      margin: auto;
    }
    footer p{
      display: inline-block;
      color: #373737;
      font-family: "montserratregular";
      font-size: 7px;
      font-weight: 300;
      border-right: 0.5px solid #a3a3a3;
      margin-top: 15px;
      padding-right: 5px;
      padding-left: 5px;
      margin-right: -4px;
    }
    footer p:last-of-type{
      border-right: none;
    }

      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js"></script>
    </head>
    <body>
    <!-- THIRD PAGE -->
    <header id="pageHeader">
      <img src="${this.logoFull}" width="180">
    </header>
    <div class="page itenerary first">

    <h1 class="page-header">Your Itinerary</h1>
    <p class="subtitle">${this.usedDays} DAYS</p>
    <div class="line"></div>
    <main>
      <div class="container">

        <!-- SIDEBAR -->
        <ul class="sidebar">
          <li>
            <p class="title">Itinerary</p>
            <p class="field">${this.itinerary.title}</p>
          </li>
          <li>
            <p class="title">Safari Specialist</p>
            <p class="field">${this.agent.firstName} ${this.agent.lastName}</p>
          </li>
          <li>
            <p class="title">Travel Dates</p>
            <p class="field">${this.itinerary.startDate} - ${this.itinerary.endDate}</p>
          </li>
          <li>
            <p class="title">Adults</p>
            <p class="field">${ this.itinerary.adults.length > 0 ? this.getAdultDetails('adults') : this.itinerary.adults.length}</p>
          </li>
          <li>
          <p class="title">Children</p>
          <p class="field">${ this.itinerary.children.length > 0 ? this.getAdultDetails('children') : this.itinerary.children.length}</p>
          </li>

          </li>
          <li>
            <p class="title">Status</p>
            <p class="field">${this.itinerary.status}</p>
          </li>
                  <li>
          <p class="title">Modified</p>
          <p class="field">${this.updatedAt.toLocaleString()}</p>
        </li>
        </ul>

        <!-- ITENERARY ITEMS -->
    		<ul class="itenerary-items">
    			${this.getDays()}
        </ul>
    		<!-- end Itenerary items -->

        <!-- quote -->
        <div class="itenerary-quote">
          <h2>Quote</h2>

          <table class="quoting" cellspacing="0">

            <!-- Price -->
            <tr>
              <td class="description">Average price per person, per day of service</td>
              <td class="currency">USD</td>
              <td class="amount"/>${(this.averageCost / this.usedDays).toFixed(2)}</td>
            </tr>
            <tr>
              <td class="description">Average price per person</td>
              <td class="currency">USD</td>
              <td class="amount">${this.averageCost}</td>
            </tr>
            <tr class="total-price">
              <td class="description">Total Price</td>
              <td class="currency">USD</td>
              <td class="amount">${this.filter.transform(this.itinerary.total)}</td>
            </tr>

            ${this.showDiscountAndDeposit()}

            <!-- payments -->
            ${this.getPayments()}

          <!-- BALANCE -->
            <tr class="balance-due">
              <td class="description">Balance Due</td>
              <td class="currency">USD</td>
              <td class="amount">${this.balanceCalculator()}</td>
            </tr>
          </table>
        </div>
        </div>
      </main>
    </div>

     <!-- Contact-->
     <div class="page contact">
      <h1 class="page-header">Contact Information</h1>
      <main>
        <div class="container">
        ${this.getContacts()}

        ${this.getTravelInsuranceBox()}

          <div class="info-block">
            <img src="${this.getInfoIcon()}" alt="" width="24" height="24">
            <p>Please read your <em>Important Info for your Safari</em> brochure for further information about tipping, weather, visas, vaccines, what to pack and more.</p>
          </div>

        </div>
      </main>
    </div>
    <footer id="pageFooter">
      ${this.getFooter()}
    </footer>
    <div id="pageFooter-first"></div>

<script>
$(function(){
// itenerary-items
// -------------------------
var height = 0;
var heightThreshold = ${this.heightThreshold};
var count = 0;
$( ".itenerary-items li" ).each(function( index ) {
  height =  height + $(this).outerHeight();
  if (count > 0) heightThreshold = ${this.heightThreshold + 50};

  if (height > heightThreshold) {
    count ++;

    var copied = $(this).nextAll().addBack().detach();
    var ul =  $('.page.itenerary.first');
    //var copyUl = ul.clone().removeClass('page first').empty().append(copied);
    var test = $('<div class="page itenerary appended-' + count + '"><main><div class="container border-break"><div class="spacer"></div><ul class="itenerary-items copy-here'+ count +'"></ul></div></div></main></div>');

    $('.page.itenerary').last().after(test);
    //$('.copy-here'+ count).append(copyUl.removeClass('.first'));
    $('.copy-here'+ count).append(copied);

    // append quote to end
     $('.itenerary-quote').insertAfter($('.copy-here'+ count).last());

     // reset height to that of current item
     height = $(this).outerHeight();
  }

});


// Accomodation
// -------------------------
var accomCount = 0;

var accomHeight = 0;

// every 4th element
$( ".accom-list .wrapper" ).each(function( index ) {
  accomHeight = accomHeight + $(this).height() ;

  if (accomHeight > 500) {
    accomCount++;
  var copied = $(this).nextAll().detach();
  var ul =  $('.page.accomodation.first');
  var copyUl = ul.clone().removeClass('page first').empty().append(copied);
  var test = $('<div class="page accomodation appended-' + accomCount + '"><main><div class="container"><div class="accom-list accom-copy-here'+ accomCount +'"></div></div></div></main>');

  $('.page.accomodation').last().after(test);
  $('.accom-copy-here'+ accomCount).append(copyUl.removeClass('accomodation.first'));
  accomHeight = 0;
  }


console.log(accomCount);

});

$('.add-ons').insertAfter($('.accom-copy-here'+ accomCount).last());

// if inclusion + exclusions are too big
// ---------------------------------
console.log(accomHeight);
var addOnsHeight = $('.add-ons').height();
var pageAccomLast = $('.page.accomodation').last().height();
var lastaccomPage = $('.page.accomodation ').last();
var addonsThreshold = 610;
if( lastaccomPage.hasClass('first') ) addonsThreshold = 570;
if (accomHeight + addOnsHeight > addonsThreshold) {
  // create new page
  var newAddonPage = $('<div class="page accomodation"><main><div class="container "><div class="spacer"></div><div class="move-addons-here"></div></div></main></div>');
  // Move to new page
  var addOns = $('.add-ons').detach();
  lastaccomPage.after(newAddonPage);
  $('.move-addons-here').append(addOns);
}


// If QUOTE + ITENERary ARE TOO big
// ---------------------------------
var lastIteneraryPage = $('.page.itenerary').last();
var quoteThreshold = 610;
if( lastIteneraryPage.hasClass('first') ) quoteThreshold = 570;
var lastIteneraryItemsHeight = lastIteneraryPage.find('.itenerary-items').height();
var quotHeight = $('.itenerary-quote').outerHeight();
var pageHeight = 661;
var newPage = $('<div class="page itenerary quote-append"><main><div class="container border-break"><div class="spacer"></div><div class="move-quote-here"></div></div></main></div>');

if (lastIteneraryItemsHeight + quotHeight > quoteThreshold) {

    var quote = $('.itenerary-quote').detach();
    lastIteneraryPage.after(newPage);
    $('.move-quote-here').append(quote);
}
});
</script>

    </body>

    </html>`;
  }

  // function to get payments
  getPayments() {
    let payments = '';
    this.payments.forEach((p) => {

      payments += ` <tr>
      <td class="description space" >Payment Received ${p.date} </td>
      <td class="currency space">USD</td>
      <td class="amount space">-${this.filter.transform(p.amount)}</td>
    </tr>
      `;
    });

    return payments;
  }

  // function to get days
  getDays() {
    let days = '';



    this.days.forEach(d => {
      const day = `
				 <li>
				 <div class="legend">
					 <p class="day">${this.dayTitleGenerator('title', d)}</p>
					 <p class="date">${this.dayTitleGenerator('dates', d)}</p>
				 </div>
				 <div class="description">
					 <p>${this.getItineraryDescriptions(d)}</p>
					 ${this.getComments(d)}
				 </div>
			 </li>`;

      days += day;

    });

    return days;
  }

  // function to generate editor-components title
  dayTitleGenerator(type: string, day: any) {
    // variables related to editor-components tile
    let title = '';
    let first_day = 0;
    let last_day = 0;

    // variables related to dates
    let start_date: any;
    let end_date: any;
    let dates = '';

    if (day.position < 1) {
      first_day = 1;
    } else {
      // iterate days array
      this.days.every((d, i) => {
        // check if position is current position
        if (d.position === day.position) {
          return false;
        }
        // add all days of days before to current
        first_day += d.days;
        return true;
      });

      // add 1 to editor-components
      first_day += 1;
    }

    // add first editor-components to title
    title += `Day ${first_day}`;

    // init start date to itinerary start date
    start_date = new Date(this.itinerary.startDate);

    // add number of days before current editor-components to start date to get current start date
    start_date.setDate(start_date.getDate() + (first_day - 1));

    // add start_date to date string
    dates += `${start_date.getDate()} ${this.date_months[start_date.getMonth()]}`;

    // if editor-components contains more than 1 editor-components
    if (day.days > 1) {
      // last editor-components is first editor-components + total days - 1
      last_day = first_day + day.days - 1;

      // add last editor-components to title
      title += ` - ${last_day}`;

      // init end_date to start_date
      end_date = start_date;

      // add number of days
      end_date.setDate(end_date.getDate() + day.days - 1);

      // add to dates string
      dates += ` - ${end_date.getDate()} ${this.date_months[end_date.getMonth()]}`;
    }

    // check type
    if (type === 'title') {
      // return editor-components title
      return title;
    } else {
      // return dates
      return dates;
    }
  }

  // function to get itinerary descriptions from editor-components
  getItineraryDescriptions(day: any) {
    // string to store all itinerary item descriptions
    let itinerary = '';

    // check if any services were added to editor-components
    if (day.services !== undefined && day.services !== 'undefined') {
      if (day.services.length !== 0) {
        day.services.forEach(d => {
          // concat service
          itinerary += d.service.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }

    // check if any activities were added to editor-components
    if (day.activities !== undefined && day.activities !== 'undefined') {
      if (day.activities.length !== 0) {
        day.activities.forEach(d => {
          // concat activity
          itinerary += d.activity.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }

    // // check if any accommodation wa added to editor-components
    if (day.accommodation !== undefined && day.accommodation !== 'undefined') {
      if (day.accommodation.length !== 0) {
        day.accommodation.forEach(d => {
          // concat accommodation
          itinerary += d.description.replace(/^[.\s]+onSelectionChange|[.\s]+$/g, '') + '. ';
        });
      }
    }
    return itinerary;
  }

  // function to get comment
  getComments(day) {
    let comments = '';
    this.comments.forEach((c) => {
      if (c.day.id === day.key) {
        comments += ` <p class="${this.commentIconGenerator(c.type)}">${c.comment}</p>`;
      }
    });

    return comments;
  }

  // function to get icon comment
  commentIconGenerator(type: any) {
    let icon = '';

    switch (type) {
      case 'Activity':
        icon = 'activity';
        break;
      case 'Flight':
        icon = 'airport';
        break;
      case 'Info':
        icon = 'info';
        break;
      default:
        break;
    }

    return icon;
  }

  // function to calculate balance
  balanceCalculator() {
    // remaining balance
    let balance = 0;

    // check if total is equal to 0, assign balance depending on total, discount and total payments
    this.itinerary.total === 0 ? balance = 0 : balance = (this.itinerary.total - this.itinerary.discount) - this.totalPayments;

    // return balance
    return this.filter.transform(balance);
  }

  // function to get accommodation
  getAccommodation(accommodation: any[]) {

    let accomodations = '';

    accommodation.forEach(a => {
      // console.log(a)
      const currentAcc = `
      <div class="wrapper">
        <div class="img-block" style="background-image:url('${a.imageUrl}')"></div>
        <div class="accom-desc">
          <h2>${a.name.replace(/\-.*/, '')}</h2>
          <p class="location">${a.region}</p>
          <p class="desc">${a.longDescription}</p>
        </div>
      </div>`;

      // add current accommodation to temp accommodations array
      accomodations += currentAcc;


    });

    return accomodations;
  }

  // function to print destinations in string
  getDestinations() {
    const countries = [];

    this.phoneNumbers.forEach(phoneNumber => {
      countries.push(this.countries.find(country => country.key === phoneNumber.country).name);
    });

    let dest = '';
    dest = [countries.slice(0, -1).join(', '), countries.slice(-1)[0]].join(countries.length < 2 ? '' : ' & ');
    return dest;
  }

  // function to loop thru and print inclusion
  getInclusions(accommodation: any[]) {
    let inclusions = '';

    accommodation.forEach((a) => {
      const inc = `
      <p >
      <b>Included at ${a.name.replace(/\-.*/, '')}:</b> ${a.inclusions}
      </p>`;

      inclusions += inc;
    });

    return inclusions;
  }

  // function to diplay destination names
  showDestination(ref) {
    // return destination name
    const d = this.countries.find((item) => {
      return item.key === ref.id;
    });

    return d.name;
  }

  getHeaderLogo() {
    switch (this.data.company.name) {
      case 'True Africa':
        this.headerLogoSrc = 'data:image/png;base64,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';
        this.headerLogoWidth = '16';
        this.logo = 'https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/logo%402x.png?alt=media&token=ef6846a7-6d6a-48a2-ad60-fa039dd06dc5';
        // set height threshold for itinerary page
        this.heightThreshold = 500;
        break;
      case 'Planet Africa':
        this.headerLogoSrc = 'data:image/png;base64,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';
        this.headerLogoWidth = '80';
        this.logo = 'https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/logo-planetafrica%402x%20-%20copy.png?alt=media&token=eebb5c08-8e1d-4604-ac7e-4160c79760e6';
        // set height threshold for itinerary page
        this.heightThreshold = 500;
        break;
      default:
        break;
    }
  }

  getLogo() {
    switch (this.data.company.name) {
      case 'True Africa':
        this.logoFull = 'data:image/png;base64,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';
        break;
      case 'Planet Africa':
        this.logoFull = 'data:image/png;base64,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';
        break;
      default:
        break;
    }
  }

  getStyleSheet() {
    if (this.data.company.name === 'Planet Africa') {
      return 'css/style-2.css';
    } else if (this.data.company.name === 'True Africa') {
      return 'css/style.css';
    }
  }

  getFooter() {
    if (this.data.company.name === 'True Africa') {
      return `
  <p>True Africa - The Safari Company</p>
  <p>www.trueafrica.com</p>
  <p>info@trueafrica.com</p>
      `;
    } else if (this.data.company.name === 'Planet Africa') {
      return `
  <p>Planet Africa - Tailor Made Safaris in East and Southern Africa</p>
  <p>www.planetafricasafaris.com</p>
  <p>info@planetafricasafaris.com</p>
      `;
    }
  }

  getInfoIcon() {
    if (this.data.company.name === 'True Africa') {
      return `https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/info%402x.png?alt=media&token=32aca098-eb54-4b6b-a7fd-494cc547daa2`;
    } else if (this.data.company.name === 'Planet Africa') {
      return `https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/info%402x-red.png?alt=media&token=2b85b903-b92a-4f33-8dea-ef39c3c1266c`;
    }
  }

  // function to get the travel insurance box
  getTravelInsuranceBox() {
    return `<div class="contact-block" style="margin-top: 15px; !important;">
      <p class="heading">24/7 Medical Hotline and Emergency Air Evacuation Insurance</p>
      <p class="normal-text">Medical Emergency Number: +27 31 100 2370</p>
      <p class="normal-text">It is essential that you organise comprehensive travel insurance prior to departure. This should cover any medical situation such as hospitalisation, as well as cancellation, curtailment of arrangements and loss/delay of baggage. When you travel with TrueAfrica/Planet Africa Safaris, you are automatically covered by our emergency evacuation insurance. This guarantees emergency evacuation to the nearest hospital should you suffer either severe illness or injury. This does not cover the cost of treatment once in hospital and in no way replaces your normal travel insurance. Please contact us for further details.</p>
    </div>
    `;

  }

  // function to get contact details
  getContacts() {
    let html = '';

    this.phoneNumbers.forEach((pn) => {

      let contactBlock = `
           <div class="contact-block">
        <p class="heading">${pn.countryName}</p>
        <div class="details">`;

      // check if office hours is set & add to contact block
      if (pn.officeHours !== '') {
        contactBlock += `
          <!-- office hours -->
          <p class="field">Office Hours</p>
          <p class="value">${pn.officeHours}</p>
          <br>`;
      }

      // check if after hours is set & add to contact block
      if (pn.afterHours !== '') {
        contactBlock += `<!-- after hours -->
          <p class="field">After Hours</p>
          <p class="value">${pn.afterHours}</p>
          <br>`;
      }

      // check if alt after hours is set & add to contact block
      if (pn.alt_afterHours !== '') {
        contactBlock += `            <!-- after hours -->
          <p class="field">Alternative After Hours</p>
          <p class="value">${pn.altAfterHours}</p>
          <br>`;
      }

      contactBlock += '</div></div>';

      html += contactBlock;
    });


    switch (this.data.company.name) {
      case 'True Africa':
        html += `
        <h2 class="sub-header">True Africa - The Safari Company</h2>
        <div class="contact-block">
          <p class="heading">Cape Town Office</p>
          <div class="details">
            <p class="field">Office Hours</p>
            <p class="value">+27 21 418 1515</p>
            <br>
            <p class="field">Email</p>
            <p class="value">info@trueafrica.com</p>
            <br>
            <p class="field">After Hours (Mobile)</p>
            <p class="value">+27 82 387 2717</p>
          </div>
          <p class="aside">Our office is open Monday to Friday between 08:30 to 17:00, Standard South African Time (GMT +2 Hours). During weekends or after office hours, please contact us by mobile phone (call or SMS) rather than contacting the office line or emailing.</p>
        </div>`;
        break;
      case 'Planet Africa':
        html += `
        <h2 class="sub-header">Planet Africa Safaris - Tailor Made Safaris in East and Southern Africa</h2>
        <div class="contact-block">
          <p class="heading">Cape Town Office</p>
          <div class="details">
            <p class="field">Office Hours</p>
            <p class="value">+27 21 418 0562</p>
            <br>
            <p class="field">Email</p>
            <p class="value">info@planetafricasafaris.com</p>
            <br>
            <p class="field">After Hours (Mobile)</p>
            <p class="value">+27 79 856 5020</p>
          </div>
          <p class="aside" style="padding-left:10px !important;">Our office is open Monday to Friday between 08:30 to 17:00, Standard South African Time (GMT +2 Hours). During weekends or after office hours, please contact us by mobile phone (call or SMS) rather than contacting the office line or emailing.</p>
        </div>`;
        break;
      default:
        break;
    }


    return html;


  }


  showDiscountAndDeposit() {

    let html = '';

    if (this.itinerary.discount > 0) {
      // check if discount is more than 0
      html += `
              <tr class="discount">
          <td class="description">Discount applied off normal rates</td>
          <td class="currency">USD</td>
          <td class="amount">${this.filter.transform(this.itinerary.discount)}</td>
        </tr>`;
    }


    // check if deposit is more than 0
    if (this.itinerary.deposit > 0) {
      html += `<tr class="deposit" >
          <td class="description">Deposit Required</td>
          <td class="currency">USD</td>
          <td class="amount">${this.filter.transform(this.itinerary.deposit)}</td>
        </tr>
        `;
    }

    return html;


  }

  getAdultDetails(type: string) {
    let deets = '';

    this.itinerary[type].forEach((passenger) => {
      deets += `${passenger.firstName} ${passenger.lastName} ${passenger.age === 0 ? '' : '-' + passenger.age }<br>`;
    });

    return deets;
  }
}

function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}
