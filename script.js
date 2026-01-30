document.addEventListener('DOMContentLoaded', function () {

  // ============================
  // Utilitário: somar meses
  // ============================
  function adicionarMes(mes, incremento) {
    var partes = mes.split('-')
    var ano = parseInt(partes[0])
    var mesNum = parseInt(partes[1]) - 1

    var data = new Date(ano, mesNum + incremento, 1)
    return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0')
  }

  // ============================
  // LocalStorage
  // ============================
  function obterDespesas() {
    return JSON.parse(localStorage.getItem('despesas')) || []
  }

  function salvarDespesas(lista) {
    localStorage.setItem('despesas', JSON.stringify(lista))
  }

  // ============================
  // Abas
  // ============================
  var tabs = document.querySelectorAll('.tab')
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {

      tabs.forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))

      tab.classList.add('active')
      document.getElementById(tab.dataset.tab).classList.add('active')

      if (tab.dataset.tab === 'consultar') {
        carregarFiltros()
        carregarConsulta()
      }
    })
  })

  // ============================
  // Formulário
  // ============================
  var form = document.getElementById('form-despesa')

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault()

      var mes = document.getElementById('mes').value
      var valorParcela = parseFloat(document.getElementById('valor').value)
      var descricao = document.getElementById('descricao').value.trim()
      var categoria = document.getElementById('categoria').value
      var parcelas = parseInt(document.getElementById('parcelas').value)

      if (!mes || !descricao || !categoria || isNaN(valorParcela) || valorParcela <= 0 || parcelas < 1) {
        alert('Preencha todos os campos corretamente.')
        return
      }

      var despesas = obterDespesas()

      for (var i = 0; i < parcelas; i++) {
        despesas.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          mes: adicionarMes(mes, i),
          valor: valorParcela,
          descricao: descricao,
          categoria: categoria,
          parcelaAtual: i + 1,
          totalParcelas: parcelas
        })
      }

      salvarDespesas(despesas)
      alert('Despesa salva com sucesso!')
      form.reset()
    })
  }

  // ============================
  // Consulta
  // ============================
  function carregarConsulta() {
    var despesas = obterDespesas()
    var filtroMes = document.getElementById('filtro-mes').value
    var filtroCategoria = document.getElementById('filtro-categoria').value

    var tbody = document.getElementById('tabela-consulta')
    tbody.innerHTML = ''
    var total = 0

    despesas
      .filter(function (d) {
        return (!filtroMes || d.mes === filtroMes) &&
               (!filtroCategoria || d.categoria === filtroCategoria)
      })
      .forEach(function (d) {

        var partes = d.mes.split('-')

        var tr = document.createElement('tr')
        tr.innerHTML =
          '<td>' + partes[0] + '</td>' +
          '<td>' + partes[1] + '</td>' +
          '<td>R$ ' + d.valor.toFixed(2) + '</td>' +
          '<td>' + d.parcelaAtual + '/' + d.totalParcelas + '</td>' +
          '<td>' + d.categoria + '</td>' +
          '<td><button data-id="' + d.id + '">🗑</button></td>'

        tr.querySelector('button').addEventListener('click', function () {
          excluirDespesa(d.id)
        })

        tbody.appendChild(tr)
        total += d.valor
      })

    document.getElementById('total-geral').textContent = 'R$ ' + total.toFixed(2)
  }

  function excluirDespesa(id) {
    if (!confirm('Deseja excluir esta despesa?')) return
    var despesas = obterDespesas().filter(d => d.id !== id)
    salvarDespesas(despesas)
    carregarConsulta()
  }

  // ============================
  // Filtros
  // ============================
  function carregarFiltros() {
    var despesas = obterDespesas()
    var filtroMes = document.getElementById('filtro-mes')
    var filtroCategoria = document.getElementById('filtro-categoria')

    filtroMes.innerHTML = '<option value="">Todos os meses</option>'
    filtroCategoria.innerHTML = '<option value="">Todas as categorias</option>'

    var meses = []
    var categorias = []

    despesas.forEach(function (d) {
      if (meses.indexOf(d.mes) === -1) meses.push(d.mes)
      if (categorias.indexOf(d.categoria) === -1) categorias.push(d.categoria)
    })

    meses.sort().forEach(function (m) {
      filtroMes.innerHTML += '<option value="' + m + '">' + m + '</option>'
    })

    categorias.forEach(function (c) {
      filtroCategoria.innerHTML += '<option value="' + c + '">' + c + '</option>'
    })
  }

  document.getElementById('filtro-mes').addEventListener('change', carregarConsulta)
  document.getElementById('filtro-categoria').addEventListener('change', carregarConsulta)

  // ============================
  // Exportar CSV
  // ============================
  document.getElementById('btn-exportar').addEventListener('click', function () {
    var despesas = obterDespesas()
    var csv = 'Ano,Mês,Valor,Parcela,Categoria\n'

    despesas.forEach(function (d) {
      var partes = d.mes.split('-')
      csv += partes[0] + ',' + partes[1] + ',' +
             d.valor.toFixed(2) + ',' +
             d.parcelaAtual + '/' + d.totalParcelas + ',' +
             d.categoria + '\n'
    })

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    var link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'controle-financeiro.csv'
    link.click()
  })

})
