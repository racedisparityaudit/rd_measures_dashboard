
var activeState = 'planned';
var processCards;
var stages = ['planned', 'progress', 'review', 'published'];
var measures = {'planned': [], 'progress':[], 'review':[], 'published':[]};
var appId = '96d724e7c72db4a9b322ef382e54a796';

var lists = {
  '5a686d4076c5194520f1186c': {name: 'Planned', id: '5a686d4076c5194520f1186c', stage: 'planned'},
  '5a686ce113786b932cf745b2': {name: 'Received, In progress', id: '5a686ce113786b932cf745b2', stage: 'progress'},
  '5a686ce113786b932cf745b4': {name: 'Content design backlog', id: '5a686ce113786b932cf745b4', stage: 'progress'},
  '5a686ce113786b932cf745b5': {name: 'Content design in progress', id: '5a686ce113786b932cf745b5', stage: 'progress'},
  '5a686ce113786b932cf745b6': {name: 'Needs senior analyst sign off', id: '5a686ce113786b932cf745b6', stage: 'progress'},
  '5a686ce113786b932cf745b7': {name: 'Ready for upload', id: '5a686ce113786b932cf745b7', stage: 'progress'},
  '5a686ce113786b932cf745b8': {name: 'Uploaded', id: '5a686ce113786b932cf745b8', stage: 'progress'},
  '5a686ce113786b932cf745ba': {name: 'Department review', id: '5a686ce113786b932cf745ba', stage: 'review'},
  '5a686ce113786b932cf745bd': {name: 'Published', id: '5a686ce113786b932cf745bd', stage: 'published'},
  '5a686fb201a2b230f9de88cd': {name: 'Not being worked on', id: '5a686fb201a2b230f9de88cd', stage: 'other'}
}

var work_flags = ['New measure', 'Updated version'];
var department_flags = ['BEIS', 'CO', 'DCMS', 'MHCLG', 'DEFRA', 'DfE', 'DfT', 'DH', 'DWP', 'HO', 'MoJ', 'ONS', 'RDU', 'MOD'];

document.addEventListener('DOMContentLoaded', function() {
  var table = document.getElementById('measure-table');

  if (table) {
    new SortableTable(table)
  }
})


$(document).ready(function () {

  Trello.authorize({
    success: refreshData,
    name: 'Ethnicity facts and figures dashboard',
    expiration: 'never',
    'error': function() { console.log('error in authorize', data);}
  })

  var planned = document.getElementById("planned");
  planned.onclick = function () { selectState('planned') };

  var progress = document.getElementById("progress");
  progress.onclick = function () { selectState('progress') };

  var review = document.getElementById("review");
  review.onclick = function () { selectState('review') };

  var published = document.getElementById("published");
  published.onclick = function () { selectState('published') };

  processCards = {'planned': planned, 'progress': progress, 'review': review, 'published': published};
});

function selectState(state) {
  activeState = state;
  for(key of stages) {
    processCards[key].classList.remove('progress-card--selected');
    processCards[key].classList.remove('progress-card--active');
    if(key === activeState) {
      processCards[key].classList.add('progress-card--selected');
      setMeasureTableRows(measures[key]);
    } else {
      processCards[key].classList.add('progress-card--active');
    }
  }
}

function setMeasureTableRows(measures) {
  var html = '';
  for(measure of measures) {
    html = html + measureRowHtml(measure);
  }
  document.getElementById("measure-table-body").innerHTML = html;
}

function measureRowHtml(measure) {
  var shortType = measure.type === 'New measure' ? 'New' : 'Update';
  
  return "<tr><td>" + measure.name + "</td><td>" + measure.department + 
  "</td><td>" + measure.list + "</td><td>" + shortType + "</td></tr>";
}


function refreshData() {
  var boardKey = '5a686ce113786b932cf745b1';
  var listURL = '/boards/' + boardKey + '/lists'
  var cardsURL = '/boards/' + boardKey + '/cards'

  Trello.get(
    cardsURL,
    function(cardObjects) {
      var cards = cardObjects.map(card => mapCard(card)).filter(card => card.type !== '');

      measures = {
        'planned': cards.filter(card => card.stage === 'planned'),
        'progress': cards.filter(card => card.stage === 'progress'),
        'review': cards.filter(card => card.stage === 'review'),
        'published': cards.filter(card => card.stage === 'published')
      }

      setMeasureTableRows(measures[activeState]);
      for(stage of stages) {
        document.getElementById(stage + '-measures').innerHTML = measures[stage].length
      }

    },
    function(data) {
      console.log("failure", data);
      if(data.responseText==='invalid token'){
        localStorage.clear();
      }
    }
  )
}

function mapCard(card) {
  var obj = {
        id: card.id,
      name: card.name,
      department: findFlag(card, department_flags),
      type: findFlag(card, work_flags),
      list: '', stage: ''
  }
  if(card.idList in lists) {
      obj['list'] = lists[card.idList]['name'];
      obj['stage'] = lists[card.idList]['stage'];
  }
  return obj;
}
function findFlag(card, flags) {
  for(flag of card.labels){
    if(flags.indexOf(flag.name) > -1) {
      return flag.name;
    }
  }
  return '';
}

function isValidCard(card) {
  var labels = card.labels.map(label => label.name);
  return (labels.indexOf('Updated version') > -1) || 
  (labels.indexOf('New measure') > -1);

}

function parseData(data) {
  return (
    {
      'planned':0,
      'in_progress':0,
      'under_review':0,
      'published':0
    }
    )
  }
