console.log('index.js loaded')

var url = 'https://api.github.com/repos/lif3ng/todos/issues'

function getParamsStr(obj) {
  var paramsObj = new URLSearchParams()
  for (i in obj) {
    paramsObj.append(i, obj[i])
  }
  return paramsObj.toString()
}

function loadData(url) {
  return fetch(url)
    .then((res) => res.json())
  //             .then(items=> items.map(({title})=>title))
  //             .then(console.log)
}
function render(div, query) {
  var paramsStr = getParamsStr(query)
  var url = `https://api.github.com/repos/lif3ng/todos/issues?${paramsStr}`
  loadData(url)
    .then((issues) => {
//       console.log({ issues })
      let itemsStr = issues.map(({ title, url, html_url, labels, created_at, closed_at }) => {
        let labelStr = labels.map(({ name, color }) =>
          `<span class="label" style="border:1px solid #${color}">${name}</span>`
        ).join('')
        const timeStr = query.state === 'closed' ? closed_at : create_at;
        return `<div class="issue">
    <a href="${html_url}" traget="_blank">${title}</a>
    <span class="labels">
        ${labelStr}
    </span><span class="time">${new Date(timeStr).toLocaleString()}</span>
</div>`
      }).join('')
      div.innerHTML = itemsStr
    })
}

render(document.getElementById('new'), {per_page:5})

render(document.getElementById('done'), {per_page:5,state:'closed'})

