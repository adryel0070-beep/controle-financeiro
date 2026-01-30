alert('JS carregou')
document.addEventListener('DOMContentLoaded', function () {

  // ============================
  // Função para somar meses
  // ============================
  function adicionarMes(mes, incremento) {
    const partes = mes.split('-').map(Number)
    const ano = partes[0]
    const mesNum = partes[1]

    const data = new Date(ano, mesNum - 1 + incremento)
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
  // Controle das abas
  // ============================
  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
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
  // Submit do formulário
  // ============================
  const form = document.getElementById('form-despesa')

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault()

      const mes = document.getElementById('mes').value
      const valorTotal = parseFloat(document.getElementById('valor').value)
      const descricao = document.getElementById('descricao').value.trim()
      const categoria = document.getElementById('categoria').value
      const parcelas = parseInt(document.getElementById('parcelas').value)

      // ✅ Validações
      if (!mes || !descricao || !categoria) {
        alert('Preencha todos os campos.')
        return
      }

      if (isNaN(valorTotal) || valorTotal <= 0) {
        alert('Informe um valor válido.')
        return
      }

      if (isNaN(parcelas) || parcelas < 1) {
        alert('Parcelas inválidas.')
        return
      }

      let despesas = obterDespesas()
      const valorParcela = valorTotal / parcelas

      for (let i = 0; i < parcelas; i++) {
        despesas.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          mes: adicionarMes(mes, i),
          valor: valorParcela,
          descricao,
          categoria,
          parcelaAtual: i + 1,
          totalParcelas: parcelas
        })
      }

      salvarDespesas(despesas)
      alert('Despesa salva com sucesso!')
      this.reset()
    })
  }

  // ============================
  // CONSULTA
  // ============================
  function carregarConsulta() {
    const despesas = obterDespesas()
    const filtroMes = document.getElementById('filtro-mes').value
    const filtroCategoria = document.getElementById('filtro-categoria').value

    const tbody = document.getElementById('tabela-consulta')
    tbody.innerHTML = ''

    let total = 0

    despesas
      .filter(function (d) {
        return (!filtroMes || d.mes === filtroMes) &&
               (!filtroCategoria || d.categoria === filtroCategoria)
      })
      .forEach(function (d) {
        const partes = d.mes.split('-')
        const ano = partes[0]
        const mes = partes[1]

        const tr = document.createElement('tr')
        tr.innerHTML =
          '<td>' + ano + '</td>' +
          '<td>' + mes + '</td>' +
          '<td>R$ ' + d.valor.toFixed(2) + '</td>' +
          '<td>' + d.parcelaAtual + '/' + d.totalParcelas + '</td>' +
          '<td>' + d.categoria + '</td>'

        tbody.appendChild(tr)
        total += d.valor
      })

    document.getElementById('total-geral').textContent = 'R$ ' + total.toFixed(2)
  }

  // ============================
  // Filtros
  // ============================
  function carregarFiltros() {
    const despesas = obterDespesas()
    const filtroMes = document.getElementById('filtro-mes')
    const filtroCategoria = document.getElementById('filtro-categoria')

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

  const filtroMesEl = document.getElementById('filtro-mes')
  const filtroCatEl = document.getElementById('filtro-categoria')

  if (filtroMesEl) filtroMesEl.addEventListener('change', carregarConsulta)
  if (filtroCatEl) filtroCatEl.addEventListener('change', carregarConsulta)

  // ============================
  // Exportar CSV
  // ============================
  const btnExportar = document.getElementById('btn-exportar')

  if (btnExportar) {
    btnExportar.addEventListener('click', function () {
      const despesas = obterDespesas()
      const filtroMes = filtroMesEl.value
      const filtroCategoria = filtroCatEl.value

      let csv = 'Ano,Mês,Valor,Parcela,Categoria\n'

      despesas
        .filter(d =>
          (!filtroMes || d.mes === filtroMes) &&
          (!filtroCategoria || d.categoria === filtroCategoria)
        )
        .forEach(d => {
          const partes = d.mes.split('-')
          csv += partes[0] + ',' +
                 partes[1] + ',' +
                 d.valor.toFixed(2) + ',' +
                 d.parcelaAtual + '/' + d.totalParcelas + ',' +
                 d.categoria + '\n'
        })

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'controle-financeiro.csv'
      link.click()
    })
  }

})