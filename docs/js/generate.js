/**
 * Generates a chart when an organization is selected
 * This is called in index.html
 *
 * @author Loan Lassalle (loan.lassalle@heig-vd.ch)
 * @since 13.09.2017
 */

/* eslint-disable semi */

/* global XMLHttpRequest */

/**
 * Generates a chart and a table in function of oragnization login
 *
 * @param organizationLogin organization login
 */
// eslint-disable-next-line no-unused-vars
function changeOrganizationName (organizationLogin) {
  clearHtml();

  if (organizationLogin.length > 0) {
    let jsonURL = 'https://raw.githubusercontent.com/lassalleloan/githubAnalytic-static/master/docs/data/' + organizationLogin + '.json';
    let agentURL = 'https://glacial-beach-38619.herokuapp.com/agent?repository=githubAnalytic-static&organization=' + organizationLogin;

    // Gets organization json
    const xhttp = new XMLHttpRequest();
    const xhttp2 = new XMLHttpRequest();
    const xhttp3 = new XMLHttpRequest();

    xhttp.open('GET', jsonURL);
    xhttp.responseType = 'json';
    xhttp.send();

    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 404) {
        // Ask the server to generates organization JSON
        xhttp2.open('GET', agentURL);
        xhttp2.send();

        document.getElementById('p-message').innerHTML = 'Loading';
      } else if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
        addContent(xhttp.response);
      }
    };

    xhttp2.onreadystatechange = () => {
      if (xhttp2.readyState === XMLHttpRequest.DONE && xhttp2.status === 200) {
        if (xhttp2.responseText === '/ready') {
          // Gets organization json
          xhttp3.open('GET', jsonURL);
          xhttp3.responseType = 'json';
          xhttp3.send();
        } else {
          document.getElementById('p-message').innerHTML = 'The chosen organization does not exist';
        }
      }
    };

    xhttp3.onreadystatechange = () => {
      if (xhttp3.readyState === XMLHttpRequest.DONE && xhttp3.status === 200) {
        addContent(xhttp3.response);
      }
    };
  }
}

/**
 * Clears HTML for insertion of chart and table
 */
function clearHtml () {
  document.getElementById('p-message').innerHTML = '';

  // Remove old canvas and add a new one
  // eslint-disable-next-line no-undef
  $('#canvas-bar-chart').remove();
  // eslint-disable-next-line no-undef
  $('#div-bar-chart').append('<canvas id="canvas-bar-chart"><canvas>');

  document.getElementById('div-infos').innerHTML = '';
}

/**
 * Adds content in HTML
 *
 * @param xhttpResponse xhttp response
 */
function addContent (xhttpResponse) {
  document.getElementById('p-message').innerHTML = '';

  // Gets back organization
  // eslint-disable-next-line
  const organization = new Organization(xhttpResponse);

  // eslint-disable-next-line
  const barChartStacked = new BarChartStacked('Name of repos', organization._reposName, 'Number of bytes', organization._languagesBytes);
  barChartStacked.addToContext('canvas-bar-chart');

  generateTable(organization);

  document.getElementById('canvas-bar-chart').scrollIntoView();
}

/**
 * Generates a table of informations of organization
 *
 * @param organization organization object
 */
function generateTable (organization) {
  const divTable = document.getElementById('div-infos');
  divTable.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'table';
  divTable.appendChild(table);

  for (const key in organization._summary) {
    if (organization._summary.hasOwnProperty(key)) {
      const tr = table.appendChild(document.createElement('tr'));
      tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(key));
      tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(organization._summary[key]));
    }
  }

  const tr = table.appendChild(document.createElement('tr'));
  const a = document.createElement('a');
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode('Smallest repo'));
  a.setAttribute('href', organization._repoSmallestBytes.html_url);
  a.innerHTML = organization._repoSmallestBytes.name;
  tr.appendChild(document.createElement('td')).appendChild(a);

  const tr2 = table.appendChild(document.createElement('tr'));
  const a2 = document.createElement('a');
  tr2.appendChild(document.createElement('td')).appendChild(document.createTextNode('Biggest repo'));
  tr2.appendChild(document.createElement('td')).appendChild(a2);
  a2.setAttribute('href', organization._repoBiggestBytes.html_url);
  a2.innerHTML = organization._repoBiggestBytes.name;

  for (const languageName of organization._languagesName) {
    const tr = table.appendChild(document.createElement('tr'));
    tr.appendChild(document.createElement('td')).appendChild(document.createTextNode('Number of bytes of ' + languageName));
    tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(organization._languagesBytesSum[languageName]));
  }
}
