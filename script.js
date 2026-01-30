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
      .filter(d =>
        (!filtroMes || d.mes === filtroMes) &&
        (!filtroCategoria || d.categoria === filtroCategoria)
      )
      .forEach(d => {
        const [ano, mes] = d.mes.split('-')

        const tr = document.createElement('tr')
        tr.innerHTML =
          '<td>' + ano + '</td>' +
          '<td>' + mes + '</td>' +
          '<td>R$ ' + d.valor.toFixed(2) + '</td>' +
          '<td>' + d.parcelaAtual + '/' + d.totalParcelas + '</td>' +
          '<td>' + d.categoria + '</td>' +
          '<td>' +
            '<button onclick="editarDespesa(\'' + d.id + '\')">✏️</button> ' +
            '<button onclick="excluirDespesa(\'' + d.id + '\')">🗑</button>' +
          '</td>'

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

    const meses = []
    const categorias = []

    despesas.forEach(d => {
      if (!meses.includes(d.mes)) meses.push(d.mes)
      if (!categorias.includes(d.categoria)) categorias.push(d.categoria)
    })

    meses.sort().forEach(m => {
      filtroMes.innerHTML += '<option value="' + m + '">' + m + '</option>'
    })

    categorias.forEach(c => {
      filtroCategoria.innerHTML += '<option value="' + c + '">' + c + '</option>'
    })
  }

  // ============================
  // Excluir
  // ============================
  window.excluirDespesa = function (id) {
    if (!confirm('Deseja excluir esta despesa?')) return

    let despesas = obterDespesas()
    despesas = despesas.filter(d => d.id !== id)

    salvarDespesas(despesas)
    carregarFiltros()
    carregarConsulta()
  }

  // ============================
  // Editar
  // ============================
  window.editarDespesa = function (id) {
    let despesas = obterDespesas()
    const d = despesas.find(x => x.id === id)
    if (!d) return

    document.getElementById('mes').value = d.mes
    document.getElementById('valor').value = d.valor * d.totalParcelas
    document.getElementById('descricao').value = d.descricao
    document.getElementById('categoria').value = d.categoria
    document.getElementById('parcelas').value = d.totalParcelas

    despesas = despesas.filter(x => x.id !== id)
    salvarDespesas(despesas)

    document.querySelector('[data-tab="inserir"]').click()
  }

  // ============================
  // Eventos filtros
  // ============================
  document.getElementById('filtro-mes')?.addEventListener('change', carregarConsulta)
  document.getElementById('filtro-categoria')?.addEventListener('change', carregarConsulta)

})
