(() => {
  let chartCategory = null;
  let chartPayment = null;

  const palette = [
    "#60a5fa","#a78bfa","#34d399","#fbbf24","#fb7185",
    "#22c55e","#f97316","#38bdf8","#e879f9","#f43f5e"
  ];

  function groupSum(list, keyFn){
    const map = new Map();
    for (const e of list){
      const k = keyFn(e);
      map.set(k, (map.get(k) || 0) + e.amount);
    }
    return map;
  }

  function ensureCharts(){
    const c1 = document.getElementById("chartCategory");
    const c2 = document.getElementById("chartPayment");
    if (!c1 || !c2 || !window.Chart) return;

    if (!chartCategory){
      chartCategory = new Chart(c1, {
        type:"pie",
        data:{ labels:[], datasets:[{ data:[], backgroundColor: palette, borderColor:"#0b0f18", borderWidth:2 }] },
        options:{ responsive:true, plugins:{ legend:{ position:"bottom", labels:{ color:"#b6c0d1" } } } }
      });
    }
    if (!chartPayment){
      chartPayment = new Chart(c2, {
        type:"bar",
        data:{ labels:[], datasets:[{ data:[], backgroundColor: palette.slice(0,3), borderWidth:0 }] },
        options:{
          responsive:true,
          plugins:{ legend:{ display:false } },
          scales:{
            x:{ ticks:{ color:"#b6c0d1" }, grid:{ color:"rgba(255,255,255,.06)" } },
            y:{ ticks:{ color:"#b6c0d1" }, grid:{ color:"rgba(255,255,255,.06)" } }
          }
        }
      });
    }
  }

  function updateCharts(expenses){
    ensureCharts();
    if (!chartCategory || !chartPayment) return;

    const catMap = groupSum(expenses, e => e.category);
    chartCategory.data.labels = Array.from(catMap.keys()).map(UIService.labelCategory);
    chartCategory.data.datasets[0].data = Array.from(catMap.values());
    chartCategory.update();

    const payMap = groupSum(expenses, e => e.paymentType);
    chartPayment.data.labels = Array.from(payMap.keys()).map(UIService.labelPayment);
    chartPayment.data.datasets[0].data = Array.from(payMap.values());
    chartPayment.update();
  }

  window.ChartService = { updateCharts };
})();